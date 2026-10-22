import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import ComputerDivision from './pages/ComputerDivision'
import AppsGames from './pages/AppsGames'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Terms from './pages/Terms'
import Contact from './pages/Contact'

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/computer-division" element={<ComputerDivision />} />
          <Route path="/apps-games" element={<AppsGames />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
