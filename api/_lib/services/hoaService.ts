import { query, queryOne, testConnection, getQuotedSchema } from '../db.ts';
import type { 
  Edificio, 
  GrupoPropiedad, 
  Usuario, 
  Propiedad, 
  PropiedadUsuario, 
  Huesped, 
  Reservacion, 
  SolicitudAcceso 
} from '../../../src/types/index.ts';

// Schema-qualified table helpers to guarantee absolute schema isolation without touching search_path
const T = {
  edificios: () => `${getQuotedSchema()}.edificios`,
  grupos: () => `${getQuotedSchema()}.grupos_propiedad`,
  usuarios: () => `${getQuotedSchema()}.usuarios`,
  propiedades: () => `${getQuotedSchema()}.propiedades`,
  propiedadUsuarios: () => `${getQuotedSchema()}.propiedad_usuarios`,
  huespedes: () => `${getQuotedSchema()}.huespedes`,
  reservaciones: () => `${getQuotedSchema()}.reservaciones`,
  solicitudes: () => `${getQuotedSchema()}.solicitudes_acceso`,
};

// ==============================================================================
// 1. EDIFICIOS (TORRES)
// ==============================================================================

export async function getAllEdificios(): Promise<Edificio[]> {
  const res = await query<Edificio>(`
    SELECT id, nombre, activo, created_at
    FROM ${T.edificios()}
    ORDER BY id ASC;
  `);
  return res.rows;
}

export async function getEdificioById(id: number): Promise<Edificio | null> {
  return queryOne<Edificio>(`
    SELECT id, nombre, activo, created_at
    FROM ${T.edificios()}
    WHERE id = $1;
  `, [id]);
}

export async function createEdificio(data: { nombre: string; activo?: boolean }): Promise<Edificio> {
  const res = await query<Edificio>(`
    INSERT INTO ${T.edificios()} (nombre, activo)
    VALUES ($1, $2)
    RETURNING id, nombre, activo, created_at;
  `, [data.nombre.trim(), data.activo !== undefined ? data.activo : true]);
  return res.rows[0];
}

export async function updateEdificio(id: number, data: Partial<Edificio>): Promise<Edificio | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (data.nombre !== undefined) {
    fields.push(`nombre = $${idx++}`);
    values.push(data.nombre.trim());
  }
  if (data.activo !== undefined) {
    fields.push(`activo = $${idx++}`);
    values.push(data.activo);
  }

  if (fields.length === 0) return getEdificioById(id);

  values.push(id);
  const res = await query<Edificio>(`
    UPDATE ${T.edificios()}
    SET ${fields.join(', ')}
    WHERE id = $${idx}
    RETURNING id, nombre, activo, created_at;
  `, values);
  return res.rows[0] || null;
}

export async function deleteEdificio(id: number): Promise<{ success: boolean; id: number }> {
  await query(`DELETE FROM ${T.edificios()} WHERE id = $1`, [id]);
  return { success: true, id };
}

// ==============================================================================
// 2. GRUPOS DE PROPIEDAD
// ==============================================================================

export async function getAllGrupos(): Promise<GrupoPropiedad[]> {
  const res = await query<GrupoPropiedad>(`
    SELECT id, nombre, fechas_cobro, intereses_moratorios, balance_bajo, created_at
    FROM ${T.grupos()}
    ORDER BY id ASC;
  `);
  return res.rows;
}

export async function getGrupoById(id: number): Promise<GrupoPropiedad | null> {
  return queryOne<GrupoPropiedad>(`
    SELECT id, nombre, fechas_cobro, intereses_moratorios, balance_bajo, created_at
    FROM ${T.grupos()}
    WHERE id = $1;
  `, [id]);
}

export async function createGrupo(data: Omit<GrupoPropiedad, 'id'>): Promise<GrupoPropiedad> {
  const res = await query<GrupoPropiedad>(`
    INSERT INTO ${T.grupos()} (nombre, fechas_cobro, intereses_moratorios, balance_bajo)
    VALUES ($1, $2, $3, $4)
    RETURNING id, nombre, fechas_cobro, intereses_moratorios, balance_bajo, created_at;
  `, [
    data.nombre.trim(),
    data.fechas_cobro ?? false,
    data.intereses_moratorios ?? false,
    data.balance_bajo ?? false
  ]);
  return res.rows[0];
}

