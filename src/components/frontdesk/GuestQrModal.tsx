import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useApp } from '../../context/AppContext';
import { Reservacion } from '../../types';
import { 
  X, 
  Printer, 
  Download, 
  Share2, 
  CheckCircle, 
  Calendar, 
  Building2, 
  User, 
  Users, 
  Tag, 
  Car, 
  Clock, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink,
  QrCode as QrIcon,
  LogOut,
  Sparkles
} from 'lucide-react';

interface GuestQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservacion | null;
  onCheckIn?: (res: Reservacion) => void;
  initialPassType?: 'ALL' | 'ENTRY' | 'EXIT';
}

export const GuestQrModal: React.FC<GuestQrModalProps> = ({
  isOpen,
  onClose,
  reservation,
  onCheckIn,
  initialPassType = 'ALL'
}) => {
  const { 
    reservaciones, 
    getPropiedadById, 
    getHuespedById, 
    getEdificioById, 
    checkOutReservacion,
    showToast 
  } = useApp();

  const [passType, setPassType] = useState<'ALL' | 'ENTRY' | 'EXIT'>(initialPassType);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const printableRef = useRef<HTMLDivElement>(null);

  const currentReservation = reservaciones.find(r => r.id === reservation?.id) || reservation;

  useEffect(() => {
    if (initialPassType) {
      setPassType(initialPassType);
    }
  }, [initialPassType, isOpen]);

  useEffect(() => {
    if (!currentReservation) return;

    const prop = getPropiedadById(currentReservation.propiedad_id);
    const huesped = getHuespedById(currentReservation.huesped_id);

    // Build the payload for the QR
    const qrPayload = JSON.stringify({
      app: 'VecinosHOA-LasPalomas',
      folio: currentReservation.codigo || `RES-${currentReservation.id}`,
      id: currentReservation.id,
      condo: prop?.nombre || `Unidad ${currentReservation.propiedad_id}`,
      titular: huesped ? `${huesped.nombres} ${huesped.apellidos}` : 'Huésped',
      tipo_pase: passType === 'ALL' ? 'Entrada & Salida' : passType === 'ENTRY' ? 'Acceso de Entrada' : 'Pase de Salida',
      checkin: currentReservation.fecha_checkin,
      checkout: currentReservation.fecha_checkout,
      estado: currentReservation.estado,
      ocupantes: currentReservation.numero_ocupantes || (1 + (currentReservation.acompanantes?.length || 0)),
      vehiculo: currentReservation.vehiculo_info || 'N/A',
      valido_hasta: currentReservation.fecha_checkout
    }, null, 0);

    QRCode.toDataURL(qrPayload, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0f766e', // Teal 700
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    })
      .then(url => setQrDataUrl(url))
      .catch(err => {
        console.error('Error generando QR:', err);
      });
  }, [currentReservation, passType, getPropiedadById, getHuespedById]);

  if (!isOpen || !currentReservation) return null;

  const prop = getPropiedadById(currentReservation.propiedad_id);
  const edificio = prop ? getEdificioById(prop.edificio_id) : undefined;
  const huesped = getHuespedById(currentReservation.huesped_id);
  const isCheckedIn = currentReservation.estado === 'En Casa (Checked-in)';
  const isCheckedOut = currentReservation.estado === 'Checked-out';

  const acompList = Array.isArray(currentReservation.acompanantes) 
    ? currentReservation.acompanantes.filter(a => a.id !== 'titular') 
    : [];
  const totalOccupants = 1 + acompList.length;

  const handleCopyLink = () => {
    const text = `🌴 *PASE DE ACCESO - LAS PALOMAS RESORT*\n` +
      `📌 *Folio:* ${currentReservation.codigo || currentReservation.id}\n` +
      `🏢 *Condominio:* ${prop?.nombre || currentReservation.propiedad_id} (Torre ${edificio?.nombre || 'Principal'})\n` +
      `👤 *Huésped Titular:* ${huesped ? `${huesped.nombres} ${huesped.apellidos}` : 'Huésped'}\n` +
      `📅 *Estadía:* ${currentReservation.fecha_checkin} al ${currentReservation.fecha_checkout}\n` +
      `🎟️ *Tipo de Pase:* ${passType === 'ALL' ? 'Entrada y Salida (Estadía Completa)' : passType === 'ENTRY' ? 'Pase de Entrada' : 'Pase de Salida'}\n` +
      `👥 *Ocupantes:* ${totalOccupants} personas\n` +
      `🚗 *Vehículo:* ${currentReservation.vehiculo_info || 'Sin vehículo'}\n` +
      `ℹ️ Presente este código QR en caseta o recepción al ingresar o salir.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Datos del pase de acceso copiados al portapapeles', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const phone = huesped?.telefono?.replace(/[^0-9]/g, '') || '';
    const message = encodeURIComponent(
      `🌴 *PASE DE ACCESO DIGITAL - LAS PALOMAS RESORT*\n\n` +
      `Hola ${huesped?.nombres || ''}, te compartimos tu Pase de Acceso QR para tu estadía:\n\n` +
      `• *Folio:* ${currentReservation.codigo || currentReservation.id}\n` +
      `• *Condominio:* ${prop?.nombre || currentReservation.propiedad_id} (${edificio?.nombre ? `Torre ${edificio.nombre}` : ''})\n` +
      `• *Fechas:* Del ${currentReservation.fecha_checkin} al ${currentReservation.fecha_checkout}\n` +
      `• *Tipo:* ${passType === 'ALL' ? 'Entrada y Salida' : passType === 'ENTRY' ? 'Pase de Entrada' : 'Pase de Salida'}\n` +
      `• *Ocupantes:* ${totalOccupants} personas\n\n` +
      `Muestra tu código QR en el portón de seguridad o Front Desk para agilizar tu acceso.`
    );

    const url = phone ? `https://wa.me/${phone}?text=${message}` : `https://wa.me/?text=${message}`;
    window.open(url, '_blank');
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `Pase_QR_${prop?.nombre || 'Condo'}_${currentReservation.codigo || currentReservation.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Código QR descargado exitosamente', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-6 animate-scale-up print:border-none print:shadow-none print:my-0 print:max-w-none">
        
        {/* Header Modal (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-teal-900 via-teal-800 to-teal-900 text-white no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-xs">
              <QrIcon className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Generador de Pase QR</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/30 text-teal-200 border border-teal-400/30">
                  Front Desk
                </span>
              </div>
              <p className="text-xs text-teal-200/80">Control de Entradas y Salidas de Huéspedes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pass Type Selector Tabs (Hidden in Print) */}
        <div className="px-6 pt-4 pb-2 bg-slate-50/80 border-b border-slate-100 no-print">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-xs font-semibold text-slate-600">Tipo de pase a generar:</div>
            <div className="inline-flex p-1 rounded-xl bg-slate-200/70 border border-slate-300/60 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPassType('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  passType === 'ALL'
                    ? 'bg-teal-700 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🌟 Entrada & Salida
              </button>
              <button
                type="button"
                onClick={() => setPassType('ENTRY')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  passType === 'ENTRY'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🟢 Solo Entrada
              </button>
              <button
                type="button"
                onClick={() => setPassType('EXIT')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  passType === 'EXIT'
                    ? 'bg-rose-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🔴 Solo Salida
              </button>
            </div>
          </div>
        </div>

        {/* Main Pass Printable Area */}
        <div ref={printableRef} className="p-6 bg-white space-y-6 print:p-4">
          
          {/* Visual Digital Access Pass Card */}
          <div className="rounded-2xl border-2 border-teal-600/30 bg-gradient-to-b from-teal-50/40 via-white to-slate-50/50 p-5 sm:p-6 shadow-sm relative overflow-hidden print:border-slate-800 print:shadow-none print:p-4">
            
            {/* Watermark Logo / Badge */}
            <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none">
              <QrIcon className="w-64 h-64 text-teal-900" />
            </div>

            {/* Pass Top Branding */}
            <div className="flex items-start justify-between border-b border-slate-200/80 pb-4 mb-5">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-teal-800 uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Las Palomas Beach & Golf Resort</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                  PASE DIGITAL DE ACCESO
                </h3>
                <div className="text-xs text-slate-500 font-medium">
                  {passType === 'ALL' && 'Autorización para Entrada y Salida durante Estadía'}
                  {passType === 'ENTRY' && 'Pase de Entrada / Check-In en Puerta'}
                  {passType === 'EXIT' && 'Pase de Salida / Check-Out y Entrega'}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Folio Oficial</div>
                <div className="font-mono font-black text-base text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 inline-block mt-0.5">
                  {currentReservation.codigo || `RES-${currentReservation.id}`}
                </div>
              </div>
            </div>

            {/* Grid with QR Code + Details */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
              
              {/* QR Code Frame */}
              <div className="sm:col-span-5 flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                {qrDataUrl ? (
                  <div className="relative group">
                    <img 
                      src={qrDataUrl} 
                      alt="Código QR de Acceso" 
                      className="w-48 h-48 sm:w-44 sm:h-44 object-contain rounded-lg"
                    />
                    <div className="mt-2 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                        <ShieldCheck className="w-3 h-3 text-teal-700" />
                        Código QR Verificado
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center bg-slate-100 rounded-lg text-slate-400 text-xs animate-pulse">
                    Generando QR...
                  </div>
                )}
                <div className="text-[10px] text-slate-400 text-center mt-1.5">
                  Escanear en caseta o Front Desk
                </div>
              </div>

              {/* Guest & Reservation Info */}
              <div className="sm:col-span-7 space-y-3">
                
                {/* Condo & Tower */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unidad Asignada</div>
                  <div className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Condominio {prop?.nombre || currentReservation.propiedad_id}</span>
                    {edificio?.nombre && (
                      <span className="text-xs font-bold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-md">
                        Torre {edificio.nombre}
                      </span>
                    )}
                  </div>
                </div>

                {/* Guest Name */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Huésped Titular</div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-600 shrink-0" />
                    <span>{huesped ? `${huesped.nombres} ${huesped.apellidos}` : 'No especificado'}</span>
                  </div>
                  {huesped?.telefono && (
                    <div className="text-xs text-slate-500 mt-0.5">
                      Tel: {huesped.telefono}
                    </div>
                  )}
                </div>

                {/* Dates & Validity */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                    <div className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      Check-In
                    </div>
                    <div className="font-extrabold text-xs text-emerald-950 mt-0.5">
                      {currentReservation.fecha_checkin}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200">
                    <div className="text-[10px] font-bold text-rose-800 uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3 text-rose-600" />
                      Check-Out
                    </div>
                    <div className="font-extrabold text-xs text-rose-950 mt-0.5">
                      {currentReservation.fecha_checkout}
                    </div>
                  </div>
                </div>

                {/* Badges Info (Occupants, Bracelets, Vehicle) */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 font-semibold text-slate-700">
                    <Users className="w-3 h-3 text-teal-600" />
                    <span>{totalOccupants} {totalOccupants === 1 ? 'Huésped' : 'Huéspedes'}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 font-semibold text-slate-700">
                    <Tag className="w-3 h-3 text-amber-600" />
                    <span>{currentReservation.brazaletes || 'Brazaletes según registro'}</span>
                  </span>

                  {currentReservation.vehiculo_info && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 font-semibold text-slate-700">
                      <Car className="w-3 h-3 text-sky-600" />
                      <span className="truncate max-w-[170px]">{currentReservation.vehiculo_info}</span>
                    </span>
                  )}
                </div>

              </div>

            </div>

            {/* Companions Mini List if any */}
            {acompList.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-200/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Acompañantes Autorizados ({acompList.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {acompList.map((a, idx) => (
                    <span 
                      key={a.id || idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] text-slate-700 font-medium"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                      {a.nombre_completo}
                      <span className="text-[10px] text-slate-400">({a.tipo})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Rules & Instructions */}
            <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500">
              <span>⚠️ Uso obligatorio de brazalete en áreas comunes y albercas.</span>
              <span className="font-semibold text-teal-800">Vecinos HOA • Las Palomas</span>
            </div>

          </div>

        </div>

        {/* Quick Action Footer Toolbar (Hidden in Print) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="h-9 px-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Imprimir ticket o pase de acceso"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Imprimir Pase</span>
            </button>

            <button
              onClick={handleDownloadQr}
              className="h-9 px-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Descargar imagen PNG del QR"
            >
              <Download className="w-4 h-4 text-teal-700" />
              <span>Descargar QR</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Compartir por WhatsApp al huésped"
            >
              <Share2 className="w-4 h-4" />
              <span>Enviar por WhatsApp</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="h-9 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copiar texto resumen"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isCheckedIn && !isCheckedOut && onCheckIn && (
              <button
                onClick={() => {
                  onClose();
                  onCheckIn(currentReservation);
                }}
                className="h-9 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Registrar Check-In</span>
              </button>
            )}

            {isCheckedIn && (
              <button
                onClick={() => {
                  if (window.confirm('¿Registrar salida / Check-Out de esta reservación?')) {
                    checkOutReservacion(currentReservation.id);
                    onClose();
                  }
                }}
                className="h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Registrar Salida</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="h-9 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
