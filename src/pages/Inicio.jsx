import { Search, ChevronDown, Sun, Minus, Plus, MapPin, Star, ArrowRight, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';
import BarraNavegacion from '../components/BarraNavegacion'; // Import shared Navbar
import { COASTAL_LOCATIONS } from '../constants';

// --- Shared Components ---
const SectionTitle = ({ title, subtitle, light = false }) => (
    <div className="text-center mb-12 md:mb-20 relative z-10">
        <h2 className={`text-4xl md:text-6xl font-serif font-bold mb-6 tracking-tight ${light ? 'text-white' : 'text-brand-dark'}`}>
            {title}
        </h2>
        <div className="flex items-center justify-center gap-4 mb-6">
            <div className={`h-[1px] w-12 md:w-24 ${light ? 'bg-brand-gold/50' : 'bg-brand-gold'}`}></div>
            <Star className={`w-4 h-4 ${light ? 'text-brand-gold' : 'text-brand-dark'} fill-current`} />
            <div className={`h-[1px] w-12 md:w-24 ${light ? 'bg-brand-gold/50' : 'bg-brand-gold'}`}></div>
        </div>
        <p className={`text-lg md:text-xl max-w-2xl mx-auto leading-relaxed px-4 font-light ${light ? 'text-white/80' : 'text-slate-600'}`}>
            {subtitle}
        </p>
    </div>
);

// ... (Navbar handled by shared component)

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
    const [maxPassengers, setMaxPassengers] = useState(5); // Default to 5 until fetched
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const navigate = useNavigate();

    const [availableLocations, setAvailableLocations] = useState([]);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                // 1. Fetch defined locations (Master List)
                const { data: dbLocations, error: locError } = await supabase
                    .from('locations')
                    .select('name, department');

                // 2. Fetch cities with actual vehicles (Inventory) and find max passengers
                const { data: vehicleData, error: vError } = await supabase
                    .from('vehicles')
                    .select('location_city, passengers');

                if (locError || vError) throw new Error('Error loading location data');

                const vehicleCities = new Set(vehicleData.map(v => v.location_city));
                // Calculate max passengers dynamically from inventory
                const maxCap = vehicleData.reduce((max, v) => Math.max(max, v.passengers || 0), 4);
                setMaxPassengers(maxCap || 5);

                const locations = [];
                const activeDepartments = new Set();

                // 3. Build valid list (Intersection of DB Locations AND Active Inventory)
                dbLocations.forEach(loc => {
                    // Normalize check to avoid accent/case mismatches if possible, 
                    // but strict match is safer for data integrity. Assuming exact match for now.
                    if (vehicleCities.has(loc.name)) {
                        locations.push({ type: 'city', name: loc.name, label: `${loc.name}, ${loc.department}` });
                        activeDepartments.add(loc.department);
                    }
                });

                // Add active departments
                activeDepartments.forEach(dept => {
                    locations.push({ type: 'department', name: dept, label: dept });
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
                className="w-full bg-transparent outline-none text-slate-700 font-semibold placeholder:text-slate-400 text-sm cursor-pointer"
            />
        </div>
    );

    return (
        <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-[2.5rem] shadow-glass hover:shadow-glow transition-all duration-300 p-4 md:pl-8 md:pr-2 md:py-2 max-w-5xl mx-auto flex flex-col md:flex-row items-stretch md:items-center transform -translate-y-12 md:-translate-y-1/2 relative z-50">

            {/* Location */}
            <div className="flex-1 py-3 md:py-2 md:pr-6 w-full md:w-[32%] relative border-b border-slate-200/50 md:border-b-0 md:border-r md:border-slate-200/50 hover:bg-white/50 md:rounded-full transition-colors group cursor-pointer">
                <label className="block text-xs font-extrabold text-brand-dark ml-1 mb-0.5 tracking-wider uppercase">Dónde</label>
                <div className="relative">
                    <input
                        type="text"
                        value={destination}
                        onChange={handleLocationChange}
                        onFocus={() => destination.length > 0 && setShowSuggestions(true)}
                        placeholder="Explorar destinos"
                        className="w-full bg-transparent outline-none text-slate-700 text-sm placeholder:text-slate-400 font-medium truncate"
                    />
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-12 left-0 w-full md:w-[300px] bg-white rounded-3xl shadow-2xl border border-slate-100 py-4 z-50 overflow-hidden text-left">
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
            <div className="flex-1 py-3 md:py-2 md:px-6 w-full md:w-[38%] relative border-b border-slate-200/50 md:border-b-0 md:border-r md:border-slate-200/50 hover:bg-white/50 md:rounded-full transition-colors group cursor-pointer">
                <label className="block text-xs font-extrabold text-brand-dark ml-1 mb-0.5 tracking-wider uppercase">Fechas</label>
                <div className="w-full text-left">
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
                        className="w-full bg-transparent outline-none text-slate-700 text-sm placeholder:text-slate-400 font-medium"
                        calendarClassName="!font-sans !shadow-2xl !rounded-3xl !border-0 !p-6 !mt-4"
                        dayClassName={(date) => "rounded-full hover:bg-slate-100 font-medium"}
                        popperClassName="!z-50"
                        popperPlacement="bottom-start"
                    />
                </div>
            </div>

            {/* Passengers */}
            <div className="flex-1 py-3 md:py-2 md:px-6 w-full md:w-[30%] relative hover:bg-white/50 md:rounded-full transition-colors group cursor-pointer flex items-center justify-between">
                <div>
                    <label className="block text-xs font-extrabold text-brand-dark ml-1 mb-0.5 tracking-wider uppercase">Quién</label>
                    <div className="text-slate-700 text-sm font-medium truncate">
                        {passengers > 0 ? `${passengers} viajeros` : '¿Cuántos?'}
                    </div>
                </div>

                {/* Passenger Controls */}
                <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 md:right-4 bg-white shadow-sm md:shadow-lg rounded-full p-1 border border-slate-100">
                    <button onClick={(e) => { e.stopPropagation(); setPassengers(Math.max(1, passengers - 1)) }} className="p-1.5 hover:bg-slate-100 rounded-full"><Minus className="w-3 h-3 text-slate-600" /></button>
                    <span className="text-xs font-bold w-4 text-center">{passengers}</span>
                    <button onClick={(e) => { e.stopPropagation(); setPassengers(Math.min(maxPassengers, passengers + 1)) }} className="p-1.5 hover:bg-slate-100 rounded-full"><Plus className="w-3 h-3 text-slate-600" /></button>
                </div>
            </div>

            {/* Search Button */}
            <button
                onClick={handleSearch}
                className="bg-brand-blue hover:bg-brand-dark text-white p-3.5 rounded-2xl md:rounded-full shadow-lg shadow-brand-blue/30 transition-all hover:scale-[1.02] md:hover:scale-105 active:scale-95 mt-2 md:mt-0 w-full md:w-auto flex items-center justify-center gap-2 font-bold px-8 flex-shrink-0 z-10"
            >
                <Search className="w-5 h-5 stroke-[2.5px]" />
                <span className="md:hidden">Buscar</span>
            </button>
        </div>
    );
};

const PromotionCard = ({ title, discount, discountType, code }) => (
    <div className="group relative overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2">
        {/* Glass Background */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 transition-all duration-500 group-hover:bg-white/20"></div>

        {/* Gradient Glow */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-gold/20 rounded-full blur-3xl group-hover:bg-brand-gold/30 transition-all duration-1000"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-brand-blue/20 rounded-full blur-3xl group-hover:bg-brand-blue/30 transition-all duration-1000"></div>

        <div className="relative z-10 flex flex-col h-full justify-between min-h-[220px]">
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-xs font-bold tracking-wider uppercase mb-4">
                    <Star className="w-3 h-3 fill-current" /> Promoción Exclusiva
                </div>
                <h3 className="text-2xl font-serif font-bold text-white mb-2 leading-tight">
                    {title}
                </h3>
            </div>

            <div className="mt-6">
                <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-white">
                        {discountType === 'percentage' ? `${discount}%` : `S/${discount}`}
                    </span>
                    <span className="text-lg font-medium text-white/60">OFF</span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-brand-gold tracking-widest text-center shadow-inner">
                        {code}
                    </div>
                    <button className="bg-brand-gold hover:bg-white hover:text-brand-dark text-brand-dark p-3 rounded-xl transition-all duration-300 shadow-lg shadow-brand-gold/20">
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const VehicleCard = ({ id, name, price, location, image, isOffer, rating }) => (
    <div className="group relative rounded-[2rem] transition-all duration-500 hover:-translate-y-3">
        {/* Floating Effect Shadow */}
        <div className="absolute inset-4 bg-brand-dark/20 blur-2xl rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-8"></div>

        {/* Card Content with Glassmorphism */}
        <div className="relative h-full bg-white/90 backdrop-blur-md border border-white/50 rounded-[2rem] overflow-hidden shadow-glass hover:shadow-glow transition-all duration-500 flex flex-col">

            {/* Image Section */}
            <div className="relative h-80 overflow-hidden">
                <Link to={`/vehiculo/${id}`} className="block h-full w-full">
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500 z-10"></div>

                    {/* Hover Reveal Actions */}
                    <div className="absolute inset-0 bg-brand-dark/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 flex items-center justify-center gap-4">
                        <span className="bg-white/20 hover:bg-white hover:text-brand-dark text-white backdrop-blur-md px-6 py-3 rounded-full font-bold transition-all transform scale-90 group-hover:scale-100 duration-300 border border-white/30">
                            Ver Detalles
                        </span>
                    </div>

                    {isOffer && (
                        <div className="absolute top-5 left-5 z-30">
                            <div className="bg-brand-gold text-brand-dark text-xs font-bold px-4 py-2 rounded-full shadow-lg shadow-brand-gold/20 flex items-center gap-1.5 animate-pulse">
                                <Star className="w-3 h-3 fill-brand-dark" /> OFERTA
                            </div>
                        </div>
                    )}

                    <div className="absolute top-5 right-5 z-30">
                        <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 text-brand-gold fill-brand-gold" />
                            {Number(rating).toFixed(1)}
                        </div>
                    </div>

                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out"
                    />
                </Link>
            </div>

            {/* Info Section */}
            <div className="p-8 flex flex-col flex-1 relative">
                {/* Decorative Background Element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

                <div className="mb-auto relative z-10">
                    <div className="flex items-start justify-between gap-4 mb-2">
                        <Link to={`/vehiculo/${id}`} className="group-hover:text-brand-blue transition-colors duration-300">
                            <h3 className="text-2xl font-serif font-bold text-brand-dark leading-tight">{name}</h3>
                        </Link>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-6">
                        <MapPin className="w-4 h-4 text-brand-gold" />
                        {location}
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 relative z-10">
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Precio Diario</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-brand-blue text-lg font-bold">S/</span>
                                <span className="text-4xl font-serif font-bold text-brand-dark tracking-tight">
                                    {Number(price).toFixed(0)}
                                </span>
                            </div>
                        </div>
                        <Link to={`/vehiculo/${id}`} className="btn-primary !px-6 !py-3 !rounded-2xl !text-sm group-hover:bg-brand-gold group-hover:border-brand-gold/50 transition-all duration-300">
                            Reservar
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// ... (Fleet Section wrapper updated in main render)
// --- Main Component ---
export default function Inicio() {
    // ... (State and useEffect remain same)
    const [vehicles, setVehicles] = useState([]);
    const [promotions, setPromotions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            // ... (Fetch logic logic remains same)
            const { data: vehiclesData, error: vehiclesError } = await supabase.from('vehicles').select('*');
            if (vehiclesError) console.error('Error fetching vehicles:', vehiclesError);
            else setVehicles(vehiclesData || []);

            const { data: promosData, error: promosError } = await supabase.from('promotions').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(3);
            if (promosError) console.error('Error fetching promotions:', promosError);
            else setPromotions(promosData || []);
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-brand-cream font-sans selection:bg-brand-gold/30 selection:text-brand-dark">
            <BarraNavegacion />

            {/* Hero Section - Immersive Video/Image */}
            <div className="relative h-[85vh] w-full overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?q=80&w=2070&auto=format&fit=crop"
                    alt="Costa Peruana Lujo Atardecer"
                    className="w-full h-full object-cover scale-105 animate-[kenburns_30s_infinite_alternate]"
                />

                {/* Advanced Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/60 via-transparent to-brand-dark/90"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/50 to-transparent"></div>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pt-20">
                    <div className="animate-fade-in-up">
                        <span className="inline-flex items-center gap-2 py-2 px-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-brand-gold text-xs md:text-sm font-bold tracking-[0.2em] uppercase mb-8 shadow-glass">
                            <Star className="w-3 h-3 fill-current" /> Experience Peru
                        </span>
                        <h1 className="text-4xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 drop-shadow-2xl leading-tight">
                            El Lujo de <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-gold via-white to-brand-gold animate-shimmer bg-[length:200%_auto]">
                                Explorar
                            </span>
                        </h1>
                        <p className="hidden md:block text-lg md:text-2xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed mb-12 mix-blend-screen">
                            Descubre la costa peruana con nuestra flota exclusiva. <br />Libertad, confort y estilo en cada kilómetro.
                        </p>
                    </div>
                </div>
            </div>

            {/* Floating Search Bar Container - Negative Margin for overlap */}
            <div className="px-6 relative z-30 max-w-7xl mx-auto w-full -mt-24">
                <SearchBar />
            </div>

            {/* Promotions Section with Dark Premium Background */}
            <section className="relative py-24 overflow-hidden">
                {/* Dark Background */}
                <div className="absolute inset-0 bg-brand-dark"></div>
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                    <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-brand-blue rounded-full blur-[120px]"></div>
                    <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] bg-brand-gold rounded-full blur-[100px]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <SectionTitle
                        title="Privilegios Exclusivos"
                        subtitle="Accede a descuentos especiales diseñados para tu próxima aventura."
                        light={true}
                    />

                    {promotions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {promotions.map((promo) => (
                                <PromotionCard
                                    key={promo.id}
                                    title={promo.name}
                                    discount={promo.discount_value}
                                    discountType={promo.discount_type}
                                    code={promo.code}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="glass-panel rounded-3xl p-12 text-center max-w-2xl mx-auto">
                            <p className="text-white/60 text-lg">Actualmente estamos preparando nuevas experiencias exclusivas.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Fleet Section with Sand Gradient */}
            <section className="bg-slate-100 py-32 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <SectionTitle
                        title="Nuestra Colección"
                        subtitle="Selección curada de vehículos premium para el viajero exigente."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                        {vehicles.map((vehicle) => (
                            <VehicleCard
                                key={vehicle.id}
                                id={vehicle.id}
                                name={`${vehicle.make} ${vehicle.model}`}
                                location={vehicle.location_city}
                                price={vehicle.price_per_day}
                                image={vehicle.image_url}
                                rating={vehicle.rating}
                                isOffer={vehicle.is_offer}
                            />
                        ))}
                    </div>

                    <div className="text-center mt-24">
                        <button className="btn-secondary text-lg px-10 py-4 hover:shadow-xl hover:shadow-brand-gold/20">
                            Explorar Todo el Catálogo
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
