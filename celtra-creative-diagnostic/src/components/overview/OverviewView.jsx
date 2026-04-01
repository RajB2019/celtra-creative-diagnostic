import { useMemo } from 'react'
import { normalizeScore, aggregateKPIs } from '../../engine/metrics'
import NormalizedTable from './NormalizedTable'
import PerformanceScatter from './PerformanceScatter'
import TrendPanel from './TrendPanel'

function KPICard({ label, value }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 flex flex-col gap-1 border border-gray-700">
      <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-semibold text-gray-100">{value}</span>
    </div>
  )
}

export default function OverviewView({ creatives, persona = 'performance' }) {
  const enriched = useMemo(() => {
    return creatives.map((c) => ({
      ...c,
      normScore: normalizeScore(c, creatives),
    }))
  }, [creatives])

  const kpis = useMemo(() => aggregateKPIs(creatives), [creatives])

  const scores = enriched.map((c) => c.normScore).sort((a, b) => a - b)
  const mid = Math.floor(scores.length / 2)
  const medianScore =
    scores.length % 2 === 0
      ? (scores[mid - 1] + scores[mid]) / 2
      : scores[mid]

  const overBenchmarkPct =
    scores.length > 0
      ? (enriched.filter((c) => c.normScore > 65).length / enriched.length) * 100
      : 0

  const isExec = persona === 'executive'
  const isPerf = persona === 'performance'

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* KPI row */}
      <div className={`grid gap-4 ${isExec ? 'grid-cols-4' : isPerf ? 'grid-cols-6' : 'grid-cols-4'}`}>
        <KPICard label="Total Creatives" value={kpis.totalCreatives.toLocaleString()} />
        <KPICard label="Total Impressions" value={kpis.totalImpressions.toLocaleString()} />
        <KPICard label="Median Score" value={medianScore.toFixed(1)} />
        <KPICard label="% Over Benchmark" value={`${overBenchmarkPct.toFixed(1)}%`} />
        {isPerf && (
          <>
            <KPICard label="Total Spend" value={`$${Math.round(kpis.totalSpend).toLocaleString()}`} />
            <KPICard label="Avg CPM" value={`$${kpis.avgCPM.toFixed(2)}`} />
          </>
        )}
      </div>

      {/* Inline note */}
      <p className="text-xs text-gray-500">
        Scores are benchmarked within each platform × funnel stage group
      </p>

      {/* Two-column layout */}
      <div className="flex gap-4 items-start">
        <div className="flex-[7]">
          <NormalizedTable creatives={enriched} persona={persona} />
        </div>
        <div className="flex-[3] flex flex-col gap-4">
          <PerformanceScatter creatives={enriched} />
          {!isExec && <TrendPanel creatives={enriched} />}
        </div>
      </div>
    </div>
  )
}
