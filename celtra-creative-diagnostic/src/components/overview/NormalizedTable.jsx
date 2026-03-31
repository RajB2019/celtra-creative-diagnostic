import { useState } from 'react'

const COLUMNS = [
  { key: 'creative_id', label: 'Creative ID' },
  { key: 'platform', label: 'Platform' },
  { key: 'format', label: 'Format' },
  { key: 'funnel_stage', label: 'Stage' },
  { key: 'normScore', label: 'Score' },
  { key: 'ctr', label: 'CTR' },
  { key: 'cvr', label: 'CVR' },
  { key: 'roas', label: 'ROAS' },
  { key: 'cpa', label: 'CPA' },
  { key: 'status', label: 'Status' },
]

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

export default function NormalizedTable({ creatives }) {
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
            {COLUMNS.map((col) => (
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
              <td className="px-3 py-2 font-mono text-xs">{c.creative_id}</td>
              <td className="px-3 py-2">{c.platform}</td>
              <td className="px-3 py-2">{c.format}</td>
              <td className="px-3 py-2">{c.funnel_stage}</td>
              <td className="px-3 py-2 font-semibold">{c.normScore.toFixed(1)}</td>
              <td className="px-3 py-2">{(c.ctr * 100).toFixed(1)}%</td>
              <td className="px-3 py-2">{(c.cvr * 100).toFixed(1)}%</td>
              <td className="px-3 py-2">{c.roas.toFixed(1)}</td>
              <td className="px-3 py-2">${c.cpa.toFixed(1)}</td>
              <td className="px-3 py-2">
                <StatusBadge score={c.normScore} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
