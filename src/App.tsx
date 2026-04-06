import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Home        from './pages/home'
import Analyze     from './pages/analyze'
import AnalyzeTree from './pages/analyze-tree'
import Guide       from './pages/guide'
import Navbar      from './components/Navbar'
import Footer      from './components/Footer'

function AppContent() {
  const { pathname } = useLocation()
  const isTree = pathname === '/analyze/tree'

  return (
    <div className="relative flex flex-col min-h-dvh">
      {pathname === '/' && (
        <img
          src="/bacteria1.png"
          alt=""
          className="hidden md:block absolute top-0 right-0 h-dvh w-auto object-contain object-top-right pointer-events-none mr-6"
          style={{ zIndex: 0, animation: 'fadeInUp 0.6s ease 0.1s both' }}
        />
      )}
      <Navbar />
      <div className="flex-1" style={{ zIndex: 1 }}>
        <Routes>
          <Route path="/"             element={<Home />} />
          <Route path="/analyze"      element={<Analyze />} />
          <Route path="/analyze/tree" element={<AnalyzeTree />} />
          <Route path="/guide"        element={<Guide />} />
        </Routes>
      </div>
      {!isTree && <Footer />}
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
