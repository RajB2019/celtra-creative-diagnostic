// Real records: C001–C040 (transcribed verbatim from CSV)
// product_in_first_3s is normalized to boolean
// video_duration_sec is null for Image and Carousel rows

const realCreatives = [
  { creative_id: 'C001', platform: 'Meta',   format: 'Video',    video_duration_sec: 6,    aspect_ratio: '9:16', emotional_tone: 'Urgent',     motion_intensity: 'High',   color_contrast: 'High',   brand_prominence: 'Balanced', brand_consistency_score: 'High',   funnel_stage: 'Conversion',    cta: 'Shop Now',   product_in_first_3s: true,  impressions: 120000, ctr: 0.018, cvr: 0.042, cpa: 18.5, roas: 2.8 },
  { creative_id: 'C002', platform: 'Meta',   format: 'Video',    video_duration_sec: 15,   aspect_ratio: '4:5',  emotional_tone: 'Emotional',  motion_intensity: 'Subtle', color_contrast: 'Medium', brand_prominence: 'Subtle',   brand_consistency_score: 'Medium', funnel_stage: 'Consideration', cta: 'Learn More', product_in_first_3s: false, impressions: 98000,  ctr: 0.011, cvr: 0.031, cpa: 27.2, roas: 1.9 },
  { creative_id: 'C003', platform: 'Meta',   format: 'Image',    video_duration_sec: null, aspect_ratio: '1:1',  emotional_tone: 'Functional', motion_intensity: 'None',   color_contrast: 'High',   brand_prominence: 'Dominant', brand_consistency_score: 'High',   funnel_stage: 'Conversion',    cta: 'Buy Now',    product_in_first_3s: true,  impressions: 76000,  ctr: 0.021, cvr: 0.038, cpa: 20.1, roas: 2.5 },
  { creative_id: 'C004', platform: 'TikTok', format: 'Video',    video_duration_sec: 7,    aspect_ratio: '9:16', emotional_tone: 'Playful',    motion_intensity: 'High',   color_contrast: 'High',   brand_prominence: 'Subtle',   brand_consistency_score: 'Low',    funnel_stage: 'Awareness',     cta: 'Shop Now',   product_in_first_3s: true,  impressions: 150000, ctr: 0.026, cvr: 0.029, cpa: 22.4, roas: 2.1 },
  { creative_id: 'C005', platform: 'TikTok', format: 'Video',    video_duration_sec: 20,   aspect_ratio: '9:16', emotional_tone: 'Functional', motion_intensity: 'Subtle', color_contrast: 'Medium', brand_prominence: 'Balanced', brand_consistency_score: 'Medium', funnel_stage: 'Consideration', cta: 'Learn More', product_in_first_3s: false, impressions: 110000, ctr: 0.014, cvr: 0.024, cpa: 31.8, roas: 1.6 },
  { creative_id: 'C006', platform: 'TikTok', format: 'Image',    video_duration_sec: null, aspect_ratio: '1:1',  emotional_tone: 'Urgent',     motion_intensity: 'None',   color_contrast: 'High',   brand_prominence: 'Balanced', brand_consistency_score: 'Medium', funnel_stage: 'Conversion',    cta: 'Buy Now',    product_in_first_3s: true,  impressions: 67000,  ctr: 0.019, cvr: 0.033, cpa: 24.7, roas: 2.0 },
  { creative_id: 'C007', platform: 'Google', format: 'Image',    video_duration_sec: null, aspect_ratio: '1:1',  emotional_tone: 'Functional', motion_intensity: 'None',   color_contrast: 'Medium', brand_prominence: 'Dominant', brand_consistency_score: 'High',   funnel_stage: 'Conversion',    cta: 'Buy Now',    product_in_first_3s: true,  impressions: 88000,  ctr: 0.017, cvr: 0.041, cpa: 19.3, roas: 2.7 },
  { creative_id: 'C008', platform: 'Google', format: 'Carousel', video_duration_sec: null, aspect_ratio: '4:5',  emotional_tone: 'Urgent',     motion_intensity: 'Subtle', color_contrast: 'High',   brand_prominence: 'Balanced', brand_consistency_score: 'Medium', funnel_stage: 'Conversion',    cta: 'Shop Now',   product_in_first_3s: true,  impressions: 102000, ctr: 0.022, cvr: 0.036, cpa: 21.6, roas: 2.4 },
  { creative_id: 'C009', platform: 'Google', format: 'Video',    video_duration_sec: 30,   aspect_ratio: '16:9', emotional_tone: 'Emotional',  motion_intensity: 'Subtle', color_contrast: 'Low',    brand_prominence: 'Dominant', brand_consistency_score: 'High',   funnel_stage: 'Awareness',     cta: 'Learn More', product_in_first_3s: false, impressions: 54000,  ctr: 0.009, cvr: 0.028, cpa: 34.5, roas: 1.5 },
  { creative_id: 'C010', platform: 'Meta',   format: 'Carousel', video_duration_sec: null, aspect_ratio: '4:5',  emotional_tone: 'Urgent',     motion_intensity: 'Subtle', color_contrast: 'High',   brand_prominence: 'Balanced', brand_consistency_score: 'Medium', funnel_stage: 'Conversion',    cta: 'Buy Now',    product_in_first_3s: true,  impressions: 93000,  ctr: 0.024, cvr: 0.039, cpa: 19.8, roas: 2.6 },
  { creative_id: 'C011', platform: 'TikTok', format: 'Video',    video_duration_sec: 5,    aspect_ratio: '9:16', emotional_tone: 'Playful',    motion_intensity: 'High',   color_contrast: 'High',   brand_prominence: 'Subtle',   brand_consistency_score: 'Low',    funnel_stage: 'Awareness',     cta: 'Shop Now',   product_in_first_3s: true,  impressions: 170000, ctr: 0.031, cvr: 0.027, cpa: 23.1, roas: 2.2 },
  { creative_id: 'C012', platform: 'Meta',   format: 'Image',    video_duration_sec: null, aspect_ratio: '1:1',  emotional_tone: 'Emotional',  motion_intensity: 'None',   color_contrast: 'Low',    brand_prominence: 'Subtle',   brand_consistency_score: 'Low',    funnel_stage: 'Consideration', cta: 'Learn More', product_in_first_3s: false, impressions: 64000,  ctr: 0.013, cvr: 0.026, cpa: 30.4, roas: 1.7 },
  { creative_id: 'C013', platform: 'Google', format: 'Video',    video_duration_sec: 10,   aspect_ratio: '16:9', emotional_tone: 'Functional', motion_intensity: 'Subtle', color_contrast: 'Medium', brand_prominence: 'Dominant', brand_consistency_score: 'High',   funnel_stage: 'Conversion',    cta: 'Buy Now',    product_in_first_3s: true,  impressions: 72000,  ctr: 0.019, cvr: 0.044, cpa: 17.9, roas: 3.0 },
  { creative_id: 'C014', platform: 'TikTok', format: 'Carousel', video_duration_sec: null, aspect_ratio: '4:5',  emotional_tone: 'Urgent',     motion_intensity: 'Subtle', color_contrast: 'High',   brand_prominence: 'Balanced', brand_consistency_score: 'Medium', funnel_stage: 'Conversion',    cta: 'Shop Now',   product_in_first_3s: true,  impressions: 81000,  ctr: 0.025, cvr: 0.034, cpa: 21.2, roas: 2.3 },
  { creative_id: 'C015', platform: 'Meta',   format: 'Video',    video_duration_sec: 12,   aspect_ratio: '4:5',  emotional_tone: 'Functional', motion_intensity: 'Subtle', color_contrast: 'Medium', brand_prominence: 'Dominant', brand_consistency_score: 'High',   funnel_stage: 'Consideration', cta: 'Learn More', product_in_first_3s: false, impressions: 59000,  ctr: 0.012, cvr: 0.029, cpa: 28.9, roas: 1.8 },
  { creative_id: 'C016', platform: 'Meta',   format: 'Video',    video_duration_sec: 8,    aspect_ratio: '9:16', emotional_tone: 'Playful',    motion_intensity: 'High',   color_contrast: 'High',   brand_prominence: 'Balanced', brand_consistency_score: 'Medium', funnel_stage: 'Awareness',     cta: 'Shop Now',   product_in_first_3s: true,  impressions: 140000, ctr: 0.023, cvr: 0.028, cpa: 24.0, roas: 2.2 },
  { creative_id: 'C017', platform: 'Meta',   format: 'Image',    video_duration_sec: null, aspect_ratio: '1:1',  emotional_tone: 'Functional', motion_intensity: 'None',   color_contrast: 'Medium', brand_prominence: 'Dominant', brand_consistency_score: 'High',   funnel_stage: 'Conversion',    cta: 'Buy Now',    product_in_first_3s: true,  impressions: 82000,  ctr: 0.018, cvr: 0.043, cpa: 18.7, roas: 2.9 },
  { creative_id: 'C018', platform: 'Meta',   format: 'Video',    video_duration_sec: 20,   aspect_ratio: '4:5',  emotional_tone: 'Emotional',  motion_intensity: 'Subtle', color_contrast: 'Low',    brand_prominence: 'Subtle',   brand_consistency_score: 'Low',    funnel_stage: 'Consideration', cta: 'Learn More', product_in_first_3s: false, impressions: 61000,  ctr: 0.010, cvr: 0.025, cpa: 32.6, roas: 1.6 },
  { creative_id: 'C019', platform: 'Meta',   format: 'Carousel', video_duration_sec: null, aspect_ratio: '4:5',  emotional_tone: 'Urgent',     motion_intensity: 'Subtle', color_contrast: 'High',   brand_prominence: 'Balanced', brand_consistency_score: 'Medium', funnel_stage: 'Conversion',    cta: 'Buy Now',    product_in_first_3s: true,  impressions: 97000,  ctr: 0.026, cvr: 0.041, cpa: 19.1, roas: 2.7 },
  { creative_id: 'C020', platform: 'Meta',   format: 'Video',    video_duration_sec: 5,    aspect_ratio: '9:16', emotional_tone: 'Urgent',     motion_intensity: 'High',   color_contrast: 'High',   brand_prominence: 'Subtle',   brand_consistency_score: 'Low',    funnel_stage: 'Awareness',     cta: 'Shop Now',   product_in_first_3s: true,  impressions: 165000, ctr: 0.032, cvr: 0.026, cpa: 23.8, roas: 2.1 },
  { creative_id: 'C021', platform: 'TikTok', format: 'Video',    video_duration_sec: 6,    aspect_ratio: '9:16', emotional_tone: 'Playful',    motion_intensity: 'High',   color_contrast: 'High',   brand_prominence: 'Subtle',   brand_consistency_score: 'Low',    funnel_stage: 'Awareness',     cta: 'Shop Now',   product_in_first_3s: true,  impressions: 180000, ctr: 0.034, cvr: 0.025, cpa: 24.5, roas: 2.0 },
  { creative_id: 'C022', platform: 'TikTok', format: 'Video',    video_duration_sec: 15,   aspect_ratio: '9:16', emotional_tone: 'Emotional',  motion_intensity: 'Subtle', color_contrast: 'Medium', brand_prominence: 'Balanced', brand_consistency_score: 'Medium', funnel_stage: 'Consideration', cta: 'Learn More', product_in_first_3s: false, impressions: 105000, ctr: 0.016, cvr: 0.027, cpa: 29.7, roas: 1.7 },
  { creative_id: 'C023', platform: 'TikTok', format: 'Image',    video_duration_sec: null, aspect_ratio: '1:1',  emotional_tone: 'Functional', motion_intensity: 'None',   color_contrast: 'Medium', brand_prominence: 'Balanced', brand_consistency_score: 'Medium', funnel_stage: 'Conversion',    cta: 'Buy Now',    product_in_first_3s: true,  impressions: 72000,  ctr: 0.020, cvr: 0.034, cpa: 23.5, roas: 2.1 },
  { creative_id: 'C024', platform: 'TikTok', format: 'Carousel', video_duration_sec: null, aspect_ratio: '4:5',  emotional_tone: 'Urgent',     motion_intensity: 'Subtle', color_contrast: 'High',   brand_prominence: 'Balanced', brand_consistency_score: 'High',   funnel_stage: 'Conversion',    cta: 'Shop Now',   product_in_first_3s: true,  impressions: 88000,  ctr: 0.027, cvr: 0.036, cpa: 21.0, roas: 2.4 },
  { creative_id: 'C025', platform: 'TikTok', format: 'Video',    video_duration_sec: 25,   aspect_ratio: '9:16', emotional_tone: 'Functional', motion_intensity: 'Subtle', color_contrast: 'Low',    brand_prominence: 'Dominant', brand_consistency_score: 'High',   funnel_stage: 'Awareness',     cta: 'Learn More', product_in_first_3s: false, impressions: 54000,  ctr: 0.011, cvr: 0.022, cpa: 35.2, roas: 1.4 },
  { creative_id: 'C026', platform: 'Google', format: 'Image',    video_duration_sec: null, aspect_ratio: '1:1',  emotional_tone: 'Functional', motion_intensity: 'None',   color_contrast: 'Medium', brand_prominence: 'Dominant', brand_consistency_score: 'High',   funnel_stage: 'Conversion',    cta: 'Buy Now',    product_in_first_3s: true,  impressions: 91000,  ctr: 0.016, cvr: 0.045, cpa: 18.9, roas: 2.8 },
  { creative_id: 'C027', platform: 'Google', format: 'Carousel', video_duration_sec: null, aspect_ratio: '4:5',  emotional_tone: 'Urgent',     motion_intensity: 'Subtle', color_contrast: 'High',   brand_prominence: 'Balanced', brand_consistency_score: 'Medium', funnel_stage: 'Conversion',    cta: 'Shop Now',   product_in_first_3s: true,  impressions: 99000,  ctr: 0.021, cvr: 0.037, cpa: 21.4, roas: 2.5 },
  { creative_id: 'C028', platform: 'Google', format: 'Video',    video_duration_sec: 12,   aspect_ratio: '16:9', emotional_tone: 'Emotional',  motion_intensity: 'Subtle', color_contrast: 'Low',    brand_prominence: 'Dominant', brand_consistency_score: 'High',   funnel_stage: 'Consideration', cta: 'Learn More', product_in_first_3s: false, impressions: 63000,  ctr: 0.012, cvr: 0.030, cpa: 31.1, roas: 1.7 },
  { creative_id: 'C029', platform: 'Google', format: 'Video',    video_duration_sec: 6,    aspect_ratio: '16:9', emotional_tone: 'Functional', motion_intensity: 'Subtle', color_contrast: 'Medium', brand_prominence: 'Dominant', brand_consistency_score: 'High',   funnel_stage: 'Conversion',    cta: 'Buy Now',    product_in_first_3s: true,  impressions: 78000,  ctr: 0.018, cvr: 0.046, cpa: 17.5, roas: 3.1 },
  { creative_id: 'C030', platform: 'Google', format: 'Image',    video_duration_sec: null, aspect_ratio: '1:1',  emotional_tone: 'Urgent',     motion_intensity: 'None',   color_contrast: 'High',   brand_prominence: 'Balanced', brand_consistency_score: 'Medium', funnel_stage: 'Conversion',    cta: 'Buy Now',    product_in_first_3s: true,  impressions: 86000,  ctr: 0.020, cvr: 0.039, cpa: 20.8, roas: 2.6 },
  { creative_id: 'C031', platform: 'Meta',   format: 'Video',    video_duration_sec: 10,   aspect_ratio: '4:5',  emotional_tone: 'Functional', motion_intensity: 'Subtle', color_contrast: 'Medium', brand_prominence: 'Dominant', brand_consistency_score: 'High',   funnel_stage: 'Consideration', cta: 'Learn More', product_in_first_3s: false, impressions: 70000,  ctr: 0.013, cvr: 0.028, cpa: 29.4, roas: 1.8 },
  { creative_id: 'C032', platform: 'Meta',   format: 'Image',    video_duration_sec: null, aspect_ratio: '1:1',  emotional_tone: 'Emotional',  motion_intensity: 'None',   color_contrast: 'Low',    brand_prominence: 'Subtle',   brand_consistency_score: 'Low',    funnel_stage: 'Awareness',     cta: 'Learn More', product_in_first_3s: false, impressions: 58000,  ctr: 0.009, cvr: 0.021, cpa: 36.8, roas: 1.3 },
  { creative_id: 'C033', platform: 'Meta',   format: 'Carousel', video_duration_sec: null, aspect_ratio: '4:5',  emotional_tone: 'Urgent',     motion_intensity: 'Subtle', color_contrast: 'High',   brand_prominence: 'Balanced', brand_consistency_score: 'Medium', funnel_stage: 'Conversion',    cta: 'Shop Now',   product_in_first_3s: true,  impressions: 101000, ctr: 0.025, cvr: 0.040, cpa: 20.0, roas: 2.6 },
  { creative_id: 'C034', platform: 'TikTok', format: 'Video',    video_duration_sec: 8,    aspect_ratio: '9:16', emotional_tone: 'Playful',    motion_intensity: 'High',   color_contrast: 'High',   brand_prominence: 'Subtle',   brand_consistency_score: 'Low',    funnel_stage: 'Awareness',     cta: 'Shop Now',   product_in_first_3s: true,  impressions: 190000, ctr: 0.036, cvr: 0.024, cpa: 25.1, roas: 2.0 },
  { creative_id: 'C035', platform: 'TikTok', format: 'Image',    video_duration_sec: null, aspect_ratio: '1:1',  emotional_tone: 'Functional', motion_intensity: 'None',   color_contrast: 'Medium', brand_prominence: 'Balanced', brand_consistency_score: 'Medium', funnel_stage: 'Consideration', cta: 'Learn More', product_in_first_3s: false, impressions: 69000,  ctr: 0.015, cvr: 0.027, cpa: 28.6, roas: 1.8 },
  { creative_id: 'C036', platform: 'Google', format: 'Video',    video_duration_sec: 20,   aspect_ratio: '16:9', emotional_tone: 'Emotional',  motion_intensity: 'Subtle', color_contrast: 'Low',    brand_prominence: 'Dominant', brand_consistency_score: 'High',   funnel_stage: 'Awareness',     cta: 'Learn More', product_in_first_3s: false, impressions: 50000,  ctr: 0.010, cvr: 0.026, cpa: 33.9, roas: 1.5 },
  { creative_id: 'C037', platform: 'Google', format: 'Carousel', video_duration_sec: null, aspect_ratio: '4:5',  emotional_tone: 'Functional', motion_intensity: 'Subtle', color_contrast: 'Medium', brand_prominence: 'Balanced', brand_consistency_score: 'Medium', funnel_stage: 'Conversion',    cta: 'Buy Now',    product_in_first_3s: true,  impressions: 92000,  ctr: 0.019, cvr: 0.042, cpa: 19.6, roas: 2.7 },
  { creative_id: 'C038', platform: 'Meta',   format: 'Video',    video_duration_sec: 6,    aspect_ratio: '9:16', emotional_tone: 'Urgent',     motion_intensity: 'High',   color_contrast: 'High',   brand_prominence: 'Balanced', brand_consistency_score: 'High',   funnel_stage: 'Conversion',    cta: 'Buy Now',    product_in_first_3s: true,  impressions: 134000, ctr: 0.021, cvr: 0.045, cpa: 18.2, roas: 3.0 },
  { creative_id: 'C039', platform: 'TikTok', format: 'Video',    video_duration_sec: 12,   aspect_ratio: '9:16', emotional_tone: 'Emotional',  motion_intensity: 'Subtle', color_contrast: 'Medium', brand_prominence: 'Subtle',   brand_consistency_score: 'Low',    funnel_stage: 'Consideration', cta: 'Learn More', product_in_first_3s: false, impressions: 84000,  ctr: 0.017, cvr: 0.029, cpa: 27.8, roas: 1.9 },
  { creative_id: 'C040', platform: 'Google', format: 'Image',    video_duration_sec: null, aspect_ratio: '1:1',  emotional_tone: 'Functional', motion_intensity: 'None',   color_contrast: 'Medium', brand_prominence: 'Dominant', brand_consistency_score: 'High',   funnel_stage: 'Conversion',    cta: 'Buy Now',    product_in_first_3s: true,  impressions: 87000,  ctr: 0.018, cvr: 0.043, cpa: 19.0, roas: 2.8 },
];

