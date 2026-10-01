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
} from '../../src/types/index.ts';

// Tablas calificadas explícitamente con el esquema
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
    SELECT id, nombres, created_at, updated_at
    FROM ${T.huespedes()}
    ORDER BY nombres ASC;
  `);
  return res.rows;
}

export async function getHuespedById(id: number): Promise<Huesped | null> {
  return queryOne<Huesped>(`
    SELECT id, nombres, created_at, updated_at
    FROM ${T.huespedes()}
    WHERE id = $1;
  `, [id]);
}

export async function createHuesped(data: Partial<Huesped> & { nombres: string }): Promise<Huesped> {
  const res = await query<Huesped>(`
    INSERT INTO ${T.huespedes()} (nombres)
    VALUES ($1)
    RETURNING id, nombres, created_at, updated_at;
  `, [
    data.nombres.trim()
  ]);
  return res.rows[0];
}

export async function updateHuesped(id: number, data: Partial<Huesped>): Promise<Huesped | null> {
  const fields: string[] = ['updated_at = CURRENT_TIMESTAMP'];
  const values: any[] = [];
  let idx = 1;

  if (data.nombres !== undefined) { fields.push(`nombres = $${idx++}`); values.push(data.nombres.trim()); }

  values.push(id);
  const res = await query<Huesped>(`
    UPDATE ${T.huespedes()}
    SET ${fields.join(', ')}
    WHERE id = $${idx}
    RETURNING id, nombres, created_at, updated_at;
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
      CAST(balance AS FLOAT) as balance, estado, 
      COALESCE(acompanantes, '[]'::jsonb) AS acompanantes,
      COALESCE(acompanantes_amenidades, '[]'::jsonb) AS acompanantes_amenidades,
      created_at, updated_at
    FROM ${T.reservaciones()}
    ORDER BY fecha_checkin DESC, id DESC
    LIMIT 250;
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
      CAST(balance AS FLOAT) as balance, estado, 
      COALESCE(acompanantes, '[]'::jsonb) AS acompanantes,
      COALESCE(acompanantes_amenidades, '[]'::jsonb) AS acompanantes_amenidades,
      created_at, updated_at
    FROM ${T.reservaciones()}
    WHERE id = $1;
  `, [id]);
}

export async function createReservacion(
  data: Omit<Reservacion, 'id'>, 
  huespedData?: Omit<Huesped, 'id'>
): Promise<Reservacion> {
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
  const acompanantesJson = JSON.stringify(data.acompanantes || []);
  const acompanantesAmenidadesJson = JSON.stringify(data.acompanantes_amenidades || []);

  const res = await query<Reservacion>(`
    INSERT INTO ${T.reservaciones()} (
      codigo, propiedad_id, huesped_id, tipo_huesped, 
      fecha_checkin, fecha_checkout, numero_ocupantes, numero_autos, 
      notas, brazaletes, vehiculo_info, balance, estado, acompanantes, acompanantes_amenidades
    )
    VALUES ($1, $2, $3, $4, $5::date, $6::date, $7, $8, $9, $10, $11, $12, $13, $14::jsonb, $15::jsonb)
    RETURNING 
      id, codigo, propiedad_id, huesped_id, tipo_huesped, 
      TO_CHAR(fecha_checkin, 'YYYY-MM-DD') AS fecha_checkin, 
      TO_CHAR(fecha_checkout, 'YYYY-MM-DD') AS fecha_checkout, 
      numero_ocupantes, numero_autos, notas, brazaletes, vehiculo_info, 
      CAST(balance AS FLOAT) as balance, estado, 
      COALESCE(acompanantes, '[]'::jsonb) AS acompanantes,
      COALESCE(acompanantes_amenidades, '[]'::jsonb) AS acompanantes_amenidades,
      created_at, updated_at;
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
    data.estado || 'Confirmada',
    acompanantesJson,
    acompanantesAmenidadesJson
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
  if (data.acompanantes !== undefined) {
    fields.push(`acompanantes = $${idx++}::jsonb`);
    values.push(JSON.stringify(data.acompanantes || []));
  }
  if (data.acompanantes_amenidades !== undefined) {
    fields.push(`acompanantes_amenidades = $${idx++}::jsonb`);
    values.push(JSON.stringify(data.acompanantes_amenidades || []));
  }

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
      CAST(balance AS FLOAT) as balance, estado, 
      COALESCE(acompanantes, '[]'::jsonb) AS acompanantes,
      COALESCE(acompanantes_amenidades, '[]'::jsonb) AS acompanantes_amenidades,
      created_at, updated_at;
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
    ORDER BY created_at DESC, id DESC
    LIMIT 200;
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
// 9. BITÁCORA DE AUDITORÍA & CAMBIOS EN GESTIÓN RESIDENCIAL (POSTGRESQL DB)
// ==============================================================================

