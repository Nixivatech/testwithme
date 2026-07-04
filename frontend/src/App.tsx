import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ModulePage from './pages/ModulePage'
import TopicPage from './pages/TopicPage'
import Certificates from './pages/Certificates'
import CertificateVerify from './pages/CertificateVerify'
import Pricing from './pages/Pricing'
import Admin from './pages/Admin'
import LogoConcepts from './pages/LogoConcepts'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/verify/:certificateCode" element={<CertificateVerify />} />
        <Route path="/logo-concepts" element={<LogoConcepts />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/modules/:moduleSlug" element={<ModulePage />} />
          <Route path="/modules/:moduleSlug/topics/:topicSlug" element={<TopicPage />} />
          <Route path="/certificates" element={<Certificates />} />
        </Route>

        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </>
  )
}
