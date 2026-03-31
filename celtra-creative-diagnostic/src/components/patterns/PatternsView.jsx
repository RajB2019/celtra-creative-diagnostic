import { useState, useMemo } from 'react'
import AttributeBreakdown from './AttributeBreakdown'

const METRICS = [
  { key: 'ctr', label: 'CTR' },
  { key: 'cvr', label: 'CVR' },
  { key: 'roas', label: 'ROAS' },
  { key: 'cpa', label: 'CPA' },
]

const SLICE_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'platform', label: 'By Platform' },
  { key: 'format', label: 'By Format' },
  { key: 'funnel_stage', label: 'By Funnel Stage' },
]

const PANELS = [
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

export default function PatternsView({ creatives }) {
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
          {METRICS.map((m) => (
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

        {/* Slice selector */}
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
      </div>

      {/* 9-panel grid */}
      <div className="grid grid-cols-3 gap-4">
        {PANELS.map((panel) => (
          <AttributeBreakdown
            key={panel.attribute}
            title={panel.title}
            attribute={panel.attribute}
            creatives={panel.attribute === 'video_duration_sec' ? videoCreatives : creatives}
            metric={activeMetric}
            sliceBy={sliceBy}
          />
        ))}
      </div>
    </div>
  )
}
