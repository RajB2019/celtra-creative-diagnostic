import { useState, useMemo } from 'react'
import AttributeBreakdown from './AttributeBreakdown'
import LifecycleDistribution from './LifecycleDistribution'

const PERF_METRICS = [
  { key: 'ctr', label: 'CTR' },
  { key: 'cvr', label: 'CVR' },
  { key: 'roas', label: 'ROAS' },
  { key: 'cpa', label: 'CPA' },
  { key: 'cpm', label: 'CPM' },
]

const STRATEGIST_METRICS = [
  { key: 'ctr', label: 'Hook Rate' },
  { key: 'cvr', label: 'Conv. Strength' },
  { key: 'roas', label: 'ROAS' },
  { key: 'cpa', label: 'CPA' },
]

const SLICE_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'platform', label: 'By Platform' },
  { key: 'format', label: 'By Format' },
  { key: 'funnel_stage', label: 'By Funnel Stage' },
]

const ALL_PANELS = [
  { attribute: 'aspect_ratio', title: 'Aspect Ratio' },
  { attribute: 'emotional_tone', title: 'Emotional Tone' },
  { attribute: 'motion_intensity', title: 'Motion Intensity' },
  { attribute: 'color_contrast', title: 'Color Contrast' },
  { attribute: 'brand_prominence', title: 'Brand Prominence' },
  { attribute: 'brand_consistency_score', title: 'Brand Consistency Score' },
  { attribute: 'format', title: 'Format' },
  { attribute: 'product_in_first_3s', title: 'Product in First 3s' },
  { attribute: 'video_duration_sec', title: 'Video Duration' },
]

// Executive sees top 4 most actionable panels with one-sentence takeaways
const EXEC_PANELS = [
  { attribute: 'format', title: 'Format', takeaway: 'Which creative formats drive the strongest outcomes.' },
  { attribute: 'aspect_ratio', title: 'Aspect Ratio', takeaway: 'Platform-native ratios consistently outperform mismatched ones.' },
  { attribute: 'emotional_tone', title: 'Emotional Tone', takeaway: 'Tone alignment with funnel stage affects conversion efficiency.' },
  { attribute: 'brand_consistency_score', title: 'Brand Consistency', takeaway: 'Higher brand consistency correlates with stronger return on spend.' },
]

export default function PatternsView({ creatives, persona = 'performance' }) {
  const isExec = persona === 'executive'
  const isStrategist = persona === 'strategist'
  const metrics = isStrategist ? STRATEGIST_METRICS : PERF_METRICS
  const panels = isExec ? EXEC_PANELS : ALL_PANELS

  const [activeMetric, setActiveMetric] = useState('ctr')
  const [sliceBy, setSliceBy] = useState('all')

  const videoCreatives = useMemo(
    () => creatives.filter((c) => c.format === 'Video'),
    [creatives]
  )

  return (
    <div className="p-6 flex flex-col gap-4">
      {/* Controls */}
      <div className="flex items-center gap-6 flex-wrap">
        {/* Metric selector */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 mr-2 uppercase tracking-wide">Metric</span>
          {metrics.map((m) => (
            <button
              key={m.key}
              onClick={() => setActiveMetric(m.key)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                activeMetric === m.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Slice selector — hidden for executive */}
        {!isExec && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 mr-2 uppercase tracking-wide">Slice</span>
            {SLICE_OPTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => setSliceBy(s.key)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  sliceBy === s.key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Panel grid */}
      <div className={`grid gap-4 ${isExec ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {panels.map((panel) => (
          <div key={panel.attribute} className="flex flex-col gap-1">
            <AttributeBreakdown
              title={panel.title}
              attribute={panel.attribute}
              creatives={panel.attribute === 'video_duration_sec' ? videoCreatives : creatives}
              metric={activeMetric}
              sliceBy={isExec ? 'all' : sliceBy}
            />
            {isExec && panel.takeaway && (
              <p className="text-xs text-gray-500 px-1">{panel.takeaway}</p>
            )}
          </div>
        ))}
      </div>

      {/* Lifecycle Distribution — hidden for executive */}
      {!isExec && <LifecycleDistribution creatives={creatives} />}
    </div>
  )
}
