import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Propiedad } from '../../types';
import { X, Building2 } from 'lucide-react';

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyToEdit?: Propiedad | null;
}

export const PropertyFormModal: React.FC<PropertyFormModalProps> = ({
  isOpen,
  onClose,
  propertyToEdit
}) => {
  const { 
    edificios, 
    grupos, 
    usuarios, 
    addPropiedad, 
    updatePropiedad, 
    getOwnerByPropiedadId 
  } = useApp();

  const [nombre, setNombre] = useState('');
  const [edificioId, setEdificioId] = useState<number>(edificios[0]?.id || 1);
  const [grupoId, setGrupoId] = useState<number>(grupos[0]?.id || 1);
  const [piso, setPiso] = useState<number>(1);
  const [area, setArea] = useState('Planta Baja');
  const [tipoCuarto, setTipoCuarto] = useState('Columna 1');
  const [dormitorios, setDormitorios] = useState<number>(2);
  const [banos, setBanos] = useState<number>(2);
  const [capacidadPersonas, setCapacidadPersonas] = useState<number>(6);
  const [maxCarros, setMaxCarros] = useState<number>(1);
  const [idImpuesto, setIdImpuesto] = useState('');
  const [medidorAgua, setMedidorAgua] = useState('');
  const [medidorElectricidad, setMedidorElectricidad] = useState('');
  const [empresaManejadora, setEmpresaManejadora] = useState('Las Palomas Rental Pool');
  const [moneda, setMoneda] = useState('USD');
  const [cuotaHoa, setCuotaHoa] = useState<number>(420);
  const [estado, setEstado] = useState<'Active' | 'Inactive'>('Active');
  const [notas, setNotas] = useState('');
  const [ownerId, setOwnerId] = useState<number>(0);

  useEffect(() => {
    if (propertyToEdit) {
      setNombre(propertyToEdit.nombre);
      setEdificioId(propertyToEdit.edificio_id);
      setGrupoId(propertyToEdit.grupo_id || 1);
      setPiso(propertyToEdit.piso);
      setArea(propertyToEdit.area || '');
      setTipoCuarto(propertyToEdit.tipo_cuarto || '');
      setDormitorios(propertyToEdit.dormitorios);
      setBanos(propertyToEdit.banos);
      setCapacidadPersonas(propertyToEdit.capacidad_personas);
      setMaxCarros(propertyToEdit.max_carros);
      setIdImpuesto(propertyToEdit.id_impuesto || '');
      setMedidorAgua(propertyToEdit.medidor_agua || '');
      setMedidorElectricidad(propertyToEdit.medidor_electricidad || '');
      setEmpresaManejadora(propertyToEdit.empresa_manejadora || '');
      setMoneda(propertyToEdit.moneda);
      setCuotaHoa(propertyToEdit.cuota_hoa || 420);
      setEstado(propertyToEdit.estado);
      setNotas(propertyToEdit.notas || '');

      const currentOwner = getOwnerByPropiedadId(propertyToEdit.id);
      setOwnerId(currentOwner ? currentOwner.id : 0);
    } else {
      setNombre('');
      setEdificioId(edificios[0]?.id || 1);
      setGrupoId(grupos[0]?.id || 1);
      setPiso(1);
      setArea('Planta Baja');
      setTipoCuarto('Columna 1');
      setDormitorios(2);
      setBanos(2);
      setCapacidadPersonas(6);
      setMaxCarros(1);
      setIdImpuesto('');
      setMedidorAgua('');
      setMedidorElectricidad('');
      setEmpresaManejadora('Las Palomas Rental Pool');
      setMoneda('USD');
      setCuotaHoa(420);
      setEstado('Active');
      setNotas('');
      setOwnerId(0);
    }
  }, [propertyToEdit, isOpen, edificios, grupos]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: Omit<Propiedad, 'id'> = {
      nombre,
      edificio_id: edificioId,
      grupo_id: grupoId,
      piso,
      area,
      tipo_cuarto: tipoCuarto,
      dormitorios,
      banos,
      capacidad_personas: capacidadPersonas,
      max_carros: maxCarros,
      id_impuesto: idImpuesto,
      medidor_agua: medidorAgua,
      medidor_electricidad: medidorElectricidad,
      empresa_manejadora: empresaManejadora,
      moneda,
      cuota_hoa: cuotaHoa,
      estado,
      notas
    };

    if (propertyToEdit) {
      updatePropiedad(propertyToEdit.id, data, ownerId);
    } else {
      addPropiedad(data, ownerId > 0 ? ownerId : undefined);
    }
    onClose();
  };

  const ownersList = usuarios.filter(u => u.rol === 'Dueño' || u.rol === 'Administrador');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden my-8 animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Building2 className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {propertyToEdit ? `Editar Propiedad: ${propertyToEdit.nombre}` : 'Registrar Nueva Propiedad'}
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
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Número / Nombre de Propiedad *
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="ej. A 101, F 202, J 701"
                className="w-full px-3 py-2 rounded-lg form-input text-xs font-bold text-teal-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Edificio / Torre *
              </label>
              <select
                value={edificioId}
                onChange={(e) => setEdificioId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg form-input text-xs font-medium"
              >
                {edificios.map(ed => (
                  <option key={ed.id} value={ed.id}>
                    {ed.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Propietario Asignado
              </label>
              <select
                value={ownerId}
                onChange={(e) => setOwnerId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg form-input text-xs"
              >
                <option value={0}>Sin asignar / Pendiente</option>
                {ownersList.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.nombre} {u.apellido} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Grupo de Propiedad (Cobranza)
              </label>
              <select
                value={grupoId}
                onChange={(e) => setGrupoId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg form-input text-xs"
              >
                {grupos.map(g => (
                  <option key={g.id} value={g.id}>
                    Grupo {g.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Dormitorios</label>
              <input
                type="number"
                min="1"
                max="10"
                value={dormitorios}
                onChange={(e) => setDormitorios(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg form-input text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Baños</label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="10"
                value={banos}
                onChange={(e) => setBanos(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg form-input text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Capacidad (Pers.)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={capacidadPersonas}
                onChange={(e) => setCapacidadPersonas(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg form-input text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Piso / Nivel</label>
              <input
                type="number"
                min="1"
                max="25"
                value={piso}
                onChange={(e) => setPiso(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg form-input text-xs"
              />
            </div>
          </div>

          {/* Medidores */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800 block">
              Medidores y Datos Administrativos
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">ID de Impuesto</label>
                <input
                  type="text"
                  value={idImpuesto}
                  onChange={(e) => setIdImpuesto(e.target.value)}
                  placeholder="610004-403-088"
                  className="w-full px-3 py-2 rounded-lg form-input text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Medidor de Luz #</label>
                <input
                  type="text"
                  value={medidorElectricidad}
                  onChange={(e) => setMedidorElectricidad(e.target.value)}
                  placeholder="2B380T"
                  className="w-full px-3 py-2 rounded-lg form-input text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Medidor de Agua #</label>
                <input
                  type="text"
                  value={medidorAgua}
                  onChange={(e) => setMedidorAgua(e.target.value)}
                  placeholder="AG-101"
                  className="w-full px-3 py-2 rounded-lg form-input text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Empresa Manejadora</label>
                <input
                  type="text"
                  value={empresaManejadora}
                  onChange={(e) => setEmpresaManejadora(e.target.value)}
                  placeholder="Las Palomas Rental Pool / Direct"
                  className="w-full px-3 py-2 rounded-lg form-input text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Cuota HOA Mensual ($ USD)</label>
                <input
                  type="number"
                  value={cuotaHoa}
                  onChange={(e) => setCuotaHoa(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg form-input text-xs font-mono text-teal-800 font-bold"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Notas y Observaciones
            </label>
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Detalles sobre cerraduras electrónicas o remodelaciones..."
              className="w-full px-3.5 py-2 rounded-lg form-input text-xs"
            />
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
              {propertyToEdit ? 'Actualizar Propiedad' : 'Guardar Propiedad'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
