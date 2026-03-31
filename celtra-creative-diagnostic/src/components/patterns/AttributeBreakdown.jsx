import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const SLICE_COLORS = {
  // platform
  Meta: '#6366f1',
  TikTok: '#10b981',
  Google: '#f59e0b',
  // format
  Video: '#6366f1',
  Image: '#10b981',
  Carousel: '#f59e0b',
  // funnel_stage
  Awareness: '#6366f1',
  Consideration: '#10b981',
  Conversion: '#f59e0b',
}

const DEFAULT_BAR_COLOR = '#6366f1'

const SLICE_FIELD_MAP = {
  platform: 'platform',
  format: 'format',
  funnel_stage: 'funnel_stage',
}

function getAttrValue(c, attribute) {
  if (attribute === 'video_duration_sec') {
    const v = c[attribute]
    if (v == null) return null
    return v <= 15 ? 'Short' : 'Long'
  }
  if (attribute === 'product_in_first_3s') {
    return c[attribute] ? 'Yes' : 'No'
  }
  return c[attribute] == null ? null : String(c[attribute])
}

function avgMetric(creatives, metric) {
  if (!creatives || creatives.length === 0) return 0
  return creatives.reduce((sum, c) => sum + (c[metric] || 0), 0) / creatives.length
}

function formatMetricValue(v, metric) {
  if (metric === 'ctr' || metric === 'cvr') return (v * 100).toFixed(1) + '%'
  if (metric === 'roas') return v.toFixed(2)
  if (metric === 'cpa') return '$' + v.toFixed(1)
  return v.toFixed(2)
}

function ArrowBadge({ groupAvg, overallAvg, metric }) {
  const isBetter = metric === 'cpa'
    ? groupAvg < overallAvg   // lower CPA is better
    : groupAvg > overallAvg

  if (Math.abs(groupAvg - overallAvg) < 1e-9) return null

  return (
    <span
      className="ml-1 text-xs font-bold"
      style={{ color: isBetter ? '#10b981' : '#ef4444' }}
    >
      {isBetter ? '↑' : '↓'}
    </span>
  )
}

export default function AttributeBreakdown({ title, attribute, creatives, metric, sliceBy }) {
  const overallAvg = useMemo(() => avgMetric(creatives, metric), [creatives, metric])

  const chartData = useMemo(() => {
    if (!creatives || creatives.length === 0) return []

    // Collect distinct attribute values (excluding nulls from video_duration_sec if non-video records slipped in)
    const attrGroups = new Map()
    for (const c of creatives) {
      const attrVal = getAttrValue(c, attribute)
      if (attrVal == null) continue
      if (!attrGroups.has(attrVal)) attrGroups.set(attrVal, [])
      attrGroups.get(attrVal).push(c)
    }

    if (sliceBy === 'all') {
      return Array.from(attrGroups.entries()).map(([attrVal, group]) => ({
        name: attrVal,
        value: avgMetric(group, metric),
        n: group.length,
      }))
    }

    // Grouped bars: collect all slice values
    const sliceField = SLICE_FIELD_MAP[sliceBy]
    const allSliceValues = [...new Set(creatives.map((c) => c[sliceField]).filter(Boolean))]

    return Array.from(attrGroups.entries()).map(([attrVal, group]) => {
      const row = { name: attrVal, n: group.length }
      for (const sv of allSliceValues) {
        const sub = group.filter((c) => c[sliceField] === sv)
        row[sv] = sub.length > 0 ? avgMetric(sub, metric) : 0
        row[`n_${sv}`] = sub.length
      }
      return row
    })
  }, [creatives, attribute, metric, sliceBy])

  // Determine which slice values are present (for grouped mode)
  const sliceValues = useMemo(() => {
    if (sliceBy === 'all') return []
    const sliceField = SLICE_FIELD_MAP[sliceBy]
    return [...new Set((creatives || []).map((c) => c[sliceField]).filter(Boolean))]
  }, [creatives, sliceBy])

  const tooltipFormatter = (value, name) => {
    return [formatMetricValue(value, metric), name]
  }

  if (!creatives || creatives.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-3">
        <p className="text-sm font-medium text-gray-300 mb-2">{title}</p>
        <p className="text-xs text-gray-500">No data</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <div className="flex items-center gap-1 mb-1">
        <p className="text-sm font-medium text-gray-300">{title}</p>
        <span className="text-xs text-gray-500">
          avg {formatMetricValue(overallAvg, metric)}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart
          data={chartData}
          margin={{ top: 16, right: 6, bottom: 4, left: 0 }}
        >
          <XAxis
            dataKey="name"
            tick={{ fill: '#9ca3af', fontSize: 10 }}
            stroke="#4b5563"
            interval={0}
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 9 }}
            stroke="#4b5563"
            tickFormatter={(v) => formatMetricValue(v, metric)}
            width={38}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 6, fontSize: 11 }}
            labelStyle={{ color: '#e5e7eb' }}
            itemStyle={{ color: '#d1d5db' }}
            formatter={tooltipFormatter}
          />

          {sliceBy === 'all' ? (
            <Bar dataKey="value" name={metric.toUpperCase()} maxBarSize={40}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={
                    (metric === 'cpa' ? entry.value < overallAvg : entry.value > overallAvg)
                      ? '#6366f1'
                      : '#4b5563'
                  }
                />
              ))}
              <LabelList
                dataKey="n"
                position="top"
                style={{ fontSize: 10, fill: '#9ca3af' }}
              />
            </Bar>
          ) : (
            sliceValues.map((sv) => (
              <Bar key={sv} dataKey={sv} name={sv} maxBarSize={24} fill={SLICE_COLORS[sv] || DEFAULT_BAR_COLOR}>
                <LabelList
                  dataKey={`n_${sv}`}
                  position="top"
                  style={{ fontSize: 9, fill: '#9ca3af' }}
                />
              </Bar>
            ))
          )}
        </BarChart>
      </ResponsiveContainer>

      {/* Arrow badges row */}
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
        {chartData.map((entry) => {
          const groupAvg = sliceBy === 'all' ? entry.value : avgMetric(
            (creatives || []).filter((c) => getAttrValue(c, attribute) === entry.name),
            metric
          )
          return (
            <span key={entry.name} className="text-xs text-gray-400 flex items-center">
              {entry.name}
              <ArrowBadge groupAvg={groupAvg} overallAvg={overallAvg} metric={metric} />
            </span>
          )
        })}
      </div>
    </div>
  )
}
