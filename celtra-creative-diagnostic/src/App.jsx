import { useState, useMemo } from 'react'
import CREATIVES from './data/creatives'
import { generateInsights } from './engine/insights'
import AppShell from './components/layout/AppShell'
import OverviewView from './components/overview/OverviewView'
import PatternsView from './components/patterns/PatternsView'
import ReliabilityView from './components/reliability/ReliabilityView'
import RecommendationsView from './components/recommendations/RecommendationsView'
import SummaryView from './components/summary/SummaryView'

export default function App() {
  const [activeStep, setActiveStep] = useState(1)
  const [persona, setPersona] = useState('performance')

  const insights = useMemo(() => generateInsights(CREATIVES), [])

  function renderStep() {
    if (activeStep === 1) {
      return <OverviewView creatives={CREATIVES} />
    }
    if (activeStep === 2) {
      return <PatternsView creatives={CREATIVES} />
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
    <AppShell
      activeStep={activeStep}
      onStepChange={setActiveStep}
      persona={persona}
      onPersonaChange={setPersona}
    >
      {renderStep()}
    </AppShell>
  )
}
