import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import VehicleDetail from './pages/VehicleDetail';
import CoastalRoutes from './pages/CoastalRoutes';
import Payment from './pages/Payment';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import ClientDashboard from './pages/ClientDashboard';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vehiculo/:id" element={<VehicleDetail />} />
        <Route path="/rutas" element={<CoastalRoutes />} />
        <Route path="/pago/:bookingId" element={<Payment />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas Protegidas */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
          <Route path="/owner" element={<OwnerDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['client', 'admin', 'owner']} />}>
          <Route path="/cliente" element={<ClientDashboard />} />
          <Route path="/perfil" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