export async function updateGrupo(id: number, data: Partial<GrupoPropiedad>): Promise<GrupoPropiedad | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (data.nombre !== undefined) {
    fields.push(`nombre = $${idx++}`);
    values.push(data.nombre.trim());
  }
  if (data.fechas_cobro !== undefined) {
    fields.push(`fechas_cobro = $${idx++}`);
    values.push(data.fechas_cobro);
  }
  if (data.intereses_moratorios !== undefined) {
    fields.push(`intereses_moratorios = $${idx++}`);
    values.push(data.intereses_moratorios);
  }
  if (data.balance_bajo !== undefined) {
    fields.push(`balance_bajo = $${idx++}`);
    values.push(data.balance_bajo);
  }

  if (fields.length === 0) return getGrupoById(id);

  values.push(id);
  const res = await query<GrupoPropiedad>(`
    UPDATE ${T.grupos()}
    SET ${fields.join(', ')}
    WHERE id = $${idx}
    RETURNING id, nombre, fechas_cobro, intereses_moratorios, balance_bajo, created_at;
  `, values);
  return res.rows[0] || null;
}

export async function deleteGrupo(id: number): Promise<{ success: boolean; id: number }> {
  await query(`DELETE FROM ${T.grupos()} WHERE id = $1`, [id]);
  return { success: true, id };
}

// ==============================================================================
// 3. USUARIOS / PROPIETARIOS / PERSONAL
// ==============================================================================

export async function getAllUsuarios(): Promise<Usuario[]> {
  const res = await query<Usuario>(`
    SELECT id, email, nombre, apellido, rol, telefono, idioma, ciudad, estado AS estado_geo, codigo_postal, status, created_at, updated_at
    FROM ${T.usuarios()}
    ORDER BY nombre ASC, apellido ASC;
  `);
  return res.rows;
}

export async function getUsuarioById(id: number): Promise<Usuario | null> {
  return queryOne<Usuario>(`
    SELECT id, email, nombre, apellido, rol, telefono, idioma, ciudad, estado AS estado_geo, codigo_postal, status, created_at, updated_at
    FROM ${T.usuarios()}
    WHERE id = $1;
  `, [id]);
}

export async function createUsuario(data: Omit<Usuario, 'id'>): Promise<Usuario> {
  const res = await query<Usuario>(`
    INSERT INTO ${T.usuarios()} (email, nombre, apellido, rol, telefono, idioma, ciudad, estado, codigo_postal, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id, email, nombre, apellido, rol, telefono, idioma, ciudad, estado AS estado_geo, codigo_postal, status, created_at, updated_at;
  `, [
    data.email.trim().toLowerCase(),
    data.nombre.trim(),
    data.apellido.trim(),
    data.rol || 'Dueño',
    data.telefono || null,
    data.idioma || 'es',
    data.ciudad || null,
    data.estado_geo || null,
    data.codigo_postal || null,
    data.status || 'Active'
  ]);
  return res.rows[0];
}

export async function updateUsuario(id: number, data: Partial<Usuario>): Promise<Usuario | null> {
  const fields: string[] = ['updated_at = CURRENT_TIMESTAMP'];
  const values: any[] = [];
  let idx = 1;

  if (data.email !== undefined) {
    fields.push(`email = $${idx++}`);
    values.push(data.email.trim().toLowerCase());
  }
  if (data.nombre !== undefined) {
    fields.push(`nombre = $${idx++}`);
    values.push(data.nombre.trim());
  }
  if (data.apellido !== undefined) {
    fields.push(`apellido = $${idx++}`);
    values.push(data.apellido.trim());
  }
  if (data.rol !== undefined) {
    fields.push(`rol = $${idx++}`);
    values.push(data.rol);
  }
  if (data.telefono !== undefined) {
    fields.push(`telefono = $${idx++}`);
    values.push(data.telefono);
  }
  if (data.idioma !== undefined) {
    fields.push(`idioma = $${idx++}`);
    values.push(data.idioma);
  }
  if (data.ciudad !== undefined) {
    fields.push(`ciudad = $${idx++}`);
    values.push(data.ciudad);
  }
  if (data.estado_geo !== undefined) {
    fields.push(`estado = $${idx++}`);
    values.push(data.estado_geo);
  }
  if (data.codigo_postal !== undefined) {
    fields.push(`codigo_postal = $${idx++}`);
    values.push(data.codigo_postal);
  }
  if (data.status !== undefined) {
    fields.push(`status = $${idx++}`);
    values.push(data.status);
  }

  values.push(id);
  const res = await query<Usuario>(`
    UPDATE ${T.usuarios()}
    SET ${fields.join(', ')}
    WHERE id = $${idx}
    RETURNING id, email, nombre, apellido, rol, telefono, idioma, ciudad, estado AS estado_geo, codigo_postal, status, created_at, updated_at;
  `, values);
  return res.rows[0] || null;
}

