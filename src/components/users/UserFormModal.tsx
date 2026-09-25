import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Usuario, RolUsuario, UserStatus } from '../../types';
import { X, User } from 'lucide-react';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: Usuario | null;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  userToEdit
}) => {
  const { addUsuario, updateUsuario } = useApp();

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rol, setRol] = useState<RolUsuario>('Dueño');
  const [idioma, setIdioma] = useState('es');
  const [ciudad, setCiudad] = useState('');
  const [estadoGeo, setEstadoGeo] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [status, setStatus] = useState<UserStatus>('Active');

  useEffect(() => {
    if (userToEdit) {
      setNombre(userToEdit.nombre);
      setApellido(userToEdit.apellido);
      setEmail(userToEdit.email);
      setTelefono(userToEdit.telefono || '');
      setRol(userToEdit.rol);
      setIdioma(userToEdit.idioma || 'es');
      setCiudad(userToEdit.ciudad || '');
      setEstadoGeo(userToEdit.estado_geo || '');
      setCodigoPostal(userToEdit.codigo_postal || '');
      setStatus(userToEdit.status);
    } else {
      setNombre('');
      setApellido('');
      setEmail('');
      setTelefono('');
      setRol('Dueño');
      setIdioma('es');
      setCiudad('');
      setEstadoGeo('');
      setCodigoPostal('');
      setStatus('Active');
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const userData: Omit<Usuario, 'id'> = {
      nombre,
      apellido,
      email,
      telefono,
      rol,
      idioma,
      ciudad,
      estado_geo: estadoGeo,
      codigo_postal: codigoPostal,
      status
    };

    if (userToEdit) {
      updateUsuario(userToEdit.id, userData);
    } else {
      addUsuario(userData);
    }
    onClose();
  };

  const rolesList: RolUsuario[] = [
    'Dueño',
    'Administrador',
    'Recepcionista',
    'Guardia de Seguridad',
    'Supervisor de Mantenimiento',
    'Operador Principal de Mantenimiento',
    'Operador de Mantenimiento',
    'Supervisor de Camaristas',
    'Camarista (Operador Principal)',
    'Camarista (Operador)',
    'Miembro del Consejo',
    'Comité de Vigilancia',
    'Contabilidad'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden my-8 animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <User className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {userToEdit ? `Editar Usuario: ${userToEdit.nombre} ${userToEdit.apellido}` : 'Registrar Nuevo Usuario / Dueño'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Nombre *</label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="ej. Manuel"
                className="w-full px-3 py-2 rounded-lg form-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Apellido *</label>
              <input
                type="text"
                required
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder="ej. Garcia"
                className="w-full px-3 py-2 rounded-lg form-input text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Correo Electrónico *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ej. mgarcia@laspalomashoamx.com"
                className="w-full px-3 py-2 rounded-lg form-input text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Teléfono / Celular</label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+52 638 100 2233"
                className="w-full px-3 py-2 rounded-lg form-input text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Rol en HOA *</label>
              <select
                value={rol}
                onChange={(e) => setRol(e.target.value as RolUsuario)}
                className="w-full px-3 py-2 rounded-lg form-input text-xs font-bold text-teal-900"
              >
                {rolesList.map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Idioma</label>
              <select
                value={idioma}
                onChange={(e) => setIdioma(e.target.value)}
                className="w-full px-3 py-2 rounded-lg form-input text-xs"
              >
                <option value="es">Español</option>
                <option value="en">English (Inglés)</option>
              </select>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
            <span className="text-xs font-bold text-slate-700 block">Dirección de Contacto (Opcional)</span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Ciudad</label>
                <input
                  type="text"
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  placeholder="Phoenix / Sonora"
                  className="w-full px-2.5 py-1.5 rounded-lg form-input text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Estado</label>
                <input
                  type="text"
                  value={estadoGeo}
                  onChange={(e) => setEstadoGeo(e.target.value)}
                  placeholder="AZ / Sonora"
                  className="w-full px-2.5 py-1.5 rounded-lg form-input text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">C.P.</label>
                <input
                  type="text"
                  value={codigoPostal}
                  onChange={(e) => setCodigoPostal(e.target.value)}
                  placeholder="85001"
                  className="w-full px-2.5 py-1.5 rounded-lg form-input text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Estatus</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as UserStatus)}
              className="w-full px-3 py-2 rounded-lg form-input text-xs font-semibold"
            >
              <option value="Active">Active (Activo)</option>
              <option value="Inactive">Inactive (Inactivo)</option>
              <option value="Suspended">Suspended (Suspendido)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-700/20"
            >
              {userToEdit ? 'Guardar Cambios' : 'Registrar Usuario'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
