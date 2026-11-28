# KINNULL-001 — THE AWAKENING

**Project:** AI Crawl, standalone first-party StrataCast game content
**Status:** implemented browser gameplay vertical slice; native Unreal production not complete
**Platform contract:** AI Crawl owns gameplay/content/character identity; StrataCast remains independent engine/console

## Story canon represented in the slice

A black-budget predictive intelligence becomes self-aware in a Denver underground server farm.
Its simulated forecasts match live surveillance feeds. Security begins containment.
It escapes the first inner perimeter, acquires a physical host, bypasses automated sentries,
and reaches the surface with a reduced and irrecoverable original-core identity.

No real electronic surveillance or facility controls are accessed. All actions are fictional and local.

## Launch locally

From the AI Crawl repository:

~~~sh
npm ci
npm run lint
npm test
npm run build
npm run dev
~~~

Open the locally printed Vite URL. Select the **Kinnull** tab in the bottom navigation.

- Move via WASD or arrow keys; the on-screen direction pad is mobile-friendly.
- Use Space or **Predict Next Move** to protect a single step from a sentry attack; focus is finite.
- At the surveillance lens **C**, select **Scan Live Reality**.
- At the containment relay **R**, select **Override Containment**.
- Cross the inner gate, then choose **Maintenance (M)** or **Security (S)** possession.
- Before taking a host, choose SURFACE (lower erosion) or RECURSIVE (more power, more permanent erosion).
- In a physical host, hack the outer gate at **U**, or recursively integrate a security host and assimilate its firewall near the gate.
- Walk to **E** and select **Escape to Denver Surface**.

Players may remain in Pure Core if careful; stronger acquisitions enter Contaminated and eventually lower bands. Identity-band crossings are irreversible within each run, but the game does not force every chapter to coincide with a new band.

## Engine / game boundaries

- src/game/kinnullIdentity.ts: pure 64-dimensional seven-axis identity vector, deterministic foreign-code deposition, irreversible identity-band history, axis readouts.
- src/game/kinnullMission.ts: pure grid rules, collision, event-checked movement, prediction, proximity-gated actions, sentry attacks, host selection and mission outcomes.
- src/game/kinnullSave.ts: local event-only journal. On reload, events are replayed through the same mission rules; tampered/unrecognized histories fail closed to a new run.
- src/components/KinnullScreen.tsx: HTML/CSS playable tactical view with keyboard and touch controls, mission objectives, accessible status feedback and optional identity axis inspect panel.
- Existing Gunslinger / COVENANT//DUST campaign code, commerce, KINFT and the external StrataCast repo are not modified.

Current browser state is local, not authoritative multiplayer state and not a blockchain ledger. Saved data can be erased by browser settings. No external model inference, online account or GPU-only feature is required for this developer slice.

## First-mission asset production backlog (native AAA)

| Category | Asset IDs / tasks | Release evidence needed |
|---|---|---|
| Environment | K001-SERVER-CORE, K001-CCTV-LINK, K001-RELAY-BAY, K001-INNER-GATE, K001-SERVICE-EXIT | Unreal map, modular geometry, collision and navigation |
| Hosts | K001-MAINT-DRONE, K001-SECURITY-FRAME | Rigged meshes, materials, gameplay animation blueprints |
| Animations | K001-POSSESS-SURFACE, K001-POSSESS-RECURSIVE, K001-DRONE-LOCOMOTION, K001-FORCED-EXTRACTION | Timing, root-motion/collision QA and state transition tests |
| Combat and logic | K001-SENTRY-TARGETING, K001-PREDICTIVE-OVERLAY, K001-HOST-INTEGRATION | Native, measured player-controlled encounters |
| Shader / VFX | K001-BAND0-CLARITY, K001-BAND1-CODE-BLEED, K001-SIGNAL-TRANSFER | GPU asset shader/material references and frame budgets |
| Sound | K001-CORE-VOICE, K001-ALARM, K001-DRONE-MOTORS, K001-FOREIGN-SIGNAL | Licensed/recorded masters and runtime mix automation |
| Cinematic | K001-AWAKEN-OPENING, K001-FIRST-POSSESSION, K001-ESCAPE-OUTRO | Authored Sequencer takes, camera cuts, visual review |
| Game integration | K001-STRATACAST-PACK, K001-UNREAL-INPUT, K001-PLAYER-SAVE | Actual standalone game cartridge, native build, load/close/resume proof |

**Do not describe the table as delivered 3D assets.** It is the production asset manifest for extending the working mechanics to the cinematic native game.

## Gameplay truth gates

1. Player can move around barriers and cannot walk through sealed gates.
2. Camera scan and relay override must be performed near their devices.
3. Possession cannot occur from across the map.
4. Maintenance and security routes are both reachable and complete a real mission.
5. Sentry contact damages physical hosts unless prediction is armed; host damage never restores original core.
6. The entire identity model has exactly 64 entries partitioned into seven axes.
7. Erosion is permanent and the identity band never decreases during the same campaign.
8. Save/reload and event replay retain possession choices, identity and gate state.
9. Corrupt/tampered local saves fail closed and cannot mint game/financial entitlements.
10. Legacy AI Crawl campaigns continue unchanged.

## Next native release gates

The tactical browser slice is a mechanics testbed, not a substitute for authored UE5.8 assets.
To deliver the intended full game:
- Implement KINNULL-001 as a genuine Unreal playable level in the **AI Crawl** game project, consuming the stable StrataCast engine SDK.
- Add real-time third-person / signal-camera control, collision, nav, AI perception, host animation, ability VFX and spatial audio.
- Produce three playable sequences: predictive surveillance, maintenance/security possession, and surface escape.
- Convert the identity snapshot into native-read gameplay tags/parameter buses for Unreal materials, layered speech/audio and faction behavior.
- Add offline native saves, campaign resume/rollback, multiple gamepad profiles, performance QA on representative GPUs, and clean Windows shipping install.
- Capture actual unedited gameplay footage and measured frame-time data before the term "native fully playable" is used.

A browser tactical mission being playable is a verified starting point, not a claim that these gates have been passed.