export async function deleteUsuario(id: number): Promise<{ success: boolean; id: number }> {
  await query(`DELETE FROM ${T.usuarios()} WHERE id = $1`, [id]);
  return { success: true, id };
}

// ==============================================================================
// 4. PROPIEDADES (CONDOMINIOS)
// ==============================================================================

export async function getAllPropiedades(): Promise<Propiedad[]> {
  const res = await query<any>(`
    SELECT 
      id, nombre, edificio_id, grupo_id, piso, area, tipo_cuarto, 
      dormitorios, CAST(banos AS FLOAT) as banos, capacidad_personas, max_carros, 
      id_impuesto, medidor_agua, medidor_electricidad, empresa_manejadora, 
      moneda, estado, CAST(cuota_hoa AS FLOAT) as cuota_hoa, notas, 
      created_at, updated_at
    FROM ${T.propiedades()}
    ORDER BY nombre ASC;
  `);
  return res.rows;
}

export async function getPropiedadById(id: number): Promise<Propiedad | null> {
  return queryOne<Propiedad>(`
    SELECT 
      id, nombre, edificio_id, grupo_id, piso, area, tipo_cuarto, 
      dormitorios, CAST(banos AS FLOAT) as banos, capacidad_personas, max_carros, 
      id_impuesto, medidor_agua, medidor_electricidad, empresa_manejadora, 
      moneda, estado, CAST(cuota_hoa AS FLOAT) as cuota_hoa, notas, 
      created_at, updated_at
    FROM ${T.propiedades()}
    WHERE id = $1;
  `, [id]);
}

export async function createPropiedad(data: Omit<Propiedad, 'id'>, ownerId?: number): Promise<Propiedad> {
  const res = await query<Propiedad>(`
    INSERT INTO ${T.propiedades()} (
      nombre, edificio_id, grupo_id, piso, area, tipo_cuarto,
      dormitorios, banos, capacidad_personas, max_carros,
      id_impuesto, medidor_agua, medidor_electricidad, empresa_manejadora,
      moneda, estado, cuota_hoa, notas
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    RETURNING 
      id, nombre, edificio_id, grupo_id, piso, area, tipo_cuarto, 
      dormitorios, CAST(banos AS FLOAT) as banos, capacidad_personas, max_carros, 
      id_impuesto, medidor_agua, medidor_electricidad, empresa_manejadora, 
      moneda, estado, CAST(cuota_hoa AS FLOAT) as cuota_hoa, notas, 
      created_at, updated_at;
  `, [
    data.nombre.trim(),
    data.edificio_id,
    data.grupo_id || null,
    data.piso || 1,
    data.area || null,
    data.tipo_cuarto || null,
    data.dormitorios || 0,
    data.banos || 0,
    data.capacidad_personas || 0,
    data.max_carros || 1,
    data.id_impuesto || null,
    data.medidor_agua || null,
    data.medidor_electricidad || null,
    data.empresa_manejadora || null,
    data.moneda || 'USD',
    data.estado || 'Active',
    data.cuota_hoa || 0,
    data.notas || null,
  ]);

  const createdProp = res.rows[0];

  // Assign owner if specified
  if (ownerId && ownerId > 0) {
    await query(`
      INSERT INTO ${T.propiedadUsuarios()} (propiedad_id, usuario_id, tipo_relacion, es_principal)
      VALUES ($1, $2, 'Owner', true)
      ON CONFLICT (propiedad_id, usuario_id) DO UPDATE SET es_principal = true;
    `, [createdProp.id, ownerId]);
  }

  return createdProp;
}

