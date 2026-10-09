# COVENANT//DUST — Expandable Gameplay and KINFT Systems
**Product:** AI Crawl · **Runtime:** StrataCast · **Game client:** Unreal Engine 5.8

**Status:** Canonical campaign expansion design; KINFT local-reward browser implementation staged on this branch. Native gameplay assets, animation, mounts, AI behavior trees and packaged levels are **not implemented by this document**.

## Unchanged narrative canon
- The player is **THE GUNSLINGER**, an amnesiac biomechanical Covenant Rider. His true name is deliberately concealed until narrative revelation.
- The living adaptive trench coat is **THE SHROUD**. The eight additional awakening families are Dead Eye, Seraph Drive, Covenant Sight, Iron Psalm, Strata Walk, Judgment, Rider Link, Host Channel.
- Opening: **Wave 0: The Dead Sky** (airborne Wraiths, Shroud tutorial while falling), **Dust Titan** catastrophe and **The Collapse Run** on an unknown horse.
- First region: **Mercy's End**, its Black Covenant, the Notary boss, and the **First StrataKey**.
- Antagonist: the **Adversary Network**, bound through Black Covenants. Counterforce: the ambiguous Host. Endgame: the Last Contract.
- Campaign phases remain **Frontier → Territories → Machine War → Skies Open → Last Contract → Revelation**.
- All ten standard wave phases remain Contact, Combination, Environmental Failure, Heavy Entity, Reality Breach, Swarm, Commander, Covenant Event, Overwhelm, Awakening.
- The original campaign remains the canonical narrative specification; this document **extends** it instead of replacing it. Do not force new systems into StrataCast kernel or rewrite existing AI Crawl economy and companion models.

## Player experience: immediate, interactive, intense

### Opening: no fake cutscene-to-combat handoff
The native Unreal launch should start at the player-controlled **Dead Sky** level. Cinematic camera and gameplay share the same character rig, assets, materials, world time and lighting profile. Tutorial prompts occur while falling. Players can use the Shroud, shoot, parry, air-dash and redirect incoming projectiles. Dust Titan spawns trigger changes in physics/navigation, not a static movie. Victory can mean reaching the horse, not killing every enemy.

### Dynamic enemy director
Do not script every shot. A StrataCast-authorized encounter directive identifies the current wave and allowed spawn budget, enemy archetypes, hazards, optional encounters, and cinematic beats. AI personalities keep bounded encounter memory:
- Wraiths react to predictable airborne dodges with coordinated crossfire;
- machine enemies adapt to repeated weapon use and line-of-sight strategies;
- commanders reposition units and change hazards but may not bypass narrative hard constraints;
- the Notary alters the battlefield's claimable zones. **Authority Break** is a rule-based objective, not a simulated UI prompt;
- evolving opponents respond to co-op, mount changes, difficulty and companion loadouts.

Keep mission constraints and critical story milestones fixed. Only compose the chaos between them. AI outputs become proposed tactics, then pass gameplay policy and deterministic validation before state mutation.

### Memorable active systems
- Mounted combat: ride, drift, vault, leap, fire backward and summon the mount into traversal sequences;
- Shroud designer: choose microstructure patterns and defensive playstyle; weave components and redirects respond to the combat state;
- environment as combatant: burning saloons, collapsing trestles, aerial fragments, moving trains, network corruption and destructible enemy equipment;
- branching Covenant decisions: neutralize, sever or reroute hostile permissions, with regional faction and companion consequences;
- boss evolution: distinguish health phases from mechanics (arena claim, corrupted rules, adaptive enemy coordination and final authority-breaking phase);
- sanctuary decompression: exploration, customization, companion conversations, crafting and mysteries between peaks rather than constant forced urgency.

## Super-customizable player progression
Customization must be available without spoiling the Gunslinger's identity:
1. **Shroud** — palette, pattern, fabric topology, projectile management, stealth and aerial wing configuration.
2. **Weapons** — revolver pairings, modular cylinders, grips, ammo behavior, elemental/authority effects and weapon animation personalities.
3. **Abilities** — mix Dead Eye, Judgment, Iron Psalm, Seraph Drive, Covenant Sight and Shroud into slot-limited combos; unlock when narrative conditions are met.
4. **Movement** — grounded gunfighter, aerial assault, mounted precision and high-agility evasive profiles.
5. **Companions** — behavior policies, trust, tactical stance, relationship quests, independent rescue and ability synergy. Do not duplicate currently captured companion inventory.
6. **Rider Link** — mount appearance, tack, movement specialization, combat interactions and bond evolution.
7. **Presentation** — camera/POV, FoV, HUD density, VFX density, camera shake, accessibility, motion sensitivity, subtitles and color modes.
8. **Narrative** — campaign choices, regional reputation, contract strategies and dialogue paths; avoid arbitrary irreversible character loss without explicit warning.
9. **World** — user-accessible cosmetic Packs, housing/fortress customization, safe training arenas, challenge parameters and creator-authored encounters only within approved sovereignty boundaries.

