import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const LIFECYCLE_COLORS = {
  ramping: '#3b82f6',
  peak: '#10b981',
  evergreen: '#6366f1',
  declining: '#f59e0b',
  stale: '#f43f5e',
}

const LIFECYCLE_STAGES = ['ramping', 'peak', 'evergreen', 'declining', 'stale']

const SLICE_OPTIONS = [
  { key: 'platform', label: 'By Platform' },
  { key: 'format', label: 'By Format' },
  { key: 'funnel_stage', label: 'By Funnel Stage' },
]

export default function LifecycleDistribution({ creatives }) {
  const [sliceBy, setSliceBy] = useState('platform')

  const chartData = useMemo(() => {
    if (!creatives || creatives.length === 0) return []

    const groups = new Map()
    for (const c of creatives) {
      const groupKey = c[sliceBy] || 'Unknown'
      if (!groups.has(groupKey)) groups.set(groupKey, { name: groupKey })
      const row = groups.get(groupKey)
      const lc = c.lifecycle || 'ramping'
      row[lc] = (row[lc] || 0) + 1
    }

    return Array.from(groups.values())
  }, [creatives, sliceBy])

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">Lifecycle Distribution</h3>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 mr-1">Slice</span>
          {SLICE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSliceBy(opt.key)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                sliceBy === opt.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            stroke="#4b5563"
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            stroke="#4b5563"
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: 6,
              fontSize: 12,
            }}
            labelStyle={{ color: '#e5e7eb' }}
            itemStyle={{ color: '#d1d5db' }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: '#9ca3af' }}
          />
          {LIFECYCLE_STAGES.map((stage) => (
            <Bar
              key={stage}
              dataKey={stage}
              name={stage.charAt(0).toUpperCase() + stage.slice(1)}
              stackId="lifecycle"
              fill={LIFECYCLE_COLORS[stage]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