// ─── Spend generation (separate LCG, seed=137) ──────────────────────────────
// Separate seed so existing synthetic metrics are unchanged.

let spendSeed = 137;
function spendLcg() {
  spendSeed = (spendSeed * 1664525 + 1013904223) & 0xffffffff;
  return (spendSeed >>> 0) / 0xffffffff;
}
function spendJitter(val, pct = 0.08) { return val * (1 + (spendLcg() - 0.5) * 2 * pct); }

// CPM base rates by platform × funnel_stage (USD per 1,000 impressions)
const CPM_BASES = {
  'TikTok-Awareness':     5.50,
  'TikTok-Consideration': 7.00,
  'TikTok-Conversion':    9.50,
  'Meta-Awareness':       6.00,
  'Meta-Consideration':   8.50,
  'Meta-Conversion':      11.00,
  'Google-Awareness':     4.50,
  'Google-Consideration': 6.50,
  'Google-Conversion':    10.00,
};

function computeSpend(platform, funnelStage, impressions) {
  const baseCpm = CPM_BASES[`${platform}-${funnelStage}`];
  const rawSpend = spendJitter(baseCpm * (impressions / 1000));
  return {
    spend: Math.round(rawSpend * 100) / 100,
    cpm:   Math.round((rawSpend / (impressions / 1000)) * 100) / 100,
  };
}

