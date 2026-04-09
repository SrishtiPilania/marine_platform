import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Dashboard from './pages/Dashboard'
import Map from './pages/Map'
import Login from './pages/Login'
import Analysis from './pages/Analysis'
import Upload from './pages/Upload' 
import Preprocessing from './pages/Preprocessing'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/explore" element={
            <ProtectedRoute><Explore /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/map" element={
            <ProtectedRoute><Map /></ProtectedRoute>
          } />
          <Route path="/analysis" element={
            <ProtectedRoute><Analysis /></ProtectedRoute>
          } />
          <Route path="/upload" element={
  <ProtectedRoute><Upload /></ProtectedRoute>
} />
<Route path="/preprocessing" element={
  <ProtectedRoute><Preprocessing /></ProtectedRoute>
} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App