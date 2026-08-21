import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import YieldPrediction from './pages/YieldPrediction.jsx'
import Weather from './pages/Weather.jsx'
import Soil from './pages/Soil.jsx'
import Recommendations from './pages/Recommendations.jsx'
import Reports from './pages/Reports.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'

export default function App() {
  return (
    <Routes>
      {/* Public marketing + auth routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* App routes, all sharing the sidebar/dashboard shell */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/yield-prediction" element={<YieldPrediction />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/soil" element={<Soil />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/reports" element={<Reports />} />
      </Route>
    </Routes>
  )
}
