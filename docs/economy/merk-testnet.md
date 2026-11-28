# MERK testnet architecture and launch gates

## Status and intent

This integration is **testnet-only**. It compiles and tests the MERK and dungeon contracts and provides an explicit wallet gateway, but it does not activate paid combat, promise returns, perform swaps, schedule autonomous financial activity, or grant production entitlements. Polygon Mumbai is retired; the checked-in network target is Amoy (`80002`).

MERK is not required to play the existing local prototype. A wallet transaction must be a separate, informed user action. Deployment addresses are data supplied by a versioned receipt, never source-code constants.

## Authority model

- `MERK_OWNER_ADDRESS` should be a test multisig or governed test account, distinct from the deployer.
- `MERK_TREASURY_ADDRESS` is explicit and immutable. It must not default to the deployer or a display-name-derived identity.
- `DEPLOYER_PRIVATE_KEY` is read only from the process environment. The deployment script never creates, exports, logs, or persists it.
- Ownership uses the two-step OpenZeppelin flow to prevent accidental transfer.
- Dungeon mutations are pausable and command IDs make entry/loot mutations idempotent.

## Local verification

```bash
npm install
npm run contracts:compile
npm run test:contracts
```

## Amoy deployment

1. Obtain explicit owner and treasury test addresses and fund only the deployer with test gas.
2. Set the four variables documented in `.env.example` through the shell or a secret manager.
3. Run `npm run contracts:deploy:amoy`.
4. Verify both contracts on the explorer and independently compare constructor arguments and bytecode.
5. Have the owner configure a test floor in a separate reviewed transaction.
6. Publish the generated `aicrawl.deployment/v1` receipt through the trusted application configuration channel.

The receipt writer uses create-only semantics. A repeat deployment cannot silently overwrite evidence from an earlier deployment.

## Threat model

| Threat | Control in this slice | Residual / launch gate |
| --- | --- | --- |
| Secret exfiltration | Environment-only key; `.env*` ignored; no wallet generation. | Managed CI signer or hardware-backed signing required. |
| Founder impersonation | Owner is an explicit address, never a name. | Production founder policy requires passkey/MFA and server authorization. |
| Duplicate mutations | On-chain command-ID registry and client Mind ledger idempotency. | Command issuance service must guarantee tenant-scoped uniqueness. |
| Reentrancy / hostile token | SafeERC20, checks/effects ordering, and reentrancy guard. | Independent audit and adversarial token tests required. |
| Fee-on-transfer ambiguity | Entry event records requested and actually received amounts. | Product UI must disclose tokenomics before signature. |
| Compromised owner | Pause and two-step transfer. | Multisig, timelock, monitoring, and incident runbook required. |
| Client fabrication | Wallet gateway waits for a mined receipt. | Backend indexer must confirm finality and publish authoritative world events. |
| Profit claims / extraction | No siphon, router, scheduled task, or payout promise exists. | Legal, tax, consumer-protection, treasury, and governance reviews required. |
| AI self-modification | No agent writes source or deploys generated code. | Generated content requires schema validation, sandboxing, review, and signed Packs. |

The pinned Hardhat 2 development toolchain currently carries transitive audit advisories. It is excluded from the shipped browser dependency set, but contract deployment must run only in an isolated CI job without production filesystem access. Migration to the Hardhat 3 plugin line is a tracked gate once the repository runtime baseline supports it; `npm audit --omit=dev` must remain clean for release artifacts.

## Production blockers

Production activation remains blocked until contract audit, economic modeling, jurisdictional/legal review, sanctions and fraud controls, monitored multisig/timelock governance, indexer finality rules, webhook-driven entitlement reconciliation, refunds/disputes, incident rollback, telemetry, and disaster-recovery exercises pass. On-chain payment alone must never grant world ownership or paid content.
