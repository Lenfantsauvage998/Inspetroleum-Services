import React, { useState, useEffect, useRef } from 'react' // useEffect kept for dropdown click-outside
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, Menu, X, ChevronDown, User, LogOut, LayoutDashboard, Shield } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { logoutUser } from '../../services/auth'
import CartSidebar from '../cart/CartSidebar'

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { user, isAuthenticated, clearAuth } = useAuthStore()
  const { getItemCount, toggleCart } = useCartStore()
  const navigate = useNavigate()
  const location = useLocation()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const itemCount = getItemCount()

  const isLanding = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = async () => {
    await logoutUser()
    clearAuth()
    setDropdownOpen(false)
    navigate('/')
  }

  const navBg = isLanding && !scrolled
    ? 'bg-transparent'
    : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'

  // Use white text on landing when transparent (dark hero bg), dark text otherwise
  const textColor = isLanding && !scrolled ? 'text-white' : 'text-[#333333]'

  const navLinks = [
    { to: '/', label: 'Inicio' },
    { to: '/what-we-do', label: 'Servicios' },
    { to: '/marketplace', label: 'Marketplace' },
  ]

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${navBg}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 md:h-28">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0 py-2">
              <img
                src="/assets/Logo-removebg-preview.png"
                alt="Industrial Services GF"
                className="h-20 w-auto object-contain"
              />
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium transition-colors hover:text-[#8DBF2E] ${textColor} ${
                    location.pathname === link.to ? 'text-[#8DBF2E]' : ''
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              {/* Cart */}
              <button
                onClick={toggleCart}
                className={`relative p-2 rounded-xl hover:bg-white/10 transition-colors ${textColor}`}
                aria-label="Shopping cart"
              >
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#8DBF2E] text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              {/* Auth */}
              {isAuthenticated && user ? (
                <div className="relative hidden md:block" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors ${textColor}`}
                  >
                    <div className="w-7 h-7 bg-[#8DBF2E] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium max-w-[100px] truncate">{user.name}</span>
                    <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-50 mb-1">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-medium text-[#333333] truncate">{user.email}</p>
                      </div>
                      {user.role === 'admin' ? (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-[#333333] hover:bg-[#F2F2F2] transition-colors"
                        >
                          <Shield size={15} className="text-[#8DBF2E]" />
                          Admin Panel
                        </Link>
                      ) : (
                        <Link
                          to="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-[#333333] hover:bg-[#F2F2F2] transition-colors"
                        >
                          <LayoutDashboard size={15} className="text-[#8DBF2E]" />
                          My Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={15} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="hidden md:flex items-center gap-2 bg-[#8DBF2E] hover:bg-[#6FA12A] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                >
                  <User size={15} />
                  Sign In
                </Link>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors ${textColor}`}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-medium text-[#333333] hover:bg-[#F2F2F2] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-gray-100" />
              {isAuthenticated && user ? (
                <>
                  {user.role === 'admin' ? (
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3 rounded-xl text-sm font-medium text-[#333333] hover:bg-[#F2F2F2]"
                    >
                      Admin Panel
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3 rounded-xl text-sm font-medium text-[#333333] hover:bg-[#F2F2F2]"
                    >
                      My Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false) }}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-semibold text-white bg-[#8DBF2E] text-center"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Cart Sidebar */}
      <CartSidebar />
    </>
  )
}

export default Navbar