export async function updatePropiedad(id: number, data: Partial<Propiedad>, ownerId?: number): Promise<Propiedad | null> {
  const fields: string[] = ['updated_at = CURRENT_TIMESTAMP'];
  const values: any[] = [];
  let idx = 1;

  if (data.nombre !== undefined) { fields.push(`nombre = $${idx++}`); values.push(data.nombre.trim()); }
  if (data.edificio_id !== undefined) { fields.push(`edificio_id = $${idx++}`); values.push(data.edificio_id); }
  if (data.grupo_id !== undefined) { fields.push(`grupo_id = $${idx++}`); values.push(data.grupo_id); }
  if (data.piso !== undefined) { fields.push(`piso = $${idx++}`); values.push(data.piso); }
  if (data.area !== undefined) { fields.push(`area = $${idx++}`); values.push(data.area); }
  if (data.tipo_cuarto !== undefined) { fields.push(`tipo_cuarto = $${idx++}`); values.push(data.tipo_cuarto); }
  if (data.dormitorios !== undefined) { fields.push(`dormitorios = $${idx++}`); values.push(data.dormitorios); }
  if (data.banos !== undefined) { fields.push(`banos = $${idx++}`); values.push(data.banos); }
  if (data.capacidad_personas !== undefined) { fields.push(`capacidad_personas = $${idx++}`); values.push(data.capacidad_personas); }
  if (data.max_carros !== undefined) { fields.push(`max_carros = $${idx++}`); values.push(data.max_carros); }
  if (data.id_impuesto !== undefined) { fields.push(`id_impuesto = $${idx++}`); values.push(data.id_impuesto); }
  if (data.medidor_agua !== undefined) { fields.push(`medidor_agua = $${idx++}`); values.push(data.medidor_agua); }
  if (data.medidor_electricidad !== undefined) { fields.push(`medidor_electricidad = $${idx++}`); values.push(data.medidor_electricidad); }
  if (data.empresa_manejadora !== undefined) { fields.push(`empresa_manejadora = $${idx++}`); values.push(data.empresa_manejadora); }
  if (data.moneda !== undefined) { fields.push(`moneda = $${idx++}`); values.push(data.moneda); }
  if (data.estado !== undefined) { fields.push(`estado = $${idx++}`); values.push(data.estado); }
  if (data.cuota_hoa !== undefined) { fields.push(`cuota_hoa = $${idx++}`); values.push(data.cuota_hoa); }
  if (data.notas !== undefined) { fields.push(`notas = $${idx++}`); values.push(data.notas); }

  values.push(id);
  const res = await query<Propiedad>(`
    UPDATE ${T.propiedades()}
    SET ${fields.join(', ')}
    WHERE id = $${idx}
    RETURNING 
      id, nombre, edificio_id, grupo_id, piso, area, tipo_cuarto, 
      dormitorios, CAST(banos AS FLOAT) as banos, capacidad_personas, max_carros, 
      id_impuesto, medidor_agua, medidor_electricidad, empresa_manejadora, 
      moneda, estado, CAST(cuota_hoa AS FLOAT) as cuota_hoa, notas, 
      created_at, updated_at;
  `, values);

  if (ownerId !== undefined) {
    // Remove previous principal owner
    await query(`DELETE FROM ${T.propiedadUsuarios()} WHERE propiedad_id = $1 AND es_principal = true;`, [id]);
    if (ownerId > 0) {
      await query(`
        INSERT INTO ${T.propiedadUsuarios()} (propiedad_id, usuario_id, tipo_relacion, es_principal)
        VALUES ($1, $2, 'Owner', true)
        ON CONFLICT (propiedad_id, usuario_id) DO UPDATE SET es_principal = true;
      `, [id, ownerId]);
    }
  }

  return res.rows[0] || null;
}

