import PersonaSummary from './PersonaSummary'

const PERSONAS = ['performance', 'strategist', 'executive']

export default function SummaryView({ insights, persona }) {
  return (
    <div className="p-6">
      {/* Side-by-side on wide viewports, tabs on narrow */}
      <div className="hidden md:flex flex-row gap-6 items-start">
        {PERSONAS.map(p => (
          <div key={p} className="flex-1 min-w-0">
            <PersonaSummary
              panelPersona={p}
              isActive={persona === p}
              insights={insights}
            />
          </div>
        ))}
      </div>

      {/* Narrow: tab-like stack — active panel on top, dimmed panels below */}
      <div className="flex flex-col gap-4 md:hidden">
        {PERSONAS.map(p => (
          <PersonaSummary
            key={p}
            panelPersona={p}
            isActive={persona === p}
            insights={insights}
          />
        ))}
      </div>

      <p className="mt-6 text-xs text-gray-500">
        Inactive panels are shown at reduced opacity but remain fully present.
        Switch persona above to highlight a different audience view.
      </p>
    </div>
  )
}
