import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { mapInsightToActions } from '../../engine/connectedSystems'

const TIER_STYLES = {
  strong: {
    border: 'border-l-4 border-emerald-500',
    badge: 'bg-emerald-900 text-emerald-300',
    label: 'STRONG',
  },
  moderate: {
    border: 'border-l-4 border-amber-500',
    badge: 'bg-amber-900 text-amber-300',
    label: 'MODERATE',
  },
  weak: {
    border: 'border-l-4 border-gray-600',
    badge: 'bg-gray-700 text-gray-400',
    label: 'WEAK',
  },
  noise: {
    border: 'border-dashed border-l-4 border-gray-700',
    badge: 'bg-gray-800 text-gray-500',
    label: 'NOISE',
  },
}

function formatDelta(deltaPercent) {
  const sign = deltaPercent >= 0 ? '+' : '\u2212'
  return `${sign}${Math.abs(deltaPercent).toFixed(0)}%`
}

function formatAvg(value, metric) {
  if (metric === 'CTR' || metric === 'CVR') return `${(value * 100).toFixed(2)}%`
  if (metric === 'ROAS') return `${value.toFixed(2)}x`
  if (metric === 'CPA') return `$${value.toFixed(2)}`
  return value.toFixed(2)
}

export default function SignalCard({ insight }) {
  const { confidence, patternLabel, metric, deltaPercent, nA, nB, labelA, labelB, avgA, avgB } = insight
  const tier = TIER_STYLES[confidence] || TIER_STYLES.weak

  const chartData = [
    { name: labelA, value: avgA },
    { name: labelB, value: avgB },
  ]

  const barColors = ['#6366f1', '#4b5563']

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${tier.border} flex flex-col gap-3`}>
      {/* Header row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wide ${tier.badge}`}>
          {tier.label}
        </span>
        <span className="text-xs text-gray-500">{metric}</span>
      </div>

      {/* Pattern label */}
      <div>
        <p className="text-sm font-medium text-gray-100">{patternLabel}</p>
        <p className="text-sm text-gray-300 mt-0.5">
          {formatDelta(deltaPercent)} {metric} vs. comparison group
        </p>
      </div>

      {/* N counts */}
      <p className="text-xs text-gray-500">
        Based on N={nA + nB} ({nA} vs. {nB})
      </p>

      {/* Avg values */}
      <p className="text-xs text-gray-400">
        {formatAvg(avgA, metric)} avg vs. {formatAvg(avgB, metric)} avg
      </p>

      {/* Mini bar chart */}
      <div className="h-16">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 9, fill: '#6b7280' }} />
            <Tooltip
              contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 4 }}
              labelStyle={{ color: '#d1d5db', fontSize: 11 }}
              itemStyle={{ color: '#d1d5db', fontSize: 11 }}
              formatter={(val) => formatAvg(val, metric)}
            />
            <Bar dataKey="value" radius={[2, 2, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={barColors[i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Take Action link for Strong/Moderate */}
      {(confidence === 'strong' || confidence === 'moderate') && (() => {
        const actions = mapInsightToActions(insight, 'performance')
        const primary = actions.find(a => a.priority === 'primary')
        return primary ? (
          <a
            href={primary.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors mt-1"
          >
            <span>{primary.product.icon}</span>
            <span>Take Action in {primary.product.name}</span>
            <span className="text-[10px] opacity-60">(placeholder)</span>
          </a>
        ) : null
      })()}
    </div>
  )
}
