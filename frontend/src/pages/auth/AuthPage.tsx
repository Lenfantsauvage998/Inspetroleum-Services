import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn, UserPlus, AlertCircle } from 'lucide-react'
import { loginUser, registerUser } from '../../services/auth'
import { useAuthStore } from '../../store/authStore'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

type Tab = 'login' | 'register'

const AuthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('login')
  const { isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  }

  return (
    <div className="min-h-screen pt-24 md:pt-36 flex items-center justify-center bg-[#F2F2F2] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <img src="/assets/Logo-removebg-preview.png" alt="Industrial Services GF" className="h-16 w-auto object-contain" />
          </div>
          <p className="text-gray-500 text-sm">Access your account or create a new one</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {(['login', 'register'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-semibold transition-colors relative ${
                  activeTab === tab ? 'text-[#8DBF2E]' : 'text-gray-500 hover:text-[#333333]'
                }`}
              >
                {tab === 'login' ? 'Sign In' : 'Create Account'}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8DBF2E]" />
                )}
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeTab === 'login' ? (
              <LoginForm onSuccess={(role) => navigate(role === 'admin' ? '/admin' : '/dashboard')} />
            ) : (
              <RegisterForm onSuccess={() => navigate('/dashboard')} />
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By signing in, you agree to our{' '}
          <a href="#" className="text-[#8DBF2E] hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-[#8DBF2E] hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}

// ── Login Form ─────────────────────────────────────────────

interface LoginFormProps {
  onSuccess: (role: string) => void
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isCoolingDown, setIsCoolingDown] = useState(false)
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (cooldownRef.current) clearTimeout(cooldownRef.current) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isCoolingDown) return
    setError('')
    setLoading(true)
    try {
      await loginUser(email.trim(), password)
      // AuthContext's onAuthStateChange will load the profile and update the store.
      // Poll the store for up to 3 seconds until the profile is ready, then navigate.
      let waited = 0
      const poll = setInterval(() => {
        const { user: u, isAuthenticated } = useAuthStore.getState()
        waited += 100
        if (isAuthenticated && u) {
          clearInterval(poll)
          setLoading(false)
          onSuccess(u.role)
        } else if (waited >= 3000) {
          clearInterval(poll)
          setLoading(false)
          setError('Could not load your profile. Please try again.')
        }
      }, 100)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      setError(msg.includes('Invalid') ? 'Invalid email or password' : msg)
      setLoading(false)
    } finally {
      setIsCoolingDown(true)
      cooldownRef.current = setTimeout(() => setIsCoolingDown(false), 5000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Email address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        autoComplete="email"
        required
      />
      <div className="relative">
        <Input
          label="Password"
          type={showPw ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
        <button
          type="button"
          onClick={() => setShowPw(!showPw)}
          className="absolute right-3 bottom-2.5 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <AlertCircle size={15} className="flex-shrink-0" />
          {error}
        </div>
      )}

      <Button type="submit" loading={loading} disabled={isCoolingDown} className="w-full" size="lg">
        <LogIn size={16} />
        {isCoolingDown ? 'Por favor espera…' : 'Sign In'}
      </Button>

      <div className="text-center">
        <a href="#" className="text-sm text-[#8DBF2E] hover:text-[#6FA12A] transition-colors">
          Forgot your password?
        </a>
      </div>
    </form>
  )
}

// ── Register Form ────────────────────────────────────────────

interface RegisterFormProps {
  onSuccess: () => void
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isCoolingDown, setIsCoolingDown] = useState(false)
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (cooldownRef.current) clearTimeout(cooldownRef.current) }, [])

  const validate = () => {
    if (name.trim().length < 2) return 'Name must be at least 2 characters'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email'
    if (password.length < 8) return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter'
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number'
    if (password !== confirm) return 'Passwords do not match'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setError('')
    setLoading(true)
    try {
      await registerUser(email.trim(), password, name.trim())
      setTimeout(onSuccess, 500)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed'
      setError(msg.includes('already') ? 'An account with this email already exists' : msg)
    } finally {
      setLoading(false)
      setIsCoolingDown(true)
      cooldownRef.current = setTimeout(() => setIsCoolingDown(false), 5000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="John Doe"
        autoComplete="name"
        required
      />
      <Input
        label="Email address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        autoComplete="email"
        required
      />
      <div className="relative">
        <Input
          label="Password"
          type={showPw ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 8 chars, 1 uppercase, 1 number"
          helperText="At least 8 characters, one uppercase letter, one number"
          autoComplete="new-password"
          required
        />
        <button
          type="button"
          onClick={() => setShowPw(!showPw)}
          className="absolute right-3 bottom-2.5 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      <Input
        label="Confirm password"
        type={showPw ? 'text' : 'password'}
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Repeat your password"
        autoComplete="new-password"
        required
      />

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <AlertCircle size={15} className="flex-shrink-0" />
          {error}
        </div>
      )}

      <Button type="submit" loading={loading} disabled={isCoolingDown} className="w-full" size="lg">
        <UserPlus size={16} />
        {isCoolingDown ? 'Por favor espera…' : 'Create Account'}
      </Button>
    </form>
  )
}

export default AuthPage
