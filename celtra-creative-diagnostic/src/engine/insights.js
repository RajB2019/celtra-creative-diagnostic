// engine/insights.js — pure functions only, no React, no side effects

import { groupBy, compareGroups, computeVariance, normalizeScore } from './metrics.js';
import { detectStaleness, classifyLifecycle, trendDirection } from './timeseries.js';

/**
 * assignBucket(direction, confidence, deltaPercent) → 'more' | 'less' | 'test' | null
 */
function assignBucket(direction, confidence, deltaPercent) {
  if (direction === 'positive' && confidence === 'strong') return 'more';
  if (direction === 'negative' && (confidence === 'strong' || confidence === 'moderate')) return 'less';
  if (Math.abs(deltaPercent) >= 15 && (confidence === 'moderate' || confidence === 'weak')) return 'test';
  return null;
}

/**
 * median(values) → number
 */
function median(values) {
  if (!values || values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * percentile75(values) → number
 */
function percentile75(values) {
  if (!values || values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil(sorted.length * 0.75) - 1;
  return sorted[Math.max(0, idx)];
}

/**
 * buildInsight(fields) → InsightObject
 * Fills in computed fields (delta, deltaPercent, direction, recommendationBucket)
 * from a partial insight spec.
 */
function buildInsight({ id, category, patternLabel, metric, labelA, labelB, avgA, avgB, nA, nB, confidence, forceDirection, personas, headline, action }) {
  const delta = avgA - avgB;
  const deltaPercent = avgB !== 0 ? (delta / avgB) * 100 : 0;
  const direction = forceDirection || (delta >= 0 ? 'positive' : 'negative');
  const recommendationBucket = assignBucket(direction, confidence, deltaPercent);

  return {
    id,
    category,
    patternLabel,
    metric,
    labelA,
    labelB,
    avgA,
    avgB,
    delta,
    deltaPercent,
    nA,
    nB,
    confidence,
    direction,
    recommendationBucket,
    personas,
    headline,
    action,
  };
}

// ─── Rule 1: ruleFormatByPlatform ─────────────────────────────────────────────
// Best format per platform, CTR — emits one insight per non-noise format pair per platform
function ruleFormatByPlatform(creatives) {
  const insights = [];
  const byPlatform = groupBy(creatives, 'platform');

  for (const [platform, platformCreatives] of byPlatform) {
    const byFormat = groupBy(platformCreatives, 'format');
    const formats = [...byFormat.keys()];
    if (formats.length < 2) continue;

    // Find best format by avg CTR as labelA reference
    let best = null, bestAvg = -Infinity;
    for (const fmt of formats) {
      const group = byFormat.get(fmt);
      const avg = group.reduce((s, c) => s + (c.ctr || 0), 0) / group.length;
      if (avg > bestAvg) { bestAvg = avg; best = fmt; }
    }

    const groupA = byFormat.get(best);
    if (groupA.length < 3) continue;

    // Compare best vs each other format
    for (const fmt of formats) {
      if (fmt === best) continue;
      const groupB = byFormat.get(fmt);
      if (groupB.length < 3) continue;

      const cmp = compareGroups(groupA, groupB, 'CTR');
      if (cmp.confidence === 'noise') continue;

      const direction = cmp.delta >= 0 ? 'positive' : 'negative';
      const bucket = assignBucket(direction, cmp.confidence, cmp.deltaPercent);

      insights.push({
        id: `format-${platform.toLowerCase()}-${best.toLowerCase()}-vs-${fmt.toLowerCase()}-ctr`,
        category: 'format',
        patternLabel: `${best} vs ${fmt} on ${platform}`,
        metric: 'CTR',
        labelA: best,
        labelB: fmt,
        avgA: cmp.avgA,
        avgB: cmp.avgB,
        delta: cmp.delta,
        deltaPercent: cmp.deltaPercent,
        nA: cmp.nA,
        nB: cmp.nB,
        confidence: cmp.confidence,
        direction,
        recommendationBucket: bucket,
        personas: ['performance', 'strategist', 'executive'],
        headline: {
          performance: `${best} outperforms ${fmt} on ${platform} by ${Math.abs(cmp.deltaPercent).toFixed(0)}% CTR`,
          strategist: `${best} format drives stronger click engagement than ${fmt} on ${platform}`,
          executive: `Shifting to ${best} format on ${platform} improves audience engagement`,
        },
        action: {
          performance: `Reallocate ${platform} budget from ${fmt} to ${best} format to capture CTR gains`,
          strategist: `Audit ${fmt} format creative on ${platform} and test ${best} alternatives`,
          executive: `Prioritize ${best} format in ${platform} media plan to maximize reach efficiency`,
        },
      });
    }
  }

  return insights;
}

// ─── Rule 2: ruleAspectRatioTikTok ────────────────────────────────────────────
// 9:16 vs non-9:16 on TikTok, CTR
function ruleAspectRatioTikTok(creatives) {
  const tiktok = creatives.filter(c => c.platform === 'TikTok');
  const groupA = tiktok.filter(c => c.aspect_ratio === '9:16');
  const groupB = tiktok.filter(c => c.aspect_ratio !== '9:16');

  if (groupA.length < 3 || groupB.length < 3) return [];

  const cmp = compareGroups(groupA, groupB, 'CTR');
  if (cmp.confidence === 'noise') return [];

  return [buildInsight({
    id: 'aspect-ratio-tiktok-ctr',
    category: 'platform',
    patternLabel: '9:16 vs non-9:16 on TikTok',
    metric: 'CTR',
    labelA: '9:16',
    labelB: 'non-9:16',
    avgA: cmp.avgA,
    avgB: cmp.avgB,
    nA: cmp.nA,
    nB: cmp.nB,
    confidence: cmp.confidence,
    personas: ['performance', 'strategist', 'executive'],
    headline: {
      performance: `9:16 aspect ratio delivers ${Math.abs(cmp.deltaPercent).toFixed(0)}% higher CTR on TikTok`,
      strategist: `Native 9:16 format aligns with TikTok's full-screen experience and drives clicks`,
      executive: `Full-screen vertical content on TikTok significantly increases audience engagement`,
    },
    action: {
      performance: `Ensure all TikTok video creatives are produced in 9:16 to capture maximum CTR`,
      strategist: `Audit non-9:16 TikTok creatives and migrate to vertical format`,
      executive: `Standardize TikTok creative production to 9:16 to improve campaign return`,
    },
  })];
}

// ─── Rule 3: ruleAspectRatioMismatch ──────────────────────────────────────────
// 1:1 vs rest on TikTok, CTR (force direction='negative')
function ruleAspectRatioMismatch(creatives) {
  const tiktok = creatives.filter(c => c.platform === 'TikTok');
  const groupA = tiktok.filter(c => c.aspect_ratio === '1:1');
  const groupB = tiktok.filter(c => c.aspect_ratio !== '1:1');

  if (groupA.length < 3 || groupB.length < 3) return [];

  const cmp = compareGroups(groupA, groupB, 'CTR');
  // Force negative direction regardless of actual delta
  const direction = 'negative';
  const bucket = assignBucket(direction, cmp.confidence, cmp.deltaPercent);

  return [{
    id: 'aspect-ratio-mismatch-tiktok-ctr',
    category: 'platform',
    patternLabel: '1:1 format on TikTok (mismatch)',
    metric: 'CTR',
    labelA: '1:1',
    labelB: 'non-1:1 on TikTok',
    avgA: cmp.avgA,
    avgB: cmp.avgB,
    delta: cmp.delta,
    deltaPercent: cmp.deltaPercent,
    nA: cmp.nA,
    nB: cmp.nB,
    confidence: cmp.confidence,
    direction,
    recommendationBucket: bucket,
    personas: ['performance', 'strategist', 'executive'],
    headline: {
      performance: `1:1 format underperforms on TikTok — format mismatch reduces CTR`,
      strategist: `Square (1:1) format is misaligned with TikTok's vertical-first feed`,
      executive: `Running square formats on TikTok wastes budget on low-engagement placements`,
    },
    action: {
      performance: `Pause or convert 1:1 TikTok creatives to 9:16 vertical format`,
      strategist: `Use 1:1 assets only for platforms designed for square formats (e.g., Meta feed)`,
      executive: `Redirect TikTok investment to native vertical formats to stop performance leakage`,
    },
  }];
}

// ─── Rule 4: ruleEmotionalToneByPlatform ──────────────────────────────────────
// Best emotional_tone per platform, CTR — emits one insight per non-noise tone pair per platform
function ruleEmotionalToneByPlatform(creatives) {
  const insights = [];
  const byPlatform = groupBy(creatives, 'platform');

  for (const [platform, platformCreatives] of byPlatform) {
    const byTone = groupBy(platformCreatives, 'emotional_tone');
    const tones = [...byTone.keys()];
    if (tones.length < 2) continue;

    // Find best tone by avg CTR
    let best = null, bestAvg = -Infinity;
    for (const tone of tones) {
      const group = byTone.get(tone);
      const avg = group.reduce((s, c) => s + (c.ctr || 0), 0) / group.length;
      if (avg > bestAvg) { bestAvg = avg; best = tone; }
    }

    const groupA = byTone.get(best);
    if (groupA.length < 3) continue;

    // Compare best vs each other tone
    for (const tone of tones) {
      if (tone === best) continue;
      const groupB = byTone.get(tone);
      if (groupB.length < 3) continue;

      const cmp = compareGroups(groupA, groupB, 'CTR');
      if (cmp.confidence === 'noise') continue;

      const direction = cmp.delta >= 0 ? 'positive' : 'negative';
      const bucket = assignBucket(direction, cmp.confidence, cmp.deltaPercent);

      insights.push({
        id: `emotional-tone-${platform.toLowerCase()}-${best.toLowerCase()}-vs-${tone.toLowerCase()}-ctr`,
        category: 'creative',
        patternLabel: `${best} vs ${tone} tone on ${platform}`,
        metric: 'CTR',
        labelA: best,
        labelB: tone,
        avgA: cmp.avgA,
        avgB: cmp.avgB,
        delta: cmp.delta,
        deltaPercent: cmp.deltaPercent,
        nA: cmp.nA,
        nB: cmp.nB,
        confidence: cmp.confidence,
        direction,
        recommendationBucket: bucket,
        personas: ['performance', 'strategist', 'executive'],
        headline: {
          performance: `${best} tone drives ${Math.abs(cmp.deltaPercent).toFixed(0)}% more clicks vs ${tone} on ${platform}`,
          strategist: `${best} messaging resonates stronger than ${tone} with ${platform} audiences`,
          executive: `Shifting to ${best} messaging on ${platform} improves audience response`,
        },
        action: {
          performance: `Prioritize ${best} tone variants over ${tone} in ${platform} creative rotation`,
          strategist: `Reduce ${tone} tone creatives on ${platform} and test ${best} messaging`,
          executive: `Brief creative teams to use ${best} messaging for ${platform} campaigns`,
        },
      });
    }
  }

  return insights;
}

// ─── Rule 5: ruleEmotionalToneConversion ──────────────────────────────────────
// Urgent vs rest on Conversion stage, CVR
function ruleEmotionalToneConversion(creatives) {
  const conversion = creatives.filter(c => c.funnel_stage === 'Conversion');
  const groupA = conversion.filter(c => c.emotional_tone === 'Urgent');
  const groupB = conversion.filter(c => c.emotional_tone !== 'Urgent');

  if (groupA.length < 3 || groupB.length < 3) return [];

  const cmp = compareGroups(groupA, groupB, 'CVR');
  if (cmp.confidence === 'noise') return [];

  return [buildInsight({
    id: 'emotional-tone-urgent-conversion-cvr',
    category: 'funnel',
    patternLabel: 'Urgent tone in Conversion stage',
    metric: 'CVR',
    labelA: 'Urgent',
    labelB: 'Non-Urgent',
    avgA: cmp.avgA,
    avgB: cmp.avgB,
    nA: cmp.nA,
    nB: cmp.nB,
    confidence: cmp.confidence,
    personas: ['performance', 'strategist', 'executive'],
    headline: {
      performance: `Urgent tone converts ${Math.abs(cmp.deltaPercent).toFixed(0)}% better at conversion stage`,
      strategist: `Urgency-driven messaging accelerates purchase decisions at the bottom of funnel`,
      executive: `Urgent messaging at the conversion stage drives higher purchase completion rates`,
    },
    action: {
      performance: `Shift conversion-stage creative mix toward Urgent tone to improve conversion rate`,
      strategist: `Use time-limited offers and urgency cues in bottom-of-funnel creative`,
      executive: `Ensure conversion campaigns lead with urgency to maximize return on conversion spend`,
    },
  })];
}

// ─── Rule 6: ruleProductFirst3s ───────────────────────────────────────────────
// Video only; true vs false, CTR
function ruleProductFirst3s(creatives) {
  const videos = creatives.filter(c => c.format === 'Video');
  const groupA = videos.filter(c => c.product_in_first_3s === true);
  const groupB = videos.filter(c => c.product_in_first_3s === false);

  if (groupA.length < 3 || groupB.length < 3) return [];

  const cmp = compareGroups(groupA, groupB, 'CTR');
  if (cmp.confidence === 'noise') return [];

  return [buildInsight({
    id: 'product-first-3s-ctr',
    category: 'creative',
    patternLabel: 'Product shown in first 3 seconds (Video)',
    metric: 'CTR',
    labelA: 'Product in first 3s',
    labelB: 'No product in first 3s',
    avgA: cmp.avgA,
    avgB: cmp.avgB,
    nA: cmp.nA,
    nB: cmp.nB,
    confidence: cmp.confidence,
    personas: ['performance', 'strategist', 'executive'],
    headline: {
      performance: `Videos showing product in first 3s achieve ${Math.abs(cmp.deltaPercent).toFixed(0)}% higher CTR`,
      strategist: `Early product reveal hooks viewers before they scroll past`,
      executive: `Leading video ads with the product in the opening seconds drives significantly more traffic`,
    },
    action: {
      performance: `Require all video briefs to feature product in first 3 seconds`,
      strategist: `Restructure video storyboards to open with the hero product shot`,
      executive: `Set a creative standard: product must appear within the first 3 seconds of every video`,
    },
  })];
}

// ─── Rule 7: ruleShortVideo ───────────────────────────────────────────────────
// Video only; ≤15s vs >15s, CTR
function ruleShortVideo(creatives) {
  const videos = creatives.filter(c => c.format === 'Video' && c.video_duration_sec != null);
  const groupA = videos.filter(c => c.video_duration_sec <= 15);
  const groupB = videos.filter(c => c.video_duration_sec > 15);

  if (groupA.length < 3 || groupB.length < 3) return [];

  const cmp = compareGroups(groupA, groupB, 'CTR');
  if (cmp.confidence === 'noise') return [];

  return [buildInsight({
    id: 'short-video-ctr',
    category: 'format',
    patternLabel: 'Short video (≤15s) vs long video (>15s)',
    metric: 'CTR',
    labelA: '≤15s',
    labelB: '>15s',
    avgA: cmp.avgA,
    avgB: cmp.avgB,
    nA: cmp.nA,
    nB: cmp.nB,
    confidence: cmp.confidence,
    personas: ['performance', 'strategist', 'executive'],
    headline: {
      performance: `Short videos (≤15s) generate ${Math.abs(cmp.deltaPercent).toFixed(0)}% more clicks than longer videos`,
      strategist: `Shorter videos retain viewer attention and drive stronger click-through`,
      executive: `Shorter video ads deliver more traffic at lower production investment`,
    },
    action: {
      performance: `Cap video duration at 15 seconds for click-focused campaigns`,
      strategist: `Condense long-form video concepts into 15-second hook-first formats`,
      executive: `Shift video production briefs toward sub-15-second formats to improve efficiency`,
    },
  })];
}

// ─── Rule 8: ruleColorContrast ────────────────────────────────────────────────
// High vs Low contrast, CTR (skip Medium)
function ruleColorContrast(creatives) {
  const groupA = creatives.filter(c => c.color_contrast === 'High');
  const groupB = creatives.filter(c => c.color_contrast === 'Low');

  if (groupA.length < 3 || groupB.length < 3) return [];

  const cmp = compareGroups(groupA, groupB, 'CTR');
  if (cmp.confidence === 'noise') return [];

  return [buildInsight({
    id: 'color-contrast-ctr',
    category: 'creative',
    patternLabel: 'High vs Low color contrast',
    metric: 'CTR',
    labelA: 'High contrast',
    labelB: 'Low contrast',
    avgA: cmp.avgA,
    avgB: cmp.avgB,
    nA: cmp.nA,
    nB: cmp.nB,
    confidence: cmp.confidence,
    personas: ['performance', 'strategist', 'executive'],
    headline: {
      performance: `High contrast creatives drive ${Math.abs(cmp.deltaPercent).toFixed(0)}% more clicks than low contrast`,
      strategist: `Bold, high-contrast visuals stop the scroll and drive click engagement`,
      executive: `High-contrast creative design produces meaningfully more audience engagement`,
    },
    action: {
      performance: `Audit creative library for low-contrast assets and prioritize high-contrast alternatives`,
      strategist: `Set a contrast standard in creative briefs — visuals must pass a high-contrast threshold`,
      executive: `Invest in high-contrast creative production to improve campaign performance`,
    },
  })];
}

// ─── Rule 9: ruleBrandConsistency ─────────────────────────────────────────────
// High vs Low brand_consistency_score, ROAS
function ruleBrandConsistency(creatives) {
  const groupA = creatives.filter(c => c.brand_consistency_score === 'High');
  const groupB = creatives.filter(c => c.brand_consistency_score === 'Low');

  if (groupA.length < 3 || groupB.length < 3) return [];

  const cmp = compareGroups(groupA, groupB, 'ROAS');
  if (cmp.confidence === 'noise') return [];

  return [buildInsight({
    id: 'brand-consistency-roas',
    category: 'creative',
    patternLabel: 'High vs Low brand consistency',
    metric: 'ROAS',
    labelA: 'High brand consistency',
    labelB: 'Low brand consistency',
    avgA: cmp.avgA,
    avgB: cmp.avgB,
    nA: cmp.nA,
    nB: cmp.nB,
    confidence: cmp.confidence,
    personas: ['performance', 'strategist', 'executive'],
    headline: {
      performance: `High brand consistency delivers ${Math.abs(cmp.deltaPercent).toFixed(0)}% higher revenue return`,
      strategist: `Consistent brand identity across creatives drives stronger purchase return`,
      executive: `Brand-consistent advertising delivers higher return on every dollar spent`,
    },
    action: {
      performance: `Deprioritize low brand-consistency creatives in budget allocation`,
      strategist: `Strengthen brand guidelines enforcement in creative review process`,
      executive: `Invest in brand alignment to improve return on advertising investment`,
    },
  })];
}

// ─── Rule 10: ruleBrandProminenceConversion ────────────────────────────────────
// Conversion stage; Dominant vs rest, CVR
function ruleBrandProminenceConversion(creatives) {
  const conversion = creatives.filter(c => c.funnel_stage === 'Conversion');
  const groupA = conversion.filter(c => c.brand_prominence === 'Dominant');
  const groupB = conversion.filter(c => c.brand_prominence !== 'Dominant');

  if (groupA.length < 3 || groupB.length < 3) return [];

  const cmp = compareGroups(groupA, groupB, 'CVR');
  if (cmp.confidence === 'noise') return [];

  return [buildInsight({
    id: 'brand-prominence-conversion-cvr',
    category: 'funnel',
    patternLabel: 'Dominant brand prominence at Conversion stage',
    metric: 'CVR',
    labelA: 'Dominant',
    labelB: 'Non-Dominant',
    avgA: cmp.avgA,
    avgB: cmp.avgB,
    nA: cmp.nA,
    nB: cmp.nB,
    confidence: cmp.confidence,
    personas: ['performance', 'strategist', 'executive'],
    headline: {
      performance: `Dominant brand placement converts ${Math.abs(cmp.deltaPercent).toFixed(0)}% better at conversion stage`,
      strategist: `Strong brand presence at the point of purchase reduces hesitation`,
      executive: `Prominent brand placement in conversion ads increases purchase completion`,
    },
    action: {
      performance: `Ensure conversion-stage creatives feature dominant brand placement`,
      strategist: `Redesign conversion creatives to foreground brand identity at decision moment`,
      executive: `Require dominant brand visibility in all bottom-of-funnel creative`,
    },
  })];
}

// ─── Rule 11: ruleBudgetDrain ──────────────────────────────────────────────────
// Impressions above 75th pct AND ROAS below median; diagnostic insight
function ruleBudgetDrain(creatives) {
  const impressions = creatives.map(c => c.impressions);
  const roasValues = creatives.map(c => c.roas);
  const imp75 = percentile75(impressions);
  const roasMed = median(roasValues);

  const drains = creatives.filter(c => c.impressions > imp75 && c.roas < roasMed);
  if (drains.length < 3) return [];

  const avgDrainROAS = drains.reduce((s, c) => s + c.roas, 0) / drains.length;
  const avgDrainImp = drains.reduce((s, c) => s + c.impressions, 0) / drains.length;
  const restROAS = creatives.filter(c => !(c.impressions > imp75 && c.roas < roasMed));
  const avgRestROAS = restROAS.length > 0 ? restROAS.reduce((s, c) => s + c.roas, 0) / restROAS.length : 0;
  const delta = avgDrainROAS - avgRestROAS;
  const deltaPercent = avgRestROAS !== 0 ? (delta / avgRestROAS) * 100 : 0;

  return [{
    id: 'budget-drain-diagnostic',
    category: 'funnel',
    patternLabel: 'High-impression, low-return creatives (budget drain)',
    metric: 'ROAS',
    labelA: 'Budget drains',
    labelB: 'Rest of portfolio',
    avgA: avgDrainROAS,
    avgB: avgRestROAS,
    delta,
    deltaPercent,
    nA: drains.length,
    nB: restROAS.length,
    confidence: 'strong',
    direction: 'negative',
    recommendationBucket: 'less',
    personas: ['performance', 'strategist', 'executive'],
    headline: {
      performance: `${drains.length} creatives consuming high impressions but returning below-median revenue`,
      strategist: `High-reach creatives failing to convert volume into return — structural inefficiency`,
      executive: `A portion of the portfolio consumes significant media investment with low return`,
    },
    action: {
      performance: `Identify and deprioritize the ${drains.length} budget-drain creatives in the next rotation`,
      strategist: `Investigate whether high-impression low-return creatives reflect wrong audience or wrong message`,
      executive: `Reduce allocation to high-spend, low-return placements to improve overall portfolio efficiency`,
    },
  }];
}

// ─── Rule 12: ruleConversionLeakage ───────────────────────────────────────────
// Conversion stage; CTR above median but CVR below median; diagnostic insight
function ruleConversionLeakage(creatives) {
  const conversion = creatives.filter(c => c.funnel_stage === 'Conversion');
  if (conversion.length < 3) return [];

  const ctrValues = conversion.map(c => c.ctr);
  const cvrValues = conversion.map(c => c.cvr);
  const ctrMed = median(ctrValues);
  const cvrMed = median(cvrValues);

  const leakers = conversion.filter(c => c.ctr > ctrMed && c.cvr < cvrMed);
  if (leakers.length < 3) return [];

  const avgLeakerCVR = leakers.reduce((s, c) => s + c.cvr, 0) / leakers.length;
  const avgLeakerCTR = leakers.reduce((s, c) => s + c.ctr, 0) / leakers.length;
  const rest = conversion.filter(c => !(c.ctr > ctrMed && c.cvr < cvrMed));
  const avgRestCVR = rest.length > 0 ? rest.reduce((s, c) => s + c.cvr, 0) / rest.length : 0;
  const delta = avgLeakerCVR - avgRestCVR;
  const deltaPercent = avgRestCVR !== 0 ? (delta / avgRestCVR) * 100 : 0;

  return [{
    id: 'conversion-leakage-diagnostic',
    category: 'funnel',
    patternLabel: 'High-CTR, low-CVR conversion creatives (leakage)',
    metric: 'CVR',
    labelA: 'Leaking creatives',
    labelB: 'Rest of conversion set',
    avgA: avgLeakerCVR,
    avgB: avgRestCVR,
    delta,
    deltaPercent,
    nA: leakers.length,
    nB: rest.length,
    confidence: 'moderate',
    direction: 'negative',
    recommendationBucket: assignBucket('negative', 'moderate', deltaPercent),
    personas: ['performance', 'strategist', 'executive'],
    headline: {
      performance: `${leakers.length} conversion creatives drive clicks but fail to convert — funnel leakage detected`,
      strategist: `High engagement but low purchase completion signals a landing page or creative-offer mismatch`,
      executive: `Some conversion ads attract clicks but do not close — wasted traffic is reducing purchase volume`,
    },
    action: {
      performance: `Audit post-click experience for high-CTR, low-CVR conversion creatives`,
      strategist: `Check whether ad messaging matches landing page offer and CTA`,
      executive: `Investigate conversion-leakage creatives to stop paying for traffic that does not purchase`,
    },
  }];
}

// ─── Rule 13: ruleFunnelROASReliability ───────────────────────────────────────
// Awareness stage; computeVariance on ROAS; if cv > 0.4 emit weak insight
function ruleFunnelROASReliability(creatives) {
  const awareness = creatives.filter(c => c.funnel_stage === 'Awareness');
  if (awareness.length < 3) return [];

  const roasValues = awareness.map(c => c.roas);
  const { mean, cv } = computeVariance(roasValues);

  if (cv <= 0.4) return [];

  return [{
    id: 'funnel-roas-reliability-awareness',
    category: 'funnel',
    patternLabel: 'ROAS volatility in Awareness stage',
    metric: 'ROAS',
    labelA: 'High-variance awareness creatives',
    labelB: 'Stable benchmark',
    avgA: mean,
    avgB: mean,
    delta: 0,
    deltaPercent: 0,
    nA: awareness.length,
    nB: awareness.length,
    confidence: 'weak',
    direction: 'negative',
    recommendationBucket: null,
    personas: ['performance', 'strategist'],
    headline: {
      performance: `Awareness-stage revenue return is highly volatile (cv=${cv.toFixed(2)}) — signals unreliable`,
      strategist: `High variability in awareness campaign returns makes budget decisions difficult to trust`,
      executive: `Awareness investment returns are inconsistent — caution advised before scaling`,
    },
    action: {
      performance: `Monitor awareness-stage performance weekly before scaling investment`,
      strategist: `Reduce creative variation in awareness campaigns to stabilize return patterns`,
      executive: `Hold awareness budget steady until performance consistency improves`,
    },
  }];
}

// ─── Rule 14: ruleMotionIntensity ─────────────────────────────────────────────
// TikTok only; High vs None motion, CTR
function ruleMotionIntensity(creatives) {
  const tiktok = creatives.filter(c => c.platform === 'TikTok');
  const groupA = tiktok.filter(c => c.motion_intensity === 'High');
  const groupB = tiktok.filter(c => c.motion_intensity === 'None');

  if (groupA.length < 3 || groupB.length < 3) return [];

  const cmp = compareGroups(groupA, groupB, 'CTR');
  if (cmp.confidence === 'noise') return [];

  return [buildInsight({
    id: 'motion-intensity-tiktok-ctr',
    category: 'platform',
    patternLabel: 'High vs No motion on TikTok',
    metric: 'CTR',
    labelA: 'High motion',
    labelB: 'No motion',
    avgA: cmp.avgA,
    avgB: cmp.avgB,
    nA: cmp.nA,
    nB: cmp.nB,
    confidence: cmp.confidence,
    personas: ['performance', 'strategist', 'executive'],
    headline: {
      performance: `High motion creatives on TikTok drive ${Math.abs(cmp.deltaPercent).toFixed(0)}% more clicks than static`,
      strategist: `Dynamic motion captures attention in TikTok's fast-scrolling feed`,
      executive: `Motion-rich content on TikTok generates substantially more audience engagement than static`,
    },
    action: {
      performance: `Replace static TikTok assets with high-motion video to lift click rates`,
      strategist: `Design TikTok creative with fast cuts, movement, and visual energy`,
      executive: `Invest in dynamic creative production for TikTok to maximize audience engagement`,
    },
  })];
}

// ─── Rule 15: ruleSpendEfficiency ────────────────────────────────────────────
// Top-spend-quartile vs bottom-spend-quartile, ROAS
function ruleSpendEfficiency(creatives) {
  const sorted = [...creatives].sort((a, b) => (a.spend || 0) - (b.spend || 0));
  const q = Math.floor(sorted.length / 4);
  if (q < 3) return [];

  const bottomQ = sorted.slice(0, q);
  const topQ = sorted.slice(sorted.length - q);

  if (topQ.length < 3 || bottomQ.length < 3) return [];

  const cmp = compareGroups(topQ, bottomQ, 'ROAS');
  if (cmp.confidence === 'noise') return [];

  const direction = cmp.delta >= 0 ? 'positive' : 'negative';
  const bucket = assignBucket(direction, cmp.confidence, cmp.deltaPercent);

  return [{
    id: 'spend-efficiency-top-vs-bottom-roas',
    category: 'spend',
    patternLabel: 'Top-spend quartile vs bottom-spend quartile',
    metric: 'ROAS',
    labelA: 'Top spend quartile',
    labelB: 'Bottom spend quartile',
    avgA: cmp.avgA,
    avgB: cmp.avgB,
    delta: cmp.delta,
    deltaPercent: cmp.deltaPercent,
    nA: cmp.nA,
    nB: cmp.nB,
    confidence: cmp.confidence,
    direction,
    recommendationBucket: bucket,
    personas: ['performance', 'strategist', 'executive'],
    headline: {
      performance: `Top-spend creatives return ${Math.abs(cmp.deltaPercent).toFixed(0)}% ${direction === 'positive' ? 'higher' : 'lower'} revenue per dollar vs bottom-spend`,
      strategist: `Highest-investment creatives ${direction === 'positive' ? 'justify' : 'do not justify'} their spend with proportional returns`,
      executive: `The highest-funded creatives ${direction === 'positive' ? 'deliver proportionally stronger' : 'underdeliver on'} revenue return`,
    },
    action: {
      performance: `${direction === 'positive' ? 'Continue scaling top-spend creatives' : 'Audit top-spend creatives for diminishing returns'} and rebalance budget`,
      strategist: `Review whether spend concentration aligns with creative quality and audience fit`,
      executive: `${direction === 'positive' ? 'Sustain investment in top performers' : 'Redistribute budget from underperforming high-spend creatives to improve portfolio return'}`,
    },
  }];
}

// ─── Rule 16: ruleUnderfunded ────────────────────────────────────────────────
// High-potential creatives (normalizeScore > 65) still in early maturity
function ruleUnderfunded(creatives) {
  // Score threshold: 50 (above peer-group median). normalizeScore returns
  // floating-point values that can land at 49.999… due to rounding, so we
  // round before comparing to avoid excluding creatives that are effectively
  // at the threshold.
  const scoreThreshold = 50;
  const scored = creatives.map(c => ({ c, score: normalizeScore(c, creatives) }));
  const underfunded = scored
    .filter(({ c, score }) => Math.round(score) >= scoreThreshold && c.maturity === 'early')
    .map(({ c }) => c);

  if (underfunded.length < 2) return [];

  const underfundedSet = new Set(underfunded);
  const avgScore = underfunded.reduce((s, c) => s + normalizeScore(c, creatives), 0) / underfunded.length;
  const avgImp = underfunded.reduce((s, c) => s + (c.impressions || 0), 0) / underfunded.length;
  const rest = creatives.filter(c => !underfundedSet.has(c));
  const avgRestImp = rest.length > 0 ? rest.reduce((s, c) => s + (c.impressions || 0), 0) / rest.length : 0;

  return [{
    id: 'spend-underfunded-high-potential',
    category: 'spend',
    patternLabel: 'High-potential creatives with low impressions',
    metric: 'impressions',
    labelA: 'Underfunded high-potential',
    labelB: 'Rest of portfolio',
    avgA: avgImp,
    avgB: avgRestImp,
    delta: avgImp - avgRestImp,
    deltaPercent: avgRestImp !== 0 ? ((avgImp - avgRestImp) / avgRestImp) * 100 : 0,
    nA: underfunded.length,
    nB: rest.length,
    confidence: 'moderate',
    direction: 'positive',
    recommendationBucket: 'more',
    personas: ['performance', 'strategist', 'executive'],
    headline: {
      performance: `${underfunded.length} high-scoring creatives are stuck in early maturity — increase delivery`,
      strategist: `Strong creatives are being held back by low impression volume`,
      executive: `${underfunded.length} promising creatives need more investment to reach their potential`,
    },
    action: {
      performance: `Increase budget allocation for the ${underfunded.length} underfunded high-potential creatives`,
      strategist: `Prioritize scaling these early-stage winners before testing new concepts`,
      executive: `Fund high-potential creatives that have not yet received enough media investment`,
    },
  }];
}

// ─── Rule 17: ruleSpendMaturityWarning ───────────────────────────────────────
// Early-maturity creatives that look like under-performers (score < 35) — diagnostic only
function ruleSpendMaturityWarning(creatives) {
  const tooEarly = creatives.filter(c =>
    c.maturity === 'early' && normalizeScore(c, creatives) < 35
  );

  if (tooEarly.length < 2) return [];

  const avgScore = tooEarly.reduce((s, c) => s + normalizeScore(c, creatives), 0) / tooEarly.length;
  const avgImp = tooEarly.reduce((s, c) => s + (c.impressions || 0), 0) / tooEarly.length;

  return [{
    id: 'spend-maturity-warning-too-early',
    category: 'spend',
    patternLabel: 'Low-scoring creatives still in early maturity',
    metric: 'impressions',
    labelA: 'Early + low-score',
    labelB: 'N/A (diagnostic)',
    avgA: avgImp,
    avgB: 0,
    delta: 0,
    deltaPercent: 0,
    nA: tooEarly.length,
    nB: 0,
    confidence: 'weak',
    direction: 'negative',
    recommendationBucket: null,
    personas: ['performance', 'strategist', 'executive'],
    headline: {
      performance: `${tooEarly.length} creatives score low but have too few impressions to judge — too early to call`,
      strategist: `Some creatives appear weak, but limited delivery makes the signal unreliable`,
      executive: `${tooEarly.length} creatives look underperforming but haven't had enough exposure to confirm`,
    },
    action: {
      performance: `Do not pause these ${tooEarly.length} creatives yet — wait for maturity before judging performance`,
      strategist: `Flag as "pending maturity" and revisit after impressions exceed the early threshold`,
      executive: `Hold decisions on early-stage creatives until enough data accumulates to be reliable`,
    },
  }];
}

// ─── Rule 18: ruleLifecycleStaleness ────────────────────────────────────────
// Stale creatives (detectStaleness.isStale === true). Bucket: 'less'. Key automation trigger.
function ruleLifecycleStaleness(creatives) {
  const stale = creatives.filter(c => {
    if (!c.daily_metrics || c.daily_metrics.length === 0) return false;
    const staleness = detectStaleness(c.daily_metrics);
    return staleness.isStale;
  });

  if (stale.length < 2) return [];

  const avgDecay = stale.reduce((s, c) => s + detectStaleness(c.daily_metrics).decayPercent, 0) / stale.length;
  const rest = creatives.filter(c => {
    if (!c.daily_metrics || c.daily_metrics.length === 0) return true;
    return !detectStaleness(c.daily_metrics).isStale;
  });
  const avgStaleImp = stale.reduce((s, c) => s + (c.impressions || 0), 0) / stale.length;
  const avgRestImp = rest.length > 0 ? rest.reduce((s, c) => s + (c.impressions || 0), 0) / rest.length : 0;

  return [{
    id: 'lifecycle-staleness-detected',
    category: 'lifecycle',
    patternLabel: 'Stale creatives with significant audience decay',
    metric: 'impressions',
    labelA: 'Stale creatives',
    labelB: 'Active creatives',
    avgA: avgStaleImp,
    avgB: avgRestImp,
    delta: avgStaleImp - avgRestImp,
    deltaPercent: avgRestImp !== 0 ? ((avgStaleImp - avgRestImp) / avgRestImp) * 100 : 0,
    nA: stale.length,
    nB: rest.length,
    confidence: 'strong',
    direction: 'negative',
    recommendationBucket: 'less',
    personas: ['performance', 'strategist', 'executive'],
    headline: {
      performance: `${stale.length} creatives are stale — avg ${avgDecay.toFixed(0)}% decay from peak impressions`,
      strategist: `${stale.length} creatives have exhausted their audience — diminishing returns on continued delivery`,
      executive: `${stale.length} ads have gone stale and are no longer reaching new audiences effectively`,
    },
    action: {
      performance: `Pause or rotate the ${stale.length} stale creatives and replace with fresh variants`,
      strategist: `Schedule creative refresh for stale assets — audience fatigue is reducing delivery efficiency`,
      executive: `Replace aging ads that have stopped performing to maintain portfolio freshness`,
    },
  }];
}

// ─── Rule 19: ruleEvergreenPerformers ───────────────────────────────────────
// Evergreen lifecycle + high normalized score. Bucket: 'more'.
function ruleEvergreenPerformers(creatives) {
  const scored = creatives.map(c => ({ c, score: normalizeScore(c, creatives) }));
  const evergreens = scored
    .filter(({ c, score }) => c.lifecycle === 'evergreen' && score >= 60)
    .map(({ c }) => c);

  if (evergreens.length < 2) return [];

  const evergreenSet = new Set(evergreens);
  const avgScore = evergreens.reduce((s, c) => s + normalizeScore(c, creatives), 0) / evergreens.length;
  const avgImp = evergreens.reduce((s, c) => s + (c.impressions || 0), 0) / evergreens.length;
  const rest = creatives.filter(c => !evergreenSet.has(c));
  const avgRestImp = rest.length > 0 ? rest.reduce((s, c) => s + (c.impressions || 0), 0) / rest.length : 0;

  return [{
    id: 'lifecycle-evergreen-high-performers',
    category: 'lifecycle',
    patternLabel: 'Evergreen creatives with strong performance scores',
    metric: 'impressions',
    labelA: 'Evergreen high-performers',
    labelB: 'Rest of portfolio',
    avgA: avgImp,
    avgB: avgRestImp,
    delta: avgImp - avgRestImp,
    deltaPercent: avgRestImp !== 0 ? ((avgImp - avgRestImp) / avgRestImp) * 100 : 0,
    nA: evergreens.length,
    nB: rest.length,
    confidence: 'strong',
    direction: 'positive',
    recommendationBucket: 'more',
    personas: ['performance', 'strategist', 'executive'],
    headline: {
      performance: `${evergreens.length} evergreen creatives maintain strong scores (avg ${avgScore.toFixed(0)}) — scale them`,
      strategist: `${evergreens.length} creatives show sustained performance without audience fatigue`,
      executive: `${evergreens.length} ads continue to deliver strong results over time — proven winners`,
    },
    action: {
      performance: `Increase budget allocation for the ${evergreens.length} evergreen high-performers`,
      strategist: `Use evergreen creatives as always-on anchors and study what makes them durable`,
      executive: `Invest more in proven long-lasting ads to maximize sustained portfolio performance`,
    },
  }];
}

// ─── Rule 20: ruleDecayByPlatform ───────────────────────────────────────────
// Compare average decay rates across platforms
function ruleDecayByPlatform(creatives) {
  const insights = [];
  const byPlatform = groupBy(creatives, 'platform');

  // Compute average decay percent per platform
  const platformDecay = [];
  for (const [platform, platformCreatives] of byPlatform) {
    const withMetrics = platformCreatives.filter(c => c.daily_metrics && c.daily_metrics.length >= 14);
    if (withMetrics.length < 3) continue;
    const decays = withMetrics.map(c => detectStaleness(c.daily_metrics).decayPercent);
    const avgDecay = decays.reduce((s, d) => s + d, 0) / decays.length;
    platformDecay.push({ platform, avgDecay, n: withMetrics.length, creatives: withMetrics });
  }

  if (platformDecay.length < 2) return insights;

  // Sort by decay: highest decay first
  platformDecay.sort((a, b) => b.avgDecay - a.avgDecay);

  const worst = platformDecay[0];
  const best = platformDecay[platformDecay.length - 1];

  if (worst.avgDecay - best.avgDecay < 10) return insights; // not meaningful

  const delta = worst.avgDecay - best.avgDecay;
  const deltaPercent = best.avgDecay !== 0 ? (delta / best.avgDecay) * 100 : 0;
  const confidence = (worst.n >= 10 && best.n >= 10) ? 'strong' : (worst.n >= 5 && best.n >= 5) ? 'moderate' : 'weak';

  insights.push({
    id: `lifecycle-decay-${worst.platform.toLowerCase()}-vs-${best.platform.toLowerCase()}`,
    category: 'lifecycle',
    patternLabel: `Creative decay: ${worst.platform} vs ${best.platform}`,
    metric: 'decay_percent',
    labelA: worst.platform,
    labelB: best.platform,
    avgA: worst.avgDecay,
    avgB: best.avgDecay,
    delta,
    deltaPercent,
    nA: worst.n,
    nB: best.n,
    confidence,
    direction: 'negative',
    recommendationBucket: assignBucket('negative', confidence, deltaPercent),
    personas: ['performance', 'strategist', 'executive'],
    headline: {
      performance: `${worst.platform} creatives decay ${delta.toFixed(0)}pp faster than ${best.platform} — refresh more often`,
      strategist: `Creative fatigue sets in faster on ${worst.platform} — shorter shelf life requires more frequent rotation`,
      executive: `Ads on ${worst.platform} lose effectiveness faster than on ${best.platform} — rotation cadence needs adjustment`,
    },
    action: {
      performance: `Shorten creative rotation intervals on ${worst.platform} and monitor decay rates weekly`,
      strategist: `Plan a faster creative refresh cadence for ${worst.platform} campaigns`,
      executive: `Increase creative production pipeline for ${worst.platform} to counter faster audience fatigue`,
    },
  });

  return insights;
}

// ─── Rule 21: ruleRampingPotential ──────────────────────────────────────────
// Ramping lifecycle + above-median metrics. Bucket: 'test'.
function ruleRampingPotential(creatives) {
  const ramping = creatives.filter(c => c.lifecycle === 'ramping');
  if (ramping.length < 2) return [];

  const ctrMed = median(creatives.map(c => c.ctr));
  const cvrMed = median(creatives.map(c => c.cvr));

  const promising = ramping.filter(c => c.ctr > ctrMed || c.cvr > cvrMed);
  if (promising.length < 2) return [];

  const promisingSet = new Set(promising);
  const avgCTR = promising.reduce((s, c) => s + (c.ctr || 0), 0) / promising.length;
  const avgImp = promising.reduce((s, c) => s + (c.impressions || 0), 0) / promising.length;
  const rest = creatives.filter(c => !promisingSet.has(c));
  const avgRestImp = rest.length > 0 ? rest.reduce((s, c) => s + (c.impressions || 0), 0) / rest.length : 0;

  return [{
    id: 'lifecycle-ramping-potential',
    category: 'lifecycle',
    patternLabel: 'Ramping creatives with above-median engagement',
    metric: 'impressions',
    labelA: 'Promising ramping creatives',
    labelB: 'Rest of portfolio',
    avgA: avgImp,
    avgB: avgRestImp,
    delta: avgImp - avgRestImp,
    deltaPercent: avgRestImp !== 0 ? ((avgImp - avgRestImp) / avgRestImp) * 100 : 0,
    nA: promising.length,
    nB: rest.length,
    confidence: 'moderate',
    direction: 'positive',
    recommendationBucket: 'test',
    personas: ['performance', 'strategist', 'executive'],
    headline: {
      performance: `${promising.length} ramping creatives show above-median engagement — candidates for scale testing`,
      strategist: `${promising.length} early-stage creatives are outperforming peers — worth accelerating`,
      executive: `${promising.length} newer ads show early promise and deserve more investment to validate`,
    },
    action: {
      performance: `Increase delivery on the ${promising.length} promising ramping creatives to accelerate learning`,
      strategist: `Prioritize these ramping creatives for A/B test slots in the next campaign cycle`,
      executive: `Fund early winners to determine which new ads can scale into top performers`,
    },
  }];
}

/**
 * generateInsights(creatives) → InsightObject[]
 */
export function generateInsights(creatives) {
  return [
    ...ruleFormatByPlatform(creatives),
    ...ruleAspectRatioTikTok(creatives),
    ...ruleAspectRatioMismatch(creatives),
    ...ruleEmotionalToneByPlatform(creatives),
    ...ruleEmotionalToneConversion(creatives),
    ...ruleProductFirst3s(creatives),
    ...ruleShortVideo(creatives),
    ...ruleColorContrast(creatives),
    ...ruleBrandConsistency(creatives),
    ...ruleBrandProminenceConversion(creatives),
    ...ruleBudgetDrain(creatives),
    ...ruleConversionLeakage(creatives),
    ...ruleFunnelROASReliability(creatives),
    ...ruleMotionIntensity(creatives),
    ...ruleSpendEfficiency(creatives),
    ...ruleUnderfunded(creatives),
    ...ruleSpendMaturityWarning(creatives),
    ...ruleLifecycleStaleness(creatives),
    ...ruleEvergreenPerformers(creatives),
    ...ruleDecayByPlatform(creatives),
    ...ruleRampingPotential(creatives),
  ];
}
