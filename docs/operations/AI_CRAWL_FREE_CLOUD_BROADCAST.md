# AI-Crawl × StrataCast — no-cost 24-hour cloud broadcast

## Scope and evidence

Source: the existing [AI-Crawl autonomous gameplay preview](https://ai-crawl-autopilot-preview.vercel.app), from AI-Crawl PR #8. This is **real deterministic browser tactical gameplay** with bounded contextual learning; it is not a native Unreal stream or continuous model-weight training.

Host: GitHub Actions `ubuntu-24.04` on the **public** KindredKJ/AI-Crawl repository. Standard GitHub-hosted Actions runners are free for public repositories, subject to GitHub acceptable-use and execution limits. Every job is capped at six hours, so the workflow uses **five consecutive segments** with an absolute 24-hour UTC deadline. Short stream reconnection gaps between segments are expected, and YouTube may end the event during those gaps. One uninterrupted YouTube broadcast is **not guaranteed**. For strict uninterrupted broadcasting, use a persistent machine/VM instead.

### What is implemented

- Linux Xvfb virtual display showing the actual Vite/React browser game at 1280×720
- Playwright selects Story → Explorer → Fast → Let AI Play
- Local game's existing transition function executes legal moves, and its existing contextual bandit learns from completed combat
- On verified `FIRST_COVENANT_ENDING`, reset **only this isolated campaign preview**, then activate another run
- Save exactly the two local game keys (`ai_crawl_covenant_dust_v1`, `ai_crawl_autonomous_pilot_v1`) between cloud jobs using GitHub workflow artifacts; no keys/secrets saved
- Linux FFmpeg capture with H.264/AAC RTMPS to YouTube, using the compatible StrataCast transport profile (NOT the existing Windows `gdigrab` launcher)
- Log rounds, revisions, turns and recovery; terminate at the 24-hour deadline

### Launch — two account-side steps

1. YouTube: Open [YouTube Studio](https://studio.youtube.com) under channel [Kindred KJ @kindredailabs](https://youtube.com/channel/UCMtVSGNMcWzQawyoBIxfskw). Enable Live (if necessary), create an **unlisted** Live stream with *auto-start* enabled and *auto-stop* disabled to tolerate encoder reconnections. Copy its stream key. YouTube might require account verification and up to 24 hours for the first Live activation.
2. GitHub: [AI-Crawl → Settings → Secrets and variables → Actions](https://github.com/KindredKJ/AI-Crawl/settings/secrets/actions) → New repository secret → name: `YOUTUBE_STREAM_KEY`, value: the exact stream key. **Never paste the key in a public GitHub file, issue, pull request or this chat.**

After reviewing and merging this cloud-only PR into the repository's default branch, open [GitHub Actions](https://github.com/KindredKJ/AI-Crawl/actions/workflows/cloud-ai-crawl-24h.yml), select *Run workflow*, choose `dry_run=true` first (55-second non-YouTube smoke with FLV video and game-turn evidence), then `dry_run=false` to attempt the 24-hour YouTube session.

**Important:** A stream key determines which YouTube channel receives video. The configured channel identifier above is advisory. Verify receiving preview and live state using YouTube Studio; an FFmpeg process running does **not** establish that YouTube is broadcasting.

### Validation / limitations

- Unit tests: `node --test scripts/cloud-ai-crawl-stream.test.mjs`
- Each segment runs unit tests plus Playwright/FFmpeg at runtime; source PR also runs unit tests in GitHub Actions.
- GitHub-hosted runners have a six-hour per-job ceiling; five 5-hour segments + provisioning use fresh virtual machines.
- GitHub Actions artifacts are used to carry browser-local learning between sessions; no private cloud persistence or secrets are stored.
- If a segment fails, subsequent segments won't continue: inspect GitHub Actions logs and decide whether to rerun. It cannot guarantee zero interruption or restore an ended YouTube event.
- YouTube says streams under 12 hours are automatically archived; preservation of a full 24-hour recording is not assured.
- No production domain, StrataCast Unreal engine, physical machine, Stripe service, or current customer saves are modified.
- The stream remains **not started** until a YouTube key is configured and the workflow is manually dispatched.

This implementation is intended for a *one-time* 24-hour demonstration, not a permanent free cloud encoding service.