function classifyMaturity(impressions) {
  if (impressions < 65000)  return 'early';
  if (impressions < 100000) return 'ramping';
  return 'mature';
}

// Enrich real records with spend, cpm, maturity
for (const c of realCreatives) {
  const s = computeSpend(c.platform, c.funnel_stage, c.impressions);
  c.spend    = s.spend;
  c.cpm      = s.cpm;
  c.maturity = classifyMaturity(c.impressions);
}

// ─── Seeded LCG synthetic generator (seed=42) ────────────────────────────────
// Parameters match scopeGoal.md §3 and the weighted distributions in TODO.md

let seed = 42;
function lcg() {
  seed = (seed * 1664525 + 1013904223) & 0xffffffff;
  return (seed >>> 0) / 0xffffffff;
}
function pick(arr) { return arr[Math.floor(lcg() * arr.length)]; }
function jitter(val, pct = 0.10) { return val * (1 + (lcg() - 0.5) * 2 * pct); }
function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

// Platform weights: TikTok ~40%, Meta ~35%, Google ~25%
const PLATFORMS = ['TikTok', 'TikTok', 'TikTok', 'TikTok', 'Meta', 'Meta', 'Meta', 'Google', 'Google'];

// Format weights by platform (Video-heavy for TikTok, Carousel-heavy for Meta)
const FORMATS = {
  TikTok: ['Video', 'Video', 'Video', 'Video', 'Video', 'Image', 'Image', 'Carousel'],
  Meta:   ['Video', 'Video', 'Image', 'Carousel', 'Carousel', 'Carousel'],
  Google: ['Video', 'Image', 'Image', 'Carousel'],
};

