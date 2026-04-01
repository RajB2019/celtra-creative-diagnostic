import { useState, useMemo } from 'react'
import CREATIVES from '../../data/timeseries'
import { generateInsights } from '../../engine/insights'
import AppShell from './AppShell'
import OverviewView from '../overview/OverviewView'
import PatternsView from '../patterns/PatternsView'
import ReliabilityView from '../reliability/ReliabilityView'
import RecommendationsView from '../recommendations/RecommendationsView'
import SummaryView from '../summary/SummaryView'

export default function PersonaLayout({ persona }) {
  const [activeStep, setActiveStep] = useState(1)

  const insights = useMemo(() => generateInsights(CREATIVES), [])

  function renderStep() {
    if (activeStep === 1) {
      return <OverviewView creatives={CREATIVES} persona={persona} />
    }
    if (activeStep === 2) {
      return <PatternsView creatives={CREATIVES} persona={persona} />
    }
    if (activeStep === 3) {
      return <ReliabilityView insights={insights} persona={persona} />
    }
    if (activeStep === 4) {
      return <RecommendationsView insights={insights} persona={persona} />
    }
    if (activeStep === 5) {
      return <SummaryView insights={insights} persona={persona} creatives={CREATIVES} />
    }
    return (
      <div className="p-8 text-gray-400">
        Step {activeStep} — coming soon
      </div>
    )
  }

  return (
    <AppShell activeStep={activeStep} onStepChange={setActiveStep}>
      {renderStep()}
    </AppShell>
  )
}