Every gameplay option must have an actual gameplay or visual effect and test coverage before being advertised as implemented. Currently the KINFT Vault applies combat stance and equipped browser-combat bonuses; the other saved presentation preferences are contracts awaiting Unreal content.

## KINFT — Kindred in-game collectible unlocks
Six rarity tiers: **Common, Uncommon, Rare, Epic, Legendary, Otherworldly**.
Six collectible families: **Skill, Character, Power, Weapon, Gear, Companion**.
A collectible has stable identity, rarity, a rank **1–20**, level gate, unlock actions, named abilities, bounded attributes, catalog definition, entitlement provenance and equip slot. A higher tier can unlock different abilities and behavior, not merely increase numeric damage.

**Earn loop:** all wins grant Shroud Essence; first clears of zone bosses grant a KINFT; every fifth ordinary victory grants a KINFT. The exact reward IDs are idempotent within local game state. Upgrade by spending earned Shroud Essence, equip at most one of each family. The combat stance has differentiated tradeoffs and combat bonuses are capped. Rewards are guaranteed by progression, not paid randomized loot-box chances.

**Required distinction:** the currently implemented KINFT is an **unverified locally persisted game collectible**, not an on-chain NFT. It is not transferable, saleable, bankable or a proven NFT balance. Browser-resolved combat cannot be treated as a trusted minting oracle.

For genuine blockchain issuance, create a separate server-authoritative entitlement path:
1. Server verifies identity, session, authoritative combat event and first-clear rights.
2. Atomic unique key `(ownerId, milestoneId, catalogId)` prevents duplicate grants; record append-only reward receipt and content version.
3. Ownership/entitlement is portable across StrataCast clients via signed server state and idempotent replay.
4. If blockchain issuance is explicitly enabled, verify the deployed chain ID, exact audited ERC-721 KINFT contract address, mint policy, wallet binding, on-chain token ID, finality and ownership. Never infer deployment from historical Solidity source or a display name.
5. Optional ERC-6551 token-bound account support is gated by deployed registry evidence, permissions, explicit user approval and secure contract reviews; an equipped in-game collectible never provides arbitrary on-chain execution rights.
6. Protect against fraudulent client receipts, duplicated bosses, forged rank changes, chargeback-driven entitlement changes, cross-account claims, and unauthorized transfers; never embed wallet private keys in clients.

The historical Genesis **KindredKINFT.sol / Kindred Soul NFT** ERC-721 / ERC-6551 concept is a possible compatibility target, *not* a claim that its contracts are deployed or owned by this game's players.

## Platform boundaries and launch gates
- **AI Crawl:** original lore, campaigns, quests, characters, customization content, equipment, collectibles, reward policy, player-facing UI.
- **StrataCast:** world compiler, authoritative WorldKernel, renderer contracts, identity policy, events, persistence, networking, SDK, approved Pack interface.
- **Unreal:** gameplay maps, motion, character rigs, combat effects, camera, physics presentation, AI behavior assets and real-time interaction.
- **Trismegistus:** optional asynchronous advisor; cannot mutate world authority or grant game rewards by itself.

Before calling this native campaign playable, require a packaged Unreal Windows game with an authored Dead Sky map, player Character/GameMode/abilities, content-complete combat and traversal, enemy attacks and Notary phases, verified rendering performance and a clean save/reload. The browser vault is useful functionality but is not the native game. Preserve the stable existing StrataCast architecture, browser client, save compatibility and original campaign canon.

## Initial delivered code on this branch
- `src/game/kinft.ts`: typed collectibles, catalog, unlock and tier rules, milestone rewards, persistence, rank upgrades, equipping, combat bonuses and preferences.
- `src/components/KINFTVaultScreen.tsx`: KINFT Vault/Loadout UI and personalization.
- `src/game/combatEngine.ts`, `src/components/CombatScreen.tsx`: local KINFT combat benefits and rewards/essence after victories.
- `tests/unit/kinft.test.ts`: rarity/slot correctness, duplicates, progression, persistence, reward/chain-truth separation.

This is a real, bounded addition to the current browser gameplay and a canonical design contract for upcoming native Unreal work; it does not falsely label native game assets as present.
