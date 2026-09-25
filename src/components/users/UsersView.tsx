import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Usuario, RolUsuario } from '../../types';
import { 
  Users, 
  Plus, 
  Filter, 
  Phone, 
  Edit, 
  Trash2
} from 'lucide-react';

interface UsersViewProps {
  onOpenNewUser: () => void;
  onEditUser: (user: Usuario) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  onOpenNewUser,
  onEditUser
}) => {
  const { 
    usuarios, 
    searchQuery, 
    deleteUsuario, 
    propiedades, 
    propiedadUsuarios 
  } = useApp();

  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredUsers = usuarios.filter(u => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = `${u.nombre} ${u.apellido}`.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchRol = u.rol.toLowerCase().includes(q);
      const matchId = `${u.id}`.includes(q);
      if (!matchName && !matchEmail && !matchRol && !matchId) return false;
    }

    if (roleFilter !== 'ALL' && u.rol !== roleFilter) return false;
    if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;

    return true;
  });

  const getCondosForUser = (userId: number) => {
    const rels = propiedadUsuarios.filter(pu => pu.usuario_id === userId);
    return rels.map(rel => {
      const prop = propiedades.find(p => p.id === rel.propiedad_id);
      return prop ? prop.nombre : null;
    }).filter(Boolean);
  };

  const rolesList: RolUsuario[] = [
    'Dueño',
    'Administrador',
    'Recepcionista',
    'Guardia de Seguridad',
    'Supervisor de Mantenimiento',
    'Operador de Mantenimiento',
    'Supervisor de Camaristas',
    'Camarista (Operador Principal)',
    'Camarista (Operador)',
    'Miembro del Consejo',
    'Comité de Vigilancia',
    'Contabilidad'
  ];

  return (
    <div className="space-y-5">
      
      {/* Top Filter Controls */}
      <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 min-h-[56px]">
        
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-700" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 px-3 text-xs rounded-lg form-input font-medium cursor-pointer border-slate-200"
            >
              <option value="ALL">Todos los Roles ({usuarios.length})</option>
              {rolesList.map(role => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 text-xs rounded-lg form-input font-medium cursor-pointer border-slate-200"
            >
              <option value="ALL">Todos los Estatus</option>
              <option value="Active">Solo Activos</option>
              <option value="Inactive">Inactivos</option>
              <option value="Suspended">Suspendidos</option>
            </select>
          </div>
        </div>

        <button
          onClick={onOpenNewUser}
          className="h-9 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors duration-150 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Registrar Usuario / Dueño</span>
        </button>

      </div>

      {/* Users Table */}
      <div className="rounded-xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3.5 whitespace-nowrap w-16"># ID</th>
                <th className="py-3 px-3.5 whitespace-nowrap min-w-[170px]">Nombre Completo</th>
                <th className="py-3 px-3.5 whitespace-nowrap min-w-[170px]">Email</th>
                <th className="py-3 px-3.5 whitespace-nowrap w-36">Rol / Puesto</th>
                <th className="py-3 px-3.5 whitespace-nowrap w-44">Propiedades Asociadas</th>
                <th className="py-3 px-3.5 whitespace-nowrap w-40">Ubicación / Idioma</th>
                <th className="py-3 px-3.5 whitespace-nowrap w-24">Estatus</th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap w-28">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    No se encontraron usuarios con estos criterios.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const condos = getCondosForUser(user.id);

                  return (
                    <tr key={user.id} className="hover:bg-teal-50/40 transition-colors">
                      {/* ID */}
                      <td className="py-3 px-3.5 font-mono font-bold text-teal-700 whitespace-nowrap align-middle">
                        #{user.id}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-3.5 align-middle whitespace-nowrap">
                        <span className="font-extrabold text-sm text-slate-900 block">
                          {user.nombre} {user.apellido}
                        </span>
                        {user.telefono ? (
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5 text-slate-400" />
                            <span>{user.telefono}</span>
                          </div>
                        ) : (
                          <span className="block text-[10px] text-slate-400 mt-0.5">Sin teléfono</span>
                        )}
                      </td>

                      {/* Email */}
                      <td className="py-3 px-3.5 align-middle whitespace-nowrap">
                        <span className="font-mono text-slate-900 block text-xs">{user.email}</span>
                        <span className="text-[10px] text-slate-500 uppercase block mt-0.5">Idioma: {user.idioma}</span>
                      </td>

                      {/* Rol */}
                      <td className="py-3 px-3.5 align-middle whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap shadow-2xs ${
                          user.rol === 'Administrador'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200/80'
                            : user.rol === 'Dueño'
                            ? 'bg-amber-50 text-amber-900 border border-amber-200/80'
                            : user.rol === 'Recepcionista'
                            ? 'bg-sky-50 text-sky-800 border border-sky-200/80'
                            : user.rol.includes('Mantenimiento')
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {user.rol}
                        </span>
                      </td>

                      {/* Condos */}
                      <td className="py-3 px-3.5 align-middle whitespace-nowrap">
                        {condos.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-1">
                            {condos.map(condo => (
                              <span key={condo} className="inline-flex items-center px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 font-extrabold text-[10px] shadow-2xs whitespace-nowrap">
                                {condo}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Ninguna</span>
                        )}
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3.5 align-middle whitespace-nowrap text-slate-700">
                        <div className="text-xs text-slate-800 font-medium">
                          {user.ciudad ? `${user.ciudad}${user.estado_geo ? `, ${user.estado_geo}` : ''}` : 'Puerto Peñasco, Sonora'}
                        </div>
                        <span className="block text-[10px] text-slate-500 mt-0.5">
                          {user.codigo_postal ? `CP ${user.codigo_postal}` : 'Residente'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5 align-middle whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          {user.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 text-right align-middle whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditUser(user)}
                            className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Edit className="w-3 h-3 text-slate-500" />
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Eliminar al usuario ${user.nombre} ${user.apellido}?`)) {
                                deleteUsuario(user.id);
                              }
                            }}
                            className="p-1 rounded-md hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
