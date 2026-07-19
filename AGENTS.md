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