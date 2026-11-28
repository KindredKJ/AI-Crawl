# COVENANT//DUST — Wave 0 and First Covenant implementation record

**Date:** 2026-10-09  
**Product owner:** AI Crawl  
**Reusable platform:** StrataCast  
**Native client:** Unreal Engine 5.8  
**Canonical content:** `content/canonical-world/covenant-dust.campaign.v1.json`

## Delivered in this change

1. Added a dedicated, versioned and deterministic `src/game/covenantDust.ts` module; it does not modify the existing `combatEngine`, enemy roster, KINFT, cloud synchronization, purchase processing or legacy save format.
2. The Gunslinger begins extraordinarily capable in **Wave 0 / The Dead Sky**, and Shroud/Dead Eye awaken through actual player *local tactical decisions*. Airborne tutorial progression triggers **three EPIC Dust Titans** and a survival/escape objective—there is no kill-all requirement.
3. **The Collapse Run:** mounted escape on the unnamed, unidentified horse. The mission retains the mystery and Rider Link awakening. Victory is arrival at the archway, not Titan extermination.
4. **Mercy's End:** four versioned investigation clues; require three distinct clues before exposing the Black Covenant hidden in data-center ownership software. Ten fixed wave phase names with variable deterministic enemy roster/budget/hazards/tactics controlled by a seed and bounded tactical memory.
5. **The Notary:** three authority-breaking seals—not a simple health depletion. First StrataKey awarded only after the third seal. The campaign's first conclusion announces global Covenant convergence at 1%, leaving Campaign II unimplemented.
6. **Rarity:** Common, Uncommon, Rare, Epic, Legendary, Otherworldly; enemy archetype records supply behavioral roles rather than only numeric modifiers. The current encounter director proposes bounded pressure, hazards and enemy archetypes but does not spawn actual UE enemies.
7. **Replay-safe local progression:** revision-checked unique event IDs, deterministic seed, event journal, idempotence, isolated versioned local saves, validation and corruption fallback. Local campaign state cannot grant blockchain rights or server-authoritative rewards.
8. **Browser tactical campaign interface:** an additive Story navigation tab. Existing Combat, Hub, Map, Craft, Store and KINFT tabs remain available. Local tactical decisions progress the authored spine; it explicitly does not claim real-time UE rendering or server-verified battles.
9. **Regression tests:** cover all of the above, prevent premature unlocks and preserve ability/hero identity mysteries.

## Source-of-truth boundaries

- The user-supplied **Hyper-Accelerated Wave Campaign** directive is canonical. The manifest records its six long-term phases, 10 wave classes, world premises, major characters, mystery, signature beats, awakening families and campaign ending.
- **AI Crawl:** canonical narrative, progression, encounter proposals, companion dialogue and adaptation hooks, local prototype view, identity of awards. No existing KINFT economy or companion manager behavior changed.
- **StrataCast:** WorldKernel truth/authority, canonical compiled world, renderer materialization, Cinematic Cast, event/provenance verification. This AI Crawl PR does not write to StrataCast or take over its source tree.
- **Unreal:** native maps, player Character, Shroud microstructure animation, ballistics, aerial controls, the intelligent horse, large destructible Titan encounters, Sequencer cameras, enemy behavior trees, real cinematic material and performance proof. **None of these are delivered by the web campaign implementation.**
- **External systems:** The Adversary's contracts are fictional game mechanics. Local outcomes never operate real smart contracts, run arbitrary code, command industrial systems, mint NFTs, pay rewards or publish media.

## Runtime requirements for the next native vertical slice

1. Version and compile the existing StrataCast world with a `covenant.dust/v1` campaign Pack referencing exact content digest and authenticated session.
2. Author a genuine `DeadSky` Unreal level and a native Gunslinger rig with Shroud defensive, redirect and aerial control mechanics; continuously play while falling, not in a disconnected fake loading scene.
3. Implement Wraith aerial behavior, collision and stable projectiles, with a scored and testable short combat encounter and physically present three Dust Titans. Introduce separate terrain destruction budgets and fallbacks under real UE runtime constraints.
4. Implement the unknown intelligent horse, grab/mount/vault actions, collapsing arch traversal and physically measured travel and combat. Avoid a substitute animation sequence being reported as playable.
5. Author Mercy's End and the real data-center investigation, ability authorization and authority claim/invalidations for the Notary, with companion AI behavior, decisions and persistent consequences.
6. Connect the stage events to a **trusted** StrataCast WorldKernel session. Map bounded encounter proposals into server-policy-checked updates, version the world state, and reconcile real game events and cast actor entities with the existing CinePlay native-take bridge.
7. Add QA checks for UHT/UBT compilation, cooked .umap/.uasset inventory, 1080p performance on a named GPU, save/reload, accessibility, and actual full gameplay footage with all companions retained.
8. Record only authenticated game receipts and make KINFT server entitlements a separate opt-in system; no unaudited wallet or blockchain integration.

## Open implementation backlog (not misrepresented as finished)

Shroud’s actual fluid microstructure simulation; Dead Eye targeting; Seraph Drive movement; Covenant Sight perception/material effects; Iron Psalm ballistic upgrades; Strata Walk navigation; Judgment; Host Channel; massive destruction/physics; companion independent agency; AI-driven tactics with signed input policy; mounted controls; dialog voice acting; procedural biomes; otherworldly visual/audio language; new campaigns II–VI, including the Last Contract and origin revelation; real Unreal shipping build.

**Production status:** Source-level campaign engine and browser tactical interactions only. Native game build, art/animation, performance QA, deployment, and verified multiplayer remain release blockers. Preserve the existing `StrataCast` and `AI Crawl` source responsibilities.

## Addendum: tactical Wave combat delivered in this implementation

- `src/game/covenantDustCombat.ts` implements a pure tactical turn system. The incoming attack is telegraphed; the player's Shroud energy, revolver ammunition, cover integrity and HP change according to the selected defense/strike.
- Shroud Block, Shroud Redirect, Revolver, Dead Eye, Dodge, Take Cover and Rider Evasion have distinct effects and prerequisites. Combat ends in ROUTED, SURVIVED after five defended rounds, or FALLEN; it cannot be declared as a browser victory before the tactical battle resolves.
- The browser Story panel now runs those turns. Its wave resolution button appears only after actual **local** survival or routing. Failing a round allows a local retry; no signed competitive, blockchain, or paid entitlement is created.
- `tests/unit/covenantDustCombat.test.ts` verifies ammunition, Shroud depletion, ability gates, mounted movement, turn-based survival and deterministic replay.
- Local battle state is currently ephemeral to the Story screen and is not synchronized to StrataCast networking or saved as server receipts. This is a production integration gap, not a claim of a complete native combat game.
