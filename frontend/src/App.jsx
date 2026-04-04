import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { auth } from './store/auth'
import Landing     from './pages/Landing'
import Register    from './pages/Register'
import Login       from './pages/Login'
import Form        from './pages/Form/index'
import Cabinet     from './pages/Cabinet'
import VerifyEmail from './pages/VerifyEmail'

function PrivateRoute({ children }) {
  return auth.isLoggedIn() ? children : <Navigate to="/login" replace />
}

function GuestRoute({ children }) {
  return auth.isLoggedIn() ? <Navigate to="/cabinet" replace /> : children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"              element={<Landing />} />
        <Route path="/register"      element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/login"         element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/form"          element={<PrivateRoute><Form /></PrivateRoute>} />
        <Route path="/cabinet"       element={<PrivateRoute><Cabinet /></PrivateRoute>} />
        <Route path="/verify-email"  element={<VerifyEmail />} />
        <Route path="*"              element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}