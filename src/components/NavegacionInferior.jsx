import { Home, Search, Calendar, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const NavegacionInferior = () => {
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 px-6 py-2 z-50 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] pb-safe">
            <div className="flex justify-between items-center max-w-sm mx-auto">
                <NavLink
                    to="/"
                    className={({ isActive }) => `flex flex-col items-center gap-1 p-2 transition-colors ${isActive ? 'text-brand-blue' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Home className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Inicio</span>
                </NavLink>

                <NavLink
                    to="/explorar"
                    className={({ isActive }) => `flex flex-col items-center gap-1 p-2 transition-colors ${isActive ? 'text-brand-blue' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Search className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Explorar</span>
                </NavLink>

                <NavLink
                    to="/cliente"
                    className={({ isActive }) => `flex flex-col items-center gap-1 p-2 transition-colors ${isActive ? 'text-brand-blue' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Calendar className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Reservas</span>
                </NavLink>

                <NavLink
                    to="/perfil"
                    className={({ isActive }) => `flex flex-col items-center gap-1 p-2 transition-colors ${isActive ? 'text-brand-blue' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <User className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Perfil</span>
                </NavLink>
            </div>
        </div>
    );
};

export default NavegacionInferior;