export async function deletePropiedad(id: number): Promise<{ success: boolean; id: number }> {
  await query(`DELETE FROM ${T.propiedades()} WHERE id = $1`, [id]);
  return { success: true, id };
}

// ==============================================================================
// 5. ASIGNACIÓN PROPIEDAD - USUARIOS
// ==============================================================================

export async function getAllPropiedadUsuarios(): Promise<PropiedadUsuario[]> {
  const res = await query<PropiedadUsuario>(`
    SELECT id, propiedad_id, usuario_id, tipo_relacion, es_principal, created_at
    FROM ${T.propiedadUsuarios()}
    ORDER BY id ASC;
  `);
  return res.rows;
}

export async function createPropiedadUsuario(data: Omit<PropiedadUsuario, 'id'>): Promise<PropiedadUsuario> {
  const res = await query<PropiedadUsuario>(`
    INSERT INTO ${T.propiedadUsuarios()} (propiedad_id, usuario_id, tipo_relacion, es_principal)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (propiedad_id, usuario_id) 
    DO UPDATE SET tipo_relacion = EXCLUDED.tipo_relacion, es_principal = EXCLUDED.es_principal
    RETURNING id, propiedad_id, usuario_id, tipo_relacion, es_principal, created_at;
  `, [
    data.propiedad_id,
    data.usuario_id,
    data.tipo_relacion || 'Owner',
    data.es_principal !== undefined ? data.es_principal : true
  ]);
  return res.rows[0];
}

export async function deletePropiedadUsuario(id: number): Promise<{ success: boolean; id: number }> {
  await query(`DELETE FROM ${T.propiedadUsuarios()} WHERE id = $1`, [id]);
  return { success: true, id };
}

// ==============================================================================
// 6. HUÉSPEDES
// ==============================================================================

export async function getAllHuespedes(): Promise<Huesped[]> {
  const res = await query<Huesped>(`
    SELECT id, nombres, apellidos, telefono, email, created_at, updated_at
    FROM ${T.huespedes()}
    ORDER BY nombres ASC, apellidos ASC;
  `);
  return res.rows;
}

export async function getHuespedById(id: number): Promise<Huesped | null> {
  return queryOne<Huesped>(`
    SELECT id, nombres, apellidos, telefono, email, created_at, updated_at
    FROM ${T.huespedes()}
    WHERE id = $1;
  `, [id]);
}

export async function createHuesped(data: Omit<Huesped, 'id'>): Promise<Huesped> {
  const res = await query<Huesped>(`
    INSERT INTO ${T.huespedes()} (nombres, apellidos, telefono, email)
    VALUES ($1, $2, $3, $4)
    RETURNING id, nombres, apellidos, telefono, email, created_at, updated_at;
  `, [
    data.nombres.trim(),
    data.apellidos.trim(),
    data.telefono || null,
    data.email ? data.email.trim().toLowerCase() : null
  ]);
  return res.rows[0];
}

export async function updateHuesped(id: number, data: Partial<Huesped>): Promise<Huesped | null> {
  const fields: string[] = ['updated_at = CURRENT_TIMESTAMP'];
  const values: any[] = [];
  let idx = 1;

  if (data.nombres !== undefined) { fields.push(`nombres = $${idx++}`); values.push(data.nombres.trim()); }
  if (data.apellidos !== undefined) { fields.push(`apellidos = $${idx++}`); values.push(data.apellidos.trim()); }
  if (data.telefono !== undefined) { fields.push(`telefono = $${idx++}`); values.push(data.telefono); }
  if (data.email !== undefined) { fields.push(`email = $${idx++}`); values.push(data.email.trim().toLowerCase()); }

  values.push(id);
  const res = await query<Huesped>(`
    UPDATE ${T.huespedes()}
    SET ${fields.join(', ')}
    WHERE id = $${idx}
    RETURNING id, nombres, apellidos, telefono, email, created_at, updated_at;
  `, values);
  return res.rows[0] || null;
}

export async function deleteHuesped(id: number): Promise<{ success: boolean; id: number }> {
  await query(`DELETE FROM ${T.huespedes()} WHERE id = $1`, [id]);
  return { success: true, id };
}

