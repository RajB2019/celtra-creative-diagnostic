const PERSONAS = [
  { key: 'performance', label: 'Perf. Marketer' },
  { key: 'strategist', label: 'Strategist' },
  { key: 'executive', label: 'Executive' },
]

export default function PersonaToggle({ persona, onPersonaChange }) {
  return (
    <div className="bg-gray-800 rounded-lg p-2 flex flex-col gap-1">
      {PERSONAS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onPersonaChange(key)}
          className={`px-3 py-2 rounded text-sm font-medium text-left transition-colors ${
            persona === key
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
