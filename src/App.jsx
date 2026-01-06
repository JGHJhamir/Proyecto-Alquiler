import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Toaster } from 'sonner';
import RutaProtegida from './components/RutaProtegida';
import CapturaErrores from './components/CapturaErrores';
import PantallaMantenimiento from './components/PantallaMantenimiento';

// ************************************************************************
// [CONTROL DE MANTENIMIENTO]
// PARA DESACTIVAR LA PÁGINA: Cambia el valor de abajo a "true"
// PARA ACTIVAR LA PÁGINA: Cambia el valor de abajo a "false"
const MODO_MANTENIMIENTO = false;
// ************************************************************************

// Carga diferida de páginas
const Inicio = lazy(() => import('./pages/Inicio'));
const DetalleVehiculo = lazy(() => import('./pages/DetalleVehiculo'));
const ExplorarVehiculos = lazy(() => import('./pages/ExplorarVehiculos'));
const Pago = lazy(() => import('./pages/Pago'));
const Registro = lazy(() => import('./pages/Registro'));
const IniciarSesion = lazy(() => import('./pages/IniciarSesion'));
const PanelAdministrador = lazy(() => import('./pages/PanelAdministrador'));
const PanelPropietario = lazy(() => import('./pages/PanelPropietario'));
const PanelCliente = lazy(() => import('./pages/PanelCliente'));
const Perfil = lazy(() => import('./pages/Perfil'));

// Componente de reserva de carga
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  // Si el modo manual está activo, bloquea todo
  if (MODO_MANTENIMIENTO) {
    return <PantallaMantenimiento />;
  }

  return (
    <Router>
      <Toaster position="top-center" richColors />
      <CapturaErrores>
        <Suspense fallback={<LoadingFallback />}>
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
        </Suspense>
      </CapturaErrores>
    </Router>
  )
}

export default App;
