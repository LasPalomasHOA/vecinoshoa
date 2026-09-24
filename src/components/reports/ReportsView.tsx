import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Printer, 
  Download, 
  Calendar, 
  Building2, 
  Waves 
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { 
    reservaciones, 
    edificios, 
    getPropiedadById, 
    getHuespedById 
  } = useApp();

  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-30');
  const [edificioFilter, setEdificioFilter] = useState('ALL');

  const filteredReservations = reservaciones.filter(res => {
    if (res.fecha_checkin < startDate || res.fecha_checkin > endDate) {
      return false;
    }
    if (edificioFilter !== 'ALL') {
      const prop = getPropiedadById(res.propiedad_id);
      if (prop && prop.edificio_id !== parseInt(edificioFilter)) return false;
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Propiedad', 'Entrada', 'Salida', 'Huésped', 'Correo', 'Tipo', 'Estatus', 'Balance', 'Brazaletes', 'Creación'];
    const rows = filteredReservations.map(res => {
      const prop = getPropiedadById(res.propiedad_id);
      const huesped = getHuespedById(res.huesped_id);
      const guestName = huesped ? `${huesped.nombres} ${huesped.apellidos}` : 'N/A';
      return [
        res.codigo || res.id,
        prop?.nombre || res.propiedad_id,
        res.fecha_checkin,
        res.fecha_checkout,
        `"${guestName}"`,
        huesped?.email || 'info@laspalomashoa.mx',
        `"${res.tipo_huesped}"`,
        res.estado,
        `$${res.balance || '0.00'}`,
        `"${res.brazaletes || ''}"`,
        res.created_at || ''
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Reporte_Reservaciones_LasPalomas_${startDate}_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      
      {/* Filters Toolbar (Hidden on Print) */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-700" />
            <span className="text-xs font-bold text-slate-700">Rango:</span>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-[11px] text-slate-500 font-medium">Del</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg form-input font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-[11px] text-slate-500 font-medium">Al</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg form-input font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={edificioFilter}
              onChange={(e) => setEdificioFilter(e.target.value)}
              className="px-3 py-1 text-xs rounded-lg form-input font-medium cursor-pointer"
            >
              <option value="ALL">Todas las Torres</option>
              {edificios.map(ed => (
                <option key={ed.id} value={ed.id}>
                  Torre {ed.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-teal-700" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Reporte</span>
          </button>
        </div>

      </div>

      {/* Official White Paper Report */}
      <div className="p-8 rounded-xl bg-white border border-slate-200/90 shadow-sm space-y-6 print-card">
        
        {/* Header */}
        <div className="text-center border-b border-slate-200 pb-5 relative">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Waves className="w-6 h-6 text-teal-700" />
            <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
              Entradas - Reporte de Reservaciones
            </h1>
          </div>
          <h2 className="text-sm font-bold text-teal-800">
            Las Palomas Seaside Golf Community • Puerto Peñasco
          </h2>
          <p className="text-xs font-mono text-slate-500 mt-1">
            Del {startDate} al {endDate}
          </p>

          <div className="absolute top-0 right-0 hidden sm:block text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Registros</span>
            <span className="text-base font-mono font-bold text-teal-800">{filteredReservations.length}</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Folio</th>
                <th className="py-2.5 px-3">Propiedad</th>
                <th className="py-2.5 px-3">Entrada</th>
                <th className="py-2.5 px-3">Salida</th>
                <th className="py-2.5 px-3">Huésped Titular</th>
                <th className="py-2.5 px-3">Correo</th>
                <th className="py-2.5 px-3">Tipo de Entrada</th>
                <th className="py-2.5 px-3">Estatus</th>
                <th className="py-2.5 px-3">Balance</th>
                <th className="py-2.5 px-3">Creación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No hay registros en el rango seleccionado.
                  </td>
                </tr>
              ) : (
                filteredReservations.map(res => {
                  const prop = getPropiedadById(res.propiedad_id);
                  const huesped = getHuespedById(res.huesped_id);

                  return (
                    <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-teal-800">{res.codigo || res.id}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{prop?.nombre}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{res.fecha_checkin}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{res.fecha_checkout}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {huesped ? `${huesped.nombres} ${huesped.apellidos}` : 'N/A'}
                        {res.brazaletes && (
                          <span className="block text-[10px] text-teal-700 font-mono font-normal">
                            {res.brazaletes}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 text-[10px]">
                        {huesped?.email || 'info@laspalomashoa.mx'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 text-[11px]">{res.tipo_huesped}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-[10px] text-slate-800">{res.estado}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">${res.balance || '0.00'}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500 text-[10px]">{res.created_at || '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
          <p>Documento generado electrónicamente por Las Palomas HOA Hub</p>
          <p>Página 1 de 1</p>
        </div>

      </div>

    </div>
  );
};
