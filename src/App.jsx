import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import VehicleDetail from './pages/VehicleDetail';
import CoastalRoutes from './pages/CoastalRoutes';
import Payment from './pages/Payment';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vehiculo/:id" element={<VehicleDetail />} />
        <Route path="/rutas" element={<CoastalRoutes />} />
        <Route path="/pago/:bookingId" element={<Payment />} />
      </Routes>
    </Router>
  )
}

export default App