// ==============================================================================
// 7. RESERVACIONES (FRONT DESK & CALENDARIO)
// ==============================================================================

export async function checkReservationOverlap(
  propiedadId: number,
  checkin: string,
  checkout: string,
  excludeId?: number
): Promise<Reservacion | null> {
  const queryText = `
    SELECT id, codigo, propiedad_id, huesped_id, tipo_huesped, 
           TO_CHAR(fecha_checkin, 'YYYY-MM-DD') AS fecha_checkin, 
           TO_CHAR(fecha_checkout, 'YYYY-MM-DD') AS fecha_checkout, 
           numero_ocupantes, numero_autos, notas, brazaletes, vehiculo_info, 
           CAST(balance AS FLOAT) as balance, estado, created_at, updated_at
    FROM ${T.reservaciones()}
    WHERE propiedad_id = $1
      AND estado NOT IN ('Cancelada', 'Checked-out')
      AND fecha_checkin < $3::date 
      AND fecha_checkout > $2::date
      ${excludeId ? `AND id != ${excludeId}` : ''}
    LIMIT 1;
  `;
  return queryOne<Reservacion>(queryText, [propiedadId, checkin, checkout]);
}

export async function getAllReservaciones(): Promise<Reservacion[]> {
  const res = await query<any>(`
    SELECT 
      id, codigo, propiedad_id, huesped_id, tipo_huesped, 
      TO_CHAR(fecha_checkin, 'YYYY-MM-DD') AS fecha_checkin, 
      TO_CHAR(fecha_checkout, 'YYYY-MM-DD') AS fecha_checkout, 
      numero_ocupantes, numero_autos, notas, brazaletes, vehiculo_info, 
      CAST(balance AS FLOAT) as balance, estado, created_at, updated_at
    FROM ${T.reservaciones()}
    ORDER BY fecha_checkin DESC, id DESC;
  `);
  return res.rows;
}

export async function getReservacionById(id: number): Promise<Reservacion | null> {
  return queryOne<Reservacion>(`
    SELECT 
      id, codigo, propiedad_id, huesped_id, tipo_huesped, 
      TO_CHAR(fecha_checkin, 'YYYY-MM-DD') AS fecha_checkin, 
      TO_CHAR(fecha_checkout, 'YYYY-MM-DD') AS fecha_checkout, 
      numero_ocupantes, numero_autos, notas, brazaletes, vehiculo_info, 
      CAST(balance AS FLOAT) as balance, estado, created_at, updated_at
    FROM ${T.reservaciones()}
    WHERE id = $1;
  `, [id]);
}

export async function createReservacion(
  data: Omit<Reservacion, 'id'>, 
  huespedData?: Omit<Huesped, 'id'>
): Promise<Reservacion> {
  // Check overlap first
  const overlap = await checkReservationOverlap(data.propiedad_id, data.fecha_checkin, data.fecha_checkout);
  if (overlap) {
    throw new Error(`Conflicto de fechas: La unidad ya está reservada del ${overlap.fecha_checkin} al ${overlap.fecha_checkout}`);
  }

  let finalHuespedId = data.huesped_id;
  if (huespedData && huespedData.nombres) {
    const createdGuest = await createHuesped(huespedData);
    finalHuespedId = createdGuest.id;
  }

  const generatedCode = data.codigo || `RES-${Math.floor(100000 + Math.random() * 900000)}`;

  const res = await query<Reservacion>(`
    INSERT INTO ${T.reservaciones()} (
      codigo, propiedad_id, huesped_id, tipo_huesped, 
      fecha_checkin, fecha_checkout, numero_ocupantes, numero_autos, 
      notas, brazaletes, vehiculo_info, balance, estado
    )
    VALUES ($1, $2, $3, $4, $5::date, $6::date, $7, $8, $9, $10, $11, $12, $13)
    RETURNING 
      id, codigo, propiedad_id, huesped_id, tipo_huesped, 
      TO_CHAR(fecha_checkin, 'YYYY-MM-DD') AS fecha_checkin, 
      TO_CHAR(fecha_checkout, 'YYYY-MM-DD') AS fecha_checkout, 
      numero_ocupantes, numero_autos, notas, brazaletes, vehiculo_info, 
      CAST(balance AS FLOAT) as balance, estado, created_at, updated_at;
  `, [
    generatedCode,
    data.propiedad_id,
    finalHuespedId,
    data.tipo_huesped || 'Dueño',
    data.fecha_checkin,
    data.fecha_checkout,
    data.numero_ocupantes || 1,
    data.numero_autos || 0,
    data.notas || null,
    data.brazaletes || null,
    data.vehiculo_info || null,
    data.balance || 0,
    data.estado || 'Confirmada'
  ]);

  return res.rows[0];
}

