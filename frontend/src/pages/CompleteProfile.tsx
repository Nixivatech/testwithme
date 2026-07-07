import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useEnrollment } from '../context/EnrollmentContext'
import type { User } from '../types'

const PROFESSIONAL_OPTIONS = ['Student', 'Working Professional', 'Learner']

function isPhoneMandatory(createdAt: string, enrolledCount: number): boolean {
  const daysSinceRegistration = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  return daysSinceRegistration > 7 || enrolledCount > 0
}

export default function CompleteProfile() {
  const { user, setUser } = useAuth()
  const { enrolledModuleIds } = useEnrollment()
  const navigate = useNavigate()

  const isEditing = user?.isProfileComplete ?? false
  const mandatory = !isEditing && user ? isPhoneMandatory(user.createdAt, enrolledModuleIds.length) : false

  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [professional, setProfessional] = useState(user?.professional ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!phone.trim() || !professional) { setError('Please fill all fields.'); return }
    setSubmitting(true)
    setError('')
    try {
      const res = await api.patch<User>('/api/users/profile', { name: name.trim(), phone: phone.trim(), professional })
      setUser(res.data)
      navigate('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-1">{isEditing ? 'Edit Profile' : 'Complete your profile'}</h1>
        <p className="text-sm text-slate-400 mb-2">{isEditing ? 'Update your details below.' : 'Just a few more details before you get started.'}</p>

        {mandatory && (
          <p className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-2.5 mb-6">
            Phone number is required — you've been with us for a while or have enrolled in a module.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Phone Number {mandatory && <span className="text-amber-400">*</span>}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              required={mandatory}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-2">I am a…</label>
            <div className="grid grid-cols-3 gap-2">
              {PROFESSIONAL_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setProfessional(opt)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-colors text-center ${
                    professional === opt
                      ? 'bg-brand border-brand text-white'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/30'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand text-white font-semibold py-3 rounded-xl hover:bg-brand/90 disabled:opacity-50 transition-colors mt-2"
          >
            {submitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Continue to Dashboard'}
          </button>

          {!isEditing && !mandatory && (
            <button
              type="button"
              onClick={() => { sessionStorage.setItem('profileSkipped', '1'); navigate('/dashboard') }}
              className="w-full text-sm text-slate-500 hover:text-slate-300 py-2 transition-colors"
            >
              Skip for now
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
