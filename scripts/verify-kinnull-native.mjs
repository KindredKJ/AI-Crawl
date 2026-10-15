/**
 * Source-boundary verification; NOT a native Unreal compiler substitute.
 * Verifies expected project/module/game symbols, input mapping and cross-runtime
 * identity dimensions. A Windows UE toolchain still must compile and cook this.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
function read(rel){
 const full=path.join(root,rel);
 assert.ok(fs.existsSync(full),'Required source missing: '+rel);
 return fs.readFileSync(full,'utf8');
}
const base='clients/unreal/KinnullGame/';
const up=JSON.parse(read(base+'KinnullGame.uproject'));
assert.equal(up.EngineAssociation,'5.8');
assert.ok(up.Modules.some(m=>m.Name==='KinnullGame'&&m.Type==='Runtime'));
for(const key of ['KinnullGame.Target.cs','KinnullGameEditor.Target.cs']){
 assert.match(read(base+'Source/'+key),/class KinnullGame(?:Editor)?Target/);
}
const build=read(base+'Source/KinnullGame/KinnullGame.Build.cs');
for(const dep of ['CoreUObject','Engine','InputCore'])assert.ok(build.includes('"'+dep+'"'));
const cmode=read(base+'Source/KinnullGame/Private/KinnullNativeGameMode.cpp');
const hmode=read(base+'Source/KinnullGame/Public/KinnullNativeGameMode.h');
const pawn=read(base+'Source/KinnullGame/Private/KinnullNativePawn.cpp');
const world=read(base+'Source/KinnullGame/Private/KinnullPropActor.cpp');
const save=read(base+'Source/KinnullGame/Public/KinnullNativeTypes.h');
const hud=read(base+'Source/KinnullGame/Private/KinnullNativeHUD.cpp');
const ini=read(base+'Config/DefaultInput.ini');
const engineIni=read(base+'Config/DefaultEngine.ini');
assert.match(engineIni,/GlobalDefaultGameMode=\/Script\/KinnullGame\.KinnullNativeGameMode/);
assert.match(cmode,/HUDClass = AKinnullNativeHUD::StaticClass\(\)/);
assert.match(hud,/DrawHUD\(\)/);
assert.match(hud,/GetNativeIntegrity\(\)/);
for(const action of ['Interact','Predict','ToggleDepth','NewRun'])
 assert.ok(ini.includes('ActionName="'+action+'"')&&pawn.includes('TEXT("'+action+'")'));
for(const axis of ['MoveForward','MoveRight'])
 assert.ok(ini.includes('AxisName="'+axis+'"')&&pawn.includes('TEXT("'+axis+'")'));
for(const step of ['GenerateFacility','ReactToSentries','Possess','Erode','SaveProgress','LoadSavedState'])
 assert.ok(cmode.includes('::'+step+'(')&&hmode.includes(step+'('));
for(const phase of ['Awakening','Containment','FirstHost','Escape','Complete'])
 assert.ok(save.includes(phase));
for(const host of ['Maintenance','Security'])assert.ok(cmode.includes('EKinnullHost::'+host));
for(const prop of ['Camera','Relay','InnerGate','OuterGate','Maintenance','Security','Sentry','UtilityConsole','Exit'])
 assert.ok(world.includes('EKinnullObject::'+prop),'Missing visible native prop label: '+prop);
assert.match(save,/UPROPERTY\(SaveGame\).*CoreVector/);
const ts=read('src/game/kinnullIdentity.ts');
const counts=[...ts.matchAll(/count:\s*(\d+)/g)].map(m=>Number(m[1]));
const native=cmode.match(/AxisCounts\[7\]\s*=\s*\{([^}]+)\}/);
assert.ok(native,'Missing native dimensional identity contract');
const nativeCounts=[...native[1].matchAll(/\d+/g)].map(m=>Number(m[0]));
assert.deepEqual(nativeCounts,counts,'Native/TypeScript identity axes are out of sync');
assert.equal(counts.reduce((a,b)=>a+b,0),64);
assert.match(cmode,/State->HighestBand = FMath::Max/);
assert.match(read('src/components/KinnullScreen.tsx'),/KinnullCampaignScreen/);
assert.equal((read('src/game/kinnullCampaign.ts').match(/id:'(?:II|III|IV|V)-/g)??[]).length,12);
console.log('KINNULL native source contract OK: 64 axes, five phases, native HUD, input, game actors, save hooks and 12 story encounters.');
console.log('NOTE: source-level checks do not establish Unreal C++ compilation or successful packaging.');
