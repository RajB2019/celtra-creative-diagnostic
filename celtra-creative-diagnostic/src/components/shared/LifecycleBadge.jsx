const LIFECYCLE_STYLES = {
  ramping:    { bg: 'bg-blue-900',    text: 'text-blue-300',    label: 'Ramping' },
  peak:       { bg: 'bg-emerald-900', text: 'text-emerald-300', label: 'Peak' },
  evergreen:  { bg: 'bg-indigo-900',  text: 'text-indigo-300',  label: 'Evergreen' },
  declining:  { bg: 'bg-amber-900',   text: 'text-amber-300',   label: 'Declining' },
  stale:      { bg: 'bg-rose-900',    text: 'text-rose-400',    label: 'Stale' },
}

export default function LifecycleBadge({ lifecycle }) {
  const style = LIFECYCLE_STYLES[lifecycle] || LIFECYCLE_STYLES.ramping

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  )
}
