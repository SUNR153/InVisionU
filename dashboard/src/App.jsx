import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { auth } from './store/auth'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Candidates from './pages/Candidates'
import CandidateCard from './pages/CandidateCard'
import Stats from './pages/Stats'
import Baseline from './pages/Baseline'
import Fairness from './pages/Fairness'

function Layout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      {children}
    </div>
  )
}

function StaffRoute({ children }) {
  if (!auth.isLoggedIn() || !auth.isStaff()) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/candidates"     element={<StaffRoute><Candidates /></StaffRoute>} />
        <Route path="/candidates/:id" element={<StaffRoute><CandidateCard /></StaffRoute>} />
        <Route path="/shortlist"      element={<StaffRoute><Candidates defaultStatus="shortlisted" /></StaffRoute>} />
        <Route path="/flagged"        element={<StaffRoute><Candidates defaultAI="true" /></StaffRoute>} />
        <Route path="/stats"          element={<StaffRoute><Stats /></StaffRoute>} />
        <Route path="/baseline"       element={<StaffRoute><Baseline /></StaffRoute>} />
        <Route path="/fairness"       element={<StaffRoute><Fairness /></StaffRoute>} />
        <Route path="*"               element={<Navigate to="/candidates" replace />} />
      </Routes>
    </BrowserRouter>
  )
}