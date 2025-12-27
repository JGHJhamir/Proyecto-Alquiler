import Navbar from '../components/Navbar';
import { DollarSign, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

const OwnerDashboard = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="pt-32 px-6 max-w-7xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-4xl font-serif font-bold text-slate-900">Panel del Dueño</h1>
                    <p className="text-slate-500 mt-2">Resumen ejecutivo del rendimiento del negocio.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Ganancias del Mes</p>
                                <h3 className="text-2xl font-bold text-slate-900">S/ 24,500</h3>
                            </div>
                        </div>
                        <div className="text-sm text-green-600 flex items-center gap-1 font-medium bg-green-50 w-fit px-2 py-1 rounded-lg">
                            <TrendingUp className="w-4 h-4" /> +12% vs mes anterior
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Reservas Activas</p>
                                <h3 className="text-2xl font-bold text-slate-900">8</h3>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400">4 finalizan esta semana</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Alertas de Flota</p>
                                <h3 className="text-2xl font-bold text-slate-900">1</h3>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400">Hilux GR requiere mantenimiento</p>
                    </div>
                </div>

                {/* Main Content Area Placeholder */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm h-96 flex items-center justify-center text-slate-400 flex-col gap-4">
                    <TrendingUp className="w-16 h-16 opacity-20" />
                    <p className="font-medium">Gráfico de Rendimiento Financiero (Próximamente)</p>
                </div>
            </div>
        </div>
    );
};

export default OwnerDashboard;
