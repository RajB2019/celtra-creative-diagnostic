import PersonaToggle from './PersonaToggle'

const STEP_NAMES = [
  'Campaign Overview',
  'Pattern Detection',
  'Reliability',
  'Recommendations',
  'Audience Summary',
]

export default function Sidebar({ activeStep, onStepChange }) {
  return (
    <div className="flex flex-col h-full px-4 py-6 gap-6">
      <div className="text-sm font-semibold text-indigo-400 tracking-wide">
        Celtra Creative Diagnostic
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {STEP_NAMES.map((name, i) => {
          const step = i + 1
          const isActive = step === activeStep
          const isVisited = step < activeStep

          let className = 'px-3 py-2 text-sm rounded cursor-pointer transition-colors '
          if (isActive) {
            className += 'border-l-2 border-indigo-400 text-indigo-300 bg-gray-800'
          } else if (isVisited) {
            className += 'text-indigo-600 hover:text-indigo-400'
          } else {
            className += 'text-gray-500 hover:text-gray-400'
          }

          return (
            <div
              key={step}
              className={className}
              onClick={() => onStepChange(step)}
            >
              <span className="mr-2 opacity-60">{step}.</span>
              {name}
            </div>
          )
        })}
      </nav>

      <div>
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-1">
          Persona
        </div>
        <PersonaToggle />
      </div>
    </div>
  )
}
