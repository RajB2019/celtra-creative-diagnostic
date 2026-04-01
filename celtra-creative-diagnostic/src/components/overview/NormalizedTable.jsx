import { useState, useMemo } from 'react'
import SparklineChart from '../shared/SparklineChart'
import LifecycleBadge from '../shared/LifecycleBadge'

const FULL_COLUMNS = [
  { key: 'creative_id', label: 'Creative ID' },
  { key: 'platform', label: 'Platform' },
  { key: 'format', label: 'Format' },
  { key: 'funnel_stage', label: 'Stage' },
  { key: 'normScore', label: 'Score' },
  { key: 'ctr', label: 'CTR' },
  { key: 'cvr', label: 'CVR' },
  { key: 'roas', label: 'ROAS' },
  { key: 'cpa', label: 'CPA' },
  { key: 'spend', label: 'Spend' },
  { key: 'cpm', label: 'CPM' },
  { key: 'trend', label: 'Trend' },
  { key: 'lifecycle', label: 'Lifecycle' },
  { key: 'maturity', label: 'Maturity' },
  { key: 'status', label: 'Status' },
]

const STRATEGIST_COLUMNS = [
  { key: 'creative_id', label: 'Creative ID' },
  { key: 'platform', label: 'Platform' },
  { key: 'format', label: 'Format' },
  { key: 'funnel_stage', label: 'Stage' },
  { key: 'normScore', label: 'Score' },
  { key: 'ctr', label: 'Hook Rate' },
  { key: 'cvr', label: 'Conv. Strength' },
  { key: 'roas', label: 'ROAS' },
  { key: 'cpa', label: 'CPA' },
  { key: 'trend', label: 'Trend' },
  { key: 'lifecycle', label: 'Lifecycle' },
  { key: 'status', label: 'Status' },
]

const EXECUTIVE_COLUMNS = [
  { key: 'creative_id', label: 'Creative ID' },
  { key: 'platform', label: 'Platform' },
  { key: 'normScore', label: 'Score' },
  { key: 'lifecycle', label: 'Lifecycle' },
  { key: 'status', label: 'Status' },
]

function getColumns(persona) {
  if (persona === 'executive') return EXECUTIVE_COLUMNS
  if (persona === 'strategist') return STRATEGIST_COLUMNS
  return FULL_COLUMNS
}

function getStatus(score) {
  if (score > 65) return 'over'
  if (score >= 40) return 'ontarget'
  return 'under'
}

function StatusBadge({ score }) {
  const status = getStatus(score)
  if (status === 'over') {
    return (
      <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-900 text-emerald-300">
        Over
      </span>
    )
  }
  if (status === 'ontarget') {
    return (
      <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-400">
        On Target
      </span>
    )
  }
  return (
    <span className="px-2 py-0.5 rounded text-xs font-medium bg-rose-900 text-rose-400">
      Under
    </span>
  )
}

const MATURITY_LABELS = {
  early: { label: 'Too Early to Call', bg: 'bg-gray-700', text: 'text-gray-400' },
  ramping: { label: 'Ramping', bg: 'bg-blue-900', text: 'text-blue-300' },
  mature: { label: 'Mature', bg: 'bg-emerald-900', text: 'text-emerald-300' },
}

function MaturityBadge({ maturity }) {
  const style = MATURITY_LABELS[maturity] || MATURITY_LABELS.early
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  )
}

function formatCell(key, value) {
  if (key === 'ctr' || key === 'cvr') return `${(value * 100).toFixed(1)}%`
  if (key === 'roas') return value.toFixed(1)
  if (key === 'cpa') return `$${value.toFixed(1)}`
  if (key === 'spend') return `$${Math.round(value).toLocaleString()}`
  if (key === 'cpm') return `$${value.toFixed(2)}`
  if (key === 'normScore') return value.toFixed(1)
  return value
}

export default function NormalizedTable({ creatives, persona = 'performance' }) {
  const columns = useMemo(() => getColumns(persona), [persona])
  const [sortKey, setSortKey] = useState('normScore')
  const [sortDir, setSortDir] = useState('desc')

  function handleSort(key) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = [...creatives].sort((a, b) => {
    let aVal = a[sortKey]
    let bVal = b[sortKey]
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = (bVal || '').toLowerCase()
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    }
    aVal = aVal ?? 0
    bVal = bVal ?? 0
    return sortDir === 'asc' ? aVal - bVal : bVal - aVal
  })

  return (
    <div className="overflow-auto max-h-[520px] rounded border border-gray-700">
      <table className="w-full text-sm text-gray-300 border-collapse">
        <thead className="sticky top-0 bg-gray-800 z-10">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.key !== 'status' && handleSort(col.key)}
                className={
                  'px-3 py-2 text-left font-medium text-gray-400 whitespace-nowrap select-none ' +
                  (col.key !== 'status' ? 'cursor-pointer hover:text-gray-200' : '')
                }
              >
                {col.label}
                {sortKey === col.key && (
                  <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((c) => (
            <tr key={c.creative_id} className="border-t border-gray-700 hover:bg-gray-800/50">
              {columns.map((col) => (
                <td key={col.key} className={`px-3 py-2${col.key === 'creative_id' ? ' font-mono text-xs' : ''}${col.key === 'normScore' ? ' font-semibold' : ''}`}>
                  {col.key === 'status' ? (
                    <StatusBadge score={c.normScore} />
                  ) : col.key === 'trend' ? (
                    <SparklineChart data={c.daily_metrics} color="#6366f1" width={100} height={28} />
                  ) : col.key === 'lifecycle' ? (
                    <LifecycleBadge lifecycle={c.lifecycle} />
                  ) : col.key === 'maturity' ? (
                    <MaturityBadge maturity={c.maturity} />
                  ) : (
                    formatCell(col.key, c[col.key])
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