// funnel_stage weights (conversion-heavy to satisfy Conversion+Dominant target)
const STAGES = ['Awareness', 'Awareness', 'Consideration', 'Conversion', 'Conversion'];

// TikTok tone weighted toward Playful (to hit playful+TikTok ≥ 7)
const TIKTOK_TONES = ['Playful', 'Playful', 'Playful', 'Urgent', 'Urgent', 'Emotional', 'Functional'];
const OTHER_TONES  = ['Playful', 'Urgent', 'Urgent', 'Emotional', 'Functional'];

// Motion: non-video always None; TikTok video heavily High
const TIKTOK_VIDEO_MOTIONS = ['High', 'High', 'High', 'Subtle'];
const OTHER_VIDEO_MOTIONS  = ['High', 'Subtle', 'Subtle'];

const CONTRASTS    = ['High', 'High', 'High', 'Medium', 'Low'];           // ~60% High
const PROMINENCES  = ['Subtle', 'Balanced', 'Dominant'];
const CONSISTENCIES = ['High', 'High', 'Medium', 'Low'];                  // ~50% High
const CTAS         = ['Shop Now', 'Buy Now', 'Learn More'];
const DURATIONS    = [5, 6, 7, 8, 10, 12, 15, 15, 20, 25, 30];          // weighted toward ≤15

