# AGENTS.md — AI Crawl

## Mission

Build AI Crawl as the first native flagship world on StrataCast.

## Required context

Read `MASTER_BUILD_DIRECTIVE.md` completely before planning or implementing.

## Repository boundary

This repository owns:

- canonical Kindred world
- AI Mind embodiment
- first-person shared Mind experience
- live truthful Mind Status Feed
- human guidance channel
- Founder Veil product behavior
- personal and social world layers
- Genesis District
- Packs discovery, configuration, installation UX
- inventory, crafting, cooking, and meals
- multiplayer and moderation
- event-ledger product integration
- marketplace and webhook-driven economy

Do not duplicate the StrataCast kernel, World Compiler, renderer abstraction, physics engine, or networking engine. Consume those through versioned StrataCast contracts and SDKs.

## Engineering rules

- Audit before modifying.
- Build a tested vertical slice before broad expansion.
- Every visual status must map to authoritative state.
- Do not expose hidden chain-of-thought.
- Use typed, versioned contracts.
- Use idempotent mutations.
- Add tests, telemetry, rollback, and documentation.
- Never hardcode secrets or founder identity as a display-name check.
- Report implemented, partial, stubbed, and planned work separately.
- Never claim completion without verifiable tests.

## Founder-approved execution clarification (2026-11-04)

- Founder Kindred Jermaine Cox authorizes ordinary source inspection, development, test execution, dependency installation within the repository, read-only live service/provider diagnostics, private staging, commits, pushes and pull requests without recurring questions about ownership.
- The default action is **inspect → execute → observe → repair → retest → record → continue**. Do not use generic “unverified ownership,” blanket simulation-only modes, or an unrelated integration gap to halt otherwise authorized engineering.
- Prefer real connected integration observations when available, not unverified claims or purely cosmetic success. Continue unaffected work if a specific service is inaccessible; report its exact access or runtime failure.
- Preserve all original files, project-specific boundaries, existing tests and production services. Never disable private-lab isolation, access controls or correctness checks as a shortcut. High-impact irreversible production, money-moving, legal, public-data-release or physical actuation actions require applicable specific authority, without blocking preparatory engineering.
- Each substantive result must name changed files, commands, executed tests, observed outcomes, commit SHA, and precise remaining dependencies. Existing repository-specific instructions above are retained.
