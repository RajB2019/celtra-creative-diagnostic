import Sidebar from './Sidebar'

export default function AppShell({
  activeStep,
  onStepChange,
  persona,
  onPersonaChange,
  children,
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-60 flex-shrink-0 bg-gray-900 overflow-y-auto">
        <Sidebar
          activeStep={activeStep}
          onStepChange={onStepChange}
          persona={persona}
          onPersonaChange={onPersonaChange}
        />
      </div>
      <main className="flex-1 overflow-y-auto bg-gray-950">
        {children}
      </main>
    </div>
  )
}