// Base rates keyed by "platform-format-stage" or "platform-format-any"
const BASE_RATES = {
  'TikTok-Video-Awareness':     { ctr: 0.025, cvr: 0.026, cpa: 24.0, roas: 2.1, imp: 155000 },
  'TikTok-Video-Consideration': { ctr: 0.015, cvr: 0.027, cpa: 29.0, roas: 1.8, imp: 100000 },
  'TikTok-Video-Conversion':    { ctr: 0.022, cvr: 0.034, cpa: 22.0, roas: 2.3, imp: 90000  },
  'TikTok-Image-any':           { ctr: 0.018, cvr: 0.031, cpa: 24.0, roas: 2.0, imp: 72000  },
  'TikTok-Carousel-any':        { ctr: 0.024, cvr: 0.034, cpa: 22.0, roas: 2.3, imp: 85000  },
  'Meta-Video-Awareness':       { ctr: 0.022, cvr: 0.026, cpa: 24.5, roas: 2.1, imp: 145000 },
  'Meta-Video-Consideration':   { ctr: 0.011, cvr: 0.028, cpa: 29.0, roas: 1.8, imp: 80000  },
  'Meta-Video-Conversion':      { ctr: 0.019, cvr: 0.042, cpa: 19.0, roas: 2.8, imp: 125000 },
  'Meta-Image-any':             { ctr: 0.016, cvr: 0.035, cpa: 23.0, roas: 2.2, imp: 75000  },
  'Meta-Carousel-any':          { ctr: 0.024, cvr: 0.039, cpa: 20.0, roas: 2.6, imp: 97000  },
  'Google-Video-any':           { ctr: 0.014, cvr: 0.034, cpa: 27.0, roas: 2.1, imp: 65000  },
  'Google-Image-any':           { ctr: 0.018, cvr: 0.041, cpa: 20.0, roas: 2.7, imp: 85000  },
  'Google-Carousel-any':        { ctr: 0.020, cvr: 0.039, cpa: 21.0, roas: 2.6, imp: 95000  },
};

