# AI Tokenomics — Executive Experience for Prudential Insurance

A single-page, interactive, executive-grade demonstration of **AI Tokenomics** — the
economics of intelligently allocating AI capability across tasks.

> The right intelligence for the right task: lower cost, faster response, better quality.

All data is an **illustrative simulation — not Prudential production data**.

## Run

```bash
npm install
npm run dev        # http://localhost:5173/prudential/
npm run build      # production build in dist/
```

## Deploy

The site is served under the `/prudential/` base path (see `base` in `vite.config.ts`),
with a redirect from `/`. Staging + deploy:

```bash
npm run build
rm -rf deploy && mkdir -p deploy/prudential && cp -r dist/* deploy/prudential/
printf '/ /prudential/ 302\n' > deploy/_redirects

npx wrangler pages deploy ./deploy --project-name tokenomics-cxo --branch main   # → resources.ai.tilicho.in
npx wrangler deploy                                                              # → workers.dev mirror
```

- Production: https://resources.ai.tilicho.in/prudential/ (Cloudflare Pages project `tokenomics-cxo`,
  custom domain via GoDaddy CNAME `resources.ai` → `tokenomics-cxo.pages.dev`)
- Mirror: https://tokenomics-cxo-presentation.kiran-41d.workers.dev/prudential/

Primary target: 1440×900 desktop. Presentation Mode targets 1920×1080 (16:9).

## Two modes, one product

- **Explore Mode** — the interactive page: What / Why / At-scale chapters, two insurance-agent
  scenarios (Claims Intake & Triage, Policy Case Resolution), a three-lane live run
  (Frontier Only · Efficient Only · Orchestrated), and an executive decision simulator.
- **Presentation Mode** — "Present →" (top right) launches a full-screen 9-slide narrative.
  Arrow keys / spacebar / click to advance, Esc to exit. Slides 06–08 are live: the run can be
  paused and replayed, the result metric toggled, and the volume slider moved during the talk.

Both modes share the same components, data and simulation engine.

## Architecture

| Layer | File | Notes |
| --- | --- | --- |
| Config / data | `src/data/config.ts` | **Every assumption lives here** — model pricing, latency, quality-by-complexity, task token shapes, conversations, volume ranges. Replace these values with Prudential production telemetry. |
| Simulation engine | `src/engine/simulation.ts` | Pure, deterministic. Per-task and aggregate cost / latency / quality; enterprise-scale projections. |
| Playback | `src/engine/playback.ts` | Compressed real-time animation of the simulation (rAF clock, pause/resume/replay). |
| Run experience | `src/components/run/` | Three-lane run, orchestrator decision feed, agent conversation, result comparison. |
| Scale | `src/components/scale/ScalePanel.tsx` | Volume slider (log scale), strategy selector, turns and quality-target controls, utilization. |
| Explore sections | `src/sections/` | Hero, Chapter 01/02/03, finale. |
| Presentation | `src/present/PresentationMode.tsx` | 9 slides composed from the shared components. |

Stack: React 19 · TypeScript · Tailwind CSS 4 · Framer Motion · Vite.
