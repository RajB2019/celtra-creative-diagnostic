// engine/insights.js — pure functions only, no React, no side effects

import { groupBy, compareGroups, computeVariance } from './metrics.js';

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
  ];
}
