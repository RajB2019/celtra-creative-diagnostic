import { Routes, Route, Navigate } from 'react-router-dom'
import PersonaLayout from './components/layout/PersonaLayout'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PersonaLayout persona="performance" />} />
      <Route path="/strategist" element={<PersonaLayout persona="strategist" />} />
      <Route path="/executive" element={<PersonaLayout persona="executive" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
