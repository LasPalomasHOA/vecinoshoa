import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, 
  Plus, 
  ChevronRight,
  Sparkles,
  CalendarCheck,
  UserCheck
} from 'lucide-react';

interface NavbarProps {
  onOpenNewReservation: () => void;
  onOpenNewProperty: () => void;
  onOpenNewRequest: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenNewReservation, 
  onOpenNewProperty,
  onOpenNewRequest 
}) => {
  const { 
    activeTab, 
    searchQuery, 
    setSearchQuery
  } = useApp();

  const { currentUser } = useAuth();

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case 'frontdesk': return 'Front Desk & Recepción In-House';
      case 'calendar': return 'Calendario de Ocupación Timeline';
      case 'properties': return 'Directorio de Propiedades & Torres';
      case 'users': return 'Directorio de Residentes & Personal';
      case 'requests': return 'Pases de Trabajo & Solicitudes';
      case 'reports': return 'Reporte Oficial de Reservaciones';
    }
  };

  return (
    <header className="sticky top-0 z-30 glass-header px-6 py-3.5 flex items-center justify-between gap-4 border-b border-slate-200/80 shadow-xs no-print print:hidden">
      
      {/* Breadcrumbs & Active Title */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="hover:text-teal-700 cursor-pointer font-semibold text-slate-600">Principal</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-teal-800 bg-teal-50/80 px-2 py-0.5 rounded-lg border border-teal-100">
            {getBreadcrumbTitle()}
          </span>
        </div>
      </div>

      {/* Global Quick Search */}
      <div className="flex-1 max-w-md mx-2">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por condo (A 101, F 202), huésped, placas o brazalete..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl form-input shadow-xs placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full w-4 h-4 flex items-center justify-center"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-semibold text-teal-800 bg-teal-50/60 px-2.5 py-1.5 rounded-xl border border-teal-100">
          <CalendarCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>24 Sep 2026</span>
        </div>

        {currentUser && (
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200/80 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
            <span className="font-bold text-slate-800 truncate max-w-[120px]">{currentUser.nombre}</span>
            <span className="text-[10px] bg-white px-1.5 py-0.5 rounded-md font-semibold text-teal-700 border border-slate-200">
              {currentUser.rol}
            </span>
          </div>
        )}

        {activeTab === 'frontdesk' || activeTab === 'calendar' ? (
          <button
            onClick={onOpenNewReservation}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors duration-150 cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Nueva Reservación</span>
          </button>
        ) : activeTab === 'properties' ? (
          <button
            onClick={onOpenNewProperty}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors duration-150 cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Nueva Propiedad</span>
          </button>
        ) : activeTab === 'requests' ? (
          <button
            onClick={onOpenNewRequest}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors duration-150 cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Nuevo Pase</span>
          </button>
        ) : null}
      </div>

    </header>
  );
};
