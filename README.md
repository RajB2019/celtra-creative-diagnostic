# Celtra Creative Diagnostic Tool

A browser-based diagnostic tool that helps advertising teams understand why some creatives performed better — and what to produce, cut, or test next.

Most campaign dashboards answer *what happened*. This tool answers *why*, by breaking performance down across creative attributes, quantifying how reliable each pattern is, and connecting findings directly to next steps in your production and media workflow.

---

## Demo

Three persona views, one dataset:

| Route | Persona |
|---|---|
| `/#/` | Performance Marketer |
| `/#/strategist` | Creative Strategist |
| `/#/executive` | Executive |

---

## Getting Started

```bash
cd celtra-creative-diagnostic
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

To build for production:

```bash
npm run build
npm run preview
```

The built `dist/` opens correctly without a server — hash routing means no 404s on direct URLs.

---

## The 5-Step Diagnostic Flow

**Step 1 — Overview**
Every creative receives a normalized performance score (percentile within platform × funnel stage peers). A scatter plot, sortable table, trend sparklines, and lifecycle badges let you immediately identify over- and underperformers on an apples-to-apples basis.

**Step 2 — Patterns**
Nine attribute panels split creatives into groups (Video vs. Static, Short vs. Long Copy, etc.) and compute the performance delta alongside a confidence tier. A Lifecycle Distribution chart shows how creative age breaks down across platform, format, and funnel stage.

**Step 3 — Reliability**
Every pattern surfaces as a SignalCard tagged with its confidence tier — Strong, Moderate, Weak, or Noise. Spend efficiency and lifecycle alerts appear here alongside format signals. Each card includes connected action buttons linking to Celtra Studio, Meta Ads Manager, or TikTok Business Center.

**Step 4 — Recommendations**
Patterns translated into actions: Scale, Test, or Cut. Recommendation language adapts to the active persona — budget framing for Performance Marketers, brief framing for Creative Strategists.

**Step 5 — Summary**
One-screen persona-specific summary of top findings, with connected actions filtered per role.

---

## Confidence Tiers

The tool uses directional confidence tiers rather than p-values. Most creative sets have 30–80 records — too few for valid significance tests. Instead:

| Tier | Criteria |
|---|---|
| **Strong** | N ≥ 10 in smaller group AND \|Δ\| ≥ 15% |
| **Moderate** | Meets one but not both criteria |
| **Weak** | Fewer than 5 creatives in one group |
| **Noise** | \|Δ\| < 10% regardless of N |

Noise findings are shown, not filtered — if copy length shows no effect, that's a real signal.

---

## Architecture

- **100% static** — React, Vite, Tailwind. No backend, no API calls, no auth.
- **Pure engine layer** — `metrics.js`, `insights.js`, `timeseries.js`, `connectedSystems.js` have no React imports and no side effects.
- **21 insight rules** — 14 creative attribute rules, 3 spend efficiency rules, 4 lifecycle rules.
- **Hash routing** — `react-router-dom` HashRouter; built `dist/` works without a server.
- **Seeded synthetic data** — 40 real records + ~40 synthetic records via LCG (seed=42), fully deterministic.

---

## Tech Stack

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/) — scatter plots, bar charts, sparklines
- [react-router-dom](https://reactrouter.com/) — HashRouter persona routing
