// Time-series augmentation layer
// Imports flat CREATIVES from creatives.js, adds daily_metrics[] (90 days) and lifecycle to each record.
// Uses a separate LCG (seed=271) so flat-record values are untouched.

import CREATIVES from './creatives.js';

// ─── Third LCG (seed=271) for time-series generation ────────────────────────
let tsSeed = 271;
function tsLcg() {
  tsSeed = (tsSeed * 1664525 + 1013904223) & 0xffffffff;
  return (tsSeed >>> 0) / 0xffffffff;
}
function tsNoise(center, pct) { return center * (1 + (tsLcg() - 0.5) * 2 * pct); }

// ─── Lifecycle curve multipliers ─────────────────────────────────────────────
// Each returns a value in ~0.15–1.0 representing creative quality on that day.

function curveRamping(day) {
  if (day < 15) return 0.20 + 0.20 * (day / 14);
  if (day < 46) return 0.40 + 0.40 * ((day - 15) / 30);
  return 0.80 + 0.20 * ((day - 46) / 44);
}

function curvePeak(day) {
  if (day < 8)  return 0.30 + 0.70 * (day / 7);
  if (day < 31) return 0.90 + 0.10 * Math.sin((day - 8) / 22 * Math.PI); // subtle wave at plateau
  if (day < 61) return 1.0 - 0.25 * ((day - 30) / 30);
  return 0.75 - 0.10 * ((day - 60) / 30);
}

function curveEvergreen(day) {
  if (day < 11) return 0.50 + 0.50 * (day / 10);
  // Slight sine wave for realistic micro-fluctuation
  return 0.90 + 0.10 * Math.sin(day / 7);
}

function curveDeclining(day) {
  if (day < 15) return 0.70 + 0.30 * (day / 14);
  if (day < 46) return 1.0 - 0.45 * ((day - 14) / 31);
  return 0.55 - 0.20 * ((day - 45) / 45);
}

function curveStale(day) {
  if (day < 8)  return 0.70 + 0.30 * (day / 7);
  if (day < 22) return 1.0 - 0.60 * ((day - 7) / 14);
  return 0.40 - 0.20 * ((day - 21) / 69);
}

const CURVE_FNS = {
  ramping:   curveRamping,
  peak:      curvePeak,
  evergreen: curveEvergreen,
  declining: curveDeclining,
  stale:     curveStale,
};

// ─── Lifecycle assignment ────────────────────────────────────────────────────
// Weighted random based on creative attributes.

function assignLifecycle(creative) {
  const w = { ramping: 1, peak: 1, evergreen: 1, declining: 1, stale: 1 };

  // TikTok + High motion → novelty-dependent, more stale/declining
  if (creative.platform === 'TikTok' && creative.motion_intensity === 'High') {
    w.stale += 3;
    w.declining += 2;
  }

  // High brand consistency → durable, more evergreen
  if (creative.brand_consistency_score === 'High') {
    w.evergreen += 3;
  }

  // Low brand consistency → fragile, more stale
  if (creative.brand_consistency_score === 'Low') {
    w.stale += 2;
  }

  // Conversion stage → always-on, more evergreen
  if (creative.funnel_stage === 'Conversion') {
    w.evergreen += 2;
  }

  // Awareness → trend-dependent, more declining
  if (creative.funnel_stage === 'Awareness') {
    w.declining += 2;
    w.peak += 1;
  }

  // Low impressions → may still be ramping
  if (creative.maturity === 'early') {
    w.ramping += 3;
  }

  // Build weighted pool and pick
  const pool = [];
  for (const [type, weight] of Object.entries(w)) {
    for (let j = 0; j < weight; j++) pool.push(type);
  }
  return pool[Math.floor(tsLcg() * pool.length)];
}

// ─── Daily metrics generation ────────────────────────────────────────────────
// Spec: dailyBase = impressions / 90, then curve multiplier + ±5% daily noise.
// After raw generation, normalize so sum of daily impressions matches lifetime.

function generateDailyMetrics(creative, lifecycle) {
  const curveFn = CURVE_FNS[lifecycle];
  const dailyImpBase = creative.impressions / 90;

  // Pass 1: generate raw impression values shaped by curve + ±5% noise
  const rawImps = [];
  for (let day = 0; day < 90; day++) {
    const mult = curveFn(day);
    const noise = 1 + (tsLcg() - 0.5) * 0.10; // ±5%
    rawImps.push(Math.max(0.01, dailyImpBase * mult * noise));
  }

  // Normalize so sum matches lifetime impressions exactly
  const rawSum = rawImps.reduce((s, v) => s + v, 0);
  const scale = creative.impressions / rawSum;

  // Pass 2: build daily metric objects using normalized impressions
  const days = [];
  for (let day = 0; day < 90; day++) {
    const mult = curveFn(day);
    const impressions = Math.max(1, Math.round(rawImps[day] * scale));

    // CTR: scales with lifecycle curve + ±8% noise
    const ctr = Math.max(0.001, tsNoise(creative.ctr * mult, 0.08));

    // CVR: partially tracks curve (less fatigue-sensitive) + ±8% noise
    const cvrMult = 0.60 + 0.40 * mult;
    const cvr = Math.max(0.001, tsNoise(creative.cvr * cvrMult, 0.08));

    // Derived metrics
    const clicks      = Math.round(impressions * ctr);
    const conversions = Math.round(impressions * cvr);
    const spend       = Math.round(impressions * creative.cpm / 1000 * 100) / 100;
    const cpa         = conversions > 0 ? Math.round(spend / conversions * 100) / 100 : null;
    const roas        = spend > 0 ? Math.max(0.1, Math.round(tsNoise(creative.roas * mult, 0.10) * 10) / 10) : null;

    days.push({
      day,
      impressions,
      clicks,
      conversions,
      spend,
      ctr:  Math.round(ctr * 10000) / 10000,
      cvr:  Math.round(cvr * 10000) / 10000,
      cpa,
      roas,
    });
  }

  return days;
}

// ─── Augment all creatives ───────────────────────────────────────────────────

const ENRICHED = CREATIVES.map(c => {
  const lifecycle = assignLifecycle(c);
  const daily_metrics = generateDailyMetrics(c, lifecycle);
  return { ...c, lifecycle, daily_metrics };
});

export default ENRICHED;
