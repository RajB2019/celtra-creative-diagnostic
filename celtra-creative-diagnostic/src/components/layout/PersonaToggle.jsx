import { NavLink } from 'react-router-dom'

const PERSONAS = [
  { path: '/', label: 'Perf. Marketer' },
  { path: '/strategist', label: 'Strategist' },
  { path: '/executive', label: 'Executive' },
]

export default function PersonaToggle() {
  return (
    <div className="bg-gray-800 rounded-lg p-2 flex flex-col gap-1">
      {PERSONAS.map(({ path, label }) => (
        <NavLink
          key={path}
          to={path}
          end
          className={({ isActive }) =>
            `px-3 py-2 rounded text-sm font-medium text-left transition-colors block ${
              isActive
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </div>
  )
}
