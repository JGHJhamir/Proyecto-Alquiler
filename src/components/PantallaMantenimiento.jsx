import React from 'react';
import { ShieldAlert, Clock } from 'lucide-react';

const PantallaMantenimiento = () => {
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full animate-fade-in-up">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-3">Servicio No Disponible</h1>
                <p className="text-slate-600 mb-6">
                    El servidor se encuentra actualmente desactivado por mantenimiento o por decisión del administrador.
                </p>

                <div className="flex items-center justify-center gap-2 text-sm text-slate-400 bg-slate-50 py-2 rounded-lg">
                    <Clock className="w-4 h-4" />
                    <span>Intente nuevamente más tarde</span>
                </div>
            </div>
            <p className="text-slate-500 text-xs mt-8">JIAR PlayaRent System</p>
        </div>
    );
};

export default PantallaMantenimiento;