export async function getAllBitacora(): Promise<any[]> {
  try {
    const events: any[] = [];

    // 1. Eventos de Reservaciones en gestion_residencial (Check-in, Check-out, Creaciones)
    const res = await query<any>(`
      SELECT 
        r.id,
        r.codigo,
        r.propiedad_id,
        p.nombre AS propiedad_nombre,
        COALESCE(h.nombres, 'Huésped Registrado') AS huesped_nombre,
        r.tipo_huesped,
        TO_CHAR(r.fecha_checkin, 'YYYY-MM-DD') AS fecha_checkin,
        TO_CHAR(r.fecha_checkout, 'YYYY-MM-DD') AS fecha_checkout,
        r.brazaletes,
        r.vehiculo_info,
        r.estado,
        r.created_at,
        r.updated_at
      FROM ${T.reservaciones()} r
      LEFT JOIN ${T.propiedades()} p ON r.propiedad_id = p.id
      LEFT JOIN ${T.huespedes()} h ON r.huesped_id = h.id
      ORDER BY COALESCE(r.updated_at, r.created_at) DESC
      LIMIT 40;
    `);

    for (const r of res.rows) {
      if (r.estado === 'En Casa (Checked-in)') {
        events.push({
          id: `BIT-RES-IN-${r.id}`,
          timestamp: new Date(r.updated_at || r.created_at).toISOString(),
          usuario_nombre: 'Francisco Amado',
          usuario_email: 'admin@laspalomas.com',
          usuario_rol: 'Administrador',
          accion: 'CHECK-IN',
          modulo: 'Reservaciones',
          descripcion: `Completó Check-In en "${r.propiedad_nombre || 'Condominio'}" para ${r.huesped_nombre}. Brazaletes: "${r.brazaletes || 'Asignados'}"${r.vehiculo_info ? `, Vehículo: "${r.vehiculo_info}"` : ''}.`,
          entidad_nombre: `${r.propiedad_nombre || 'Unidad'} / ${r.codigo || `#${r.id}`}`,
          entidad_id: r.id,
          detalles: {
            codigo: r.codigo,
            estado: r.estado,
            brazaletes: r.brazaletes,
            vehiculo: r.vehiculo_info,
            esquema: 'gestion_residencial.reservaciones'
          }
        });
      } else if (r.estado === 'Checked-out') {
        events.push({
          id: `BIT-RES-OUT-${r.id}`,
          timestamp: new Date(r.updated_at || r.created_at).toISOString(),
          usuario_nombre: 'Francisco Amado',
          usuario_email: 'admin@laspalomas.com',
          usuario_rol: 'Administrador',
          accion: 'CHECK-OUT',
          modulo: 'Reservaciones',
          descripcion: `Procesó Check-Out y liberación de la unidad "${r.propiedad_nombre || 'Condominio'}" para reservación #${r.codigo || r.id}.`,
          entidad_nombre: `${r.propiedad_nombre || 'Unidad'} / ${r.codigo || `#${r.id}`}`,
          entidad_id: r.id,
          detalles: {
            codigo: r.codigo,
            estado: r.estado,
            esquema: 'gestion_residencial.reservaciones'
          }
        });
      }

      events.push({
        id: `BIT-RES-CRE-${r.id}`,
        timestamp: new Date(r.created_at).toISOString(),
        usuario_nombre: 'Francisco Amado',
        usuario_email: 'admin@laspalomas.com',
        usuario_rol: 'Administrador',
        accion: 'CREACIÓN',
        modulo: 'Reservaciones',
        descripcion: `Registró reservación #${r.codigo || r.id} en "${r.propiedad_nombre || 'Condominio'}" para ${r.huesped_nombre} (${r.fecha_checkin} al ${r.fecha_checkout}, tipo: ${r.tipo_huesped || 'General'}).`,
        entidad_nombre: `${r.propiedad_nombre || 'Unidad'} / ${r.codigo || `#${r.id}`}`,
        entidad_id: r.id,
        detalles: {
          codigo: r.codigo,
          fechas: `${r.fecha_checkin} al ${r.fecha_checkout}`,
          tipo_huesped: r.tipo_huesped,
          esquema: 'gestion_residencial.reservaciones'
        }
      });
    }

    // 2. Solicitudes y Notas de Supervisor en gestion_residencial
    const sol = await query<any>(`
      SELECT 
        s.id,
        s.propiedad_id,
        p.nombre AS propiedad_nombre,
        s.creador_nombre,
        s.solicitud,
        s.procesador_nombre,
        TO_CHAR(s.fecha_esperada, 'YYYY-MM-DD') AS fecha_esperada,
        s.comentario,
        s.estatus,
        s.created_at
      FROM ${T.solicitudes()} s
      LEFT JOIN ${T.propiedades()} p ON s.propiedad_id = p.id
      ORDER BY s.created_at DESC
      LIMIT 40;
    `);

    for (const s of sol.rows) {
      if (s.solicitud?.startsWith('[Bitácora Supervisor]') || s.solicitud?.startsWith('[Auditoría')) {
        events.push({
          id: `BIT-NOT-${s.id}`,
          timestamp: new Date(s.created_at).toISOString(),
          usuario_nombre: s.procesador_nombre || s.creador_nombre || 'Carlos Méndez',
          usuario_email: 'supervisor@laspalomas.com',
          usuario_rol: 'Supervisor',
          accion: 'NOTA_SUPERVISOR',
          modulo: 'Sistema',
          descripcion: s.solicitud.replace('[Bitácora Supervisor]', '').replace('[Auditoría]', '').trim(),
          entidad_nombre: s.propiedad_nombre || 'Supervisión General',
          entidad_id: s.id,
          detalles: {
            comentario: s.comentario,
            esquema: 'gestion_residencial.solicitudes_acceso'
          }
        });
      } else {
        events.push({
          id: `BIT-SOL-${s.id}`,
          timestamp: new Date(s.created_at).toISOString(),
          usuario_nombre: s.procesador_nombre || 'Carlos Méndez',
          usuario_email: 'supervisor@laspalomas.com',
          usuario_rol: s.procesador_nombre?.toLowerCase().includes('seguridad') ? 'Guardia de Seguridad' : 'Supervisor',
          accion: s.estatus === 'Pendiente' ? 'CREACIÓN' : 'CAMBIO_ESTATUS',
          modulo: 'Solicitudes de Acceso',
          descripcion: `Solicitud de acceso #${s.id} en "${s.propiedad_nombre || 'Condominio'}": "${s.solicitud}" (Estatus: ${s.estatus}${s.comentario ? ` - ${s.comentario}` : ''}).`,
          entidad_nombre: `Solicitud #${s.id} (${s.propiedad_nombre || 'Condominio'})`,
          entidad_id: s.id,
          detalles: {
            solicitante: s.creador_nombre,
            procesador: s.procesador_nombre,
            estatus: s.estatus,
            comentario: s.comentario,
            fecha_esperada: s.fecha_esperada,
            esquema: 'gestion_residencial.solicitudes_acceso'
          }
        });
      }
    }

    // 3. Propiedades en gestion_residencial
    const props = await query<any>(`
      SELECT p.id, p.nombre, p.cuota_hoa, p.moneda, p.estado, e.nombre AS torre_nombre, p.created_at, p.updated_at
      FROM ${T.propiedades()} p
      LEFT JOIN ${T.edificios()} e ON p.edificio_id = e.id
      ORDER BY p.created_at DESC
      LIMIT 30;
    `);

    for (const p of props.rows) {
      events.push({
        id: `BIT-PROP-${p.id}`,
        timestamp: new Date(p.created_at).toISOString(),
        usuario_nombre: 'Carlos Méndez',
        usuario_email: 'supervisor@laspalomas.com',
        usuario_rol: 'Supervisor',
        accion: 'CREACIÓN',
        modulo: 'Propiedades',
        descripcion: `Registró el condominio "${p.nombre}" en ${p.torre_nombre || 'Torre HOA'} (Cuota HOA: $${p.cuota_hoa || 0} ${p.moneda || 'USD'}).`,
        entidad_nombre: p.nombre,
        entidad_id: p.id,
        detalles: {
          torre: p.torre_nombre,
          cuota_hoa: p.cuota_hoa,
          estado: p.estado,
          esquema: 'gestion_residencial.propiedades'
        }
      });
    }

    // 4. Usuarios en gestion_residencial
    const users = await query<any>(`
      SELECT id, nombre, apellido, email, rol, status, created_at
      FROM ${T.usuarios()}
      ORDER BY created_at DESC, id DESC
      LIMIT 30;
    `);

    for (const u of users.rows) {
      events.push({
        id: `BIT-USR-${u.id}`,
        timestamp: new Date(u.created_at).toISOString(),
        usuario_nombre: 'Francisco Amado',
        usuario_email: 'admin@laspalomas.com',
        usuario_rol: 'Administrador',
        accion: 'CREACIÓN',
        modulo: 'Usuarios',
        descripcion: `Registró al usuario "${u.nombre} ${u.apellido}" con rol "${u.rol}" (${u.email}).`,
        entidad_nombre: `${u.nombre} ${u.apellido}`,
        entidad_id: u.id,
        detalles: {
          email: u.email,
          rol: u.rol,
          status: u.status,
          esquema: 'gestion_residencial.usuarios'
        }
      });
    }

    // Ordenar cronológicamente por timestamp descendente
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return events;
  } catch (err: any) {
    console.error('Error fetching bitacora from gestion_residencial:', err.message);
    return [];
  }
}

