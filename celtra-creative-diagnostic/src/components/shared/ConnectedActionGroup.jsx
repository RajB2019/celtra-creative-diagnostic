import ConnectedActionButton from './ConnectedActionButton'

export default function ConnectedActionGroup({ actions }) {
  if (!actions || actions.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {actions.map((action, i) => (
        <ConnectedActionButton key={`${action.product.id}-${i}`} action={action} />
      ))}
    </div>
  )
}