export async function updateReservacion(id: number, data: Partial<Reservacion>): Promise<Reservacion | null> {
  const current = await getReservacionById(id);
  if (!current) throw new Error(`Reservación con ID ${id} no encontrada`);

  const propId = data.propiedad_id !== undefined ? data.propiedad_id : current.propiedad_id;
  const checkin = data.fecha_checkin || current.fecha_checkin;
  const checkout = data.fecha_checkout || current.fecha_checkout;

  if (data.propiedad_id || data.fecha_checkin || data.fecha_checkout) {
    const overlap = await checkReservationOverlap(propId, checkin, checkout, id);
    if (overlap) {
      throw new Error(`Conflicto de fechas: La unidad ya está reservada del ${overlap.fecha_checkin} al ${overlap.fecha_checkout}`);
    }
  }

  const fields: string[] = ['updated_at = CURRENT_TIMESTAMP'];
  const values: any[] = [];
  let idx = 1;

  if (data.codigo !== undefined) { fields.push(`codigo = $${idx++}`); values.push(data.codigo); }
  if (data.propiedad_id !== undefined) { fields.push(`propiedad_id = $${idx++}`); values.push(data.propiedad_id); }
  if (data.huesped_id !== undefined) { fields.push(`huesped_id = $${idx++}`); values.push(data.huesped_id); }
  if (data.tipo_huesped !== undefined) { fields.push(`tipo_huesped = $${idx++}`); values.push(data.tipo_huesped); }
  if (data.fecha_checkin !== undefined) { fields.push(`fecha_checkin = $${idx++}::date`); values.push(data.fecha_checkin); }
  if (data.fecha_checkout !== undefined) { fields.push(`fecha_checkout = $${idx++}::date`); values.push(data.fecha_checkout); }
  if (data.numero_ocupantes !== undefined) { fields.push(`numero_ocupantes = $${idx++}`); values.push(data.numero_ocupantes); }
  if (data.numero_autos !== undefined) { fields.push(`numero_autos = $${idx++}`); values.push(data.numero_autos); }
  if (data.notas !== undefined) { fields.push(`notas = $${idx++}`); values.push(data.notas); }
  if (data.brazaletes !== undefined) { fields.push(`brazaletes = $${idx++}`); values.push(data.brazaletes); }
  if (data.vehiculo_info !== undefined) { fields.push(`vehiculo_info = $${idx++}`); values.push(data.vehiculo_info); }
  if (data.balance !== undefined) { fields.push(`balance = $${idx++}`); values.push(data.balance); }
  if (data.estado !== undefined) { fields.push(`estado = $${idx++}`); values.push(data.estado); }

  values.push(id);
  const res = await query<Reservacion>(`
    UPDATE ${T.reservaciones()}
    SET ${fields.join(', ')}
    WHERE id = $${idx}
    RETURNING 
      id, codigo, propiedad_id, huesped_id, tipo_huesped, 
      TO_CHAR(fecha_checkin, 'YYYY-MM-DD') AS fecha_checkin, 
      TO_CHAR(fecha_checkout, 'YYYY-MM-DD') AS fecha_checkout, 
      numero_ocupantes, numero_autos, notas, brazaletes, vehiculo_info, 
      CAST(balance AS FLOAT) as balance, estado, created_at, updated_at;
  `, values);

  return res.rows[0] || null;
}

export async function deleteReservacion(id: number): Promise<{ success: boolean; id: number }> {
  await query(`DELETE FROM ${T.reservaciones()} WHERE id = $1`, [id]);
  return { success: true, id };
}

