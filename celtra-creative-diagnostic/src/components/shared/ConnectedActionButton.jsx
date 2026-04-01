const PRIORITY_STYLES = {
  primary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
  secondary: 'border border-indigo-500 text-indigo-300 hover:bg-indigo-900/40',
  tertiary: 'text-indigo-400 hover:text-indigo-300 underline underline-offset-2',
}

export default function ConnectedActionButton({ action }) {
  const style = PRIORITY_STYLES[action.priority] || PRIORITY_STYLES.tertiary

  return (
    <a
      href={action.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${style}`}
      title={action.product.description}
    >
      <span>{action.product.icon}</span>
      <span>{action.label}</span>
      <span className="text-[10px] opacity-60 ml-0.5">(placeholder)</span>
    </a>
  )
}
