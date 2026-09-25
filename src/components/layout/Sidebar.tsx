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
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import logoImg from '../../assets/logoDashboard.png';
import logoIcon from '../../assets/logo.png';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    reservaciones,
    solicitudes,
    propiedades,
    resetToDefaults,
    isSidebarCollapsed,
    toggleSidebar
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
      badgeCount: inHouseCount > 0 ? inHouseCount : undefined,
      badgeColor: 'bg-teal-100 text-teal-800'
    },
    {
      id: 'calendar' as const,
      label: 'Calendario Timeline',
      icon: CalendarIcon,
    },
    {
      id: 'properties' as const,
      label: 'Propiedades & Torres',
      icon: Building2,
      badge: `${propiedades.length}`,
      badgeCount: propiedades.length,
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
      badgeCount: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 font-bold'
    },
    {
      id: 'reports' as const,
      label: 'Reportes de Entradas',
      icon: FileSpreadsheet,
    }
  ];

  return (
    <aside
      className={`${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      } transition-all duration-300 ease-in-out bg-white/95 backdrop-blur-md border-r border-slate-200/90 flex flex-col shrink-0 h-screen sticky top-0 z-40 shadow-xs no-print print:hidden select-none`}
    >
      {/* Brand Header */}
      {!isSidebarCollapsed ? (
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <img
              src={logoImg}
              alt="Las Palomas HOA Logo"
              className="w-full max-h-11 object-contain"
            />
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="Minimizar menú lateral"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="py-3 px-2 flex flex-col items-center gap-2 border-b border-slate-100 relative group">
          <img
            src={logoIcon}
            alt="Las Palomas HOA Logo"
            className="w-9 h-9 object-contain"
          />
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer"
            title="Expandir menú lateral"
          >
            <ChevronRight className="w-4 h-4 text-teal-700" />
          </button>

          {/* Header Tooltip on hover */}
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 ease-out hidden group-hover:block">
            <div className="relative px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold whitespace-nowrap shadow-2xl border border-slate-700/80">
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45 border-l border-b border-slate-700/80" />
              <span>Expandir menú lateral</span>
            </div>
          </div>
        </div>
      )}

      {/* Resort Mini Card */}
      {!isSidebarCollapsed ? (
        <div className="mx-3.5 my-3 p-2.5 rounded-xl bg-gradient-to-r from-teal-50/90 to-sky-50/70 border border-teal-100/90 flex items-center gap-3 relative overflow-hidden shadow-xs">
          <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-teal-200/80 shadow-xs">
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
      ) : (
        <div className="mx-auto my-2.5 flex justify-center relative group">
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-teal-200/80 shadow-xs cursor-help">
            <img
              src="/las_palomas_resort.jpg"
              alt="Las Palomas"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Resort Tooltip */}
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 ease-out hidden group-hover:block">
            <div className="relative px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs whitespace-nowrap shadow-2xl border border-slate-700/80">
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45 border-l border-b border-slate-700/80" />
              <p className="font-bold text-white">Las Palomas Resort</p>
              <p className="text-[10px] text-teal-300 font-semibold">Puerto Peñasco • 2026</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className={`py-2 flex-1 space-y-1.5 overflow-visible ${isSidebarCollapsed ? 'px-2.5' : 'px-3'}`}>
        {!isSidebarCollapsed && (
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Menú de Gestión
          </p>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (isSidebarCollapsed) {
            return (
              <div key={item.id} className="relative group flex justify-center">
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full h-11 flex items-center justify-center rounded-xl transition-all duration-150 relative cursor-pointer ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-700/20 font-bold'
                      : 'text-slate-600 hover:text-teal-700 hover:bg-slate-100/90'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-500 group-hover:text-teal-600'
                    }`}
                  />

                  {/* Notification Badge Dot in Collapsed Mode */}
                  {item.badge && (
                    <span
                      className={`absolute top-1.5 right-2 px-1 min-w-[15px] h-3.5 rounded-full text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white ${
                        isActive ? 'bg-amber-400 text-slate-950' : 'bg-teal-600 text-white shadow-xs'
                      }`}
                    >
                      {item.badgeCount && item.badgeCount > 9 ? '9+' : item.badgeCount || '•'}
                    </span>
                  )}
                </button>

                {/* Floating Popover Tooltip Badge on Hover */}
                <div className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 ease-out hidden group-hover:flex items-center">
                  <div className="relative px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold whitespace-nowrap shadow-2xl border border-slate-700/80 flex items-center gap-2">
                    {/* Tooltip Arrow Pointer */}
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45 border-l border-b border-slate-700/80" />
                    
                    <span>{item.label}</span>

                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        isActive ? 'bg-amber-300 text-slate-950' : 'bg-teal-500/30 text-teal-300 border border-teal-400/40'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors duration-150 group cursor-pointer ${
                isActive
                  ? 'bg-teal-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-600'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md font-semibold shrink-0 transition-colors ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Profile & Logout / Reset */}
      <div className={`border-t border-slate-100 bg-slate-50/80 ${isSidebarCollapsed ? 'p-2.5' : 'p-3.5'}`}>
        {!isSidebarCollapsed ? (
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
                className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={logout}
                title="Cerrar sesión"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 relative group">
            <div
              className="w-9 h-9 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-white shadow-xs cursor-pointer"
            >
              {currentUser?.nombre?.[0] || 'U'}{currentUser?.apellido?.[0] || 'A'}
            </div>

            {/* Profile Tooltip on Hover */}
            <div className="absolute left-full ml-3 top-2 z-50 pointer-events-none opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 ease-out hidden group-hover:block">
              <div className="relative px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs whitespace-nowrap shadow-2xl border border-slate-700/80">
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45 border-l border-b border-slate-700/80" />
                <p className="font-bold text-white">{currentUser?.nombre} {currentUser?.apellido}</p>
                <p className="text-[10px] text-teal-300 font-semibold">{currentUser?.rol || 'Personal HOA'}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 relative group/logout">
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Logout Tooltip on Hover */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 translate-x-1 group-hover/logout:opacity-100 group-hover/logout:translate-x-0 transition-all duration-150 ease-out hidden group-hover/logout:block">
                <div className="relative px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold whitespace-nowrap shadow-2xl border border-slate-700/80">
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45 border-l border-b border-slate-700/80" />
                  <span>Cerrar sesión</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