function getBase(platform, format, stage) {
  return BASE_RATES[`${platform}-${format}-${stage}`] || BASE_RATES[`${platform}-${format}-any`];
}

function inferAspectRatio(platform, format) {
  if (format === 'Image')    return '1:1';
  if (format === 'Carousel') return '4:5';
  // Video aspect ratio by platform
  if (platform === 'TikTok') return '9:16';
  if (platform === 'Google') return '16:9';
  // Meta Video: mostly 9:16, occasionally 4:5
  return pick(['9:16', '9:16', '4:5']);
}

const syntheticRecords = [];
for (let i = 1; i <= 40; i++) {
  const platform = pick(PLATFORMS);
  const format   = pick(FORMATS[platform]);
  const stage    = pick(STAGES);

  const aspect_ratio = inferAspectRatio(platform, format);
  const tone = platform === 'TikTok' ? pick(TIKTOK_TONES) : pick(OTHER_TONES);

  let motion_intensity;
  if (format === 'Image' || format === 'Carousel') {
    motion_intensity = 'None';
  } else if (platform === 'TikTok') {
    motion_intensity = pick(TIKTOK_VIDEO_MOTIONS);
  } else {
    motion_intensity = pick(OTHER_VIDEO_MOTIONS);
  }

  const color_contrast          = pick(CONTRASTS);
  const brand_prominence        = pick(PROMINENCES);
  const brand_consistency_score = pick(CONSISTENCIES);
  const cta                     = pick(CTAS);

  let product_in_first_3s = false;
  let video_duration_sec  = null;
  if (format === 'Video') {
    product_in_first_3s = lcg() < 0.65; // ~65% true on Video
    video_duration_sec  = pick(DURATIONS);
  }

  const base = getBase(platform, format, stage);

  // ── Apply correlation multipliers ──────────────────────────────────────────
  let ctr  = base.ctr;
  let cvr  = base.cvr;
  let cpa  = base.cpa;
  let roas = base.roas;
  let imp  = base.imp;

  if (platform === 'TikTok' && format === 'Video' && aspect_ratio === '9:16') ctr  *= 1.40;
  if (platform === 'Meta'   && format === 'Carousel' && stage === 'Consideration') cvr *= 1.25;
  if (product_in_first_3s   && format === 'Video')                               ctr  *= 1.20;
  if (motion_intensity === 'High' && platform === 'TikTok')                      ctr  *= 1.20;
  if (video_duration_sec !== null && video_duration_sec <= 15)                    ctr  *= 1.18;
  if (color_contrast === 'High')                                                  ctr  *= 1.12;
  if (brand_consistency_score === 'High')                                         roas += 0.4;
  if (stage === 'Conversion' && brand_prominence === 'Dominant')                  cvr  *= 1.10;
  if (format === 'Image' && aspect_ratio === '1:1' && platform === 'TikTok')      ctr  *= 0.75; // anti-pattern
  if (tone === 'Playful' && platform === 'TikTok')                               ctr  *= 1.18;
  if (tone === 'Urgent'  && stage === 'Conversion')                               cvr  *= 1.15;

  // ── Apply jitter (±20% for Awareness, ±10% otherwise) ─────────────────────
  const jPct = stage === 'Awareness' ? 0.20 : 0.10;
  ctr  = clamp(Math.round(jitter(ctr,  jPct) * 1000) / 1000, 0.009, 0.036);
  cvr  = clamp(Math.round(jitter(cvr,  jPct) * 1000) / 1000, 0.021, 0.046);
  cpa  = clamp(Math.round(jitter(cpa,  jPct) * 10)   / 10,   17.50, 36.80);
  roas = clamp(Math.round(jitter(roas, jPct) * 10)   / 10,   1.3,   3.1);
  imp  = clamp(Math.round(jitter(imp,  jPct)),                50000, 190000);

  // Compute spend and maturity using separate LCG
  const spendData = computeSpend(platform, stage, imp);

  syntheticRecords.push({
    creative_id:            `S${String(i).padStart(3, '0')}`,
    platform,
    format,
    video_duration_sec,
    aspect_ratio,
    emotional_tone:         tone,
    motion_intensity,
    color_contrast,
    brand_prominence,
    brand_consistency_score,
    funnel_stage:           stage,
    cta,
    product_in_first_3s,
    impressions:            imp,
    ctr,
    cvr,
    cpa,
    roas,
    spend:    spendData.spend,
    cpm:      spendData.cpm,
    maturity: classifyMaturity(imp),
  });
}

const CREATIVES = [...realCreatives, ...syntheticRecords];

export default CREATIVES;
