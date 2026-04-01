// engine/timeseries.js — pure time-series analysis functions, no React, no side effects

/**
 * movingAverage(dailyMetrics, metric, windowSize) → number[]
 * Returns an array of moving averages for the given metric.
 * Output length = dailyMetrics.length - windowSize + 1.
 * Returns [] if dailyMetrics is too short for even one window.
 */
export function movingAverage(dailyMetrics, metric, windowSize) {
  if (!dailyMetrics || dailyMetrics.length < windowSize || windowSize < 1) return [];

  const result = [];
  let sum = 0;

  // Seed first window
  for (let i = 0; i < windowSize; i++) {
    sum += dailyMetrics[i][metric] || 0;
  }
  result.push(Math.round((sum / windowSize) * 100) / 100);

  // Slide
  for (let i = windowSize; i < dailyMetrics.length; i++) {
    sum += (dailyMetrics[i][metric] || 0) - (dailyMetrics[i - windowSize][metric] || 0);
    result.push(Math.round((sum / windowSize) * 100) / 100);
  }

  return result;
}

/**
 * peakWindow(dailyMetrics, metric, windowSize=14) → { startDay, endDay, avg }
 * Finds the contiguous window of `windowSize` days with the highest average for `metric`.
 * Returns null if dailyMetrics is too short.
 */
export function peakWindow(dailyMetrics, metric, windowSize = 14) {
  const avgs = movingAverage(dailyMetrics, metric, windowSize);
  if (avgs.length === 0) return null;

  let bestIdx = 0;
  let bestVal = avgs[0];
  for (let i = 1; i < avgs.length; i++) {
    if (avgs[i] > bestVal) {
      bestVal = avgs[i];
      bestIdx = i;
    }
  }

  return {
    startDay: bestIdx,
    endDay: bestIdx + windowSize - 1,
    avg: bestVal,
  };
}

/**
 * trendDirection(dailyMetrics, metric, windowSize=14) → 'improving'|'stable'|'declining'
 * Compares the average of the first half vs second half of the last `windowSize` days.
 * If the recent half is >10% higher → improving, >10% lower → declining, else stable.
 */
export function trendDirection(dailyMetrics, metric, windowSize = 14) {
  if (!dailyMetrics || dailyMetrics.length < windowSize) return 'stable';

  const recentSlice = dailyMetrics.slice(-windowSize);
  const half = Math.floor(windowSize / 2);
  const firstHalf = recentSlice.slice(0, half);
  const secondHalf = recentSlice.slice(half);

  const avg = (arr) => arr.reduce((s, d) => s + (d[metric] || 0), 0) / arr.length;
  const earlyAvg = avg(firstHalf);
  const lateAvg = avg(secondHalf);

  if (earlyAvg === 0) return lateAvg > 0 ? 'improving' : 'stable';

  const changePct = ((lateAvg - earlyAvg) / earlyAvg) * 100;

  if (changePct > 10) return 'improving';
  if (changePct < -10) return 'declining';
  return 'stable';
}

/**
 * detectStaleness(dailyMetrics, windowSize=14) → { isStale, peakWindowAvg, recentWindowAvg, decayPercent, daysToStale }
 * Compares peak window average impressions to the most recent window.
 * isStale = true when recentWindowAvg is ≤40% of peakWindowAvg (i.e. decayPercent ≥ 60).
 * daysToStale = number of days from the end of the peak window to the end of the series.
 */
export function detectStaleness(dailyMetrics, windowSize = 14) {
  const fallback = { isStale: false, peakWindowAvg: 0, recentWindowAvg: 0, decayPercent: 0, daysToStale: 0 };
  if (!dailyMetrics || dailyMetrics.length < windowSize) return fallback;

  const peak = peakWindow(dailyMetrics, 'impressions', windowSize);
  if (!peak) return fallback;

  // Recent window = last windowSize days
  const recentSlice = dailyMetrics.slice(-windowSize);
  const recentWindowAvg = Math.round(
    (recentSlice.reduce((s, d) => s + (d.impressions || 0), 0) / windowSize) * 100
  ) / 100;

  const peakWindowAvg = peak.avg;
  const decayPercent = peakWindowAvg > 0
    ? Math.round(((peakWindowAvg - recentWindowAvg) / peakWindowAvg) * 100 * 100) / 100
    : 0;

  const daysToStale = dailyMetrics.length - 1 - peak.endDay;

  return {
    isStale: decayPercent >= 60,
    peakWindowAvg,
    recentWindowAvg,
    decayPercent,
    daysToStale,
  };
}

/**
 * classifyLifecycle(dailyMetrics) → string
 * Classifies a creative's lifecycle based on its daily impressions pattern.
 * Returns one of: 'ramping'|'peak'|'evergreen'|'declining'|'stale'
 *
 * Heuristics:
 *   - Split series into thirds (early / mid / late).
 *   - Compare average impressions across thirds.
 *   - Stale: late avg ≤ 40% of max-third avg.
 *   - Declining: late avg ≤ 70% of max-third avg.
 *   - Ramping: early avg is the lowest third AND late avg > mid avg.
 *   - Peak: mid avg is the highest third by >15%.
 *   - Evergreen: all thirds within 30% of each other.
 */
export function classifyLifecycle(dailyMetrics) {
  if (!dailyMetrics || dailyMetrics.length < 3) return 'ramping';

  const len = dailyMetrics.length;
  const third = Math.floor(len / 3);

  const avgSlice = (start, end) => {
    const slice = dailyMetrics.slice(start, end);
    return slice.reduce((s, d) => s + (d.impressions || 0), 0) / slice.length;
  };

  const earlyAvg = avgSlice(0, third);
  const midAvg = avgSlice(third, third * 2);
  const lateAvg = avgSlice(third * 2, len);

  const maxAvg = Math.max(earlyAvg, midAvg, lateAvg);

  if (maxAvg === 0) return 'stale';

  const lateRatio = lateAvg / maxAvg;

  // Stale: late period has dropped to ≤40% of peak period
  if (lateRatio <= 0.40) return 'stale';

  // Declining: late period has dropped to ≤70% of peak period
  if (lateRatio <= 0.70) return 'declining';

  // Ramping: early is lowest and series is still growing
  if (earlyAvg <= midAvg && earlyAvg <= lateAvg && lateAvg > midAvg * 0.95) {
    const earlyRatio = earlyAvg / maxAvg;
    if (earlyRatio < 0.70) return 'ramping';
  }

  // Peak: mid is clearly highest
  if (midAvg > earlyAvg * 1.15 && midAvg > lateAvg * 1.15) return 'peak';

  // Evergreen: all thirds are relatively close
  const minAvg = Math.min(earlyAvg, midAvg, lateAvg);
  if (minAvg / maxAvg >= 0.70) return 'evergreen';

  // Fallback: if late is lower than mid, leaning declining; else ramping
  if (lateAvg < midAvg) return 'declining';
  return 'ramping';
}
