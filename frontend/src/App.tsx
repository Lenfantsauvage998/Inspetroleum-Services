import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { useAuthStore } from './store/authStore'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Landing from './pages/Landing'
import WhatWeDoPage from './pages/WhatWeDo'
import Marketplace from './pages/Marketplace'
import Checkout from './pages/Checkout'
import CheckoutSuccess from './pages/CheckoutSuccess'
import CheckoutFailed from './pages/CheckoutFailed'
import AuthPage from './pages/auth/AuthPage'
import UserDashboard from './pages/dashboard/UserDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import NotFound from './pages/NotFound'
import Spinner from './components/ui/Spinner'
import WhatsAppButton from './components/ui/WhatsAppButton'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
})

interface ProtectedRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isLoading, user } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/auth" replace />
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/what-we-do" element={<WhatWeDoPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route path="/checkout/success" element={<CheckoutSuccess />} />
                <Route path="/checkout/failed" element={<CheckoutFailed />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <WhatsAppButton />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
