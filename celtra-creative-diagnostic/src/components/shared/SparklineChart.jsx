import { LineChart, Line, Area, AreaChart, ResponsiveContainer } from 'recharts'

export default function SparklineChart({
  data,
  color = '#6366f1',
  width = 120,
  height = 32,
  dataKey = 'impressions',
}) {
  if (!data || data.length === 0) return null

  const chartData = data.map((d, i) => ({ i, v: d[dataKey] || 0 }))

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#spark-${color.replace('#', '')})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
