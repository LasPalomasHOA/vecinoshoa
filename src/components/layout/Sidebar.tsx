import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  Calendar as CalendarIcon, 
  Users, 
  Home, 
  FileSpreadsheet, 
  FileCheck,
  RotateCcw,
  LogOut
} from 'lucide-react';
import { DatabaseStatusBadge } from '../common/DatabaseStatusBadge';

import logoImg from '../../assets/logo.png';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    reservaciones, 
    solicitudes, 
    propiedades, 
    resetToDefaults 
  } = useApp();

  const { currentUser, logout } = useAuth();

  const inHouseCount = reservaciones.filter(r => r.estado === 'En Casa (Checked-in)').length;
  const pendingRequestsCount = solicitudes.filter(s => s.estatus === 'Pendiente' || s.estatus === 'En Proceso').length;

  const navItems = [
    {
      id: 'frontdesk' as const,
      label: 'Front Desk & In-House',
      icon: Home,
      badge: inHouseCount > 0 ? `${inHouseCount} en casa` : undefined,
      badgeColor: 'bg-teal-100 text-teal-800'
    },
    {
      id: 'calendar' as const,
      label: 'Calendario Timeline',
      icon: CalendarIcon,
      badge: 'Gantt',
      badgeColor: 'bg-sky-100 text-sky-800'
    },
    {
      id: 'properties' as const,
      label: 'Propiedades & Torres',
      icon: Building2,
      badge: `${propiedades.length}`,
      badgeColor: 'bg-slate-100 text-slate-700'
    },
    {
      id: 'users' as const,
      label: 'Residentes & Personal',
      icon: Users,
    },
    {
      id: 'requests' as const,
      label: 'Solicitudes de Acceso',
      icon: FileCheck,
      badge: pendingRequestsCount > 0 ? `${pendingRequestsCount}` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 font-bold'
    },
    {
      id: 'reports' as const,
      label: 'Reportes de Entradas',
      icon: FileSpreadsheet,
    }
  ];

  return (
    <aside className="w-64 bg-white/95 backdrop-blur-md border-r border-slate-200/90 flex flex-col shrink-0 h-screen sticky top-0 z-40 shadow-xs no-print print:hidden">
      
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-center">
        <img 
          src={logoImg} 
          alt="Las Palomas HOA Logo" 
          className="w-full max-h-12 object-contain"
        />
      </div>

      {/* Resort Mini Card with Glass styling */}
      <div className="mx-4 my-3 p-3 rounded-2xl bg-gradient-to-r from-teal-50/90 to-sky-50/70 border border-teal-100/90 flex items-center gap-3 relative overflow-hidden shadow-xs">
        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-teal-200/80 shadow-xs">
          <img 
            src="/las_palomas_resort.jpg" 
            alt="Las Palomas" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-teal-950 truncate">Puerto Peñasco, SON</p>
          <p className="text-[10px] text-teal-700 font-semibold">Temporada Activa 2026</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="px-3 py-2 flex-1 overflow-y-auto space-y-1">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Menú de Gestión
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-600'
                }`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                  isActive ? 'bg-white/20 text-white' : item.badgeColor
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Profile, DB Status & Logout / Reset */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/80 space-y-2.5">
        <DatabaseStatusBadge />
        
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-white shadow-xs shrink-0">
              {currentUser?.nombre?.[0] || 'U'}{currentUser?.apellido?.[0] || 'A'}
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs font-bold text-slate-800 leading-tight truncate">
                {currentUser?.nombre} {currentUser?.apellido}
              </p>
              <p className="text-[10px] text-teal-700 font-semibold truncate">
                {currentUser?.rol || 'Personal HOA'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={resetToDefaults}
              title="Restablecer catálogo demo oficial"
              className="p-1.5 rounded-xl text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

    </aside>
  );
};
