import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import Home        from './pages/home'
import Analyze     from './pages/analyze'
import AnalyzeTree from './pages/analyze-tree'
import Guide       from './pages/guide'
import Navbar      from './components/Navbar'
import Footer      from './components/Footer'
import Login       from './pages/auth/Login'
import SignUp      from './pages/auth/SignUp'
import ForgotPassword from './pages/auth/ForgotPassword'
import VerifyCode from './pages/auth/VerifyCode'
import ResetPassword from './pages/auth/ResetPassword'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'

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


function AppContent() {
  const location = useLocation()
  const { pathname } = location
  const isTree = pathname === '/analyze/tree'
  const authPaths = ['/login', '/signup', '/forgot-password', '/verify-code', '/reset-password'];
  const isAuth = authPaths.includes(pathname);

  return (
    <div className="relative flex flex-col min-h-dvh">
      <Toaster position="top-right" />
      {pathname === '/' && (
        <img
          src="/bacteria1.png"
          alt=""
          className="hidden md:block absolute top-0 right-0 h-dvh w-auto object-contain object-top-right pointer-events-none mr-6"
          style={{ zIndex: 0, animation: 'fadeInUp 0.6s ease 0.1s both' }}
        />
      )}
      {!isAuth && <Navbar />}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ zIndex: 1 }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={pathname}>
            <Route path="/guide"        element={<Guide />} />

            {/* Protected Routes - Only for logged-in users */}
            <Route element={<ProtectedRoute />}>
              <Route path="/"             element={<Home />} />
              <Route path="/analyze"      element={<Analyze />} />
              <Route path="/analyze/tree" element={<AnalyzeTree />} />
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
      {!isTree && !isAuth && <Footer />}
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
