import React, { useState, useMemo } from 'react';
import {
  Clock,
  Mail,
  Search,
  Download,
  Eye,
  RotateCcw,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { ComunicadoHistorial, CategoriaComunicado } from '../../types';

interface HistorialViewProps {
  comunicados: ComunicadoHistorial[];
  onOpenDetail: (comunicado: ComunicadoHistorial) => void;
  onReuse: (comunicado: ComunicadoHistorial) => void;
  onNewBroadcast: () => void;
}

const CATEGORY_LABELS: Record<CategoriaComunicado, string> = {
  AVISO_GENERAL: 'Aviso General',
  MANTENIMIENTO: 'Mantenimiento',
  ASAMBLEA: 'Asamblea',
  SEGURIDAD: 'Seguridad',
  PAGOS_HOA: 'Pagos HOA',
  EVENTO: 'Evento',
  URGENTE: 'Urgente'
};

export const HistorialView: React.FC<HistorialViewProps> = ({
  comunicados,
  onOpenDetail,
  onReuse,
  onNewBroadcast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');

  const filteredComunicados = useMemo(() => {
    return comunicados.filter(com => {
      const matchCat = selectedCategory === 'TODAS' || com.categoria === selectedCategory;
      const matchStatus = selectedStatus === 'TODOS' || com.estado === selectedStatus;
      
      const q = searchTerm.toLowerCase().trim();
      const matchSearch = !q ||
        com.asunto.toLowerCase().includes(q) ||
        com.criterio_detalle.toLowerCase().includes(q) ||
        com.remitente_nombre.toLowerCase().includes(q) ||
        com.destinatarios?.some(d => d.nombre.toLowerCase().includes(q) || d.email.toLowerCase().includes(q));

      return matchCat && matchStatus && matchSearch;
    });
  }, [comunicados, selectedCategory, selectedStatus, searchTerm]);

  const totalEnviados = comunicados.filter(c => c.estado === 'Enviado').length;
  const totalSimulados = comunicados.filter(c => c.estado === 'Simulado').length;
  const totalPropietariosImpactados = comunicados.reduce((acc, c) => acc + (c.total_destinatarios || 0), 0);

  const getCategoriaBadge = (cat: CategoriaComunicado) => {
    switch (cat) {
      case 'AVISO_GENERAL':
        return { label: 'Aviso General', bg: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'MANTENIMIENTO':
        return { label: 'Mantenimiento', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'ASAMBLEA':
        return { label: 'Asamblea', bg: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'SEGURIDAD':
        return { label: 'Seguridad', bg: 'bg-rose-50 text-rose-800 border-rose-200' };
      case 'PAGOS_HOA':
        return { label: 'Pagos HOA', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'EVENTO':
        return { label: 'Evento', bg: 'bg-teal-50 text-teal-800 border-teal-200' };
      case 'URGENTE':
        return { label: 'Urgente', bg: 'bg-red-100 text-red-800 border-red-300 font-bold' };
      default:
        return { label: cat, bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const exportToCSV = () => {
    if (comunicados.length === 0) return;
    const headers = ['ID,Fecha,Asunto,Categoria,Criterio,Destinatarios_Total,Remitente,Estado\n'];
    const rows = comunicados.map(c => 
      `"${c.id}","${c.fecha}","${c.asunto.replace(/"/g, '""')}","${c.categoria}","${c.criterio_detalle.replace(/"/g, '""')}","${c.total_destinatarios}","${c.remitente_nombre}","${c.estado}"`
    );
    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `historial_comunicados_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Comunicados</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900">{comunicados.length}</span>
              <span className="text-xs text-slate-500 font-medium">registros</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <Mail className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Envíos Reales SMTP</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-700">{totalEnviados}</span>
              <span className="text-xs text-slate-500 font-medium">({totalSimulados} simulados)</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Propietarios Impactados</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-teal-800">{totalPropietariosImpactados}</span>
              <span className="text-xs text-slate-500 font-medium">notificaciones</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
            <Layers className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Main Table Container */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        
        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por asunto, destinatario o remitente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl form-input"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl form-input text-xs font-semibold text-slate-700"
            >
              <option value="TODAS">Todas las Categorías</option>
              <option value="AVISO_GENERAL">Aviso General</option>
              <option value="MANTENIMIENTO">Mantenimiento</option>
              <option value="ASAMBLEA">Asamblea</option>
              <option value="SEGURIDAD">Seguridad</option>
              <option value="PAGOS_HOA">Pagos HOA</option>
              <option value="EVENTO">Evento</option>
              <option value="URGENTE">Urgente</option>
            </select>

            {/* Status Select */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl form-input text-xs font-semibold text-slate-700"
            >
              <option value="TODOS">Todos los Estados</option>
              <option value="Enviado">Enviado (SMTP)</option>
              <option value="Simulado">Simulado (Prueba)</option>
            </select>

            {/* Export */}
            <button
              type="button"
              onClick={exportToCSV}
              disabled={comunicados.length === 0}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* List / Table */}
        {filteredComunicados.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No se encontraron comunicados</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm || selectedCategory !== 'TODAS' || selectedStatus !== 'TODOS'
                ? 'No hay registros que coincidan con los filtros aplicados.'
                : 'Aún no has emitido ningún comunicado oficial.'}
            </p>
            <button
              type="button"
              onClick={onNewBroadcast}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              Redactar nuevo comunicado
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3.5">Fecha & Hora</th>
                  <th className="py-3 px-3.5">Asunto Oficial</th>
                  <th className="py-3 px-3.5">Categoría</th>
                  <th className="py-3 px-3.5">Audiencia / Criterio</th>
                  <th className="py-3 px-3.5 text-center">Destinatarios</th>
                  <th className="py-3 px-3.5">Estado</th>
                  <th className="py-3 px-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredComunicados.map(com => {
                  const badge = getCategoriaBadge(com.categoria);
                  const formattedDate = new Date(com.fecha).toLocaleString('es-MX', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <tr key={com.id} className="hover:bg-teal-50/30 transition-colors group">
                      <td className="py-3.5 px-3.5 whitespace-nowrap font-mono text-slate-600">
                        {formattedDate}
                      </td>
                      
                      <td className="py-3.5 px-3.5 font-bold text-slate-900 max-w-xs truncate group-hover:text-teal-900">
                        {com.asunto}
                      </td>

                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-3.5 text-slate-600 max-w-xs truncate">
                        {com.criterio_detalle}
                      </td>

                      <td className="py-3.5 px-3.5 text-center whitespace-nowrap font-black text-teal-800">
                        {com.total_destinatarios} <span className="text-[10px] font-normal text-slate-500">dueños</span>
                      </td>

                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                          com.estado === 'Enviado'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {com.estado}
                        </span>
                      </td>

                      <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenDetail(com)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Ver expediente detallado"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Detalle</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onReuse(com)}
                            className="p-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors cursor-pointer"
                            title="Clonar como nuevo comunicado"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
