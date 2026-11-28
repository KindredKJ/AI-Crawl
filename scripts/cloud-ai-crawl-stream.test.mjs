import test from "node:test";
import assert from "node:assert/strict";
import {segmentSeconds,shouldReplay,selectSavedValues,parsePilotText,MAX_SEGMENT_SECONDS,SAVE_KEYS} from "../scripts/cloud-ai-crawl-stream.mjs";
test("limits cloud session to five hours per runner",()=>{
  assert.equal(segmentSeconds(100000,1000),MAX_SEGMENT_SECONDS);
  assert.equal(segmentSeconds(1003,1000),3);
  assert.equal(segmentSeconds(999,1000),0);
  assert.equal(segmentSeconds(0,1000),0);
  assert.equal(segmentSeconds(100000,1000,true),55);
});
test("restarts only after verified first-covenant ending",()=>{
  assert.equal(shouldReplay(true),true);
  assert.equal(shouldReplay(false),false);
  assert.equal(shouldReplay("FIRST_COVENANT_ENDING"),false);
});
test("persists only canonical game and bounded AI learning",()=>{
  assert.deepEqual(SAVE_KEYS,["ai_crawl_covenant_dust_v1","ai_crawl_autonomous_pilot_v1"]);
  const valid=selectSavedValues({
    "ai_crawl_covenant_dust_v1":JSON.stringify({stage:"MERCYS_END"}),
    "ai_crawl_autonomous_pilot_v1":JSON.stringify({values:{}}),
    "user_session":"sensitive-token",
    "irrelevant":"xx",
  });
  assert.equal(Object.keys(valid).length,2);
  assert.equal(valid.user_session,undefined);
  assert.deepEqual(selectSavedValues({"ai_crawl_autonomous_pilot_v1":"invalid"}),{});
});
test("reads observed progression without inferring capabilities",()=>{
  const result=parsePilotText("● PILOT ACTIVE\nObserved combat turns: 41\nLearned contexts: 24\nCampaign revision: 23");
  assert.deepEqual(result,{active:true,turns:41,contexts:24,revision:23});
  assert.equal(parsePilotText("○ MANUAL CONTROL").active,false);
});
