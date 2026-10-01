export type RolUsuario = 
  | 'Dueño'
  | 'Miembro del Consejo'
  | 'Comité de Vigilancia'
  | 'Administrador'
  | 'Supervisor'
  | 'Contabilidad'
  | 'Recepcionista'
  | 'Guardia de Seguridad'
  | 'Supervisor de Mantenimiento'
  | 'Operador Principal de Mantenimiento'
  | 'Operador de Mantenimiento'
  | 'Supervisor de Camaristas'
  | 'Camarista (Operador Principal)'
  | 'Camarista (Operador)'
  | 'No definido';

export type UserStatus = 'Active' | 'Inactive' | 'Suspended';

export type TipoAccionBitacora = 
  | 'CREACIÓN'
  | 'EDICIÓN'
  | 'ELIMINACIÓN'
  | 'CHECK-IN'
  | 'CHECK-OUT'
  | 'CAMBIO_ESTATUS'
  | 'ACCESO_SISTEMA'
  | 'CONFIGURACIÓN'
  | 'NOTA_SUPERVISOR';

export type ModuloBitacora = 
  | 'Reservaciones'
  | 'Propiedades'
  | 'Usuarios'
  | 'Torres'
  | 'Solicitudes de Acceso'
  | 'Grupos de Cobro'
  | 'Autenticación'
  | 'Sistema';

export interface BitacoraEntry {
  id: string;
  timestamp: string; // ISO string
  usuario_id?: number;
  usuario_nombre: string;
  usuario_email: string;
  usuario_rol: RolUsuario | string;
  accion: TipoAccionBitacora;
  modulo: ModuloBitacora;
  descripcion: string;
  entidad_id?: string | number;
  entidad_nombre?: string;
  detalles?: {
    previo?: any;
    nuevo?: any;
    cambios?: string[];
    notas?: string;
    ip?: string;
    dispositivo?: string;
    [key: string]: any;
  };
}

export interface Edificio {
  id: number;
  nombre: string;
  activo: boolean;
  created_at?: string;
}

export interface GrupoPropiedad {
  id: number;
  nombre: string;
  fechas_cobro: boolean;
  intereses_moratorios: boolean;
  balance_bajo: boolean;
  created_at?: string;
}

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: RolUsuario;
  telefono?: string;
  idioma: string;
  ciudad?: string;
  estado_geo?: string;
  codigo_postal?: string;
  status: UserStatus;
  created_at?: string;
  updated_at?: string;
}

export interface Propiedad {
  id: number;
  nombre: string; // ej. "A 101"
  edificio_id: number;
  grupo_id?: number;
  piso: number;
  area?: string;
  tipo_cuarto?: string; // ej. "Columna 1"
  dormitorios: number;
  banos: number;
  capacidad_personas: number;
  max_carros: number;
  id_impuesto?: string;
  medidor_agua?: string;
  medidor_electricidad?: string;
  empresa_manejadora?: string;
  estado: 'Active' | 'Inactive';
  copropietarios?: string; // ej. "Yvonne Marie Koehler, Jack Koehler, Tyler Koehler"
  risa?: string;
  notas?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PropiedadUsuario {
  id: number;
  propiedad_id: number;
  usuario_id: number;
  tipo_relacion: 'Owner' | 'Tenant' | 'Co-owner';
  es_principal: boolean;
  created_at?: string;
}

export interface Huesped {
  id: number;
  nombres: string;
  created_at?: string;
  updated_at?: string;
}

export type TipoHuesped = 
  | 'Huésped sin Cobro (NPG)'
  | 'Resort Amenity Usage';

export type EstadoReservacion = 
  | 'Confirmada'
  | 'En Casa (Checked-in)'
  | 'Checked-out'
  | 'Pendiente'
  | 'Cancelada';

export interface Acompanante {
  id: string;
  nombre_completo: string;
  tipo: 'Adulto' | 'Menor' | 'Invitado' | 'Visita';
  telefono?: string;
  brazalete_entregado: boolean;
  fecha_entrega?: string;
  entregado_por?: string;
}

export interface AcompananteAmenidad {
  id: string;
  nombre_completo: string;
  brazalete_entregado: boolean;
  fecha_entrega?: string;
}

export interface Reservacion {
  id: number;
  codigo?: string; // ej. "2569009" o "SL:973438"
  propiedad_id: number;
  huesped_id: number;
  tipo_huesped: TipoHuesped;
  fecha_checkin: string; // "YYYY-MM-DD"
  fecha_checkout: string; // "YYYY-MM-DD"
  numero_ocupantes: number;
  numero_autos: number;
  notas?: string;
  brazaletes?: string; // ej. "4 entregados" o resumen
  vehiculo_info?: string; // ej. "Corbatin 38516 Ford F150 Blue AJM5429"
  pago_tipo?: 'Con pago' | 'Sin pago' | 'Uso de amenidades' | 'Cortesia';
  estado: EstadoReservacion;
  acompanantes?: Acompanante[];
  acompanantes_amenidades?: AcompananteAmenidad[];
  titular_brazalete_entregado?: boolean;
  titular_fecha_entrega?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SolicitudAcceso {
  id: number;
  propiedad_id: number;
  creador_nombre: string;
  solicitud: string; // ej. "Santana Glass reparación de vidrios"
  procesador_nombre?: string;
  fecha_esperada: string;
  comentario?: string;
  estatus: 'Pendiente' | 'En Proceso' | 'Aprobado' | 'Rechazado' | 'Completado';
  created_at: string;
}
