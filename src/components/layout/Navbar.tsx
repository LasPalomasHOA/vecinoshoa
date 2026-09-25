import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, 
  ChevronRight,
  CalendarCheck,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    activeTab, 
    searchQuery, 
    setSearchQuery,
    isSidebarCollapsed,
    toggleSidebar
  } = useApp();

  const { currentUser } = useAuth();

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case 'frontdesk': return 'Front Desk & In-House';
      case 'calendar': return 'Calendario Timeline';
      case 'properties': return 'Propiedades & Torres';
      case 'users': return 'Residentes & Personal';
      case 'requests': return 'Solicitudes de Acceso';
      case 'reports': return 'Reportes de Entradas';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-3 border-b border-slate-200/80 shadow-xs no-print print:hidden">
      
      {/* Sidebar Toggle & Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-slate-100/90 transition-colors cursor-pointer"
          title={isSidebarCollapsed ? "Expandir menú lateral" : "Minimizar menú lateral"}
          aria-label={isSidebarCollapsed ? "Expandir menú lateral" : "Minimizar menú lateral"}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-teal-700" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate max-w-[200px] sm:max-w-xs">
          <span className="font-semibold text-slate-600 shrink-0 hidden sm:inline">Principal</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:inline" />
          <span className="font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200/60 truncate">
            {getBreadcrumbTitle()}
          </span>
        </div>
      </div>

      {/* Global Quick Search */}
      <div className="flex-1 max-w-md mx-1 sm:mx-2">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por condo (A 101, F 202), huésped, placas o brazalete..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-8 text-xs rounded-lg form-input shadow-xs placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full w-4 h-4 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right User & System Badges */}
      <div className="shrink-0 flex items-center justify-end gap-2.5">
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-semibold text-teal-800 bg-teal-50/80 h-9 px-3 rounded-lg border border-teal-100">
          <CalendarCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span>24 Sep 2026</span>
        </div>

        {currentUser && (
          <div className="flex items-center gap-2 h-9 px-3 rounded-lg bg-slate-100/90 border border-slate-200/80 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 shrink-0" />
            <span className="font-bold text-slate-800 truncate max-w-[110px]">{currentUser.nombre}</span>
            <span className="text-[10px] bg-white px-1.5 py-0.5 rounded-md font-semibold text-teal-700 border border-slate-200 shrink-0 hidden sm:inline">
              {currentUser.rol}
            </span>
          </div>
        )}
      </div>

    </header>
  );
};
