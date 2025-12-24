import { Search, ChevronDown, Sun, Minus, Plus, MapPin, Star, ArrowRight, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Import shared Navbar

// --- Shared Components ---
const SectionTitle = ({ title, subtitle }) => (
    <div className="text-center mb-16 relative">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-4">{title}</h2>
        <div className="w-24 h-1.5 bg-brand-light mx-auto rounded-full mb-6"></div>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
    </div>
);

// Navbar removed (using shared component)

const SearchBar = () => {
    const [passengers, setPassengers] = useState(1);

    return (
        <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-glass p-3 max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-4 transform -translate-y-1/2 border border-white/50">
            {/* Location */}
            <div className="flex-1 px-8 py-3 w-full md:w-auto border-b md:border-b-0 md:border-r border-slate-100">
                <label className="block text-xs font-bold text-brand-blue uppercase tracking-wider mb-2">Destino (Perú)</label>
                <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Ej: Paracas, Máncora, Ica..."
                        className="w-full bg-transparent outline-none text-slate-800 font-semibold placeholder:text-slate-400 text-lg"
                    />
                </div>
            </div>

            {/* Date */}
            <div className="flex-1 px-8 py-3 w-full md:w-auto border-b md:border-b-0 md:border-r border-slate-100">
                <label className="block text-xs font-bold text-brand-blue uppercase tracking-wider mb-2">Fechas de Viaje</label>
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
                    <input
                        type="text"
                        placeholder="seleccionar fechas"
                        className="w-full bg-transparent outline-none text-slate-800 font-semibold placeholder:text-slate-400 text-lg"
                    />
                </div>
            </div>

            {/* Passengers */}
            <div className="flex-1 px-8 py-3 flex items-center justify-between w-full md:w-auto min-w-[240px]">
                <div className="mr-4">
                    <label className="block text-xs font-bold text-brand-blue uppercase tracking-wider mb-2">Viajeros</label>
                    <span className="text-slate-800 font-semibold text-lg">{passengers} persona{passengers !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-full border border-slate-100">
                    <button
                        onClick={() => setPassengers(Math.max(1, passengers - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 text-slate-600 shadow-sm transition-all"
                    >
                        <Minus className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => setPassengers(passengers + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-blue text-white shadow-sm hover:bg-blue-600 transition-all"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Search Button */}
            <button className="bg-brand-blue hover:bg-brand-dark text-white p-5 rounded-[2rem] shadow-lg shadow-brand-blue/30 transition-all hover:scale-105 active:scale-95 m-1">
                <Search className="w-7 h-7" />
            </button>
        </div>
    );
};

const PromotionCard = ({ title, discount, description, subtitle }) => (
    <div className="group bg-ocean-50/50 hover:bg-gradient-to-br hover:from-white hover:to-ocean-50 border border-ocean-100 p-8 rounded-[2rem] flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-brand-blue/10 hover:-translate-y-2 cursor-pointer h-full relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-light/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-brand-light/20"></div>

        <div className="relative z-10">
            <h3 className="text-xl font-bold text-brand-dark mb-4 font-serif">{title}</h3>
            <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-extrabold text-brand-blue tracking-tight">
                    {discount}
                </span>
                <span className="text-lg font-bold text-brand-blue/60 uppercase tracking-widest">OFF</span>
            </div>
            <p className="text-slate-600 leading-relaxed mb-8 font-medium">{description}</p>
        </div>
        <div className="pt-6 border-t border-ocean-100/50 flex justify-between items-center relative z-10">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{subtitle}</p>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-blue shadow-sm group-hover:translate-x-2 transition-transform">
                <ArrowRight className="w-5 h-5" />
            </div>
        </div>
    </div>
);

const VehicleCard = ({ id, name, price, location, image, isOffer, rating }) => (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 border border-slate-100 hover:border-slate-200 hover:-translate-y-2">
        <div className="relative h-72 overflow-hidden">
            <Link to={`/vehiculo/${id}`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500"></div>
                {isOffer && (
                    <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-brand-blue to-brand-light text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
                        ¡Oferta Especial!
                    </div>
                )}
                <div className="absolute bottom-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 text-white">
                    <p className="font-bold flex items-center gap-1"><MapPin className="w-4 h-4" />Ver ubicación</p>
                </div>
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                />
            </Link>
        </div>

        <div className="p-8">
            <div className="flex justify-between items-start mb-3">
                <Link to={`/vehiculo/${id}`} className="hover:text-brand-blue transition-colors">
                    <h3 className="text-2xl font-bold text-slate-900 font-serif leading-tight">{name}</h3>
                </Link>
                <div className="flex items-center gap-1.5 bg-brand-light/10 px-3 py-1.5 rounded-full">
                    <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                    <span className="text-sm font-bold text-brand-dark">{rating}</span>
                </div>
            </div>

            <p className="text-slate-500 flex items-center gap-2 text-sm mb-6 font-medium">
                <MapPin className="w-4 h-4 text-brand-blue" />
                {location}
            </p>

            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex flex-col">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Precio por día</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-brand-blue">S/{price}</span>
                    </div>
                </div>
                <Link to={`/vehiculo/${id}`} className="btn-primary px-6 py-2.5 text-sm">
                    Reservar
                </Link>
            </div>
        </div>
    </div>
);

export default function Home() {
    const [vehicles, setVehicles] = useState([]);

    useEffect(() => {
        const fetchVehicles = async () => {
            const { data, error } = await supabase
                .from('vehicles')
                .select('*');

            if (error) console.error('Error fetching vehicles:', error);
            else setVehicles(data || []);
        };

        fetchVehicles();
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-brand-blue/20 selection:text-brand-dark">
            <Navbar />

            {/* Hero Section */}
            <div className="relative h-[800px] w-full mt-0 overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=2070&auto=format&fit=crop"
                    alt="Costa Peruana"
                    className="w-full h-full object-cover scale-105 animate-[kenburns_20s_infinite_alternate]"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-hero-gradient" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-bold tracking-widest uppercase mb-6">
                        Vive el Perú
                    </span>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 drop-shadow-2xl max-w-5xl leading-tight">
                        Aventuras en la Costa <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-ocean-100 to-white">y Desiertos del Perú</span>
                    </h1>
                    <p className="text-lg md:text-2xl text-white/90 max-w-3xl font-light mb-12 drop-shadow-md">
                        Desde las misteriosas dunas de Ica hasta las cálidas aguas de Máncora. Alquila el vehículo perfecto para tu ruta.
                    </p>
                </div>
            </div>

            {/* Floating Search Bar Container */}
            <div className="px-6 relative z-30 max-w-7xl mx-auto w-full">
                <SearchBar />
            </div>

            {/* Promotions Section */}
            <section className="max-w-7xl mx-auto px-6 py-32">
                <SectionTitle
                    title="Promociones Costeras"
                    subtitle="Descuentos exclusivos para tus rutas por la Panamericana Sur y Norte."
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <PromotionCard
                        title="Dunas de Ica"
                        discount="15%"
                        description="Domina el desierto. 15% de descuento en areneros tubulares (buggies)."
                        subtitle="Válido en Huacachina"
                    />
                    <PromotionCard
                        title="Verano en Paracas"
                        discount="S/80"
                        description="Recorre la Reserva Nacional. Ahorra S/80 en alquileres de 4x4."
                        subtitle="Incluye pase a la reserva"
                    />
                    <PromotionCard
                        title="Norte de Ensueño"
                        discount="20%"
                        description="20% OFF en camionetas para explorar Máncora, Vichayito y Punta Sal."
                        subtitle="Reservas anticipada"
                    />
                </div>
            </section>

            {/* Fleet Section */}
            <section className="bg-sand-100/50 py-32 rounded-t-[4rem] -mx-4 md:mx-0">
                <div className="max-w-7xl mx-auto px-6">
                    <SectionTitle
                        title="Flota Todo Terreno"
                        subtitle="Vehículos preparados para la arena, la playa y la carretera."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {vehicles.map((vehicle) => (
                            <VehicleCard
                                key={vehicle.id}
                                id={vehicle.id}
                                name={`${vehicle.make} ${vehicle.model}`}
                                location={vehicle.location_city}
                                price={vehicle.price_per_day}
                                image={vehicle.image_url}
                                rating={vehicle.rating}
                                isOffer={vehicle.is_offer} // Assuming you might have this field, passed anyway
                            />
                        ))}
                    </div>

                    <div className="text-center mt-16">
                        <button className="btn-secondary">
                            Ver Toda la Flota
                        </button>
                    </div>
                </div>
            </section>
        </div>
    )
}
