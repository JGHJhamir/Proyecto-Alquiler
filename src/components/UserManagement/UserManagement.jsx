import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { Users, Search, MoreVertical, Edit, LogOut, Plus, Loader2 } from 'lucide-react';
import UserModal from './UserModal';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [visibleColumns, setVisibleColumns] = useState({
        name: true, email: true, phone: true, dni: true, role: true, actions: true
    });
    const [showColumnMenu, setShowColumnMenu] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [currentUserRole, setCurrentUserRole] = useState(null); // New state

    // Modal State
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [userFormData, setUserFormData] = useState({
        full_name: '', email: '', phone: '', dni: '', role: 'client', country: 'Perú', birth_date: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            // Get Current User Role
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                setCurrentUserRole(profile?.role || 'client');
            }

            setLoading(true);
            const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const logAction = async (action, details) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from("audit_logs").insert([{
                    user_id: user.id,
                    action,
                    details
                }]);
            }
        } catch (e) { console.error("Log failed", e); }
    };

    const handleEditUser = (user) => {
        setEditingUserId(user.id);
        setUserFormData({
            full_name: user.full_name || '',
            email: user.email || '',
            phone: user.phone || '',
            dni: user.dni || '',
            country: user.country || 'Perú',
            birth_date: user.birth_date || '',
            role: user.role || 'client'
        });
        setIsUserModalOpen(true);
        setActiveMenu(null);
    };

    const handleAddUser = () => {
        setEditingUserId(null);
        setUserFormData({
            full_name: '', email: '', phone: '', dni: '', role: 'client', country: 'Perú', birth_date: ''
        });
        setIsUserModalOpen(true);
    };

    const handleDeleteUser = async (id) => {
        // 1. Check for existing bookings
        try {
            const { count, error: countError } = await supabase
                .from('bookings')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', id);

            if (countError) throw countError;

            if (count > 0) {
                alert(`No se puede eliminar este usuario porque tiene ${count} reserva(s) registrada(s). Esto comprometería el historial de reservas.`);
                return;
            }

            // 2. Proceed with deletion if no bookings
            if (!confirm('¿Estás seguro de eliminar el perfil de este usuario permanentemente?')) return;

            const { error } = await supabase.from('profiles').delete().eq('id', id);
            if (error) throw error;
            await logAction('DELETE_USER_PROFILE', { profile_id: id });
            alert('Usuario eliminado correctamente.');
            setUsers(users.filter(u => u.id !== id));
        } catch (error) {
            alert('Error al procesar la solicitud: ' + error.message);
        }
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingUserId) {
                // Update existing profile
                const { error } = await supabase.from('profiles').update({
                    full_name: userFormData.full_name,
                    phone: userFormData.phone,
                    dni: userFormData.dni,
                    role: userFormData.role,
                    country: userFormData.country,
                    birth_date: userFormData.birth_date || null
                    // Email cannot be updated here straightforwardly as it's linked to Auth
                }).eq('id', editingUserId);

                if (error) throw error;
                await logAction('UPDATE_USER_PROFILE', { profile_id: editingUserId, ...userFormData });
                alert('Usuario actualizado correctamente');

                // Optimistic Update
                setUsers(users.map(u => u.id === editingUserId ? { ...u, ...userFormData } : u));
            } else {
                // Create new user via Edge Function
                const { data, error } = await supabase.functions.invoke('create-user', {
                    body: {
                        email: userFormData.email,
                        password: userFormData.password,
                        user_metadata: {
                            full_name: userFormData.full_name,
                            phone: userFormData.phone,
                            dni: userFormData.dni,
                            role: userFormData.role,
                            country: userFormData.country,
                            birth_date: userFormData.birth_date || null
                        }
                    }
                });

                if (error) throw new Error(error.message || 'Error creating user');

                // If the function returns an error object in the body
                if (data && data.error) throw new Error(data.error);

                await logAction('CREATE_USER_PROFILE', { full_name: userFormData.full_name, email: userFormData.email });
                alert('Usuario creado exitosamente. Puede iniciar sesión inmediatamente.');

                // Refresh list to show the new user
                fetchUsers();
            }
            setIsUserModalOpen(false);
        } catch (error) {
            alert('Error al guardar: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.dni?.includes(searchTerm)
    );

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div>;

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-6 h-6" /> Gestión de Usuarios
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Administra clientes, administradores y propietarios.</p>
                </div>
                <button
                    onClick={handleAddUser}
                    className="bg-brand-blue hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
                >
                    <Plus className="w-4 h-4" /> Nuevo Usuario
                </button>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Filtrar por email, nombre o DNI..."
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-brand-blue outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowColumnMenu(!showColumnMenu)}
                        className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 flex items-center gap-2"
                    >
                        Columnas <MoreVertical className="w-3 h-3" />
                    </button>
                    {showColumnMenu && (
                        <div className="absolute right-0 top-12 z-50 w-48 bg-white rounded-lg shadow-xl border border-slate-100 p-2 animate-fade-in-up">
                            <div className="text-xs font-semibold text-slate-500 mb-2 px-2 uppercase tracking-wider">Mostrar</div>
                            {Object.entries({
                                email: 'Email',
                                phone: 'Celular',
                                dni: 'DNI/Pasaporte',
                                role: 'Rol'
                            }).map(([key, label]) => (
                                <label key={key} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer text-sm text-slate-700 select-none">
                                    <input
                                        type="checkbox"
                                        checked={visibleColumns[key]}
                                        onChange={() => setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }))}
                                        className="rounded border-slate-300 w-4 h-4 accent-brand-blue"
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                            <th className="p-4 w-8"><input type="checkbox" className="rounded border-slate-300" /></th>
                            <th className="px-6 py-3">Nombre</th>
                            {visibleColumns.email && <th className="px-6 py-3">Email</th>}
                            {visibleColumns.phone && <th className="px-6 py-3">Celular</th>}
                            {visibleColumns.dni && <th className="px-6 py-3">DNI/Pasaporte</th>}
                            {visibleColumns.role && <th className="px-6 py-3">Rol</th>}
                            <th className="px-4 py-3 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredUsers.map((user, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                                <td className="p-4"><input type="checkbox" className="rounded border-slate-300" /></td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 text-brand-blue text-xs flex items-center justify-center font-bold border border-slate-200">
                                            {user.full_name?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <span className="font-medium text-slate-700 text-sm">{user.full_name}</span>
                                    </div>
                                </td>
                                {visibleColumns.email && <td className="px-6 py-4 text-sm text-slate-600">{user.email || 'email@example.com'}</td>}
                                {visibleColumns.phone && <td className="px-6 py-4 text-sm text-slate-600">{user.phone || '-'}</td>}
                                {visibleColumns.dni && <td className="px-6 py-4 text-sm text-slate-600">{user.dni || '-'}</td>}
                                {visibleColumns.role && (
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : user.role === 'owner' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {user.role === 'owner' ? 'Propietario' : user.role === 'admin' ? 'Administrador' : 'Cliente'}
                                        </span>
                                    </td>
                                )}
                                <td className="px-4 py-4 text-right relative">
                                    <button onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)} className="text-slate-400 hover:text-brand-blue p-2 rounded-full hover:bg-slate-100 transition-colors">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                    {/* Dropdown Menu */}
                                    {activeMenu === user.id && (
                                        <div className="absolute right-8 top-12 w-32 bg-white rounded-lg shadow-lg border border-slate-100 z-10 overflow-hidden animate-fade-in-up">
                                            <button onClick={() => handleEditUser(user)} className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                                <Edit className="w-3.5 h-3.5 text-slate-400" /> Editar
                                            </button>
                                            <button onClick={() => { handleDeleteUser(user.id); setActiveMenu(null); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                <LogOut className="w-3.5 h-3.5" /> Eliminar
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && <tr><td colSpan="7" className="p-8 text-center text-slate-400 text-sm">No hay usuarios registrados.</td></tr>}
                    </tbody>
                </table>
            </div>

            <UserModal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                formData={userFormData}
                setFormData={setUserFormData}
                onSubmit={handleSaveUser}
                submitting={submitting}
                isEditing={!!editingUserId}
                currentUserRole={currentUserRole} // Pass the role
            />
        </div>
    );
};

export default UserManagement;
