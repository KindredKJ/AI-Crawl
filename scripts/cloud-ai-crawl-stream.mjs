#!/usr/bin/env node
/**
 * Kindred AI-Crawl cloud gameplay broadcaster (Linux/Xvfb + StrataCast-compatible RTMPS).
 * Uses the existing public autonomous-pilot preview; does not alter customer saves.
 * Credentials are supplied only as process environment (GitHub Actions secret).
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const GAME_URL = "https://ai-crawl-autopilot-preview.vercel.app";
export const CHANNEL_ID = "UCMtVSGNMcWzQawyoBIxfskw";
export const SAVE_KEYS = ["ai_crawl_covenant_dust_v1", "ai_crawl_autonomous_pilot_v1"];
export const MAX_SEGMENT_SECONDS = 5 * 60 * 60;
export function segmentSeconds(deadlineEpoch, nowEpoch, dryRun=false) {
  if (dryRun) return 55;
  if (!Number.isSafeInteger(deadlineEpoch) || deadlineEpoch <= nowEpoch) return 0;
  return Math.max(0, Math.min(MAX_SEGMENT_SECONDS, deadlineEpoch - nowEpoch));
}
export function shouldReplay(endingVisible) { return endingVisible === true; }
export function selectSavedValues(source) {
  const value={};
  if (!source || typeof source !== "object") return value;
  for (const key of SAVE_KEYS) {
    const item=source[key];
    if (typeof item === "string" && item.length <= 65536) {
      try { JSON.parse(item); value[key]=item; } catch { /* discard invalid JSON */ }
    }
  }
  return value;
}
export function parsePilotText(text) {
  const number=(label)=>Number(new RegExp(label+"\\s*:\\s*(\\d+)","i").exec(text)?.[1] || 0);
  return { active:text.includes("PILOT ACTIVE"), turns:number("Observed combat turns"),
    contexts:number("Learned contexts"), revision:number("Campaign revision") };
}
function log(event, data={}) {
  const entry=JSON.stringify({time:new Date().toISOString(),event,...data});
  console.log(entry);
  appendFileSync("kindred-progress/events.jsonl",entry+"\n");
}
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
function readState() {
  try { return selectSavedValues(JSON.parse(readFileSync("kindred-progress/state.json","utf8"))); }
  catch { return {}; }
}
async function storeState(page) {
  let values={};
  try {
    values=await page.evaluate((keys)=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),SAVE_KEYS);
  } catch (e) { log("state_read_error",{message:String(e).slice(0,180)}); }
  const saved=selectSavedValues(values);
  writeFileSync("kindred-progress/state.json",JSON.stringify(saved)+"\n",{mode:0o600});
}
function createEncoder(key,dry) {
  if (!dry && !/^[A-Za-z0-9_-]{8,256}$/.test(key)) throw new Error("YOUTUBE_STREAM_KEY GitHub Actions secret must be configured before a live run");
  if (!process.env.DISPLAY) throw new Error("Xvfb DISPLAY missing; invoke with xvfb-run");
  const dest=dry ? "/tmp/kindred-cloud-test.flv" : "rtmps://a.rtmps.youtube.com/live2/"+key;
  const args=["-hide_banner","-loglevel","error","-nostdin","-y",
    "-thread_queue_size","512","-f","x11grab","-framerate","30",
    "-video_size","1280x720","-i",process.env.DISPLAY+"+0,0",
    "-f","lavfi","-i","anullsrc=channel_layout=stereo:sample_rate=48000",
    "-vf","format=yuv420p","-c:v","libx264","-preset","ultrafast",
    "-tune","zerolatency","-pix_fmt","yuv420p","-r","30","-g","60",
    "-b:v","2400k","-maxrate","2400k","-bufsize","4800k",
    "-c:a","aac","-b:a","96k","-ar","48000","-f","flv",dest];
  const child=spawn("ffmpeg",args,{stdio:["ignore","ignore","pipe"]});
  child.stderr.on("data",b=>{
    const message=String(b).replaceAll(key || "__NONE__","[REDACTED]").slice(-350);
    if(message.trim())log("encoder_diagnostic",{message});
  });
  child.on("error",e=>log("encoder_spawn_error",{message:e.message}));
  return child;
}
async function ensureGameplay(page) {
  await page.goto(GAME_URL,{waitUntil:"domcontentloaded",timeout:60000});
  await page.getByRole("button",{name:"Story",exact:true}).click({timeout:30000});
  const panel=page.getByRole("region",{name:"Kindred autonomous AI gameplay pilot"});
  await panel.getByRole("button",{name:/Let AI Play|Stop Pilot/}).waitFor({timeout:25000});
  return panel;
}
async function activate(panel) {
  if(await panel.getByRole("button",{name:"Let AI Play"}).isVisible().catch(()=>false)) {
    await panel.getByLabel("Autonomous player style").selectOption("EXPLORER");
    await panel.getByLabel("Autonomous player action interval").selectOption("1000");
    await panel.getByRole("button",{name:"Let AI Play"}).click();
  }
  await panel.getByText("PILOT ACTIVE").waitFor({timeout:15000});
}
async function replay(page) {
  const reset=page.getByRole("button",{name:"Reset campaign preview"});
  page.once("dialog",async d=>{
    if(d.type()==="confirm" && d.message().includes("Reset the local Covenant Dust campaign preview")) await d.accept();
    else await d.dismiss();
  });
  await reset.click();
  await page.getByText("SURVIVE THE FALL").first().waitFor({timeout:18000});
}
export async function main() {
  mkdirSync("kindred-progress",{recursive:true});
  const dry=process.env.KINDRED_DRY_RUN==="1";
  const seconds=segmentSeconds(Number(process.env.KINDRED_END_EPOCH),
    Math.floor(Date.now()/1000),dry);
  if(seconds===0){log("deadline_reached");return;}
  const key=process.env.YOUTUBE_STREAM_KEY||"";
  if(!dry && !/^[A-Za-z0-9_-]{8,256}$/.test(key))
    throw new Error("Missing YouTube RTMPS stream key: create repository Actions secret YOUTUBE_STREAM_KEY");
  const {chromium}=await import("playwright");
  const saved=readState();
  const browser=await chromium.launch({headless:false,args:[
    "--no-sandbox","--disable-dev-shm-usage","--window-position=0,0",
    "--window-size=1280,720","--no-first-run","--disable-gpu"]});
  const context=await browser.newContext({viewport:{width:1280,height:720}});
  await context.addInitScript(({origin,values})=>{
    if(location.origin===origin)for(const [k,v] of Object.entries(values)) {
      try { localStorage.setItem(k,v); } catch { /* optional persistence */ }
    }
  },{origin:new URL(GAME_URL).origin,values:saved});
  let page=await context.newPage(),encoder=null,encoderRestarts=0,rounds=0,lastUpdate=Date.now();
  let lastState="", lastTurn=0, observedTurns=0, stopping=false;
  const sig=()=>{stopping=true;};
  process.once("SIGTERM",sig);process.once("SIGINT",sig);
  const ends=Date.now()+seconds*1000;
  try {
    let panel=await ensureGameplay(page);
    await activate(panel);
    log("session_started",{segment:Number(process.env.KINDRED_SEGMENT||1),dry,
      allocatedSeconds:seconds,channelId:CHANNEL_ID,streamingAttempted:!dry});
    encoder=createEncoder(key,dry);
    let exitCode=null;
    encoder.on("exit",(code,signal)=>{exitCode=code ?? -1;log("encoder_exit",{code,signal});});
    await sleep(3000);
    while(Date.now()<ends && !stopping) {
      const timeRemaining=ends-Date.now();
      await sleep(Math.min(4500,Math.max(250,timeRemaining)));
      if(Date.now()>=ends || stopping)break;
      try {
        const snap=parsePilotText(await panel.innerText({timeout:10000}));
        const ending=await page.getByText("GLOBAL COVENANT CONVERGENCE DETECTED")
          .isVisible().catch(()=>false);
        const marker=[snap.revision,snap.turns,ending].join(":");
        if(marker!==lastState) {
          lastState=marker;lastUpdate=Date.now();
          observedTurns=Math.max(observedTurns,snap.turns);
          log("progress",{...snap,rounds,ending});
          await storeState(page);
        }
        if(shouldReplay(ending)) {
          await replay(page);rounds++;lastState="";
          await activate(panel);lastUpdate=Date.now();
          log("campaign_replayed",{rounds});
        } else if (!snap.active) {
          await activate(panel);log("pilot_reactivated");
        } else if(Date.now()-lastUpdate>180000) {
          panel=await ensureGameplay(page);
          await activate(panel);lastUpdate=Date.now();
          log("game_reloaded_after_stall");
        }
        if(exitCode!==null) {
          if(++encoderRestarts>3) throw new Error("Encoder exited repeatedly; inspect YouTube key/ingest");
          log("encoder_restarting",{attempt:encoderRestarts});
          encoder=createEncoder(key,dry);
          exitCode=null;
          encoder.on("exit",code=>{exitCode=code??-1;});
        }
      } catch (e) {
        log("game_recovery",{message:String(e).slice(0,260)});
        panel=await ensureGameplay(page);
        await activate(panel);
        lastUpdate=Date.now();
      }
    }
    await storeState(page);
    if(dry) {
      await sleep(1000);
      if(!existsSync("/tmp/kindred-cloud-test.flv")||
        statSync("/tmp/kindred-cloud-test.flv").size < 10000)
        throw new Error("Dry-run video capture did not produce a playable-size FLV file");
      if(observedTurns<1)throw new Error("Pilot did not advance any combat turns");
    }
    log("segment_complete",{rounds,observedTurns,seconds,dry});
  } finally {
    if(encoder && encoder.exitCode===null)encoder.kill("SIGTERM");
    await context.close().catch(()=>{});
    await browser.close().catch(()=>{});
    process.removeListener("SIGTERM",sig);process.removeListener("SIGINT",sig);
  }
}
if(process.argv[1] && fileURLToPath(import.meta.url)===resolve(process.argv[1]))
  main().catch(e=>{console.error("Kindred cloud stream failed: "+e.message);process.exitCode=1;});
