import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'

const PLATFORM_COLORS = {
  Meta: '#6366f1',
  TikTok: '#10b981',
  Google: '#f59e0b',
}

function median(values) {
  if (!values || values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

function formatImpressions(val) {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`
  return val
}

export default function PerformanceScatter({ creatives }) {
  const medianImpressions = median(creatives.map((c) => c.impressions))

  // Group by platform for separate Scatter series (to get per-dot color)
  const byPlatform = {}
  for (const c of creatives) {
    const p = c.platform
    if (!byPlatform[p]) byPlatform[p] = []
    byPlatform[p].push({ x: c.normScore, y: c.impressions, id: c.creative_id })
  }

  return (
    <div className="relative w-full h-full">
      {/* Quadrant labels — positioned over chart area (approx inset) */}
      <div className="absolute inset-0 pointer-events-none" style={{ top: 10, left: 50, right: 10, bottom: 40 }}>
        <span className="absolute top-1 right-2 text-xs text-gray-500">Scale</span>
        <span className="absolute top-1 left-2 text-xs text-gray-500">Budget Drain</span>
        <span className="absolute bottom-1 right-2 text-xs text-gray-500">Underfunded</span>
        <span className="absolute bottom-1 left-2 text-xs text-gray-500">Cut / Retest</span>
      </div>

      <ResponsiveContainer width="100%" height={480}>
        <ScatterChart margin={{ top: 10, right: 10, bottom: 40, left: 50 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            type="number"
            dataKey="x"
            domain={[0, 100]}
            name="Score"
            label={{ value: 'Norm Score', position: 'insideBottom', offset: -10, fill: '#9ca3af', fontSize: 11 }}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            stroke="#4b5563"
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Impressions"
            tickFormatter={formatImpressions}
            label={{ value: 'Impressions', angle: -90, position: 'insideLeft', offset: 10, fill: '#9ca3af', fontSize: 11 }}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            stroke="#4b5563"
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 6, fontSize: 12 }}
            labelStyle={{ color: '#e5e7eb' }}
            itemStyle={{ color: '#d1d5db' }}
            formatter={(value, name) => {
              if (name === 'Score') return [value.toFixed(1), 'Score']
              if (name === 'Impressions') return [value.toLocaleString(), 'Impressions']
              return [value, name]
            }}
          />
          <ReferenceLine x={50} stroke="#6b7280" strokeDasharray="4 4" />
          <ReferenceLine y={medianImpressions} stroke="#6b7280" strokeDasharray="4 4" />
          {Object.entries(byPlatform).map(([platform, data]) => (
            <Scatter
              key={platform}
              name={platform}
              data={data}
              fill={PLATFORM_COLORS[platform] || '#94a3b8'}
              fillOpacity={0.8}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex gap-4 justify-center mt-1 text-xs text-gray-400">
        {Object.entries(PLATFORM_COLORS).map(([p, color]) => (
          <span key={p} className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            {p}
          </span>
        ))}
      </div>
    </div>
  )
}
