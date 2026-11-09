# AI Crawl autonomous player (Kindred Player Mind v1)

Status: implementation candidate, **not** Unreal 5.8 or YouTube-live verified.

## Purpose

An AI actor **plays AI Crawl like a player** and tests its own authored gameplay.
This is separate from enemy AI, StrataCast world authority, and a scene-building
worker. It is the first tested vertical slice of a potential StrataCast resident
player Mind that can consume observations and submit authorized game actions.

## Current connected environment

- Actual environment: `CovenantDustScreen` campaign and `takeWaveTurn` local combat.
- Inputs: canonical `CampaignState`, `WaveBattle`, unlocked awakenings, next
  telegraphed threat, replay-limited tactical memory, user-selected style.
- Output: exactly one valid `CampaignEvent.action` or `CombatMove` per step,
  processed by the existing state transition / combat function. No direct state
  mutation, no arbitrary scripting, no SDK credentials or external effects.
- Short-horizon planner: tries every legal combat action through the actual
  deterministic battle transition, scores expected HP/damage/finish/resources,
  contextual memory, repetition penalties and style-dependent cinematic flair.
- Online learning: bounded contextual bandit with mean measured reward updated
  **after** a real completed combat step; browser-local memory persisted with a
  versioned schema. This is not trained ML weights, a general reasoning model,
  imitation of the founder, or reward-model reinforcement learning.
- Operator controls: start/stop, BALANCED / CINEMATIC / SURVIVAL / EXPLORER,
  action pacing, actual observed turn count, last legal action and cinematic cue.
- Failure handling: no valid action stops; two local retries per invocation,
  invalid memory discarded, normal manual play is unchanged by default.
- Campaign completion: respects the FIRST_COVENANT_ENDING limit, preserves
  local saved progress, and stops (never automatically resets customer saves).

## Running it

```powershell
git checkout feat/autonomous-mind-player
npm ci
npm run lint
npm test
npm run build
npm run dev
```

Open the application's Covenant//Dust campaign section (from the app navigation).
Select **Cinematic** and click **Let AI Play**. The existing controls still
work manually when the AI is stopped.

The game window can be captured by StrataCast's existing YouTube RTMPS
bridge after the streamer explicitly configures their own channel and key.
Neither this feature nor the UI publishes anything to YouTube.

## Scope / limitations

The Covenant//Dust encounter is deterministic and modeled using discrete turns;
it has no authored 3D finishers, animation assets, voice performance, 3D AI
navigation, direct gamepad control, production world persistence, or a native
Unreal combat controller. The current "epic moments" are scored tactical
choices and screen-readable cinematic cue overlays, **not** guaranteed
Hollywood-quality Unreal sequences.

A production StrataCast integration should provide a typed
`ObservationV1 -> PlayerIntentV1 -> authorize -> commit -> OutcomeV1` bridge
and independent action authority, then replace this preview's local data
source with a native/authoritative observation adapter. The same policy module
can serve as a baseline/fallback agent. A heavier open-weight pretrained
model is optional for commentary, long-range planning or story dialogue;
none is required for responsive tactical decisions.

## Quality gates

- `tests/unit/autonomousPlayer.test.ts`: deterministic decisions, legal
  actions, full campaign traversal through ten waves and boss, bounded and
  validated memory, and rejection of counterfeit learning receipts.
- `npm run lint`: compile-time TypeScript check.
- `npm test`: all game unit tests.
- `npm run build`: browser production bundle.

**Do not claim operational status until CI passes**, and do not claim
native Unreal / live YouTube readiness before those separate system tests.
