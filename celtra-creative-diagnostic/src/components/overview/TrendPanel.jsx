import { useState, useMemo } from 'react'
import SparklineChart from '../shared/SparklineChart'
import LifecycleBadge from '../shared/LifecycleBadge'
import { detectStaleness } from '../../engine/timeseries'

const LIFECYCLE_ORDER = { stale: 0, declining: 1, ramping: 2, peak: 3, evergreen: 4 }

const SORT_OPTIONS = [
  { key: 'lifecycle', label: 'Lifecycle Stage' },
  { key: 'decay', label: 'Decay Rate' },
  { key: 'creative_id', label: 'Creative ID' },
]

export default function TrendPanel({ creatives }) {
  const [sortBy, setSortBy] = useState('lifecycle')

  const enriched = useMemo(() => {
    return creatives.map((c) => {
      const staleness = detectStaleness(c.daily_metrics)
      return { ...c, staleness }
    })
  }, [creatives])

  const sorted = useMemo(() => {
    return [...enriched].sort((a, b) => {
      if (sortBy === 'lifecycle') {
        return (LIFECYCLE_ORDER[a.lifecycle] ?? 4) - (LIFECYCLE_ORDER[b.lifecycle] ?? 4)
      }
      if (sortBy === 'decay') {
        return (b.staleness.decayPercent || 0) - (a.staleness.decayPercent || 0)
      }
      return a.creative_id.localeCompare(b.creative_id)
    })
  }, [enriched, sortBy])

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">Creative Trends</h3>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 mr-1">Sort</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                sortBy === opt.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-auto max-h-[460px] flex flex-col gap-2">
        {sorted.map((c) => (
          <div
            key={c.creative_id}
            className="flex items-center gap-3 px-3 py-2 rounded bg-gray-900/50 hover:bg-gray-900"
          >
            <span className="font-mono text-xs text-gray-400 w-14 shrink-0">
              {c.creative_id}
            </span>
            <SparklineChart
              data={c.daily_metrics}
              color={c.staleness.isStale ? '#f43f5e' : '#6366f1'}
              width={120}
              height={28}
            />
            <LifecycleBadge lifecycle={c.lifecycle} />
            {c.staleness.isStale && (
              <span className="text-xs text-rose-400 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400" />
                Stale ({c.staleness.decayPercent.toFixed(0)}% decay)
              </span>
            )}
            {!c.staleness.isStale && c.staleness.decayPercent > 30 && (
              <span className="text-xs text-amber-400">
                {c.staleness.decayPercent.toFixed(0)}% decay
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
