import { useState, useMemo } from 'react'
import SignalCard from './SignalCard'

const TIER_ORDER = { strong: 0, moderate: 1, weak: 2, noise: 3 }

const FILTER_PILLS = [
  { key: 'all', label: 'All' },
  { key: 'strong', label: 'Strong' },
  { key: 'moderate', label: 'Moderate' },
  { key: 'weak_noise', label: 'Weak/Noise' },
]

export default function ReliabilityView({ insights }) {
  const [filterTier, setFilterTier] = useState('all')

  const sorted = useMemo(() => {
    return [...insights].sort((a, b) => {
      const tierDiff = (TIER_ORDER[a.confidence] ?? 3) - (TIER_ORDER[b.confidence] ?? 3)
      if (tierDiff !== 0) return tierDiff
      return Math.abs(b.deltaPercent) - Math.abs(a.deltaPercent)
    })
  }, [insights])

  const filtered = useMemo(() => {
    if (filterTier === 'all') return sorted
    if (filterTier === 'weak_noise') return sorted.filter(i => i.confidence === 'weak' || i.confidence === 'noise')
    return sorted.filter(i => i.confidence === filterTier)
  }, [sorted, filterTier])

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Explainer */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <p className="text-sm text-gray-300">
          Each signal below compares two groups of creatives on a single metric.
          Confidence tiers reflect how much data supports the pattern:{' '}
          <span className="text-emerald-400 font-medium">Strong</span> signals have N&nbsp;&ge;&nbsp;10 and
          &ge;&nbsp;15% effect size;{' '}
          <span className="text-amber-400 font-medium">Moderate</span> signals have either smaller
          samples or smaller effect sizes;{' '}
          <span className="text-gray-400 font-medium">Weak</span> and{' '}
          <span className="text-gray-500 font-medium">Noise</span> patterns are shown for
          transparency but should not drive decisions alone.
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-500 uppercase tracking-wide mr-1">Filter</span>
        {FILTER_PILLS.map(pill => (
          <button
            key={pill.key}
            onClick={() => setFilterTier(pill.key)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              filterTier === pill.key
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {pill.label}
          </button>
        ))}
        <span className="text-xs text-gray-500 ml-2">{filtered.length} signal{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No signals match this filter.</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(insight => (
            <SignalCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </div>
  )
}
