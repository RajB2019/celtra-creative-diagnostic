import { useMemo } from 'react'
import ActionBucket from './ActionBucket'

export default function RecommendationsView({ insights, persona }) {
  const produceMore = useMemo(
    () => insights.filter(i => i.confidence === 'strong' && i.direction === 'positive'),
    [insights]
  )

  const produceLess = useMemo(
    () => insights.filter(
      i => (i.confidence === 'strong' || i.confidence === 'moderate') && i.direction === 'negative'
    ),
    [insights]
  )

  const testNext = useMemo(
    () => insights.filter(
      i => (i.confidence === 'moderate' || i.confidence === 'weak') && Math.abs(i.deltaPercent) >= 15
    ),
    [insights]
  )

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-4">
        <ActionBucket bucket="more" insights={produceMore} persona={persona} />
        <ActionBucket bucket="less" insights={produceLess} persona={persona} />
        <ActionBucket bucket="test" insights={testNext} persona={persona} />
      </div>

      {/* Footer disclaimer */}
      <p className="text-xs text-gray-500">
        Recommendations use patterns with N &ge; 5 and effect size &ge; 10%.
        &ldquo;Test Next&rdquo; patterns have directional signal but need more data before acting.
      </p>
    </div>
  )
}
