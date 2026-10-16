# KINNULL assets and console integration — source and release evidence

The **AI Crawl** repository owns this game. StrataCast is the separate general-purpose console. Native producer branch PR #7 stacks on AI Crawl PR #6 and #5. Generic signed launcher is StrataCast PR #29.

## Delivered in source

- Six animated runtime proxy roles: Kinnull core, maintenance crawler, security sentinel, corporate handler, drone soldier, nanite dragon. KinnullProceduralRig uses articulated animated scene components and built-in Unreal geometric meshes; it is not skinned commercial-quality character art.
- Native opponent collision, pursuit, attack, health, defeat, two combat waves, firewall sentinel boss, player weapon and dodge controls.
- Native first-mission camera beats for awakening, first possession, and escape. These are timed camera movements rather than final Sequencer cinematics.
- Offline WAV voice authored lines and import tooling: content/kinnull/voice/manifest.json, Generate-KinnullVoice.ps1, import_kinnull_voices.py, and in-game USoundBase cue playback.
- Seven authored cinematic storyboard manifests for chapters I-V in content/kinnull/cinematics/cinematics.v1.json.
- Unreal editor Python map creation and a guarded Build-KinnullNative.ps1 cook/package process.
- Sign-KinnullForStrataCast.ps1: signs and verifies a REAL Win64 cooked executable using StrataCast's generic launcher, and only starts it after explicit owner launch.

## Separate original authoring archives in ChatGPT

Two ZIPs from this conversation are not committed as binaries: **Kinnull Offline Voice Pack** (12 synthetic WAV lines; not licensed human voice acting) and **Kinnull Character Rigs & Animation Blockouts** (six glTF assets, each with joint skinning and animation clips). Import and retarget these assets before final 3D acceptance. GlTF Interchange skeletal clip support can vary by Unreal installation; if direct import fails, use Blender FBX conversion.

## Windows build and import

From the AI Crawl source root:

    git fetch origin
    git switch feat/kinnull-production-assets-20261016
    npm ci
    npm run lint
    npm test
    npm run test:native-source

Download/extract the voice ZIP into clients/unreal/KinnullGame/Content/KinnullVoiceRaw, or generate Windows-local SAPI speech using:

    powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Generate-KinnullVoice.ps1

Import the glTF characters with Unreal Interchange, inspect the skeleton, retarget movement/attack/possession/hit clips, and replace the source-level procedural rigs only after in-engine validation.

With Unreal Engine 5.8, Visual Studio C++ workload and PythonScriptPlugin available:

    .\scripts\Build-KinnullNative.ps1 -EngineRoot "C:\Program Files\Epic Games\UE_5.8" -Configuration Development

This attempts to create the real Awakening map asset, import staged WAVs as Unreal sound assets, build, cook, stage and archive a Windows game executable. Script failures mean no native executable has been verified. Rebuild Shipping only after native gameplay succeeds.

With the independent StrataCast repository checked out on feat/kinnull-native-launch-20261016 and local owner-pinned publisher keys generated:

    .\scripts\Sign-KinnullForStrataCast.ps1 -StrataCastRoot "C:\path\to\StrataCast"

The signer verifies every packaged file and stores its signed manifest OUTSIDE the package root. Nothing executes automatically. Use an explicit launch command with the original signature and owner-pinned public key to start the game.

## Exact outstanding release gates

Not verified: UE5.8 C++ compile/UHT, final UMAP cooking, Windows game process execution, GPU gameplay performance, binary voice import/playback, glTF skeletal mesh import and retargeting, production actor-recorded voice, final mocap/handkeyed polished animation, Sequencer camera/cutscene assets, real-time native 3D stages II-V, console-to-game launch on actual Windows hardware. The stage II-V story is currently interactive browser narrative content. These must not be marked finished based on TypeScript CI.

## Privacy and security

Kinnull's cameras, security hosts and weather systems exist ONLY in fiction. They do not access real user cameras, physical infrastructure, or real-world robots. StrataCast's signature and content integrity check do not constitute a sandbox and do not prevent network activity by the installed game. Native executable launch must remain an explicit user action.
