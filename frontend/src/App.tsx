import { Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import { useHeartbeat } from './hooks/useHeartbeat'
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
import LearnSphere from './pages/LearnSphere'
import LogoConcepts from './pages/LogoConcepts'
import BrowsePage from './pages/BrowsePage'
import TestPage from './pages/TestPage'
import CompleteProfile from './pages/CompleteProfile'

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-navy">
      <div className="max-w-5xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-sm font-semibold text-white">Mathilens</p>
        <p className="text-xs text-slate-300 tracking-wide">Learn. Execute. Find.</p>
        <p className="text-xs text-slate-600">© {new Date().getFullYear()}</p>
      </div>
    </footer>
  )
}

export default function App() {
  useHeartbeat()
  const location = useLocation()
  const isLearnSphere = location.pathname.startsWith('/learnsphere')

  return (
    <div className="flex flex-col min-h-screen">
      {!isLearnSphere && <Navbar />}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/verify/:certificateCode" element={<CertificateVerify />} />
          <Route path="/logo-concepts" element={<LogoConcepts />} />
          <Route path="/learnsphere" element={<LearnSphere />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/profile" element={<CompleteProfile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/modules/:moduleSlug" element={<ModulePage />} />
            <Route path="/modules/:moduleSlug/topics/:topicSlug" element={<TopicPage />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/test" element={<TestPage />} />
          </Route>

          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
      </div>
      {!isLearnSphere && <Footer />}
    </div>
  )
}
