// engine/metrics.js — pure functions only, no React, no side effects

/**
 * aggregateKPIs(creatives) → KPISummary
 * Totals impressions; averages CTR, CVR, CPA, ROAS.
 */
export function aggregateKPIs(creatives) {
  if (!creatives || creatives.length === 0) {
    return { totalCreatives: 0, totalImpressions: 0, avgCTR: 0, avgCVR: 0, avgCPA: 0, avgROAS: 0, totalSpend: 0, avgCPM: 0, avgSpend: 0 };
  }
  const n = creatives.length;
  let totalImpressions = 0;
  let sumCTR = 0;
  let sumCVR = 0;
  let sumCPA = 0;
  let sumROAS = 0;
  let totalSpend = 0;
  let sumCPM = 0;

  for (const c of creatives) {
    totalImpressions += c.impressions || 0;
    sumCTR += c.ctr || 0;
    sumCVR += c.cvr || 0;
    sumCPA += c.cpa || 0;
    sumROAS += c.roas || 0;
    totalSpend += c.spend || 0;
    sumCPM += c.cpm || 0;
  }

  return {
    totalCreatives: n,
    totalImpressions,
    avgCTR: sumCTR / n,
    avgCVR: sumCVR / n,
    avgCPA: sumCPA / n,
    avgROAS: sumROAS / n,
    totalSpend: Math.round(totalSpend * 100) / 100,
    avgCPM: Math.round((sumCPM / n) * 100) / 100,
    avgSpend: Math.round((totalSpend / n) * 100) / 100,
  };
}

/**
 * rankByMetric(creatives, metric, topN) → Creative[]
 * Sort descending except CPA (ascending). Slice to topN.
 * metric is expected lowercase (e.g. 'ctr', 'cpa').
 */
export function rankByMetric(creatives, metric, topN) {
  if (!creatives || creatives.length === 0) return [];
  const field = metric.toLowerCase();
  const sorted = [...creatives].sort((a, b) => {
    const aVal = a[field] ?? 0;
    const bVal = b[field] ?? 0;
    return field === 'cpa' ? aVal - bVal : bVal - aVal;
  });
  return topN != null ? sorted.slice(0, topN) : sorted;
}

/**
 * groupBy(creatives, attribute) → Map<string, Creative[]>
 * Groups null/undefined under key "null".
 */
export function groupBy(creatives, attribute) {
  const map = new Map();
  for (const c of creatives) {
    const val = c[attribute];
    const key = val == null ? 'null' : String(val);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(c);
  }
  return map;
}

/**
 * compareGroups(groupA, groupB, metric) → Comparison
 * metric param will be uppercase (e.g. "CTR") — lowercased before field access.
 * Confidence branch order:
 *   1. absΔ < 10  → noise
 *   2. minN < 5   → weak
 *   3. minN in [5,9] and absΔ < 15  → noise
 *   4. minN in [5,9] and absΔ >= 15 → moderate
 *   5. minN >= 10 and absΔ < 15     → moderate
 *   6. minN >= 10 and absΔ >= 15    → strong
 */
export function compareGroups(groupA, groupB, metric) {
  const field = metric.toLowerCase();
  const nA = groupA.length;
  const nB = groupB.length;

  const avg = (arr) => arr.reduce((sum, c) => sum + (c[field] || 0), 0) / arr.length;

  const avgA = nA > 0 ? avg(groupA) : 0;
  const avgB = nB > 0 ? avg(groupB) : 0;

  const delta = avgA - avgB;
  const deltaPercent = avgB !== 0 ? (delta / avgB) * 100 : 0;

  const minN = Math.min(nA, nB);
  const absΔ = Math.abs(deltaPercent);

  let confidence;
  if (absΔ < 10) {
    confidence = 'noise';
  } else if (minN < 5) {
    confidence = 'weak';
  } else if (minN >= 5 && minN <= 9 && absΔ < 15) {
    confidence = 'noise';
  } else if (minN >= 5 && minN <= 9 && absΔ >= 15) {
    confidence = 'moderate';
  } else if (minN >= 10 && absΔ < 15) {
    confidence = 'moderate';
  } else {
    // minN >= 10 && absΔ >= 15
    confidence = 'strong';
  }

  return { avgA, avgB, delta, deltaPercent, nA, nB, confidence };
}

/**
 * normalizeScore(creative, allCreatives) → number (0–100)
 * Peer group: same platform AND funnel_stage.
 * Percentile = rank / (n - 1), 0-indexed rank.
 * If peer group size === 1, that metric's percentile = 0.50 (returns 50 after ×100).
 * CPA is inverted: cpaPct = 1 - percentile.
 * Weights: CTR×0.30, CVR×0.30, ROAS×0.30, CPA×0.10.
 */
export function normalizeScore(creative, allCreatives) {
  const peers = allCreatives.filter(
    (c) => c.platform === creative.platform && c.funnel_stage === creative.funnel_stage
  );
  const n = peers.length;

  const percentile = (values, value) => {
    if (n === 1) return 0.50;
    const sorted = [...values].sort((a, b) => a - b);
    const rank = sorted.indexOf(value);
    // indexOf returns first occurrence; use findIndex on sorted array for deterministic rank
    const idx = sorted.findIndex((v) => v === value);
    return idx / (n - 1);
  };

  const ctrValues = peers.map((c) => c.ctr);
  const cvrValues = peers.map((c) => c.cvr);
  const roasValues = peers.map((c) => c.roas);
  const cpaValues = peers.map((c) => c.cpa);

  const ctrPct = percentile(ctrValues, creative.ctr);
  const cvrPct = percentile(cvrValues, creative.cvr);
  const roasPct = percentile(roasValues, creative.roas);
  const cpaPct = 1 - percentile(cpaValues, creative.cpa);

  const score = ctrPct * 0.30 + cvrPct * 0.30 + roasPct * 0.30 + cpaPct * 0.10;
  return score * 100;
}

/**
 * computeVariance(values) → { mean, stdDev, cv }
 * Population std dev (divide by N, not N-1).
 * cv = stdDev / mean.
 */
export function computeVariance(values) {
  if (!values || values.length === 0) return { mean: 0, stdDev: 0, cv: 0 };
  const n = values.length;
  const mean = values.reduce((sum, v) => sum + v, 0) / n;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n;
  const stdDev = Math.sqrt(variance);
  const cv = mean !== 0 ? stdDev / mean : 0;
  return { mean, stdDev, cv };
}

/**
 * assessMaturity(creative) → { maturity, gated }
 * gated=true when maturity='early' (< 65K impressions) — score is unreliable.
 */
export function assessMaturity(creative) {
  const maturity = creative.maturity || 'early';
  return { maturity, gated: maturity === 'early' };
}

/**
 * isScoreGated(creative) → boolean
 * True when impressions are too low to trust the normalized score.
 */
export function isScoreGated(creative) {
  return (creative.impressions || 0) < 65000;
}
