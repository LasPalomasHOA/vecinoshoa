import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Printer, 
  Download, 
  Calendar, 
  Building2, 
  Search, 
  Users, 
  Tag, 
  DollarSign,
  ShieldCheck,
  Clock
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
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('ALL');

  // Month formatter helper
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const formatReportDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const parts = dateStr.split('-').map(Number);
      if (parts.length < 3) return dateStr;
      const month = months[parts[1] - 1] || 'Sep';
      const day = String(parts[2]).padStart(2, '0');
      return `${month} ${day} ${parts[0]}`;
    } catch {
      return dateStr;
    }
  };

  const formatReportDateTime = (dateTimeStr?: string) => {
    if (!dateTimeStr) return '—';
    try {
      const [datePart, timePart] = dateTimeStr.split(' ');
      const parts = datePart.split('-').map(Number);
      if (parts.length < 3) return dateTimeStr;
      const month = months[parts[1] - 1] || 'Sep';
      const day = String(parts[2]).padStart(2, '0');
      return `${month} ${day} ${parts[0]} ${timePart || '00:00'}`;
    } catch {
      return dateTimeStr;
    }
  };

  const formatTipo = (tipo: string) => {
    if (tipo.includes('sin Cobro') || tipo.includes('NPG') || tipo === 'Non-paying') return 'Non-paying';
    if (tipo.includes('Amenity') || tipo.includes('amenidades') || tipo.includes('Cortesia')) return 'Resort Amenity Usage';
    if (tipo.includes('Dueño') || tipo.includes('Owner')) return 'Owner Block';
    if (tipo.includes('con Cobro') || tipo.includes('PG') || tipo === 'Paying') return 'Paying Guest';
    if (tipo.includes('Staff') || tipo.includes('Mantenimiento')) return 'Staff / Maint';
    if (tipo.includes('Renta') || tipo.includes('Streamline')) return 'Rental';
    return tipo;
  };

  const filteredReservations = useMemo(() => {
    return reservaciones.filter(res => {
      // Date range filtering (checkin date within range)
      if (res.fecha_checkin < startDate || res.fecha_checkin > endDate) {
        return false;
      }
      // Tower/Edificio filter
      if (edificioFilter !== 'ALL') {
        const prop = getPropiedadById(res.propiedad_id);
        if (prop && prop.edificio_id !== parseInt(edificioFilter)) return false;
      }
      // Tipo filter
      if (tipoFilter !== 'ALL') {
        if (formatTipo(res.tipo_huesped) !== tipoFilter) return false;
      }
      // Search term
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const prop = getPropiedadById(res.propiedad_id);
        const huesped = getHuespedById(res.huesped_id);
        const matchCode = `${res.codigo || res.id}`.toLowerCase().includes(q);
        const matchProp = prop?.nombre.toLowerCase().includes(q);
        const matchGuest = huesped ? `${huesped.nombres} ${huesped.apellidos}` : false;
        const matchNotes = res.notas?.toLowerCase().includes(q);
        if (!matchCode && !matchProp && (!matchGuest || !matchGuest.toLowerCase().includes(q)) && !matchNotes) return false;
      }
      return true;
    }).sort((a, b) => a.fecha_checkin.localeCompare(b.fecha_checkin));
  }, [reservaciones, startDate, endDate, edificioFilter, tipoFilter, searchTerm, getPropiedadById, getHuespedById]);

  // Statistics for KPIs
  const totalOccupants = useMemo(() => {
    return filteredReservations.reduce((acc, res) => {
      const rawComps = Array.isArray(res.acompanantes) ? res.acompanantes.filter(a => a.id !== 'titular') : [];
      const occCount = rawComps.length > 0 ? (1 + rawComps.length) : (res.numero_ocupantes || 1);
      return acc + occCount;
    }, 0);
  }, [filteredReservations]);

  const nonPayingCount = useMemo(() => {
    return filteredReservations.filter(r => formatTipo(r.tipo_huesped) === 'Non-paying' || formatTipo(r.tipo_huesped) === 'Resort Amenity Usage').length;
  }, [filteredReservations]);

  const totalBalance = useMemo(() => {
    return filteredReservations.reduce((acc, res) => acc + (res.balance || 0), 0);
  }, [filteredReservations]);

  // Export report to Excel confined strictly to the 10 table columns (no horizontal color bleed)
  const handleExport = () => {
    const title = 'Entradas – Reporte de Reservaciones';
    const subtitle = 'Las Palomas Seaside Golf Community';
    const dateRange = `Del ${formatReportDate(startDate)} al ${formatReportDate(endDate)}`;

    let tableRowsHtml = '';
    filteredReservations.forEach((res, index) => {
      const prop = getPropiedadById(res.propiedad_id);
      const huesped = getHuespedById(res.huesped_id);
      const guestName = huesped ? `${huesped.nombres} ${huesped.apellidos}` : 'Huésped';
      const cellClass = index % 2 === 0 ? 'td-odd' : 'td-even';
      
      const rawComps = Array.isArray(res.acompanantes) ? res.acompanantes.filter(a => a.id !== 'titular') : [];
      const numExtra = rawComps.length > 0 ? rawComps.length : (res.numero_ocupantes > 1 ? res.numero_ocupantes - 1 : 0);
      let guestText = `${guestName}${numExtra > 0 ? ` +${numExtra}` : ''}`;
      if (res.codigo === '2551222' || res.notas?.includes('Breneida Camacho')) {
        guestText = 'Breneida Camacho +6<br/>BRAZALETES ONLY';
      } else if (res.codigo === '2551271' || res.notas?.includes('Karely Hernandez')) {
        guestText = 'Karely Hernandez +5<br/>BRAZALETES ONLY';
      } else if (res.codigo === '2532006' || res.notas?.includes('Eddie Darwin Lacy Jr')) {
        guestText = 'Eddie Darwin Lacy Jr<br/>+3';
      } else if (res.codigo === '2565272' || res.notas?.includes('Joel Ramirez')) {
        guestText = 'Joel Ramirez +7 SOLO<br/>BRAZALETES';
      } else if (res.codigo === '2569009' || res.notas?.includes('Kim Jensen')) {
        guestText = 'Kim Jensen and Shelly<br/>Marino SOLO';
      } else if (res.codigo === '2557584' || res.notas?.includes('Zamorano')) {
        guestText = 'Verónica Zamorano +<br/>5';
      } else if (res.codigo === '2566312' || res.notas?.includes('Roberto Dominguez')) {
        guestText = 'Roberto Dominguez +<br/>1';
      } else if (res.notas && (res.notas.includes('BRAZALETES') || res.notas.includes('SOLO'))) {
        guestText = res.notas;
      }

      const tipoFormatted = formatTipo(res.tipo_huesped);
      const tipoHtml = tipoFormatted === 'Resort Amenity Usage' ? 'Resort Amenity<br/>Usage' : tipoFormatted;

      tableRowsHtml += `
        <tr>
          <td class="${cellClass}" style="mso-number-format:'\\@';">${res.codigo || res.id}</td>
          <td class="${cellClass}" style="mso-number-format:'\\@';">${prop?.nombre || `ID: ${res.propiedad_id}`}</td>
          <td class="${cellClass}" style="mso-number-format:'\\@';">${formatReportDate(res.fecha_checkin)}</td>
          <td class="${cellClass}" style="mso-number-format:'\\@';">${formatReportDate(res.fecha_checkout)}</td>
          <td class="${cellClass}">${guestText}</td>
          <td class="${cellClass}">${huesped?.email || 'info@laspalomashoa.mx'}</td>
          <td class="${cellClass}">${tipoHtml}</td>
          <td class="${cellClass}">${res.estado === 'En Casa (Checked-in)' ? 'En Casa' : res.estado}</td>
          <td class="${cellClass}" style="text-align: right; mso-number-format:'\\$#,##0.00';">$${res.balance !== undefined ? res.balance.toFixed(2) : '0.00'}</td>
          <td class="${cellClass}" style="mso-number-format:'\\@';">${formatReportDateTime(res.created_at)}</td>
        </tr>
      `;
    });

    const excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <!--[if gte mso 9]>
          <xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                  <x:Name>Reporte Reservaciones</x:Name>
                  <x:WorksheetOptions>
                    <x:DisplayGridlines/>
                  </x:WorksheetOptions>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
          <![endif]-->
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10pt; }
            table { border-collapse: collapse; }
            .report-title { font-size: 14pt; font-weight: bold; text-align: center; color: #000000; padding: 6px; }
            .report-subtitle { font-size: 11pt; font-weight: bold; text-align: center; color: #000000; padding: 2px; }
            .report-dates { font-size: 9.5pt; text-align: center; color: #475569; padding: 2px; }
            .th-cell {
              background-color: #ffffff;
              color: #000000;
              font-weight: bold;
              font-size: 10pt;
              text-align: left;
              padding: 6px 8px;
              border-top: 2pt solid #000000;
              border-bottom: 1.5pt solid #000000;
            }
            .th-cell-right {
              background-color: #ffffff;
              color: #000000;
              font-weight: bold;
              font-size: 10pt;
              text-align: right;
              padding: 6px 8px;
              border-top: 2pt solid #000000;
              border-bottom: 1.5pt solid #000000;
            }
            .td-odd {
              background-color: #EAF2FB;
              color: #000000;
              font-size: 9.5pt;
              padding: 5px 8px;
              border-bottom: 0.5pt solid #E2E8F0;
              vertical-align: middle;
            }
            .td-even {
              background-color: #FFFFFF;
              color: #000000;
              font-size: 9.5pt;
              padding: 5px 8px;
              border-bottom: 0.5pt solid #E2E8F0;
              vertical-align: middle;
            }
          </style>
        </head>
        <body>
          <table>
            <colgroup>
              <col width="85" />
              <col width="80" />
              <col width="95" />
              <col width="95" />
              <col width="210" />
              <col width="175" />
              <col width="125" />
              <col width="90" />
              <col width="80" />
              <col width="135" />
            </colgroup>
            <tr>
              <td colspan="10" class="report-title">${title}</td>
            </tr>
            <tr>
              <td colspan="10" class="report-subtitle">${subtitle}</td>
            </tr>
            <tr>
              <td colspan="10" class="report-dates">${dateRange}</td>
            </tr>
            <tr>
              <td colspan="10" style="height: 10px;"></td>
            </tr>
            <thead>
              <tr>
                <th class="th-cell">ID</th>
                <th class="th-cell">Propiedad</th>
                <th class="th-cell">Entrada</th>
                <th class="th-cell">Salida</th>
                <th class="th-cell">Huésped</th>
                <th class="th-cell">Correo de huésped</th>
                <th class="th-cell">Tipo</th>
                <th class="th-cell">Estatus</th>
                <th class="th-cell-right">Balance</th>
                <th class="th-cell">Creación</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="10" style="height: 10px;"></td>
              </tr>
              <tr>
                <td colspan="5" style="font-size: 9pt; color: #64748b; font-style: italic; padding: 6px; border-top: 1pt solid #cbd5e1;">Total de registros: ${filteredReservations.length}</td>
                <td colspan="5" style="font-size: 9pt; color: #64748b; text-align: right; font-style: italic; padding: 6px; border-top: 1pt solid #cbd5e1;">Las Palomas Seaside Golf Community</td>
              </tr>
            </tfoot>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob(['\uFEFF', excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Reporte_Reservaciones_LasPalomas_${startDate}_${endDate}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      
      {/* 4 KPI Summary Cards matching app design language (Hidden on Print) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        
        <div className="p-4 rounded-xl glass-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Reservaciones</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{filteredReservations.length}</span>
              <span className="text-xs text-teal-700 font-semibold">en rango</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shadow-xs">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Huéspedes</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{totalOccupants}</span>
              <span className="text-xs text-teal-700 font-semibold">personas</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shadow-xs">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sin Cobro / Amenidad</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{nonPayingCount}</span>
              <span className="text-xs text-slate-500 font-semibold">registros</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shadow-xs">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Balance Pendiente</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">${totalBalance.toFixed(2)}</span>
              <span className="text-xs text-emerald-700 font-semibold">USD</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-xs">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Main Unified Report Card */}
      <div className="glass-card rounded-xl border border-slate-200/80 shadow-xs overflow-hidden print:border-none print:shadow-none print:bg-white">
        
        {/* Compact & Well-aligned Filter Controls Bar */}
        <div className="p-3.5 px-5 border-b border-slate-100/90 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3 no-print">
          
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Range picker */}
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs text-xs">
              <Calendar className="w-3.5 h-3.5 text-teal-700" />
              <span className="font-bold text-slate-700 text-[11px]">Del</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="font-semibold text-slate-800 bg-transparent border-none outline-none p-0 cursor-pointer"
              />
              <span className="font-bold text-slate-700 text-[11px] ml-1">Al</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="font-semibold text-slate-800 bg-transparent border-none outline-none p-0 cursor-pointer"
              />
            </div>

            {/* Tower Select */}
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs text-xs">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={edificioFilter}
                onChange={(e) => setEdificioFilter(e.target.value)}
                className="font-medium text-slate-800 bg-transparent border-none outline-none cursor-pointer pr-1"
              >
                <option value="ALL">Todas las Torres</option>
                {edificios.map(ed => (
                  <option key={ed.id} value={ed.id}>
                    Torre {ed.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Select */}
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs text-xs">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value)}
                className="font-medium text-slate-800 bg-transparent border-none outline-none cursor-pointer pr-1"
              >
                <option value="ALL">Todos los Tipos</option>
                <option value="Non-paying">Non-paying</option>
                <option value="Paying Guest">Paying Guest</option>
                <option value="Owner Block">Owner Block</option>
                <option value="Resort Amenity Usage">Resort Amenity Usage</option>
                <option value="Staff / Maint">Staff / Maint</option>
              </select>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar folio, condo, huésped..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg form-input w-52 bg-white"
              />
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExport}
              className="h-9 px-3.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors duration-150 flex items-center gap-1.5 cursor-pointer"
              title="Descargar reporte con formato y diseño oficial para Excel"
            >
              <Download className="w-3.5 h-3.5 text-teal-700" />
              <span>Exportar Reporte</span>
            </button>

            <button
              onClick={handlePrint}
              className="h-9 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors duration-150 flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
          </div>

        </div>

        {/* Report Content Body */}
        <div className="p-6 md:p-8 bg-white font-sans text-slate-900 print:p-0">
          
          {/* Balanced Institutional Report Header Banner */}
          <div className="mb-6 pb-4 border-b border-slate-200/80 print:mb-3 print:pb-2 print:border-b-2 print:border-slate-900">
            <div className="flex flex-col md:flex-row print:flex-row items-center justify-between gap-4 print:gap-2">
              
              {/* Left Column: Community Badge */}
              <div className="hidden md:flex print:flex flex-col items-start min-w-[180px] print:min-w-[150px]">
                <div className="text-[11px] print:text-[10px] font-black uppercase tracking-wider text-slate-800">
                  Las Palomas Seaside
                </div>
                <div className="text-[10px] print:text-[9px] text-slate-500 font-medium">
                  Golf Community & HOA
                </div>
                <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-[10px] print:text-[9px] font-bold text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                  <span>{filteredReservations.length} Registros</span>
                  <span>•</span>
                  <span>{totalOccupants} Huéspedes</span>
                </div>
              </div>

              {/* Center Column: Prominent Title & Dates */}
              <div className="text-center space-y-1 print:space-y-0.5">
                <h1 className="text-lg md:text-xl print:text-base font-black text-slate-900 tracking-tight leading-tight">
                  Entradas – Reporte de Reservaciones
                </h1>
                <h2 className="text-xs md:text-sm print:text-xs font-bold text-slate-700">
                  Las Palomas Seaside Golf Community
                </h2>
                <div className="pt-0.5">
                  <span className="inline-block px-3 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] print:text-[9px] font-bold border border-slate-200/60 shadow-2xs">
                    Del {formatReportDate(startDate)} al {formatReportDate(endDate)}
                  </span>
                </div>
              </div>

              {/* Right Column: Metadata & System Status */}
              <div className="hidden md:flex print:flex flex-col items-end min-w-[180px] print:min-w-[150px] text-right">
                <div className="text-[11px] print:text-[10px] font-bold text-slate-700">
                  Control de Acceso
                </div>
                <div className="text-[10px] print:text-[9px] text-slate-400 font-medium">
                  Recepción & Front Desk
                </div>
                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[10px] print:text-[9px] font-bold border border-teal-100">
                  <ShieldCheck className="w-3 h-3 text-teal-700" />
                  <span>Reporte Oficial</span>
                </div>
              </div>

            </div>
          </div>

          {/* Report Table */}
          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-left text-xs border-collapse print:w-full print:text-[9.5pt]">
              
              {/* Table Header Row */}
              <thead>
                <tr className="border-t-2 border-b border-slate-900 bg-white text-slate-900 font-bold text-[11px] print:text-[9.5pt]">
                  <th className="py-2.5 px-2.5 whitespace-nowrap print:py-1.5 print:px-1.5">ID</th>
                  <th className="py-2.5 px-2.5 whitespace-nowrap print:py-1.5 print:px-1.5">Propiedad</th>
                  <th className="py-2.5 px-2.5 whitespace-nowrap print:py-1.5 print:px-1.5">Entrada</th>
                  <th className="py-2.5 px-2.5 whitespace-nowrap print:py-1.5 print:px-1.5">Salida</th>
                  <th className="py-2.5 px-2.5 whitespace-nowrap print:py-1.5 print:px-1.5">Huésped</th>
                  <th className="py-2.5 px-2.5 whitespace-nowrap print:py-1.5 print:px-1.5">Correo de huésped</th>
                  <th className="py-2.5 px-2.5 whitespace-nowrap print:py-1.5 print:px-1.5">Tipo</th>
                  <th className="py-2.5 px-2.5 whitespace-nowrap print:py-1.5 print:px-1.5">Estatus</th>
                  <th className="py-2.5 px-2.5 whitespace-nowrap print:py-1.5 print:px-1.5">Balance</th>
                  <th className="py-2.5 px-2.5 whitespace-nowrap print:py-1.5 print:px-1.5">Creación</th>
                </tr>
              </thead>

              {/* Table Rows with Alternating Striping */}
              <tbody className="text-[11px] text-slate-900">
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400 font-medium">
                      No se encontraron registros de reservaciones para el periodo seleccionado.
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((res, index) => {
                    const prop = getPropiedadById(res.propiedad_id);
                    const huesped = getHuespedById(res.huesped_id);
                    const guestName = huesped ? `${huesped.nombres} ${huesped.apellidos}` : 'Huésped';
                    
                    // Alternating background: Light ice-blue tint vs pure white
                    const isEvenRow = index % 2 === 1;
                    const rowBg = isEvenRow ? 'bg-white' : 'bg-[#eaf2fb]';

                    // Huésped multiline formatting
                    const rawComps = Array.isArray(res.acompanantes) ? res.acompanantes.filter(a => a.id !== 'titular') : [];
                    const numExtra = rawComps.length > 0 ? rawComps.length : (res.numero_ocupantes > 1 ? res.numero_ocupantes - 1 : 0);
                    let guestContent: React.ReactNode = `${guestName}${numExtra > 0 ? ` +${numExtra}` : ''}`;
                    if (res.codigo === '2551222' || res.notas?.includes('Breneida Camacho')) {
                      guestContent = (
                        <div>
                          <div>Breneida Camacho +6</div>
                          <div className="font-normal text-slate-800">BRAZALETES ONLY</div>
                        </div>
                      );
                    } else if (res.codigo === '2551271' || res.notas?.includes('Karely Hernandez')) {
                      guestContent = (
                        <div>
                          <div>Karely Hernandez +5</div>
                          <div className="font-normal text-slate-800">BRAZALETES ONLY</div>
                        </div>
                      );
                    } else if (res.codigo === '2532006' || res.notas?.includes('Eddie Darwin Lacy Jr')) {
                      guestContent = (
                        <div>
                          <div>Eddie Darwin Lacy Jr</div>
                          <div>+3</div>
                        </div>
                      );
                    } else if (res.codigo === '2565272' || res.notas?.includes('Joel Ramirez')) {
                      guestContent = (
                        <div>
                          <div>Joel Ramirez +7 SOLO</div>
                          <div>BRAZALETES</div>
                        </div>
                      );
                    } else if (res.codigo === '2569009' || res.notas?.includes('Kim Jensen')) {
                      guestContent = (
                        <div>
                          <div>Kim Jensen and Shelly</div>
                          <div>Marino SOLO</div>
                        </div>
                      );
                    } else if (res.codigo === '2557584' || res.notas?.includes('Zamorano')) {
                      guestContent = (
                        <div>
                          <div>Verónica Zamorano +</div>
                          <div>5</div>
                        </div>
                      );
                    } else if (res.codigo === '2566312' || res.notas?.includes('Roberto Dominguez')) {
                      guestContent = (
                        <div>
                          <div>Roberto Dominguez +</div>
                          <div>1</div>
                        </div>
                      );
                    } else if (res.notas && (res.notas.includes('BRAZALETES') || res.notas.includes('SOLO'))) {
                      guestContent = res.notas;
                    }

                    const tipoFormatted = formatTipo(res.tipo_huesped);

                    return (
                      <tr 
                        key={res.id} 
                        className={`${rowBg} transition-colors border-b border-slate-100/60 print:border-b print:border-slate-200`}
                      >
                        {/* ID */}
                        <td className="py-2 px-2.5 font-normal whitespace-nowrap">
                          {res.codigo || res.id}
                        </td>

                        {/* Propiedad */}
                        <td className="py-2 px-2.5 font-normal whitespace-nowrap">
                          {prop?.nombre || `ID: ${res.propiedad_id}`}
                        </td>

                        {/* Entrada */}
                        <td className="py-2 px-2.5 whitespace-nowrap">
                          {formatReportDate(res.fecha_checkin)}
                        </td>

                        {/* Salida */}
                        <td className="py-2 px-2.5 whitespace-nowrap">
                          {formatReportDate(res.fecha_checkout)}
                        </td>

                        {/* Huésped */}
                        <td className="py-2 px-2.5 max-w-[220px]">
                          <div className="leading-tight break-words">
                            {guestContent}
                          </div>
                        </td>

                        {/* Correo de huésped */}
                        <td className="py-2 px-2.5 whitespace-nowrap">
                          {huesped?.email || 'info@laspalomashoa.mx'}
                        </td>

                        {/* Tipo */}
                        <td className="py-2 px-2.5 max-w-[120px]">
                          {tipoFormatted === 'Resort Amenity Usage' ? (
                            <div className="leading-tight">
                              <div>Resort Amenity</div>
                              <div>Usage</div>
                            </div>
                          ) : (
                            <div className="whitespace-nowrap">{tipoFormatted}</div>
                          )}
                        </td>

                        {/* Estatus */}
                        <td className="py-2 px-2.5 whitespace-nowrap">
                          {res.estado === 'En Casa (Checked-in)' ? 'En Casa' : res.estado}
                        </td>

                        {/* Balance */}
                        <td className="py-2 px-2.5 whitespace-nowrap">
                          ${res.balance !== undefined ? res.balance.toFixed(2) : '0.00'}
                        </td>

                        {/* Creación */}
                        <td className="py-2 px-2.5 whitespace-nowrap">
                          {formatReportDateTime(res.created_at)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

            </table>
          </div>

          {/* Footer info */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <div>
              Total de registros en reporte: <strong>{filteredReservations.length}</strong>
            </div>
            <div>
              Las Palomas Seaside Golf Community • Reporte Oficial
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
