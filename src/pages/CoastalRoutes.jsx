import Navbar from '../components/Navbar';
import { MapPin, ArrowRight, Sun, Wind, Waves } from 'lucide-react';

const RouteCard = ({ title, locations, description, image, icon: Icon, vehicles }) => (
    <div className="group relative overflow-hidden rounded-[2.5rem] bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-[500px] flex items-end">
        <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

        <div className="relative z-10 p-8 md:p-12 w-full">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white">
                    <Icon className="w-6 h-6" />
                </div>
                <span className="text-brand-light font-bold uppercase tracking-widest text-sm">Ruta Recomendada</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight">{title}</h2>
            <div className="flex flex-wrap gap-2 mb-6">
                {locations.map(loc => (
                    <span key={loc} className="flex items-center gap-1.5 bg-white/10 backdrop-blur text-white/90 px-3 py-1.5 rounded-full text-sm font-semibold border border-white/20">
                        <MapPin className="w-3 h-3" /> {loc}
                    </span>
                ))}
            </div>
            <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-xl group-hover:text-white transition-colors">
                {description}
            </p>

            <div className="flex items-center justify-between border-t border-white/20 pt-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                <div className="flex flex-col">
                    <span className="text-white/60 text-xs font-bold uppercase tracking-wider">Vehículo Ideal</span>
                    <span className="text-white font-bold">{vehicles}</span>
                </div>
                <button className="bg-white text-brand-dark hover:bg-brand-light px-6 py-3 rounded-full font-bold text-sm transition-colors flex items-center gap-2">
                    Ver Vehículos <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
);

const Routes = () => {
    return (
        <div className="min-h-screen bg-sand-100/30 selection:bg-brand-blue/20">
            <Navbar />

            <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <span className="text-brand-blue font-bold tracking-widest uppercase text-sm mb-4 block animate-in fade-in slide-in-from-bottom-4 duration-700">Explora el Perú</span>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold text-slate-900 mb-6 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        Rutas Costeras <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-ocean-500">Inolvidables</span>
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        Hemos curado los mejores itinerarios para que saques el máximo provecho a tu alquiler. Desde dunas infinitas hasta playas escondidas.
                    </p>
                </div>

                <div className="space-y-12">
                    <RouteCard
                        title="Dunas y Oasis"
                        image="https://images.unsplash.com/photo-1588661877607-07490212e61a?q=80&w=2070&auto=format&fit=crop"
                        icon={Wind}
                        locations={['Huacachina', 'Paracas', 'Desierto de Ica']}
                        description="Una aventura llena de adrenalina. Recorre las impresionantes dunas de Huacachina en un buggie tubular y termina el día viendo el atardecer en la Reserva de Paracas."
                        vehicles="Buggie Tubular / 4x4 Off-Road"
                    />

                    <RouteCard
                        title="La Ruta del Sol Eterno"
                        image="https://images.unsplash.com/photo-1534234828563-025aec2b4831?q=80&w=2047&auto=format&fit=crop"
                        icon={Sun}
                        locations={['Máncora', 'Vichayito', 'Punta Sal']}
                        description="Escápate al norte. Kilómetros de playas de arena blanca y aguas cálidas. Perfecta para recorrer en una camioneta espaciosa con aire acondicionado y tablas de surf en el techo."
                        vehicles="Pick-up 4x4 / SUV Premium"
                    />

                    <RouteCard
                        title="Aventura en el Pacífico"
                        image="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop"
                        icon={Waves}
                        locations={['Asia', 'Cerro Azul', 'Lunahuaná']}
                        description="La combinación perfecta de playa y campo. Disfruta del boulevard de Asia y luego adéntrate en el valle de Lunahuaná para hacer canotaje."
                        vehicles="SUV Familiar / Jeep"
                    />
                </div>
            </div>
        </div>
    );
};

export default Routes;
