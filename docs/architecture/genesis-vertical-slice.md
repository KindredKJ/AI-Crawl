# Genesis District vertical-slice architecture

## Boundary decision

AI Crawl owns the user journey, world content, Mind embodiment policy, truth-labelled projections, guidance UX, Founder Veil behavior, Pack UX, inventory/recipes, and event-ledger integration. StrataCast remains the owner of the kernel, compiler, ECS, renderer/physics/network abstractions, replication, and Pack runtime. AI Crawl consumes those capabilities through pinned, versioned adapters.

## Smallest complete path

1. An authenticated session enters the Mind Chamber.
2. A StrataCast adapter supplies sequenced `aicrawl.mind-event/v1` events.
3. The client projection ledger validates, deduplicates, and renders only received state.
4. Human guidance is submitted as a separate command with an idempotency key.
5. The Mind service publishes evaluation and, only after policy/approval, execution events.
6. The Pack Forge submits a signed vehicle-Pack install command; an install journal enables compensation.
7. World events project vehicle ownership, driving, inventory consumption, and meal creation.
8. Founder observation is issued only after server-side policy evaluation of cryptographic identity.
9. Significant events enter a hash-chained durable ledger; replay rebuilds projections.
10. Uninstall follows dependency analysis and a compensating plan before activation state changes.

## Trust flow

```text
Web/Capacitor client
  -> authenticated command gateway (idempotency + authorization)
  -> AI Crawl domain services (guidance, Packs, inventory, governance)
  -> versioned StrataCast SDK contracts (world/runtime operations)
  -> transactional outbox -> event fabric -> durable event ledger
  -> resumable projection gateway -> client MindEventLedger -> truthful UI
```

The browser is never an authority for identity, entitlement, founder privilege, world mutation, or execution outcome. Missing/stale transport data renders as `UNKNOWN`, never as healthy or observed.

## Delivery gates

| Gate | Verifiable exit condition |
| --- | --- |
| Contract | Schema fixtures and compatibility tests pass. |
| Identity | Cross-tenant and ordinary-user Founder Veil attempts are denied and audited. |
| Status feed | Every visible status traces to a validated event and displays its truth class/freshness. |
| Guidance | Accept/defer/reject/escalate and approval paths pass idempotency tests. |
| Pack/vehicle | Signed install, spawn, drive, quarantine, and compensating uninstall pass end-to-end. |
| Recipe | Ingredient reservation, consumption, failure compensation, and output provenance pass. |
| Replay | Rebuilt projection equals the live projection at the same sequence. |
| Operations | Traces, event lag, dead letters, rollback, and recovery evidence are available. |

## Rollout and rollback

Ship the event contract and read-only projection behind a feature flag. Shadow-consume production-like fixtures, compare legacy and event projections, then enable per tenant. On schema or ordering failure, stop projection at the last valid sequence, surface `UNKNOWN`, emit telemetry, and resume from the signed checkpoint after correction. Rollback disables the adapter; it never rewrites authoritative history.

