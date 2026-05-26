import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { Bot } from 'lucide-react'
import Home        from './pages/home'
import Analyze     from './pages/analyze'
import AnalyzeTree from './pages/analyze-tree'
import Guide       from './pages/guide'
import Chat        from './pages/chat'
import Navbar      from './components/Navbar'
import Footer      from './components/Footer'
import Login       from './pages/auth/Login'
import SignUp      from './pages/auth/SignUp'
import ForgotPassword from './pages/auth/ForgotPassword'
import VerifyCode from './pages/auth/VerifyCode'
import ResetPassword from './pages/auth/ResetPassword'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import Treatment from './pages/treatment/Treatment'

function LoginTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex-1 flex flex-col w-full overflow-hidden"
    >
      {children}
    </motion.div>
  )
}


function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function AppContent() {
  const location = useLocation()
  const { pathname } = location
  const isTree = pathname === '/analyze/tree'
  const authPaths = ['/login', '/signup', '/forgot-password', '/verify-code', '/reset-password'];
  const isAuth = authPaths.includes(pathname);
  const isChat = pathname === '/chat';

  return (
    <div className="relative flex flex-col min-h-dvh">
      <ScrollToTop />
      <Toaster position="top-right" />
      {pathname === '/' && (
        <img
          src="/bacteria1.png"
          alt=""
          className="hidden md:block absolute top-0 right-0 h-dvh w-auto object-contain object-top-right pointer-events-none mr-6"
          style={{ zIndex: 0, animation: 'fadeInUp 0.6s ease 0.1s both' }}
        />
      )}
      {!isAuth && !isChat && <Navbar />}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ zIndex: 1 }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={pathname}>
            <Route path="/guide"        element={<Guide />} />
            <Route path="/chat"         element={<Chat />} />

            {/* Protected Routes - Only for logged-in users */}
            <Route element={<ProtectedRoute />}>
              <Route path="/"             element={<Home />} />
              <Route path="/analyze"      element={<Analyze />} />
              <Route path="/analyze/tree" element={<AnalyzeTree />} />
              <Route path="/treatment"    element={<Treatment />} />
            </Route>

            {/* Public Auth Routes - Only for logged-out users */}
            <Route element={<PublicRoute />}>
              <Route path="/login"        element={<LoginTransition><Login /></LoginTransition>} />
              <Route path="/signup"       element={<LoginTransition><SignUp /></LoginTransition>} />
              <Route path="/forgot-password" element={<LoginTransition><ForgotPassword /></LoginTransition>} />
              <Route path="/verify-code" element={<LoginTransition><VerifyCode /></LoginTransition>} />
              <Route path="/reset-password" element={<LoginTransition><ResetPassword /></LoginTransition>} />
            </Route>
          </Routes>
        </AnimatePresence>
      </div>
      {!isTree && !isAuth && !isChat && <Footer />}
      {!isChat && !isAuth && (
        <Link
          to="/chat"
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-linear-to-br from-[#1a3a5c] to-[#1a6c8c] text-white shadow-lg hover:scale-110 transition-all duration-200"
          aria-label="Open chat"
        >
          <Bot size={26} />
        </Link>
      )}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
