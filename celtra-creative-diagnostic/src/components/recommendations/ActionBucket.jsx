const BUCKET_STYLES = {
  more: {
    header: 'text-emerald-400 border-emerald-700',
    title: 'Produce More',
  },
  less: {
    header: 'text-red-400 border-red-700',
    title: 'Produce Less',
  },
  test: {
    header: 'text-amber-400 border-amber-700',
    title: 'Test Next',
  },
}

const CONFIDENCE_BADGE = {
  strong: 'bg-emerald-900 text-emerald-300',
  moderate: 'bg-amber-900 text-amber-300',
  weak: 'bg-gray-700 text-gray-400',
  noise: 'bg-gray-800 text-gray-500',
}

function formatDelta(deltaPercent) {
  const sign = deltaPercent >= 0 ? '+' : '\u2212'
  return `${sign}${Math.abs(deltaPercent).toFixed(0)}%`
}

export default function ActionBucket({ bucket, insights, persona }) {
  const style = BUCKET_STYLES[bucket]

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className={`px-4 py-3 border-b ${style.header}`}>
        <h3 className="text-base font-semibold">{style.title}</h3>
      </div>

      {/* Items */}
      <div className="p-4 flex flex-col gap-4">
        {insights.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No patterns qualify for this bucket with current data.
          </p>
        ) : (
          insights.map(insight => (
            <div key={insight.id} className="flex flex-col gap-1 pb-3 border-b border-gray-700 last:border-b-0 last:pb-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-100">{insight.patternLabel}</span>
                <span className="text-xs text-gray-500">{insight.metric}</span>
                <span className="text-xs font-semibold text-gray-200">{formatDelta(insight.deltaPercent)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wide ${CONFIDENCE_BADGE[insight.confidence] || CONFIDENCE_BADGE.weak}`}>
                  {insight.confidence}
                </span>
                <span className="text-xs text-gray-500">N={insight.nA + insight.nB}</span>
              </div>
              {insight.action?.[persona] && (
                <p className="text-sm text-gray-300 mt-1">{insight.action[persona]}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
