import { Sun, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm h-20 flex items-center px-6 md:px-12 justify-between transition-all duration-300">
        <Link to="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="text-brand-blue transform group-hover:scale-110 transition-transform duration-300">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20M2 18h20M2 6h20" /></svg>
            </div>
            <span className="text-2xl font-serif font-bold text-slate-800 tracking-tight group-hover:text-brand-blue transition-colors">JIAR PlayaRent</span>
        </Link>

        <div className="hidden md:flex items-center gap-10 text-slate-600 font-medium">
            <Link to="/" className="hover:text-brand-blue hover:font-semibold transition-all duration-200">Flota 4x4</Link>
            <Link to="/rutas" className="hover:text-brand-blue hover:font-semibold transition-all duration-200">Rutas Costeras</Link>
            <a href="#" className="hover:text-brand-blue hover:font-semibold transition-all duration-200">Experiencias</a>
        </div>

        <div className="flex items-center gap-4">
            <button className="p-2.5 hover:bg-slate-100 rounded-full text-slate-600 transition-colors hover:rotate-12 duration-300">
                <Sun className="w-5 h-5" />
            </button>
            <button className="btn-primary flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Iniciar Sesión</span>
            </button>
        </div>
    </nav>
);

export default Navbar;
