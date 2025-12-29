import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Inicio from './pages/Inicio';
import DetalleVehiculo from './pages/DetalleVehiculo';
import ExplorarVehiculos from './pages/ExplorarVehiculos';
import Pago from './pages/Pago';
import Registro from './pages/Registro';
import IniciarSesion from './pages/IniciarSesion';
import PanelAdministrador from './pages/PanelAdministrador';
import PanelPropietario from './pages/PanelPropietario';
import PanelCliente from './pages/PanelCliente';
import Perfil from './pages/Perfil';
import RutaProtegida from './components/RutaProtegida';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/vehiculo/:id" element={<DetalleVehiculo />} />
        <Route path="/explorar" element={<ExplorarVehiculos />} />
        <Route path="/pago/:bookingId" element={<Pago />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<IniciarSesion />} />

        {/* Rutas Protegidas */}
        <Route element={<RutaProtegida allowedRoles={['admin']} />}>
          <Route path="/admin" element={<PanelAdministrador />} />
        </Route>

        <Route element={<RutaProtegida allowedRoles={['owner']} />}>
          <Route path="/owner" element={<PanelPropietario />} />
        </Route>

        <Route element={<RutaProtegida allowedRoles={['client', 'admin', 'owner']} />}>
          <Route path="/cliente" element={<PanelCliente />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
