import { Search, ChevronDown, Sun, Minus, Plus, MapPin, Star, ArrowRight, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';
import BarraNavegacion from '../components/BarraNavegacion'; // Import shared Navbar
import { COASTAL_LOCATIONS } from '../constants';

// --- Shared Components ---
const SectionTitle = ({ title, subtitle }) => (
    <div className="text-center mb-16 relative">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-4">{title}</h2>
        <div className="w-24 h-1.5 bg-brand-light mx-auto rounded-full mb-6"></div>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
    </div>
);

// Navbar removed (using shared component)

import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
// Custom CSS for DatePicker to match the dark theme or just general improvements
import '../index.css'; // Ensure main css is loaded for variables if needed

const SearchBar = () => {
    const [destination, setDestination] = useState('');
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;
    const [passengers, setPassengers] = useState(1);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const navigate = useNavigate();

    const [availableLocations, setAvailableLocations] = useState([]);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const { data, error } = await supabase
                    .from('vehicles')
                    .select('location_city');

                if (error) throw error;

                const cities = new Set(data.map(v => v.location_city));
                const locations = [];

                Object.entries(COASTAL_LOCATIONS).forEach(([dept, deptCities]) => {
                    const availableDeptCities = deptCities.filter(city => cities.has(city));

                    if (availableDeptCities.length > 0) {
                        locations.push({ type: 'department', name: dept, label: dept });
                        availableDeptCities.forEach(city => {
                            locations.push({ type: 'city', name: city, label: `${city}, ${dept}` });
                        });
                    }
                });

                setAvailableLocations(locations);
            } catch (error) {
                console.error('Error fetching locations:', error);
            }
        };

        fetchLocations();
    }, []);

    const handleLocationChange = (e) => {
        const value = e.target.value;
        setDestination(value);

        setDestination(value);

        if (value.length > 0) {
            const filtered = availableLocations.filter(loc =>
                loc.label.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 5); // Limit to 5 suggestions
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const selectLocation = (loc) => {
        setDestination(loc.type === 'city' ? loc.name : loc.name);
        setShowSuggestions(false);
    };

    const handleSearch = () => {
        const formattedStart = startDate ? startDate.toISOString() : '';
        const formattedEnd = endDate ? endDate.toISOString() : '';
        navigate(`/explorar?destination=${destination}&start=${formattedStart}&end=${formattedEnd}&passengers=${passengers}`);
    };

    // Custom Input to match the design - Clean/Airbnb
    const CustomDateInput = ({ value, onClick }, ref) => (
        <div onClick={onClick} ref={ref} className="cursor-pointer w-full">
            <input
                type="text"
                value={value}
                readOnly
                placeholder="Agrega fechas"
                className="w-full bg-transparent outline-none text-slate-800 font-semibold placeholder:text-slate-400 text-sm cursor-pointer"
            />
        </div>
    );

    return (
        <div className="bg-white rounded-full shadow-2xl pl-8 pr-2 py-2 max-w-4xl mx-auto flex flex-col md:flex-row items-center border border-slate-100 transform -translate-y-1/2 relative z-50">

            {/* Location */}
            <div className="flex-1 py-2 pr-6 w-full md:w-[32%] relative border-b md:border-b-0 md:border-r border-slate-200 hover:bg-slate-50 rounded-full transition-colors group cursor-pointer">
                <label className="block text-xs font-extrabold text-slate-800 ml-1 mb-0.5">Dónde</label>
                <div className="relative">
                    <input
                        type="text"
                        value={destination}
                        onChange={handleLocationChange}
                        onFocus={() => destination.length > 0 && setShowSuggestions(true)}
                        placeholder="Explorar destinos"
                        className="w-full bg-transparent outline-none text-slate-600 text-sm placeholder:text-slate-400 font-medium truncate"
                    />
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-12 left-0 w-[300px] bg-white rounded-3xl shadow-2xl border border-slate-100 py-4 z-50 overflow-hidden">
                            {suggestions.map((item, index) => (
                                <div
                                    key={index}
                                    onClick={(e) => { e.stopPropagation(); selectLocation(item); }}
                                    className="px-6 py-3 hover:bg-slate-50 flex items-center gap-4 cursor-pointer transition-colors"
                                >
                                    <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <span className="text-slate-700 font-medium text-sm">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Date */}
            <div className="flex-1 py-2 px-6 w-full md:w-[38%] relative border-b md:border-b-0 md:border-r border-slate-200 hover:bg-slate-50 rounded-full transition-colors group cursor-pointer">
                <label className="block text-xs font-extrabold text-slate-800 ml-1 mb-0.5">Fechas</label>
                <div className="w-full">
                    <DatePicker
                        selectsRange={true}
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(update) => {
                            setDateRange(update);
                        }}
                        monthsShown={2}
                        customInput={<CustomDateInput />}
                        dateFormat="d 'de' MMM"
                        minDate={new Date()}
                        isClearable={true}
                        placeholderText="Agrega fechas"
                        className="w-full bg-transparent outline-none text-slate-600 text-sm placeholder:text-slate-400 font-medium"
                        calendarClassName="!font-sans !shadow-2xl !rounded-3xl !border-0 !p-6 !mt-4"
                        dayClassName={(date) => "rounded-full hover:bg-slate-100 font-medium"}
                        popperClassName="!z-50"
                        popperPlacement="bottom-start"
                    />
                </div>
            </div>

            {/* Passengers */}
            <div className="flex-1 py-2 px-6 w-full md:w-[30%] relative hover:bg-slate-50 rounded-full transition-colors group cursor-pointer flex items-center justify-between">
                <div>
                    <label className="block text-xs font-extrabold text-slate-800 ml-1 mb-0.5">Quién</label>
                    <div className="text-slate-600 text-sm font-medium truncate">
                        {passengers > 0 ? `${passengers} viajeros` : '¿Cuántos?'}
                    </div>
                </div>

                {/* Passenger Controls */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 bg-white shadow-lg rounded-full p-1 border border-slate-100">
                    <button onClick={(e) => { e.stopPropagation(); setPassengers(Math.max(1, passengers - 1)) }} className="p-1.5 hover:bg-slate-100 rounded-full"><Minus className="w-3 h-3 text-slate-600" /></button>
                    <span className="text-xs font-bold w-4 text-center">{passengers}</span>
                    <button onClick={(e) => { e.stopPropagation(); setPassengers(Math.min(5, passengers + 1)) }} className="p-1.5 hover:bg-slate-100 rounded-full"><Plus className="w-3 h-3 text-slate-600" /></button>
                </div>
            </div>

            {/* Search Button */}
            <button
                onClick={handleSearch}
                className="bg-[#FF385C] hover:bg-[#D90B3E] text-white p-3.5 rounded-full shadow-lg shadow-rose-500/30 transition-all hover:scale-105 active:scale-95 m-0 flex items-center gap-2 font-bold px-6 flex-shrink-0 z-10"
            >
                <Search className="w-5 h-5 stroke-[2.5px]" />
                Buscar
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
                    <span className="text-sm font-bold text-brand-dark">{Number(rating).toFixed(1)}</span>
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
                        <span className="text-3xl font-bold text-brand-blue">S/{Number(price).toFixed(0)}</span>
                    </div>
                </div>
                <Link to={`/vehiculo/${id}`} className="btn-primary px-6 py-2.5 text-sm">
                    Reservar
                </Link>
            </div>
        </div>
    </div>
);

export default function Inicio() {
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
            <BarraNavegacion />

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
