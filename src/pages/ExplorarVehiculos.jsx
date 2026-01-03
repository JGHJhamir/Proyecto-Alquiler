import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import BarraNavegacion from '../components/BarraNavegacion';
import { MapPin, Star, Heart, SlidersHorizontal, Map as MapIcon, List, Plus, Minus, X } from 'lucide-react';
import { COASTAL_LOCATIONS } from '../constants';

const getCapacity = (category) => {
    // Exact match or partial match for complexity
    const lowerCat = (category || '').toLowerCase();
    if (lowerCat.includes('cuatrimoto') || lowerCat.includes('atv')) return 2; // Majority are 2, sport are 1 but safer to say 2 max
    if (lowerCat.includes('moto acuática') || lowerCat.includes('jet ski')) return 3;
    if (lowerCat.includes('buggy') || lowerCat.includes('utv')) return 4; // Commander XT is 4
    if (lowerCat.includes('foil') || lowerCat.includes('board')) return 1;
    return 2; // Fallback
};

const VehicleResultCard = ({ id, make, model, price, location, image, rating, type, stock }) => {
    const capacity = getCapacity(type);

    return (
        <div className="group bg-white/80 backdrop-blur-lg border border-white/50 rounded-[2rem] p-4 flex flex-col sm:flex-row gap-6 hover:shadow-glow hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden">
            {/* Hover Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/5 via-transparent to-brand-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            <div className="relative w-full sm:w-80 h-56 flex-shrink-0 overflow-hidden rounded-2xl shadow-inner">
                {rating >= 4.5 && (
                    <div className="absolute top-3 left-3 z-10 bg-brand-gold/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-brand-dark shadow-lg uppercase tracking-widest flex items-center gap-1 border border-white/20">
                        <Star className="w-3 h-3 fill-current" />
                        Superanfitrión
                    </div>
                )}
                <img
                    src={image}
                    alt={`${make} ${model}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000';
                    }}
                />
            </div>

            <div className="flex-1 flex flex-col justify-between py-2 relative z-10">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-[10px] text-brand-gold font-bold uppercase tracking-[0.2em] mb-1">{type || 'Vehículo'}</p>
                            <h3 className="text-2xl font-serif font-bold text-slate-800 group-hover:text-brand-blue transition-colors leading-tight">{make} {model}</h3>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-500 mb-4">
                        <span className="bg-white/50 border border-white/60 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                            <List className="w-3 h-3" /> {capacity} Pasajeros
                        </span>
                        <span className="bg-white/50 border border-white/60 px-3 py-1.5 rounded-lg">Automático</span>
                    </div>
                </div>

                <div className="flex items-end justify-between mt-auto border-t border-slate-100/50 pt-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                            {location}
                        </div>
                        <div className="flex items-center gap-0.5">
                            <Star className="w-4 h-4 text-brand-gold fill-brand-gold" />
                            <span className="font-bold text-slate-800">{rating}</span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">({stock} disponibles)</span>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Precio por hora</p>
                    <div className="flex items-baseline justify-end gap-1">
                        <span className="text-brand-blue text-lg font-bold">S/</span>
                        <span className="text-3xl font-serif font-bold text-slate-900">{price || '0'}</span>
                    </div>
                </div>
            </div>
        </div>
    )
};

const ExplorarVehiculos = () => {
    // ... (Hooks and State logic - existing logic is preserved, we are only re-rendering the return)
    const [searchParams] = useSearchParams();
    const destination = searchParams.get('destination') || '';
    const passengers = Number(searchParams.get('passengers')) || 1;

    // State
    const [vehicles, setVehicles] = useState([]);
    const [filteredVehicles, setFilteredVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    // Filter State
    const [filters, setFilters] = useState({
        categories: [],
        categories: [],
        department: '',
        city: ''
    });

    // Helper to toggle filter arrays
    const toggleFilter = (type, value) => {
        setFilters(prev => {
            const list = prev[type] || [];
            const newList = list.includes(value)
                ? list.filter(item => item !== value)
                : [...list, value];
            return { ...prev, [type]: newList };
        });
    };

    // State for Dynamic Locations (Database)
    const [locationMap, setLocationMap] = useState({});

    useEffect(() => {
        const fetchLocationMap = async () => {
            const { data } = await supabase.from('locations').select('name, department');
            if (data) {
                const map = {};
                data.forEach(loc => {
                    const dept = loc.department;
                    if (!map[dept]) map[dept] = [];
                    map[dept].push(loc.name);
                });
                setLocationMap(map);
            }
        };
        fetchLocationMap();
    }, []);

    useEffect(() => {
        const fetchAndFilterVehicles = async () => {
            setLoading(true);

            // 1. Fetch
            const { data, error } = await supabase.from('vehicles').select('*');

            if (error) {
                console.error('Error fetching vehicles:', error);
                setLoading(false);
                return;
            }

            let results = data || [];

            // 1.5 Date Availability Check 
            if (filters.startDate && filters.endDate) {
                const { data: busyBookings } = await supabase
                    .from('bookings')
                    .select('vehicle_id')
                    .neq('status', 'cancelled')
                    .or(`and(start_date.lte.${filters.endDate},end_date.gte.${filters.startDate})`);

                if (busyBookings && busyBookings.length > 0) {
                    const busyIds = busyBookings.map(b => b.vehicle_id);
                    results = results.filter(v => !busyIds.includes(v.id));
                }
            }

            // 2. Location Filtering
            if (destination) {
                const term = destination.toLowerCase().trim();
                let targetCities = [];
                const matchedDept = Object.keys(locationMap).find(d => d.toLowerCase().includes(term) || term.includes(d.toLowerCase()));
                if (matchedDept) {
                    targetCities = locationMap[matchedDept];
                }

                results = results.filter(vehicle => {
                    const vCity = vehicle.location_city?.toLowerCase() || '';
                    const directCityMatch = vCity.includes(term);
                    const deptMatch = targetCities.some(cityInDept => vCity.includes(cityInDept.toLowerCase()));
                    return directCityMatch || deptMatch;
                });
            }

            // 3. Advanced Filtering
            results = results.filter(v => {
                // const price = v.price_per_day || 0;
                // if (price < filters.minPrice || price > filters.maxPrice) return false;

                if (filters.categories.length > 0) {
                    const matchesCategory = filters.categories.some(cat =>
                        v.category?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") ===
                        cat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    );
                    if (!matchesCategory) return false;
                }

                if (filters.department) {
                    const deptCities = COASTAL_LOCATIONS[filters.department] || [];
                    const vehicleCity = v.location_city;
                    if (filters.city) {
                        if (vehicleCity !== filters.city) return false;
                    } else {
                        if (!deptCities.includes(vehicleCity)) return false;
                    }
                } else if (filters.city) {
                    if (v.location_city !== filters.city) return false;
                }

                const capacity = getCapacity(v.category);
                if (capacity < passengers) return false;

                return true;
            });

            setFilteredVehicles(results);
            setVehicles(data || []);
            setLoading(false);
        };

        fetchAndFilterVehicles();
    }, [destination, filters, locationMap]);

    const availableCities = new Set(vehicles.map(v => v.location_city));
    const availableDepartments = Object.keys(locationMap).filter(dept =>
        locationMap[dept].some(city => availableCities.has(city))
    );

    return (
        <div className="min-h-screen bg-brand-cream/30 font-sans selection:bg-brand-gold/20 selection:text-brand-dark">
            <BarraNavegacion />

            {/* Filter Modal */}
            {showFilters && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white/95 backdrop-blur-xl border border-white/50 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200 ring-1 ring-white/50">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-serif font-bold text-slate-800">Filtros Avanzados</h3>
                            <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>


                        <div className="mb-8">
                            <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">
                                <MapPin className="w-4 h-4 text-brand-gold" /> Ubicación
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">Departamento</label>
                                    <div className="relative">
                                        <select
                                            value={filters.department || ''}
                                            onChange={(e) => setFilters({ ...filters, department: e.target.value, city: '' })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none appearance-none bg-slate-50 hover:bg-white focus:bg-white focus:border-brand-blue transition-all cursor-pointer font-medium text-sm text-slate-700 shadow-sm"
                                        >
                                            <option value="">Todo el Perú</option>
                                            {availableDepartments.map(dept => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">Ciudad / Playa</label>
                                    <div className="relative">
                                        <select
                                            value={filters.city || ''}
                                            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none appearance-none bg-slate-50 hover:bg-white focus:bg-white focus:border-brand-blue transition-all cursor-pointer font-medium text-sm text-slate-700 shadow-sm"
                                        >
                                            <option value="">Cualquiera</option>
                                            {(!filters.department
                                                ? Array.from(availableCities).sort()
                                                : (locationMap[filters.department] || []).filter(city => availableCities.has(city))
                                            ).map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="mb-10">
                            <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Categoría</h4>
                            <div className="flex flex-wrap gap-2">
                                {['Cuatrimotos (ATV)', 'Buggies / UTV', 'Motos Acuáticas', 'E-Foils & Jetboards'].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => toggleFilter('categories', cat)}
                                        className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all duration-300 ${filters.categories.includes(cat) ? 'bg-brand-dark text-brand-gold border-brand-dark shadow-md transform scale-105' : 'bg-white text-slate-500 border-slate-200 hover:border-brand-gold/50 hover:text-brand-dark'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between pt-6 border-t border-slate-100">
                            <button
                                onClick={() => setFilters({ categories: [], transmission: [], department: '', city: '' })}
                                className="text-slate-500 font-bold hover:text-slate-800 transition-colors text-sm"
                            >
                                Restablecer todo
                            </button>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="btn-primary"
                            >
                                Mostrar Resultados
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="pt-24 min-h-screen flex flex-col relative w-full overflow-x-hidden">
                {/* Floating Filter Bar */}
                <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between sticky top-[80px] z-40 mx-4 md:mx-6 mt-2 md:mt-4 mb-4 md:mb-6 bg-white/70 backdrop-blur-xl border border-white/40 shadow-glass rounded-xl md:rounded-2xl">
                    <div className="flex items-center gap-2 text-slate-600">
                        <MapIcon className="w-5 h-5 text-brand-blue" />
                        <p className="text-xs md:text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                            {loading ? 'Buscando...' : (
                                <>
                                    <span className="font-bold text-slate-900">{filteredVehicles.length}</span>
                                    <span className="hidden sm:inline"> resultados</span>
                                    {(destination || filters.department || filters.city) && <span className="hidden md:inline"> en <span className="font-bold">{filters.city || filters.department || destination}</span></span>}
                                </>
                            )}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowFilters(true)}
                        className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg md:rounded-xl px-4 md:px-5 py-2 md:py-2.5 hover:border-brand-gold hover:shadow-md transition-all text-xs md:text-sm font-bold text-slate-700 hover:text-brand-dark active:scale-95"
                    >
                        <SlidersHorizontal className="w-4 h-4" /> Filtros
                        {(filters.categories.length > 0 || filters.department) && <span className="w-2 h-2 bg-brand-gold rounded-full animate-pulse"></span>}
                    </button>
                </div>

                <div className="flex flex-1 px-4 md:px-6 pb-6 gap-6">
                    {/* List */}
                    <div className="w-full lg:w-[60%] xl:w-[55%] overflow-y-auto h-[calc(100vh-160px)] custom-scrollbar pr-0 md:pr-2">
                        {loading ? (
                            <div className="space-y-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-64 rounded-[2rem] bg-white/50 border border-white/60 p-4 animate-pulse flex gap-6">
                                        <div className="w-80 h-full bg-slate-200/50 rounded-2xl"></div>
                                        <div className="flex-1 py-2 space-y-4">
                                            <div className="w-2/3 h-8 bg-slate-200/50 rounded-lg"></div>
                                            <div className="w-1/2 h-4 bg-slate-200/50 rounded-lg"></div>
                                            <div className="flex gap-2 mt-4">
                                                <div className="w-20 h-6 bg-slate-200/50 rounded-lg"></div>
                                                <div className="w-20 h-6 bg-slate-200/50 rounded-lg"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredVehicles.length > 0 ? (
                            <div className="space-y-6 pb-20">
                                {filteredVehicles.map(vehicle => (
                                    <Link key={vehicle.id} to={`/vehiculo/${vehicle.id}`} className="block">
                                        <VehicleResultCard
                                            {...vehicle}
                                            price={vehicle.price_per_hour}
                                            type={vehicle.category}
                                            location={vehicle.location_city}
                                            image={vehicle.image_url || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000'}
                                            stock={vehicle.stock}
                                        />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white/40 backdrop-blur-md rounded-[3rem] border border-white/50">
                                <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Star className="w-10 h-10 text-brand-gold opacity-50" />
                                </div>
                                <h3 className="text-2xl font-serif font-bold text-slate-800 mb-2">No encontramos vehículos</h3>
                                <p className="text-slate-500 max-w-xs mx-auto mb-8">Intenta ajustar tu búsqueda o los filtros para encontrar tu vehículo ideal.</p>
                                <button onClick={() => setFilters({ categories: [], department: '', city: '' })} className="btn-secondary">
                                    Ver todos los vehículos
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Map */}
                    <div className="hidden lg:block w-[40%] xl:w-[45%] h-[calc(100vh-180px)] sticky top-[160px] rounded-[2.5rem] overflow-hidden border border-white/60 shadow-glass">
                        <div className="w-full h-full relative overflow-hidden bg-[#eef0f2]">
                            {/* Map Gradient Overlay for 'Premium' feel */}
                            <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-brand-dark/5 to-transparent mix-blend-multiply"></div>

                            <iframe
                                width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0"
                                src={`https://maps.google.com/maps?q=${encodeURIComponent(filters.city || filters.department || destination || 'Perú')}&t=&z=10&ie=UTF8&iwloc=&output=embed`}
                                className="w-full h-full grayscale-[10%] contrast-[1.05] opacity-90 hover:opacity-100 transition-opacity duration-700"
                            ></iframe>

                            <div className="absolute bottom-8 right-8 flex flex-col gap-3 pointer-events-none z-20">
                                <div className="bg-white/90 backdrop-blur-xl border border-white/50 p-4 rounded-2xl shadow-glass flex flex-col gap-2 w-64">
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mostrando</p>
                                            <p className="font-serif font-bold text-slate-800">{filters.city || filters.department || destination || 'Todo el Perú'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-700 pointer-events-auto cursor-pointer hover:bg-brand-gold hover:text-white transition-colors" onClick={() => window.open(`https://www.google.com/maps/search/${filters.city || filters.department || destination || 'Peru'}`, '_blank')}>
                                    <Plus className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExplorarVehiculos;
