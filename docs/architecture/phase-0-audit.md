# Phase 0 repository and truth audit

**Audit date:** 2026-08-03  
**Scope:** tracked source, configuration, deployment functions, Android wrapper, and product documentation.

## Current state

The repository is a single Vite/React client with a Capacitor Android wrapper. Gameplay is held in browser-local state and rendered as combat, map, hub, registry, crafting, and shop screens. Cloud sync and checkout functions are integration edges, but there is no checked-in authoritative world service, identity service, event fabric, multiplayer runtime, Pack runtime, or StrataCast SDK dependency.

The current application is therefore a **working standalone game prototype**, not yet the persistent StrataCast-native world described by the master directive. UI values sourced from local state must not be relabeled as authoritative backend health or AI cognition.

## Reusable assets

- React navigation and responsive mobile shell.
- Inventory, combat, loot, crafting, and companion domain concepts.
- Capacitor packaging and Android project.
- Server-side checkout creation and verification boundary.
- Existing visual system, motion primitives, and deterministic game constants.

## Risks and gaps

| Area | Status | Evidence / consequence | Next control |
| --- | --- | --- | --- |
| World authority | Stubbed | Browser `localStorage` is canonical for gameplay. | Consume a versioned StrataCast world-state contract. |
| Mind telemetry | Missing | No authoritative Mind event stream exists. | Adopt `aicrawl.mind-event/v1` and a resumable transport adapter. |
| Identity / Founder Veil | Missing | No cryptographic role or policy enforcement is present. | Server-verified passkeys, hardware-backed founder MFA, policy decision records. |
| Packs | Missing | Registry UI is not a signed Pack lifecycle. | Manifest verification, permissions, install journal, compensation and rollback. |
| Multiplayer | Missing | No presence or replicated shared state. | Consume StrataCast networking contracts; do not implement its engine here. |
| Event ledger | Partial | A tested client projection ledger now validates ordering and retries; it is not durable or tamper-evident. | Back it with the platform event ledger and signed checkpoints. |
| Economy | Partial | Checkout verification exists; full webhook inbox/outbox/refund/dispute evidence is absent. | Keep paid entitlements launch-gated. |
| Secrets | Review required | Environment-based integrations exist; no secret was added in this slice. | CI secret scan and managed deployment secrets. |
| Generated files | Local-only | `android/.gradle/` is untracked build output. | Ignore/remove build output separately after owner review. |

## Implemented in this slice

- A versioned discriminated union for truth-labelled Mind events with tenant, world, session, sequence, idempotency, and provenance fields.
- Runtime validation for authority scope, timestamps, direct-observation truth classes, confidence bounds, and derived guidance evaluations.
- An ordered, idempotent client projection ledger with explicit rollback and replay behavior.
- Unit tests covering append, defensive snapshots, deduplication, sequence rejection, truth enforcement, rollback, and replay.

## Explicitly not implemented

The projection ledger does not claim durable storage, cryptographic integrity, transport authenticity, authorization, telemetry delivery, or a running AI Mind. It never manufactures “live” events. Those require authoritative StrataCast and service integrations.

## Testnet economy follow-up

The repository now contains a test-only MERK contract boundary, deployment receipt, and explicit wallet adapter. It intentionally excludes the proposed profit siphon, scheduled heartbeat, browser-written secret, AI source rewriting, and automatic combat charge. Those patterns violate least privilege, reviewability, truthful economy claims, and the directive's webhook/entitlement launch gates. See `docs/economy/merk-testnet.md` for controls and remaining blockers.