// ==============================================================================
// 8. SOLICITUDES DE ACCESO / PASES DE TRABAJO
// ==============================================================================

export async function getAllSolicitudes(): Promise<SolicitudAcceso[]> {
  const res = await query<any>(`
    SELECT 
      id, propiedad_id, creador_nombre, solicitud, procesador_nombre,
      TO_CHAR(fecha_esperada, 'YYYY-MM-DD') AS fecha_esperada,
      comentario, estatus, created_at
    FROM ${T.solicitudes()}
    ORDER BY created_at DESC, id DESC;
  `);
  return res.rows;
}

export async function createSolicitud(data: Omit<SolicitudAcceso, 'id' | 'created_at'>): Promise<SolicitudAcceso> {
  const res = await query<SolicitudAcceso>(`
    INSERT INTO ${T.solicitudes()} (
      propiedad_id, creador_nombre, solicitud, procesador_nombre,
      fecha_esperada, comentario, estatus
    )
    VALUES ($1, $2, $3, $4, $5::date, $6, $7)
    RETURNING 
      id, propiedad_id, creador_nombre, solicitud, procesador_nombre,
      TO_CHAR(fecha_esperada, 'YYYY-MM-DD') AS fecha_esperada,
      comentario, estatus, created_at;
  `, [
    data.propiedad_id,
    data.creador_nombre.trim(),
    data.solicitud.trim(),
    data.procesador_nombre || null,
    data.fecha_esperada,
    data.comentario || null,
    data.estatus || 'Pendiente'
  ]);
  return res.rows[0];
}

export async function updateSolicitudStatus(
  id: number, 
  estatus: SolicitudAcceso['estatus'], 
  comentario?: string, 
  procesadorNombre?: string
): Promise<SolicitudAcceso | null> {
  const fields: string[] = ['estatus = $1'];
  const values: any[] = [estatus];
  let idx = 2;

  if (comentario !== undefined) {
    fields.push(`comentario = $${idx++}`);
    values.push(comentario);
  }
  if (procesadorNombre !== undefined) {
    fields.push(`procesador_nombre = $${idx++}`);
    values.push(procesadorNombre);
  }

  values.push(id);
  const res = await query<SolicitudAcceso>(`
    UPDATE ${T.solicitudes()}
    SET ${fields.join(', ')}
    WHERE id = $${idx}
    RETURNING 
      id, propiedad_id, creador_nombre, solicitud, procesador_nombre,
      TO_CHAR(fecha_esperada, 'YYYY-MM-DD') AS fecha_esperada,
      comentario, estatus, created_at;
  `, values);
  return res.rows[0] || null;
}

// ==============================================================================
// 9. DIAGNOSTICS & SYSTEM STATUS
// ==============================================================================

export async function getDatabaseHealth(): Promise<{
  connected: boolean;
  message: string;
  tables: Record<string, number>;
  environment: {
    hasCustomDbUrl: boolean;
    hasDatabaseUrl: boolean;
    hasPostgresUrl: boolean;
  };
}> {
  const connection = await testConnection();
  const envInfo = {
    hasCustomDbUrl: !!process.env.CUSTOM_DB_URL,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasPostgresUrl: !!process.env.POSTGRES_URL,
  };

  if (!connection.ok) {
    return {
      connected: false,
      message: connection.message,
      tables: {},
      environment: envInfo,
    };
  }

  const tableCounts: Record<string, number> = {};
  const schema = getQuotedSchema();
  const tables = ['edificios', 'grupos_propiedad', 'usuarios', 'propiedades', 'propiedad_usuarios', 'huespedes', 'reservaciones', 'solicitudes_acceso'];

  for (const table of tables) {
    try {
      const res = await query(`SELECT COUNT(*) FROM ${schema}."${table}"`);
      tableCounts[table] = parseInt(res.rows[0].count);
    } catch {
      tableCounts[table] = -1;
    }
  }

  return {
    connected: true,
    message: 'Base de datos conectada correctamente y operativa',
    tables: tableCounts,
    environment: envInfo,
  };
}
