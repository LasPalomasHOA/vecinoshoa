export type RolUsuario = 
  | 'Dueño'
  | 'Miembro del Consejo'
  | 'Comité de Vigilancia'
  | 'Administrador'
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
  moneda: string; // "USD" | "MXN"
  estado: 'Active' | 'Inactive';
  cuota_hoa?: number;
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
  apellidos: string;
  telefono?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export type TipoHuesped = 
  | 'Bloqueo de Dueño'
  | 'Huésped con Cobro (PG)'
  | 'Huésped sin Cobro (NPG)'
  | 'Renta / Streamline'
  | 'Resort Amenity Usage'
  | 'Mantenimiento / Staff';

export type EstadoReservacion = 
  | 'Confirmada'
  | 'En Casa (Checked-in)'
  | 'Checked-out'
  | 'Pendiente'
  | 'Cancelada';

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
  brazaletes?: string; // ej. "Azul Marino 9367-9368"
  vehiculo_info?: string; // ej. "Corbatin 38516 Ford F150 Blue AJM5429"
  pago_tipo?: 'Con pago' | 'Sin pago' | 'Uso de amenidades' | 'Cortesia';
  balance?: number;
  estado: EstadoReservacion;
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
