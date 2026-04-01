// engine/connectedSystems.js — pure functions only, no React, no side effects

export const CONNECTED_PRODUCTS = [
  {
    id: 'design-studio',
    name: 'Design Studio',
    icon: '\u270F\uFE0F',
    description: 'Build and iterate on creative variants at scale',
    baseUrl: 'https://app.celtra.com/design-studio',
  },
  {
    id: 'brand-kit',
    name: 'Brand Kit',
    icon: '\uD83C\uDFA8',
    description: 'Manage brand assets, colors, and templates',
    baseUrl: 'https://app.celtra.com/brand-kit',
  },
  {
    id: 'product-catalog',
    name: 'Product Catalog',
    icon: '\uD83D\uDCE6',
    description: 'Connect product feeds for dynamic creative',
    baseUrl: 'https://app.celtra.com/product-catalog',
  },
  {
    id: 'ai-creative-flows',
    name: 'AI Creative Flows',
    icon: '\u2728',
    description: 'Auto-generate creative variations with AI',
    baseUrl: 'https://app.celtra.com/ai-flows',
  },
];

const PRODUCT_BY_ID = Object.fromEntries(CONNECTED_PRODUCTS.map(p => [p.id, p]));

/**
 * Category-to-action mapping.
 * Each category maps to an array of { productId, priority, label[persona] }.
 * priority: 'primary' | 'secondary' | 'tertiary'
 */
const CATEGORY_ACTION_MAP = {
  format: [
    {
      productId: 'design-studio',
      priority: 'primary',
      label: {
        performance: 'Create format variant in Design Studio',
        strategist: 'Brief new format in Design Studio',
        executive: 'Scale winning format via Design Studio',
      },
    },
    {
      productId: 'ai-creative-flows',
      priority: 'secondary',
      label: {
        performance: 'Generate format variations with AI',
        strategist: 'Explore AI-generated format options',
        executive: 'Automate format testing with AI',
      },
    },
  ],
  platform: [
    {
      productId: 'design-studio',
      priority: 'primary',
      label: {
        performance: 'Adapt creative for platform in Design Studio',
        strategist: 'Brief platform-specific creative',
        executive: 'Optimize platform mix in Design Studio',
      },
    },
    {
      productId: 'brand-kit',
      priority: 'tertiary',
      label: {
        performance: 'Check platform brand guidelines',
        strategist: 'Review brand consistency across platforms',
        executive: 'Ensure brand compliance across platforms',
      },
    },
  ],
  creative: [
    {
      productId: 'design-studio',
      priority: 'primary',
      label: {
        performance: 'Iterate on creative in Design Studio',
        strategist: 'Build creative variants in Design Studio',
        executive: 'Scale top creative via Design Studio',
      },
    },
    {
      productId: 'ai-creative-flows',
      priority: 'secondary',
      label: {
        performance: 'Auto-generate creative variations',
        strategist: 'Use AI to explore creative directions',
        executive: 'Accelerate creative production with AI',
      },
    },
    {
      productId: 'brand-kit',
      priority: 'tertiary',
      label: {
        performance: 'Pull assets from Brand Kit',
        strategist: 'Source assets from Brand Kit',
        executive: 'Leverage Brand Kit assets',
      },
    },
  ],
  funnel: [
    {
      productId: 'design-studio',
      priority: 'primary',
      label: {
        performance: 'Optimize funnel creative in Design Studio',
        strategist: 'Brief funnel-stage creative variants',
        executive: 'Address funnel gaps in Design Studio',
      },
    },
    {
      productId: 'product-catalog',
      priority: 'secondary',
      label: {
        performance: 'Connect product feed for dynamic ads',
        strategist: 'Add product data to lower-funnel creative',
        executive: 'Activate product catalog for conversions',
      },
    },
  ],
  spend: [
    {
      productId: 'ai-creative-flows',
      priority: 'primary',
      label: {
        performance: 'Generate cost-efficient variants with AI',
        strategist: 'Use AI to stretch creative budget',
        executive: 'Reduce creative costs with AI automation',
      },
    },
    {
      productId: 'design-studio',
      priority: 'secondary',
      label: {
        performance: 'Build efficient variants in Design Studio',
        strategist: 'Brief budget-conscious creative',
        executive: 'Optimize spend allocation via Design Studio',
      },
    },
  ],
  lifecycle: [
    {
      productId: 'ai-creative-flows',
      priority: 'primary',
      label: {
        performance: 'Refresh stale creative with AI',
        strategist: 'Generate fresh creative directions with AI',
        executive: 'Combat creative fatigue with AI automation',
      },
    },
    {
      productId: 'design-studio',
      priority: 'secondary',
      label: {
        performance: 'Build refresh variants in Design Studio',
        strategist: 'Brief creative refresh in Design Studio',
        executive: 'Plan creative refresh in Design Studio',
      },
    },
    {
      productId: 'brand-kit',
      priority: 'tertiary',
      label: {
        performance: 'Update assets in Brand Kit',
        strategist: 'Refresh brand assets for new cycle',
        executive: 'Ensure refreshed assets meet brand standards',
      },
    },
  ],
};

/**
 * mapInsightToActions(insight, persona) → ConnectedAction[]
 *
 * ConnectedAction shape:
 *   { product, priority, label, url }
 */
export function mapInsightToActions(insight, persona) {
  const templates = CATEGORY_ACTION_MAP[insight.category];
  if (!templates) return [];

  return templates.map(t => {
    const product = PRODUCT_BY_ID[t.productId];
    return {
      product,
      priority: t.priority,
      label: t.label[persona] || t.label.performance,
      url: `${product.baseUrl}?insight=${encodeURIComponent(insight.id)}`,
    };
  });
}

/**
 * filterActionsByPersona(actions, persona) → ConnectedAction[]
 *
 * Performance sees all priorities.
 * Strategist sees primary + secondary.
 * Executive sees primary only.
 */
export function filterActionsByPersona(actions, persona) {
  if (persona === 'executive') return actions.filter(a => a.priority === 'primary');
  if (persona === 'strategist') return actions.filter(a => a.priority !== 'tertiary');
  return actions; // performance sees all
}
