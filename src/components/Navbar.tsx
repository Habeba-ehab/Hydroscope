import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useRef, useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { LogOut } from 'lucide-react'
import toast from 'react-hot-toast'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/analyze', label: 'Analyze' },
  { to: '/guide', label: 'Guide' },
]

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false })
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
    Cookies.remove('user_name')
    sessionStorage.clear() // Clear uploaded images and other session data
    toast.success('Logged out successfully')
    navigate('/login')
  }

  useEffect(() => {
    const activeIndex = links.findIndex(link =>
      link.end ? location.pathname === link.to : location.pathname.startsWith(link.to)
    )
    const activeEl = linkRefs.current[activeIndex]
    const containerEl = containerRef.current
    if (activeEl && containerEl) {
      const containerRect = containerEl.getBoundingClientRect()
      const activeRect = activeEl.getBoundingClientRect()
      setIndicator({
        left: activeRect.left - containerRect.left,
        width: activeRect.width,
        ready: true,
      })
    }
  }, [location.pathname])

  // Close drawer on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <>
      <nav className="relative z-20">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 md:px-10 py-4 md:grid" style={{ gridTemplateColumns: '1fr auto 1fr' }}>
          {/* Logo + Text */}
          <NavLink to="/" className="flex items-center gap-3">
            <img src="/hydroscope-logo.svg" alt="Hydroscope" className="w-10 h-10" />
            <div>
              <p className="text-lg font-bold text-navy leading-tight mb-1">Hydroscope</p>
              <p className="text-sm text-lightnavy leading-tight hidden sm:block">AI Classification System</p>
            </div>
          </NavLink>

          {/* Navigation pills — centered — desktop only */}
          <div ref={containerRef} className="relative hidden md:flex items-center border border-gray-400 rounded-full p-1 gap-1">
            {/* Sliding indicator */}
            <div
              className="absolute bg-navy rounded-full"
              style={{
                left: indicator.left,
                width: indicator.width,
                top: 4,
                bottom: 4,
                transition: indicator.ready ? 'left 0.3s ease, width 0.3s ease' : 'none',
              }}
            />
            {links.map((link, i) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                ref={(el: HTMLAnchorElement | null) => { linkRefs.current[i] = el }}
                className={({ isActive }) =>
                  `relative z-10 px-5 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-gray-500 hover:text-gray-800'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right: Logout on desktop, hamburger on mobile */}
          <div className="flex justify-end items-center gap-4">
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-navy transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
            <button
              className="md:hidden flex flex-col justify-center gap-1.5 p-2 -mr-2"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <span className="block w-6 h-0.5 bg-navy" />
              <span className="block w-6 h-0.5 bg-navy" />
              <span className="block w-6 h-0.5 bg-navy" />
            </button>
          </div>
        </div>
      </nav>

      {/* Backdrop */}
      <div
        className={`md:hidden fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Right drawer */}
      <div
        className={`md:hidden fixed top-0 right-0 h-full w-72 bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <p className="text-lg font-bold text-navy">Menu</p>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="p-1 text-gray-400 hover:text-navy transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer links */}
        <div className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `py-3.5 px-4 rounded-xl text-sm font-medium transition-colors uppercase tracking-wide ${
                  isActive ? 'bg-navy/5 text-navy font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-navy'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Drawer Footer - Logout */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full py-3.5 px-4 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors uppercase tracking-wide"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </div>
    </>
  )
}
