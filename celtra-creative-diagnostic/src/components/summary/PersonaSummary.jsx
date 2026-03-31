const CONFIDENCE_ORDER = { strong: 0, moderate: 1, weak: 2, noise: 3 }

function formatDelta(deltaPercent) {
  const sign = deltaPercent >= 0 ? '+' : '\u2212'
  return `${sign}${Math.abs(deltaPercent).toFixed(0)}%`
}

// Replace metric jargon for strategist voice
function strategistLabel(text) {
  return text
    .replace(/\bCTR\b/g, 'hook rate')
    .replace(/\bCVR\b/g, 'conversion strength')
}

// Replace metric jargon for executive voice (no CTR/CVR/ROAS/CPA)
function executiveLabel(text) {
  return text
    .replace(/\bCTR\b/g, 'click engagement')
    .replace(/\bCVR\b/g, 'purchase completion rate')
    .replace(/\bROAS\b/g, 'return on investment')
    .replace(/\bCPA\b/g, 'cost per acquisition')
}

// ─── Performance Marketer ─────────────────────────────────────────────────────
function PerformancePanel({ insights }) {
  const top3 = [...insights]
    .filter(i => i.direction === 'positive')
    .sort((a, b) => Math.abs(b.deltaPercent) - Math.abs(a.deltaPercent))
    .slice(0, 3)

  const budgetFlags = insights.filter(i => i.recommendationBucket === 'less').slice(0, 5)
  const testQueue = insights.filter(i => i.recommendationBucket === 'test').slice(0, 2)
  const roasReliability = insights.find(i => i.id === 'funnel-roas-reliability-awareness')

  return (
    <div className="flex flex-col gap-5">
      {/* Top KPI moves */}
      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
          Top KPI Moves
        </h4>
        {top3.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No positive signals with current data.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {top3.map(i => (
              <li key={i.id} className="text-sm text-gray-100">
                <span className="text-emerald-400 font-semibold">{formatDelta(i.deltaPercent)}</span>
                {' '}
                {i.headline.performance}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Budget flags */}
      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
          Budget Flags
        </h4>
        {budgetFlags.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No budget-drain patterns detected.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {budgetFlags.map(i => (
              <li key={i.id} className="text-sm text-amber-300">
                &#9888; {i.action.performance}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Test queue */}
      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
          Test Queue
        </h4>
        {testQueue.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No test candidates with current data.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {testQueue.map(i => (
              <li key={i.id} className="text-sm text-gray-300">
                <span className="text-amber-400 font-semibold">{formatDelta(i.deltaPercent)}</span>
                {' '}{i.patternLabel} — {i.action.performance}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Risk flags */}
      {roasReliability && (
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Risk Flags
          </h4>
          <p className="text-sm text-rose-400">
            &#9888; {roasReliability.headline.performance}
          </p>
        </section>
      )}
    </div>
  )
}

// ─── Creative Strategist ──────────────────────────────────────────────────────
function StrategistPanel({ insights }) {
  const filtered = insights.filter(i => i.personas.includes('strategist'))

  const working = filtered.filter(i => i.direction === 'positive')
  const toBrief = filtered.filter(i => i.recommendationBucket === 'more' || i.recommendationBucket === 'test')
  const risks = filtered.filter(i => i.direction === 'negative').slice(0, 3)

  return (
    <div className="flex flex-col gap-5">
      {/* What's Working */}
      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
          What&apos;s Working
        </h4>
        {working.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No strong positive creative signals yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {working.slice(0, 4).map(i => (
              <li key={i.id} className="text-sm text-gray-100">
                <span className="text-emerald-400 font-semibold">{i.patternLabel}</span>
                {' — '}
                {strategistLabel(i.headline.strategist)}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* What to Brief */}
      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
          What to Brief Next
        </h4>
        {toBrief.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No briefing directions with current data.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {toBrief.slice(0, 4).map(i => (
              <li key={i.id} className="text-sm text-gray-300">
                {strategistLabel(i.action.strategist)}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Risk flags */}
      {risks.length > 0 && (
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Risk Flags
          </h4>
          <ul className="flex flex-col gap-1">
            {risks.map(i => (
              <li key={i.id} className="text-sm text-rose-400">
                &#9888; {strategistLabel(i.headline.strategist)}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

// ─── Executive ────────────────────────────────────────────────────────────────
function ExecutivePanel({ insights }) {
  const top5 = [...insights]
    .filter(i => i.personas.includes('executive'))
    .sort((a, b) => {
      const ca = CONFIDENCE_ORDER[a.confidence] ?? 3
      const cb = CONFIDENCE_ORDER[b.confidence] ?? 3
      if (ca !== cb) return ca - cb
      return Math.abs(b.deltaPercent) - Math.abs(a.deltaPercent)
    })
    .slice(0, 5)

  const risk = insights.find(i => i.direction === 'negative' && i.personas.includes('executive'))
  const opportunity = insights.find(i => i.direction === 'positive' && i.confidence === 'strong' && i.personas.includes('executive'))
  const qRec = insights.find(
    i => i.recommendationBucket === 'more' && i.personas.includes('executive')
  )

  return (
    <div className="flex flex-col gap-5">
      {/* Top bullets */}
      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
          Portfolio Summary
        </h4>
        <ul className="flex flex-col gap-2 list-disc list-inside">
          {top5.map(i => (
            <li key={i.id} className="text-sm text-gray-100">
              {executiveLabel(i.headline.executive)}
            </li>
          ))}
        </ul>
      </section>

      {/* Risk + Opportunity */}
      <section className="flex flex-col gap-2">
        {risk && (
          <p className="text-sm text-rose-400">
            <span className="font-semibold">Risk: </span>
            {executiveLabel(risk.headline.executive)}
          </p>
        )}
        {opportunity && (
          <p className="text-sm text-emerald-400">
            <span className="font-semibold">Opportunity: </span>
            {executiveLabel(opportunity.headline.executive)}
          </p>
        )}
      </section>

      {/* Q-level recommendation */}
      {qRec && (
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            This Quarter
          </h4>
          <p className="text-sm text-gray-100">
            {executiveLabel(qRec.action.executive)}
          </p>
        </section>
      )}
    </div>
  )
}

// ─── PersonaSummary ───────────────────────────────────────────────────────────
const PANEL_META = {
  performance: { label: 'Performance Marketer', color: 'text-sky-400', border: 'border-sky-700' },
  strategist:  { label: 'Creative Strategist',  color: 'text-violet-400', border: 'border-violet-700' },
  executive:   { label: 'Executive',            color: 'text-amber-400', border: 'border-amber-700' },
}

export default function PersonaSummary({ panelPersona, isActive, insights }) {
  const meta = PANEL_META[panelPersona]

  return (
    <div className={isActive ? 'opacity-100' : 'opacity-50'}>
      <div className={`bg-gray-800 rounded-lg border ${meta.border} overflow-hidden h-full`}>
        {/* Panel header */}
        <div className={`px-4 py-3 border-b ${meta.border}`}>
          <h3 className={`text-base font-semibold ${meta.color}`}>{meta.label}</h3>
          {isActive && (
            <span className="text-xs text-gray-400">Active view</span>
          )}
        </div>

        {/* Panel body */}
        <div className="p-4">
          {panelPersona === 'performance' && <PerformancePanel insights={insights} />}
          {panelPersona === 'strategist'  && <StrategistPanel  insights={insights} />}
          {panelPersona === 'executive'   && <ExecutivePanel   insights={insights} />}
        </div>
      </div>
    </div>
  )
}
