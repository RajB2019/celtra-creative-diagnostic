import { CONNECTED_PRODUCTS } from '../../engine/connectedSystems'

export default function ConnectedSystemsBanner() {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
      <h3 className="text-sm font-semibold text-gray-200 mb-1">Connected Celtra Products</h3>
      <p className="text-xs text-gray-400 mb-3">
        Take action on insights directly in Celtra&apos;s creative production suite.
      </p>
      <div className="flex flex-wrap gap-4">
        {CONNECTED_PRODUCTS.map(product => (
          <div key={product.id} className="flex items-center gap-2">
            <span className="text-lg">{product.icon}</span>
            <div>
              <p className="text-xs font-medium text-gray-200">{product.name}</p>
              <p className="text-[10px] text-gray-500">{product.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
