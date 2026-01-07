import React from 'react';
import { X, Save, Loader2 } from 'lucide-react';

const UserModal = ({ isOpen, onClose, formData, setFormData, onSubmit, submitting, isEditing, currentUserRole }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
                <div className="bg-white px-8 py-5 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{isEditing ? 'Editar Usuario' : 'Añadir Usuario'}</h2>
                        <p className="text-slate-500 text-sm">Gestiona la información del perfil del usuario.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 block">Nombre Completo</label>
                            <input type="text"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                required
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-brand-blue outline-none"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 block">Email</label>
                            <input type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                disabled={isEditing} // Email generalmente manejado por Auth, mejor no editar aquí para evitar problemas de sincronización
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-brand-blue outline-none disabled:bg-slate-100 disabled:text-slate-500"
                            />
                            {isEditing && <p className="text-[10px] text-slate-400">El email no se puede cambiar desde aquí.</p>}
                        </div>

                        {!isEditing && (
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 block">Contraseña</label>
                                <input type="password"
                                    value={formData.password || ''}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required={!isEditing}
                                    minLength={6}
                                    placeholder="Mínimo 6 caracteres"
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-brand-blue outline-none"
                                />
                                <p className="text-[10px] text-slate-400">Esta contraseña permitirá al usuario iniciar sesión inmediatamente.</p>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 block">Celular</label>
                                <input type="text"
                                    value={formData.phone}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        // Allow only numbers and max 9 digits
                                        if (/^\d*$/.test(val) && val.length <= 9) {
                                            setFormData({ ...formData, phone: val });
                                        }
                                    }}
                                    placeholder="999999999"
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-brand-blue outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 block">DNI / Pasaporte</label>
                                <input type="text"
                                    value={formData.dni}
                                    onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-brand-blue outline-none"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 block">País</label>
                                <div className="flex flex-col gap-2">
                                    <select
                                        value={['Perú', 'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Ecuador', 'Paraguay', 'Uruguay', 'Venezuela', 'Estados Unidos', 'España'].includes(formData.country) ? formData.country : 'Otro'}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === 'Otro') {
                                                setFormData({ ...formData, country: '' });
                                            } else {
                                                setFormData({ ...formData, country: val });
                                            }
                                        }}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-brand-blue outline-none"
                                    >
                                        <option value="Perú">🇵🇪 Perú</option>
                                        <option value="Argentina">🇦🇷 Argentina</option>
                                        <option value="Bolivia">🇧🇴 Bolivia</option>
                                        <option value="Brasil">🇧🇷 Brasil</option>
                                        <option value="Chile">🇨🇱 Chile</option>
                                        <option value="Colombia">🇨🇴 Colombia</option>
                                        <option value="Ecuador">🇪🇨 Ecuador</option>
                                        <option value="Paraguay">🇵🇾 Paraguay</option>
                                        <option value="Uruguay">🇺🇾 Uruguay</option>
                                        <option value="Venezuela">🇻🇪 Venezuela</option>
                                        <option value="Estados Unidos">🇺🇸 Estados Unidos</option>
                                        <option value="España">🇪🇸 España</option>
                                        <option value="Otro">🌎 Otro</option>
                                    </select>
                                    {(!['Perú', 'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Ecuador', 'Paraguay', 'Uruguay', 'Venezuela', 'Estados Unidos', 'España'].includes(formData.country) || formData.country === '') && (
                                        <input
                                            type="text"
                                            value={formData.country}
                                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                            placeholder="Especifique país"
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-brand-blue outline-none animate-fade-in"
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 block">Fecha Nacimiento</label>
                                <input type="date"
                                    value={formData.birth_date || ''}
                                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-brand-blue outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 block">Rol</label>
                            {currentUserRole === 'owner' ? (
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-brand-blue outline-none"
                                >
                                    <option value="client">Cliente</option>
                                    <option value="admin">Administrador</option>
                                    <option value="owner">Propietario</option>
                                </select>
                            ) : (
                                <div className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-500">
                                    {formData.role === 'client' ? 'Cliente' : formData.role === 'admin' ? 'Administrador' : 'Propietario'}
                                    <span className="ml-2 text-xs text-slate-400">(Solo Propietarios pueden cambiar roles)</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-2 flex gap-4">
                        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">Cancelar</button>
                        <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl bg-brand-blue text-white font-bold hover:bg-blue-700 items-center justify-center flex gap-2">
                            {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                            {isEditing ? 'Actualizar' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;