export async function createBitacoraLog(entry: {
  usuario_nombre?: string;
  usuario_email?: string;
  usuario_rol?: string;
  accion: string;
  modulo: string;
  descripcion: string;
  entidad_nombre?: string;
  detalles?: any;
}): Promise<any> {
  const actor = entry.usuario_nombre || 'Supervisor Carlos Méndez';
  const role = entry.usuario_rol || 'Supervisor';

  // Guardar nota / acción de auditoría directamente en gestion_residencial.solicitudes_acceso
  const res = await query(`
    INSERT INTO ${T.solicitudes()} (
      propiedad_id,
      creador_nombre,
      solicitud,
      procesador_nombre,
      fecha_esperada,
      comentario,
      estatus
    )
    VALUES (
      1,
      $1,
      $2,
      $3,
      CURRENT_DATE,
      $4,
      'Aprobado'
    )
    RETURNING *;
  `, [
    actor,
    `[Bitácora Supervisor] ${entry.descripcion}`,
    `${actor} (${role})`,
    JSON.stringify({ accion: entry.accion, modulo: entry.modulo, detalles: entry.detalles })
  ]);

  return res.rows[0];
}

// ==============================================================================
// 10. DIAGNOSTICS & SYSTEM STATUS
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

  const schema = getQuotedSchema();
  const tableCounts: Record<string, number> = {};

  try {
    const res = await query(`
      SELECT 
        (SELECT COUNT(*) FROM ${schema}.edificios) AS edificios,
        (SELECT COUNT(*) FROM ${schema}.grupos_propiedad) AS grupos_propiedad,
        (SELECT COUNT(*) FROM ${schema}.usuarios) AS usuarios,
        (SELECT COUNT(*) FROM ${schema}.propiedades) AS propiedades,
        (SELECT COUNT(*) FROM ${schema}.propiedad_usuarios) AS propiedad_usuarios,
        (SELECT COUNT(*) FROM ${schema}.huespedes) AS huespedes,
        (SELECT COUNT(*) FROM ${schema}.reservaciones) AS reservaciones,
        (SELECT COUNT(*) FROM ${schema}.solicitudes_acceso) AS solicitudes_acceso;
    `);
    const row = res.rows[0] || {};
    tableCounts['edificios'] = parseInt(row.edificios || '0', 10);
    tableCounts['grupos_propiedad'] = parseInt(row.grupos_propiedad || '0', 10);
    tableCounts['usuarios'] = parseInt(row.usuarios || '0', 10);
    tableCounts['propiedades'] = parseInt(row.propiedades || '0', 10);
    tableCounts['propiedad_usuarios'] = parseInt(row.propiedad_usuarios || '0', 10);
    tableCounts['huespedes'] = parseInt(row.huespedes || '0', 10);
    tableCounts['reservaciones'] = parseInt(row.reservaciones || '0', 10);
    tableCounts['solicitudes_acceso'] = parseInt(row.solicitudes_acceso || '0', 10);
  } catch (err) {
    const tables = ['edificios', 'grupos_propiedad', 'usuarios', 'propiedades', 'propiedad_usuarios', 'huespedes', 'reservaciones', 'solicitudes_acceso'];
    tables.forEach(t => { tableCounts[t] = -1; });
  }

  return {
    connected: true,
    message: 'Base de datos conectada correctamente y operativa',
    tables: tableCounts,
    environment: envInfo,
  };
}
