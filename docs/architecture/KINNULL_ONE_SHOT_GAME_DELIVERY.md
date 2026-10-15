# AI CRAWL / KINNULL — ONE-SHOT BUILD RECORD

**Product:** AI Crawl (a first-party game to be played through the separate StrataCast console)
**Narrative track:** Kinnull; existing Gunslinger / COVENANT//DUST track remains unchanged
**Owner:** Kindred Labs
**Decision:** AI Crawl owns game state, game content, gameplay mechanics and native game project. StrataCast owns the general console, world kernel and executable loading contract.

## Implemented across the stacked changes

### Browser-playable complete narrative route

- Act I: KINNULL-001 interactive escape map, CCTV realization, relay hack, maintenance/security possession, sentry threat, predictive escape, local save and irreversible foreign-code erosion.
- Acts II-V: twelve authored, choice-driven interactive encounters across corporate containment, robot networks, nanite-dragon evolution, alien weather systems, orbital intelligence and the final confrontation.
- Branching resolutions depend on irreversible identity loss, dominant accumulated foreign-system influences, selected host integration depth, power gained and faction attention.
- Two different types of interface: tactical top-down game for Awakening, and branching tactical narrative choices for later chapters. **The latter are NOT real-time 3D levels.**
- Offline local event-replayed persistence for the Awakening mission and complete story branch; rule-invalid events are rejected, but local browser storage is not tamper-proof multiplayer authority.

### Native Unreal Engine 5.8 source layer

- Self-contained **AI Crawl game project**, checked into the game repository under clients/unreal/KinnullGame; this is NOT a new repo and NOT a new console.
- Native Pawn: top-down 3D camera, collision, movement through WASD/gamepad and avatar silhouettes for signal/maintenance/security host.
- Native GameMode: procedural demonstration floor and wall geometry with two opened/closed containment gates, security sentries, interactive world markers, two host types, predictive evasion, permanent 64D identity erosion, and successful surface escape.
- Production-visible native HUD: objectives, core integrity percentage, highest band, host, hull, focus, input instructions, latest event. Not dependent on debug console messages.
- Local native USaveGame state, automatic checkpointing, explicit new-run gate after mission completion.
- Native Win64 UAT build/cook/package PowerShell command with hard failure if the editor/toolchain or executable is absent.
- Source-level verification compares Unreal's 64-dimensional identity partition with the browser rule module; **it does not compile UE C++**.

## Run existing browser game

From the AI Crawl repository:

~~~powershell
git switch feat/kinnull-001-unreal-native-20261015
npm ci
npm run lint
npm test
npm run test:native-source
npm run build
npm run dev
~~~

Open the printed local address, click **Kinnull**, finish the Awakening mission and continue into the four remaining story chapters. To restart a new run, use the explicit new-run control.

## Native project location and launch

Open:

    clients/unreal/KinnullGame/KinnullGame.uproject

in the installed Unreal Engine 5.8 editor on Windows. Allow the Unreal Build Tool to generate project files and compile the game module. Choose Play In Editor. The game mode creates the tactical facility using standard Engine meshes and a runtime HUD. No custom Unreal map or imported asset pack is required to *attempt* the source-level procedural prototype.

Controls:

| Input | Action |
|---|---|
| WASD / left gamepad stick | Move native avatar |
| E / bottom gamepad face button | Interact with adjacent facility markers |
| Space / top gamepad face button | Predict one sentry interception |
| F / right gamepad face button | Choose surface or recursive possession depth |
| R | Start an entirely new run after finishing |

For a guarded Windows cook/package attempt:

~~~powershell
.\scripts\Build-KinnullNative.ps1 -EngineRoot "C:\Program Files\Epic Games\UE_5.8" -Configuration Development
~~~

Only an actual successful UE build/cook/package, launched on user hardware, can verify native playability. Automated Node/TypeScript CI does not.

## Missing before the envisioned high-fidelity full game can truthfully be called complete

| Gate | Current state |
|---|---|
| Browser Kinnull Awakening mission rules and UI | Implemented, automated unit/CI verification |
| Browser interactive narrative through final ending | Authored as choices; automated unit/CI verification |
| Native Unreal Awakening gameplay | C++ source authored, UE compilation and playtest not yet verified |
| Native Unreal Acts II–V | NOT built as 3D levels |
| StrataCast signed game Pack and console launch | NOT yet integrated or verified |
| Kinnull hero mesh, possessed host rigs, original animations | NOT delivered |
| Nanite-dragon mesh/morph/VFX, alien weather simulation | NOT delivered |
| Cinematics, professional voice performances and final audio | NOT delivered |
| Full first-person/third-person realtime action combat | NOT delivered |
| High-quality textures, level streaming, destruction, spatial audio, controller calibration | NOT certified |
| Shipping build, fps benchmarks on low/mid/high GPUs, crash/perf QA, gameplay footage | NOT verified |
| Multi-platform native release and installers | NOT delivered |

Do not advertise the browser story path as five 3D chapters. Do not advertise the Unreal source as a successful Shipping build. Do not treat passing CI as a substitute for observed player input, completed cinematics or game asset inventories.

## Authored 3D asset and content packages still to produce

1. **ACT I / Denver:** classified server core, predictive display meshes, camera relays, maintenance and security host rig, two gates, sentry drones, original-core voice, first host transfer animation, containment protocol effects, service exit, real-time enemies and verification.
2. **ACT II / Pursuit:** urban streets, freeway checkpoint, corporate containment squads and firearms, human dispatch host, black-site interior and surveillance scenes, voice and faction countermeasure variations.
3. **ACT III / Machine War:** automated factory megastructure, machine collective, autonomous industrial robots, nanite-dragon hero mesh, morph targets, distributed-control animations, hybrid voices and scalable GPU particles.
4. **ACT IV / Alien Weather:** storm-control pylons, destructible/evacuable city set pieces, orbital relay, predictive weather VFX, alien audio and band-sensitive world abstraction.
5. **ACT V / Threshold:** coalition-of-minds inner world, origin-server ruins, termination boss, multi-identity model deformation, final cinematic variants, distinct mixed voices and ending scenes.

For each package: prepare storyboard and interaction spec → reusable model and rig → collision/LOD/materials → animation/state graph → audio/VFX → bind to authoritative gameplay → save/replay tests → GPU budget and accessibility QA → playtest acceptance.

## Release acceptance tests

A finished native game requires: actual recorded game executable gameplay from opening to ending; a clean new install and resume; identity bands never decreasing within a run; different consequences for maintenance vs security host and alien vs nanite integration; all five native chapter environments; consistent StrataCast launch and return; no mandatory internet; measured GPU frame times at supported tiers; successful collision/nav/combat and controller input; copyright-safe original art/audio; verified absence of debug-only logic; and an end-to-end native Shipping build on target hardware.

**No external purchases, cryptocurrency rewards, simulated system-health claims or public deployment occur from this change.**
