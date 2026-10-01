// server/db.ts
import pg from "pg";
import dotenv from "dotenv";
if (typeof dotenv?.config === "function") {
  dotenv.config();
}
var { Pool } = pg;
var pool = null;
function getConnectionString() {
  return (process.env.CUSTOM_DB_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING || "").trim();
}
function getSchemaName() {
  return (process.env.DB_SCHEMA || "gestion_residencial").trim();
}
function getQuotedSchema() {
  const schema = getSchemaName();
  return schema.includes(" ") ? `"${schema.replace(/"/g, '""')}"` : schema;
}
function getDbPool() {
  if (pool) {
    return pool;
  }
  const rawUrl = getConnectionString();
  if (!rawUrl) {
    const msg = "No se encontr\xF3 URL de base de datos en las variables de entorno (CUSTOM_DB_URL, DATABASE_URL o POSTGRES_URL en Vercel).";
    console.error(`[DB Error] ${msg}`);
    throw new Error(msg);
  }
  const cleanUrl = rawUrl.replace(/[\?&]sslmode=[^&]+/, "").replace(/[\?&]supa=[^&]+/, "");
  const connectionString = cleanUrl ? cleanUrl.includes("?") ? `${cleanUrl}&sslmode=no-verify` : `${cleanUrl}?sslmode=no-verify` : "";
  pool = new Pool({
    connectionString,
    ssl: connectionString.includes("localhost") || connectionString.includes("127.0.0.1") ? false : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 3e4,
    connectionTimeoutMillis: 1e4
  });
  pool.on("error", (err) => {
    console.error("[DB] Error inesperado en cliente inactivo de PostgreSQL:", err);
  });
  return pool;
}
async function query(text, params = []) {
  const p = getDbPool();
  const start = Date.now();
  try {
    const res = await p.query(text, params);
    return res;
  } catch (err) {
    console.error(`[DB Error] ${err.message}
SQL: ${text}
Params:`, params);
    throw err;
  }
}
async function queryOne(text, params = []) {
  const res = await query(text, params);
  return res.rows && res.rows.length > 0 ? res.rows[0] : null;
}
async function testConnection() {
  try {
    const schema = getSchemaName();
    const res = await query(`SELECT version(), current_database()`);
    return {
      ok: true,
      message: `Conexi\xF3n a PostgreSQL exitosa (Esquema: ${schema})`,
      version: res.rows[0]?.version,
      schema
    };
  } catch (err) {
    return {
      ok: false,
      message: err.message || "Error al conectar a la base de datos"
    };
  }
}

// server/services/hoaService.ts
var T = {
  edificios: () => `${getQuotedSchema()}.edificios`,
  grupos: () => `${getQuotedSchema()}.grupos_propiedad`,
  usuarios: () => `${getQuotedSchema()}.usuarios`,
  propiedades: () => `${getQuotedSchema()}.propiedades`,
  propiedadUsuarios: () => `${getQuotedSchema()}.propiedad_usuarios`,
  huespedes: () => `${getQuotedSchema()}.huespedes`,
  reservaciones: () => `${getQuotedSchema()}.reservaciones`,
  solicitudes: () => `${getQuotedSchema()}.solicitudes_acceso`
};
async function getAllEdificios() {
  const res = await query(`
    SELECT id, nombre, activo, created_at
    FROM ${T.edificios()}
    ORDER BY id ASC;
  `);
  return res.rows;
}
async function getEdificioById(id) {
  return queryOne(`
    SELECT id, nombre, activo, created_at
    FROM ${T.edificios()}
    WHERE id = $1;
  `, [id]);
}
async function createEdificio(data) {
  const res = await query(`
    INSERT INTO ${T.edificios()} (nombre, activo)
    VALUES ($1, $2)
    RETURNING id, nombre, activo, created_at;
  `, [data.nombre.trim(), data.activo !== void 0 ? data.activo : true]);
  return res.rows[0];
}
async function updateEdificio(id, data) {
  const fields = [];
  const values = [];
  let idx = 1;
  if (data.nombre !== void 0) {
    fields.push(`nombre = $${idx++}`);
    values.push(data.nombre.trim());
  }
  if (data.activo !== void 0) {
    fields.push(`activo = $${idx++}`);
    values.push(data.activo);
  }
  if (fields.length === 0) return getEdificioById(id);
  values.push(id);
  const res = await query(`
    UPDATE ${T.edificios()}
    SET ${fields.join(", ")}
    WHERE id = $${idx}
    RETURNING id, nombre, activo, created_at;
  `, values);
  return res.rows[0] || null;
}
async function deleteEdificio(id) {
  await query(`DELETE FROM ${T.edificios()} WHERE id = $1`, [id]);
  return { success: true, id };
}
async function getAllGrupos() {
  const res = await query(`
    SELECT id, nombre, fechas_cobro, intereses_moratorios, balance_bajo, created_at
    FROM ${T.grupos()}
    ORDER BY id ASC;
  `);
  return res.rows;
}
async function getGrupoById(id) {
  return queryOne(`
    SELECT id, nombre, fechas_cobro, intereses_moratorios, balance_bajo, created_at
    FROM ${T.grupos()}
    WHERE id = $1;
  `, [id]);
}
async function createGrupo(data) {
  const res = await query(`
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
async function updateGrupo(id, data) {
  const fields = [];
  const values = [];
  let idx = 1;
  if (data.nombre !== void 0) {
    fields.push(`nombre = $${idx++}`);
    values.push(data.nombre.trim());
  }
  if (data.fechas_cobro !== void 0) {
    fields.push(`fechas_cobro = $${idx++}`);
    values.push(data.fechas_cobro);
  }
  if (data.intereses_moratorios !== void 0) {
    fields.push(`intereses_moratorios = $${idx++}`);
    values.push(data.intereses_moratorios);
  }
  if (data.balance_bajo !== void 0) {
    fields.push(`balance_bajo = $${idx++}`);
    values.push(data.balance_bajo);
  }
  if (fields.length === 0) return getGrupoById(id);
  values.push(id);
  const res = await query(`
    UPDATE ${T.grupos()}
    SET ${fields.join(", ")}
    WHERE id = $${idx}
    RETURNING id, nombre, fechas_cobro, intereses_moratorios, balance_bajo, created_at;
  `, values);
  return res.rows[0] || null;
}
async function deleteGrupo(id) {
  await query(`DELETE FROM ${T.grupos()} WHERE id = $1`, [id]);
  return { success: true, id };
}
async function getAllUsuarios() {
  const res = await query(`
    SELECT id, email, nombre, apellido, rol, telefono, idioma, ciudad, estado AS estado_geo, codigo_postal, status, created_at, updated_at
    FROM ${T.usuarios()}
    ORDER BY nombre ASC, apellido ASC;
  `);
  return res.rows;
}
async function getUsuarioById(id) {
  return queryOne(`
    SELECT id, email, nombre, apellido, rol, telefono, idioma, ciudad, estado AS estado_geo, codigo_postal, status, created_at, updated_at
    FROM ${T.usuarios()}
    WHERE id = $1;
  `, [id]);
}
async function createUsuario(data) {
  const res = await query(`
    INSERT INTO ${T.usuarios()} (email, nombre, apellido, rol, telefono, idioma, ciudad, estado, codigo_postal, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id, email, nombre, apellido, rol, telefono, idioma, ciudad, estado AS estado_geo, codigo_postal, status, created_at, updated_at;
  `, [
    data.email.trim().toLowerCase(),
    data.nombre.trim(),
    data.apellido.trim(),
    data.rol || "Due\xF1o",
    data.telefono || null,
    data.idioma || "es",
    data.ciudad || null,
    data.estado_geo || null,
    data.codigo_postal || null,
    data.status || "Active"
  ]);
  return res.rows[0];
}
async function updateUsuario(id, data) {
  const fields = ["updated_at = CURRENT_TIMESTAMP"];
  const values = [];
  let idx = 1;
  if (data.email !== void 0) {
    fields.push(`email = $${idx++}`);
    values.push(data.email.trim().toLowerCase());
  }
  if (data.nombre !== void 0) {
    fields.push(`nombre = $${idx++}`);
    values.push(data.nombre.trim());
  }
  if (data.apellido !== void 0) {
    fields.push(`apellido = $${idx++}`);
    values.push(data.apellido.trim());
  }
  if (data.rol !== void 0) {
    fields.push(`rol = $${idx++}`);
    values.push(data.rol);
  }
  if (data.telefono !== void 0) {
    fields.push(`telefono = $${idx++}`);
    values.push(data.telefono);
  }
  if (data.idioma !== void 0) {
    fields.push(`idioma = $${idx++}`);
    values.push(data.idioma);
  }
  if (data.ciudad !== void 0) {
    fields.push(`ciudad = $${idx++}`);
    values.push(data.ciudad);
  }
  if (data.estado_geo !== void 0) {
    fields.push(`estado = $${idx++}`);
    values.push(data.estado_geo);
  }
  if (data.codigo_postal !== void 0) {
    fields.push(`codigo_postal = $${idx++}`);
    values.push(data.codigo_postal);
  }
  if (data.status !== void 0) {
    fields.push(`status = $${idx++}`);
    values.push(data.status);
  }
  values.push(id);
  const res = await query(`
    UPDATE ${T.usuarios()}
    SET ${fields.join(", ")}
    WHERE id = $${idx}
    RETURNING id, email, nombre, apellido, rol, telefono, idioma, ciudad, estado AS estado_geo, codigo_postal, status, created_at, updated_at;
  `, values);
  return res.rows[0] || null;
}
async function deleteUsuario(id) {
  await query(`DELETE FROM ${T.usuarios()} WHERE id = $1`, [id]);
  return { success: true, id };
}
async function getAllPropiedades() {
  const res = await query(`
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
async function getPropiedadById(id) {
  return queryOne(`
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
async function createPropiedad(data, ownerId) {
  const res = await query(`
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
    data.moneda || "USD",
    data.estado || "Active",
    data.cuota_hoa || 0,
    data.notas || null
  ]);
  const createdProp = res.rows[0];
  if (ownerId && ownerId > 0) {
    await query(`
      INSERT INTO ${T.propiedadUsuarios()} (propiedad_id, usuario_id, tipo_relacion, es_principal)
      VALUES ($1, $2, 'Owner', true)
      ON CONFLICT (propiedad_id, usuario_id) DO UPDATE SET es_principal = true;
    `, [createdProp.id, ownerId]);
  }
  return createdProp;
}
async function updatePropiedad(id, data, ownerId) {
  const fields = ["updated_at = CURRENT_TIMESTAMP"];
  const values = [];
  let idx = 1;
  if (data.nombre !== void 0) {
    fields.push(`nombre = $${idx++}`);
    values.push(data.nombre.trim());
  }
  if (data.edificio_id !== void 0) {
    fields.push(`edificio_id = $${idx++}`);
    values.push(data.edificio_id);
  }
  if (data.grupo_id !== void 0) {
    fields.push(`grupo_id = $${idx++}`);
    values.push(data.grupo_id);
  }
  if (data.piso !== void 0) {
    fields.push(`piso = $${idx++}`);
    values.push(data.piso);
  }
  if (data.area !== void 0) {
    fields.push(`area = $${idx++}`);
    values.push(data.area);
  }
  if (data.tipo_cuarto !== void 0) {
    fields.push(`tipo_cuarto = $${idx++}`);
    values.push(data.tipo_cuarto);
  }
  if (data.dormitorios !== void 0) {
    fields.push(`dormitorios = $${idx++}`);
    values.push(data.dormitorios);
  }
  if (data.banos !== void 0) {
    fields.push(`banos = $${idx++}`);
    values.push(data.banos);
  }
  if (data.capacidad_personas !== void 0) {
    fields.push(`capacidad_personas = $${idx++}`);
    values.push(data.capacidad_personas);
  }
  if (data.max_carros !== void 0) {
    fields.push(`max_carros = $${idx++}`);
    values.push(data.max_carros);
  }
  if (data.id_impuesto !== void 0) {
    fields.push(`id_impuesto = $${idx++}`);
    values.push(data.id_impuesto);
  }
  if (data.medidor_agua !== void 0) {
    fields.push(`medidor_agua = $${idx++}`);
    values.push(data.medidor_agua);
  }
  if (data.medidor_electricidad !== void 0) {
    fields.push(`medidor_electricidad = $${idx++}`);
    values.push(data.medidor_electricidad);
  }
  if (data.empresa_manejadora !== void 0) {
    fields.push(`empresa_manejadora = $${idx++}`);
    values.push(data.empresa_manejadora);
  }
  if (data.moneda !== void 0) {
    fields.push(`moneda = $${idx++}`);
    values.push(data.moneda);
  }
  if (data.estado !== void 0) {
    fields.push(`estado = $${idx++}`);
    values.push(data.estado);
  }
  if (data.cuota_hoa !== void 0) {
    fields.push(`cuota_hoa = $${idx++}`);
    values.push(data.cuota_hoa);
  }
  if (data.notas !== void 0) {
    fields.push(`notas = $${idx++}`);
    values.push(data.notas);
  }
  values.push(id);
  const res = await query(`
    UPDATE ${T.propiedades()}
    SET ${fields.join(", ")}
    WHERE id = $${idx}
    RETURNING 
      id, nombre, edificio_id, grupo_id, piso, area, tipo_cuarto, 
      dormitorios, CAST(banos AS FLOAT) as banos, capacidad_personas, max_carros, 
      id_impuesto, medidor_agua, medidor_electricidad, empresa_manejadora, 
      moneda, estado, CAST(cuota_hoa AS FLOAT) as cuota_hoa, notas, 
      created_at, updated_at;
  `, values);
  if (ownerId !== void 0) {
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
async function deletePropiedad(id) {
  await query(`DELETE FROM ${T.propiedades()} WHERE id = $1`, [id]);
  return { success: true, id };
}
async function getAllPropiedadUsuarios() {
  const res = await query(`
    SELECT id, propiedad_id, usuario_id, tipo_relacion, es_principal, created_at
    FROM ${T.propiedadUsuarios()}
    ORDER BY id ASC;
  `);
  return res.rows;
}
async function createPropiedadUsuario(data) {
  const res = await query(`
    INSERT INTO ${T.propiedadUsuarios()} (propiedad_id, usuario_id, tipo_relacion, es_principal)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (propiedad_id, usuario_id) 
    DO UPDATE SET tipo_relacion = EXCLUDED.tipo_relacion, es_principal = EXCLUDED.es_principal
    RETURNING id, propiedad_id, usuario_id, tipo_relacion, es_principal, created_at;
  `, [
    data.propiedad_id,
    data.usuario_id,
    data.tipo_relacion || "Owner",
    data.es_principal !== void 0 ? data.es_principal : true
  ]);
  return res.rows[0];
}
async function deletePropiedadUsuario(id) {
  await query(`DELETE FROM ${T.propiedadUsuarios()} WHERE id = $1`, [id]);
  return { success: true, id };
}
async function getAllHuespedes() {
  const res = await query(`
    SELECT id, nombres, created_at, updated_at
    FROM ${T.huespedes()}
    ORDER BY nombres ASC;
  `);
  return res.rows;
}
async function getHuespedById(id) {
  return queryOne(`
    SELECT id, nombres, created_at, updated_at
    FROM ${T.huespedes()}
    WHERE id = $1;
  `, [id]);
}
async function createHuesped(data) {
  const res = await query(`
    INSERT INTO ${T.huespedes()} (nombres)
    VALUES ($1)
    RETURNING id, nombres, created_at, updated_at;
  `, [
    data.nombres.trim()
  ]);
  return res.rows[0];
}
async function updateHuesped(id, data) {
  const fields = ["updated_at = CURRENT_TIMESTAMP"];
  const values = [];
  let idx = 1;
  if (data.nombres !== void 0) {
    fields.push(`nombres = $${idx++}`);
    values.push(data.nombres.trim());
  }
  values.push(id);
  const res = await query(`
    UPDATE ${T.huespedes()}
    SET ${fields.join(", ")}
    WHERE id = $${idx}
    RETURNING id, nombres, created_at, updated_at;
  `, values);
  return res.rows[0] || null;
}
async function deleteHuesped(id) {
  await query(`DELETE FROM ${T.huespedes()} WHERE id = $1`, [id]);
  return { success: true, id };
}
async function checkReservationOverlap(propiedadId, checkin, checkout, excludeId) {
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
      ${excludeId ? `AND id != ${excludeId}` : ""}
    LIMIT 1;
  `;
  return queryOne(queryText, [propiedadId, checkin, checkout]);
}
async function getAllReservaciones() {
  const res = await query(`
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
async function getReservacionById(id) {
  return queryOne(`
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
async function createReservacion(data, huespedData) {
  const overlap = await checkReservationOverlap(data.propiedad_id, data.fecha_checkin, data.fecha_checkout);
  if (overlap) {
    throw new Error(`Conflicto de fechas: La unidad ya est\xE1 reservada del ${overlap.fecha_checkin} al ${overlap.fecha_checkout}`);
  }
  let finalHuespedId = data.huesped_id;
  if (huespedData && huespedData.nombres) {
    const createdGuest = await createHuesped(huespedData);
    finalHuespedId = createdGuest.id;
  }
  const generatedCode = data.codigo || `RES-${Math.floor(1e5 + Math.random() * 9e5)}`;
  const acompanantesJson = JSON.stringify(data.acompanantes || []);
  const acompanantesAmenidadesJson = JSON.stringify(data.acompanantes_amenidades || []);
  const res = await query(`
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
    data.tipo_huesped || "Due\xF1o",
    data.fecha_checkin,
    data.fecha_checkout,
    data.numero_ocupantes || 1,
    data.numero_autos || 0,
    data.notas || null,
    data.brazaletes || null,
    data.vehiculo_info || null,
    data.balance || 0,
    data.estado || "Confirmada",
    acompanantesJson,
    acompanantesAmenidadesJson
  ]);
  return res.rows[0];
}
async function updateReservacion(id, data) {
  const current = await getReservacionById(id);
  if (!current) throw new Error(`Reservaci\xF3n con ID ${id} no encontrada`);
  const propId = data.propiedad_id !== void 0 ? data.propiedad_id : current.propiedad_id;
  const checkin = data.fecha_checkin || current.fecha_checkin;
  const checkout = data.fecha_checkout || current.fecha_checkout;
  if (data.propiedad_id || data.fecha_checkin || data.fecha_checkout) {
    const overlap = await checkReservationOverlap(propId, checkin, checkout, id);
    if (overlap) {
      throw new Error(`Conflicto de fechas: La unidad ya est\xE1 reservada del ${overlap.fecha_checkin} al ${overlap.fecha_checkout}`);
    }
  }
  const fields = ["updated_at = CURRENT_TIMESTAMP"];
  const values = [];
  let idx = 1;
  if (data.codigo !== void 0) {
    fields.push(`codigo = $${idx++}`);
    values.push(data.codigo);
  }
  if (data.propiedad_id !== void 0) {
    fields.push(`propiedad_id = $${idx++}`);
    values.push(data.propiedad_id);
  }
  if (data.huesped_id !== void 0) {
    fields.push(`huesped_id = $${idx++}`);
    values.push(data.huesped_id);
  }
  if (data.tipo_huesped !== void 0) {
    fields.push(`tipo_huesped = $${idx++}`);
    values.push(data.tipo_huesped);
  }
  if (data.fecha_checkin !== void 0) {
    fields.push(`fecha_checkin = $${idx++}::date`);
    values.push(data.fecha_checkin);
  }
  if (data.fecha_checkout !== void 0) {
    fields.push(`fecha_checkout = $${idx++}::date`);
    values.push(data.fecha_checkout);
  }
  if (data.numero_ocupantes !== void 0) {
    fields.push(`numero_ocupantes = $${idx++}`);
    values.push(data.numero_ocupantes);
  }
  if (data.numero_autos !== void 0) {
    fields.push(`numero_autos = $${idx++}`);
    values.push(data.numero_autos);
  }
  if (data.notas !== void 0) {
    fields.push(`notas = $${idx++}`);
    values.push(data.notas);
  }
  if (data.brazaletes !== void 0) {
    fields.push(`brazaletes = $${idx++}`);
    values.push(data.brazaletes);
  }
  if (data.vehiculo_info !== void 0) {
    fields.push(`vehiculo_info = $${idx++}`);
    values.push(data.vehiculo_info);
  }
  if (data.balance !== void 0) {
    fields.push(`balance = $${idx++}`);
    values.push(data.balance);
  }
  if (data.estado !== void 0) {
    fields.push(`estado = $${idx++}`);
    values.push(data.estado);
  }
  if (data.acompanantes !== void 0) {
    fields.push(`acompanantes = $${idx++}::jsonb`);
    values.push(JSON.stringify(data.acompanantes || []));
  }
  if (data.acompanantes_amenidades !== void 0) {
    fields.push(`acompanantes_amenidades = $${idx++}::jsonb`);
    values.push(JSON.stringify(data.acompanantes_amenidades || []));
  }
  values.push(id);
  const res = await query(`
    UPDATE ${T.reservaciones()}
    SET ${fields.join(", ")}
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
async function deleteReservacion(id) {
  await query(`DELETE FROM ${T.reservaciones()} WHERE id = $1`, [id]);
  return { success: true, id };
}
async function getAllSolicitudes() {
  const res = await query(`
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
async function createSolicitud(data) {
  const res = await query(`
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
    data.estatus || "Pendiente"
  ]);
  return res.rows[0];
}
async function updateSolicitudStatus(id, estatus, comentario, procesadorNombre) {
  const fields = ["estatus = $1"];
  const values = [estatus];
  let idx = 2;
  if (comentario !== void 0) {
    fields.push(`comentario = $${idx++}`);
    values.push(comentario);
  }
  if (procesadorNombre !== void 0) {
    fields.push(`procesador_nombre = $${idx++}`);
    values.push(procesadorNombre);
  }
  values.push(id);
  const res = await query(`
    UPDATE ${T.solicitudes()}
    SET ${fields.join(", ")}
    WHERE id = $${idx}
    RETURNING 
      id, propiedad_id, creador_nombre, solicitud, procesador_nombre,
      TO_CHAR(fecha_esperada, 'YYYY-MM-DD') AS fecha_esperada,
      comentario, estatus, created_at;
  `, values);
  return res.rows[0] || null;
}
async function getAllBitacora() {
  try {
    const events = [];
    const res = await query(`
      SELECT 
        r.id,
        r.codigo,
        r.propiedad_id,
        p.nombre AS propiedad_nombre,
        COALESCE(h.nombres, 'Hu\xE9sped Registrado') AS huesped_nombre,
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
      if (r.estado === "En Casa (Checked-in)") {
        events.push({
          id: `BIT-RES-IN-${r.id}`,
          timestamp: new Date(r.updated_at || r.created_at).toISOString(),
          usuario_nombre: "Francisco Amado",
          usuario_email: "admin@laspalomas.com",
          usuario_rol: "Administrador",
          accion: "CHECK-IN",
          modulo: "Reservaciones",
          descripcion: `Complet\xF3 Check-In en "${r.propiedad_nombre || "Condominio"}" para ${r.huesped_nombre}. Brazaletes: "${r.brazaletes || "Asignados"}"${r.vehiculo_info ? `, Veh\xEDculo: "${r.vehiculo_info}"` : ""}.`,
          entidad_nombre: `${r.propiedad_nombre || "Unidad"} / ${r.codigo || `#${r.id}`}`,
          entidad_id: r.id,
          detalles: {
            codigo: r.codigo,
            estado: r.estado,
            brazaletes: r.brazaletes,
            vehiculo: r.vehiculo_info,
            esquema: "gestion_residencial.reservaciones"
          }
        });
      } else if (r.estado === "Checked-out") {
        events.push({
          id: `BIT-RES-OUT-${r.id}`,
          timestamp: new Date(r.updated_at || r.created_at).toISOString(),
          usuario_nombre: "Francisco Amado",
          usuario_email: "admin@laspalomas.com",
          usuario_rol: "Administrador",
          accion: "CHECK-OUT",
          modulo: "Reservaciones",
          descripcion: `Proces\xF3 Check-Out y liberaci\xF3n de la unidad "${r.propiedad_nombre || "Condominio"}" para reservaci\xF3n #${r.codigo || r.id}.`,
          entidad_nombre: `${r.propiedad_nombre || "Unidad"} / ${r.codigo || `#${r.id}`}`,
          entidad_id: r.id,
          detalles: {
            codigo: r.codigo,
            estado: r.estado,
            esquema: "gestion_residencial.reservaciones"
          }
        });
      }
      events.push({
        id: `BIT-RES-CRE-${r.id}`,
        timestamp: new Date(r.created_at).toISOString(),
        usuario_nombre: "Francisco Amado",
        usuario_email: "admin@laspalomas.com",
        usuario_rol: "Administrador",
        accion: "CREACI\xD3N",
        modulo: "Reservaciones",
        descripcion: `Registr\xF3 reservaci\xF3n #${r.codigo || r.id} en "${r.propiedad_nombre || "Condominio"}" para ${r.huesped_nombre} (${r.fecha_checkin} al ${r.fecha_checkout}, tipo: ${r.tipo_huesped || "General"}).`,
        entidad_nombre: `${r.propiedad_nombre || "Unidad"} / ${r.codigo || `#${r.id}`}`,
        entidad_id: r.id,
        detalles: {
          codigo: r.codigo,
          fechas: `${r.fecha_checkin} al ${r.fecha_checkout}`,
          tipo_huesped: r.tipo_huesped,
          esquema: "gestion_residencial.reservaciones"
        }
      });
    }
    const sol = await query(`
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
      if (s.solicitud?.startsWith("[Bit\xE1cora Supervisor]") || s.solicitud?.startsWith("[Auditor\xEDa")) {
        events.push({
          id: `BIT-NOT-${s.id}`,
          timestamp: new Date(s.created_at).toISOString(),
          usuario_nombre: s.procesador_nombre || s.creador_nombre || "Carlos M\xE9ndez",
          usuario_email: "supervisor@laspalomas.com",
          usuario_rol: "Supervisor",
          accion: "NOTA_SUPERVISOR",
          modulo: "Sistema",
          descripcion: s.solicitud.replace("[Bit\xE1cora Supervisor]", "").replace("[Auditor\xEDa]", "").trim(),
          entidad_nombre: s.propiedad_nombre || "Supervisi\xF3n General",
          entidad_id: s.id,
          detalles: {
            comentario: s.comentario,
            esquema: "gestion_residencial.solicitudes_acceso"
          }
        });
      } else {
        events.push({
          id: `BIT-SOL-${s.id}`,
          timestamp: new Date(s.created_at).toISOString(),
          usuario_nombre: s.procesador_nombre || "Carlos M\xE9ndez",
          usuario_email: "supervisor@laspalomas.com",
          usuario_rol: s.procesador_nombre?.toLowerCase().includes("seguridad") ? "Guardia de Seguridad" : "Supervisor",
          accion: s.estatus === "Pendiente" ? "CREACI\xD3N" : "CAMBIO_ESTATUS",
          modulo: "Solicitudes de Acceso",
          descripcion: `Solicitud de acceso #${s.id} en "${s.propiedad_nombre || "Condominio"}": "${s.solicitud}" (Estatus: ${s.estatus}${s.comentario ? ` - ${s.comentario}` : ""}).`,
          entidad_nombre: `Solicitud #${s.id} (${s.propiedad_nombre || "Condominio"})`,
          entidad_id: s.id,
          detalles: {
            solicitante: s.creador_nombre,
            procesador: s.procesador_nombre,
            estatus: s.estatus,
            comentario: s.comentario,
            fecha_esperada: s.fecha_esperada,
            esquema: "gestion_residencial.solicitudes_acceso"
          }
        });
      }
    }
    const props = await query(`
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
        usuario_nombre: "Carlos M\xE9ndez",
        usuario_email: "supervisor@laspalomas.com",
        usuario_rol: "Supervisor",
        accion: "CREACI\xD3N",
        modulo: "Propiedades",
        descripcion: `Registr\xF3 el condominio "${p.nombre}" en ${p.torre_nombre || "Torre HOA"} (Cuota HOA: $${p.cuota_hoa || 0} ${p.moneda || "USD"}).`,
        entidad_nombre: p.nombre,
        entidad_id: p.id,
        detalles: {
          torre: p.torre_nombre,
          cuota_hoa: p.cuota_hoa,
          estado: p.estado,
          esquema: "gestion_residencial.propiedades"
        }
      });
    }
    const users = await query(`
      SELECT id, nombre, apellido, email, rol, status, created_at
      FROM ${T.usuarios()}
      ORDER BY created_at DESC, id DESC
      LIMIT 30;
    `);
    for (const u of users.rows) {
      events.push({
        id: `BIT-USR-${u.id}`,
        timestamp: new Date(u.created_at).toISOString(),
        usuario_nombre: "Francisco Amado",
        usuario_email: "admin@laspalomas.com",
        usuario_rol: "Administrador",
        accion: "CREACI\xD3N",
        modulo: "Usuarios",
        descripcion: `Registr\xF3 al usuario "${u.nombre} ${u.apellido}" con rol "${u.rol}" (${u.email}).`,
        entidad_nombre: `${u.nombre} ${u.apellido}`,
        entidad_id: u.id,
        detalles: {
          email: u.email,
          rol: u.rol,
          status: u.status,
          esquema: "gestion_residencial.usuarios"
        }
      });
    }
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return events;
  } catch (err) {
    console.error("Error fetching bitacora from gestion_residencial:", err.message);
    return [];
  }
}
async function createBitacoraLog(entry) {
  const actor = entry.usuario_nombre || "Supervisor Carlos M\xE9ndez";
  const role = entry.usuario_rol || "Supervisor";
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
    `[Bit\xE1cora Supervisor] ${entry.descripcion}`,
    `${actor} (${role})`,
    JSON.stringify({ accion: entry.accion, modulo: entry.modulo, detalles: entry.detalles })
  ]);
  return res.rows[0];
}
async function getDatabaseHealth() {
  const connection = await testConnection();
  const envInfo = {
    hasCustomDbUrl: !!process.env.CUSTOM_DB_URL,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasPostgresUrl: !!process.env.POSTGRES_URL
  };
  if (!connection.ok) {
    return {
      connected: false,
      message: connection.message,
      tables: {},
      environment: envInfo
    };
  }
  const schema = getQuotedSchema();
  const tableCounts = {};
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
    tableCounts["edificios"] = parseInt(row.edificios || "0", 10);
    tableCounts["grupos_propiedad"] = parseInt(row.grupos_propiedad || "0", 10);
    tableCounts["usuarios"] = parseInt(row.usuarios || "0", 10);
    tableCounts["propiedades"] = parseInt(row.propiedades || "0", 10);
    tableCounts["propiedad_usuarios"] = parseInt(row.propiedad_usuarios || "0", 10);
    tableCounts["huespedes"] = parseInt(row.huespedes || "0", 10);
    tableCounts["reservaciones"] = parseInt(row.reservaciones || "0", 10);
    tableCounts["solicitudes_acceso"] = parseInt(row.solicitudes_acceso || "0", 10);
  } catch (err) {
    const tables = ["edificios", "grupos_propiedad", "usuarios", "propiedades", "propiedad_usuarios", "huespedes", "reservaciones", "solicitudes_acceso"];
    tables.forEach((t) => {
      tableCounts[t] = -1;
    });
  }
  return {
    connected: true,
    message: "Base de datos conectada correctamente y operativa",
    tables: tableCounts,
    environment: envInfo
  };
}

// server/router.ts
async function parseJsonBody(req) {
  if (req.body) return req.body;
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}
function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.end(JSON.stringify(data));
}
async function handleApiRequest(req, res) {
  const method = (req.method || "GET").toUpperCase();
  if (method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.end();
    return true;
  }
  let rawUrl = req.url || "/";
  const vercelReq = req;
  const forwardedUri = req.headers["x-forwarded-uri"] || req.headers["x-vercel-matched-path"] || req.headers["x-matched-path"];
  if (forwardedUri && forwardedUri.startsWith("/api") && !forwardedUri.includes("index.js")) {
    rawUrl = forwardedUri;
  }
  if (vercelReq.query && vercelReq.query.route) {
    const routeVal = Array.isArray(vercelReq.query.route) ? vercelReq.query.route.join("/") : vercelReq.query.route;
    rawUrl = `/api/${routeVal}`;
  }
  const url = new URL(rawUrl.startsWith("http") ? rawUrl : `http://${req.headers.host || "localhost"}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`);
  let pathname = url.pathname.replace(/\/+$/, "") || "/";
  const cleanPath = pathname.replace(/^\/api\/?/, "").replace(/^\//, "");
  const parts = cleanPath.split("/").filter(Boolean);
  const resource = (parts[0] || "").toLowerCase();
  const idStr = parts[1];
  const id = idStr && !isNaN(parseInt(idStr, 10)) ? parseInt(idStr, 10) : void 0;
  const validResources = [
    "health",
    "edificios",
    "grupos_propiedad",
    "grupos",
    "usuarios",
    "propiedades",
    "propiedad_usuarios",
    "huespedes",
    "reservaciones",
    "solicitudes",
    "solicitudes_acceso",
    "bitacora"
  ];
  if (!validResources.includes(resource)) {
    if (!pathname.startsWith("/api")) {
      return false;
    }
    sendJson(res, 404, { error: `Endpoint '/api/${cleanPath}' no encontrado` });
    return true;
  }
  try {
    if (resource === "health") {
      const health = await getDatabaseHealth();
      sendJson(res, 200, health);
      return true;
    }
    if (resource === "edificios") {
      if (method === "GET" && !id) {
        const data = await getAllEdificios();
        sendJson(res, 200, data);
        return true;
      }
      if (method === "GET" && id) {
        const item = await getEdificioById(id);
        if (!item) return sendJson(res, 404, { error: "Edificio no encontrado" }), true;
        sendJson(res, 200, item);
        return true;
      }
      if (method === "POST") {
        const body = await parseJsonBody(req);
        const created = await createEdificio(body);
        sendJson(res, 201, created);
        return true;
      }
      if ((method === "PUT" || method === "PATCH") && id) {
        const body = await parseJsonBody(req);
        const updated = await updateEdificio(id, body);
        sendJson(res, 200, updated);
        return true;
      }
      if (method === "DELETE" && id) {
        const result = await deleteEdificio(id);
        sendJson(res, 200, result);
        return true;
      }
    }
    if (resource === "grupos_propiedad" || resource === "grupos") {
      if (method === "GET" && !id) {
        const data = await getAllGrupos();
        sendJson(res, 200, data);
        return true;
      }
      if (method === "GET" && id) {
        const item = await getGrupoById(id);
        if (!item) return sendJson(res, 404, { error: "Grupo no encontrado" }), true;
        sendJson(res, 200, item);
        return true;
      }
      if (method === "POST") {
        const body = await parseJsonBody(req);
        const created = await createGrupo(body);
        sendJson(res, 201, created);
        return true;
      }
      if ((method === "PUT" || method === "PATCH") && id) {
        const body = await parseJsonBody(req);
        const updated = await updateGrupo(id, body);
        sendJson(res, 200, updated);
        return true;
      }
      if (method === "DELETE" && id) {
        const result = await deleteGrupo(id);
        sendJson(res, 200, result);
        return true;
      }
    }
    if (resource === "usuarios") {
      if (method === "GET" && !id) {
        const data = await getAllUsuarios();
        sendJson(res, 200, data);
        return true;
      }
      if (method === "GET" && id) {
        const item = await getUsuarioById(id);
        if (!item) return sendJson(res, 404, { error: "Usuario no encontrado" }), true;
        sendJson(res, 200, item);
        return true;
      }
      if (method === "POST") {
        const body = await parseJsonBody(req);
        const created = await createUsuario(body);
        sendJson(res, 201, created);
        return true;
      }
      if ((method === "PUT" || method === "PATCH") && id) {
        const body = await parseJsonBody(req);
        const updated = await updateUsuario(id, body);
        sendJson(res, 200, updated);
        return true;
      }
      if (method === "DELETE" && id) {
        const result = await deleteUsuario(id);
        sendJson(res, 200, result);
        return true;
      }
    }
    if (resource === "propiedades") {
      if (method === "GET" && !id) {
        const data = await getAllPropiedades();
        sendJson(res, 200, data);
        return true;
      }
      if (method === "GET" && id) {
        const item = await getPropiedadById(id);
        if (!item) return sendJson(res, 404, { error: "Propiedad no encontrada" }), true;
        sendJson(res, 200, item);
        return true;
      }
      if (method === "POST") {
        const body = await parseJsonBody(req);
        const { ownerId, ...propData } = body;
        const created = await createPropiedad(propData, ownerId);
        sendJson(res, 201, created);
        return true;
      }
      if ((method === "PUT" || method === "PATCH") && id) {
        const body = await parseJsonBody(req);
        const { ownerId, ...propData } = body;
        const updated = await updatePropiedad(id, propData, ownerId);
        sendJson(res, 200, updated);
        return true;
      }
      if (method === "DELETE" && id) {
        const result = await deletePropiedad(id);
        sendJson(res, 200, result);
        return true;
      }
    }
    if (resource === "propiedad_usuarios") {
      if (method === "GET") {
        const data = await getAllPropiedadUsuarios();
        sendJson(res, 200, data);
        return true;
      }
      if (method === "POST") {
        const body = await parseJsonBody(req);
        const created = await createPropiedadUsuario(body);
        sendJson(res, 201, created);
        return true;
      }
      if (method === "DELETE" && id) {
        const result = await deletePropiedadUsuario(id);
        sendJson(res, 200, result);
        return true;
      }
    }
    if (resource === "huespedes") {
      if (method === "GET" && !id) {
        const data = await getAllHuespedes();
        sendJson(res, 200, data);
        return true;
      }
      if (method === "GET" && id) {
        const item = await getHuespedById(id);
        if (!item) return sendJson(res, 404, { error: "Hu\xE9sped no encontrado" }), true;
        sendJson(res, 200, item);
        return true;
      }
      if (method === "POST") {
        const body = await parseJsonBody(req);
        const created = await createHuesped(body);
        sendJson(res, 201, created);
        return true;
      }
      if ((method === "PUT" || method === "PATCH") && id) {
        const body = await parseJsonBody(req);
        const updated = await updateHuesped(id, body);
        sendJson(res, 200, updated);
        return true;
      }
      if (method === "DELETE" && id) {
        const result = await deleteHuesped(id);
        sendJson(res, 200, result);
        return true;
      }
    }
    if (resource === "reservaciones") {
      if (method === "GET" && !id) {
        const data = await getAllReservaciones();
        sendJson(res, 200, data);
        return true;
      }
      if (method === "GET" && id) {
        const item = await getReservacionById(id);
        if (!item) return sendJson(res, 404, { error: "Reservaci\xF3n no encontrada" }), true;
        sendJson(res, 200, item);
        return true;
      }
      if (method === "POST") {
        const body = await parseJsonBody(req);
        const { huespedData, ...resData } = body;
        const created = await createReservacion(resData, huespedData);
        sendJson(res, 201, created);
        return true;
      }
      if ((method === "PUT" || method === "PATCH") && id) {
        const body = await parseJsonBody(req);
        const updated = await updateReservacion(id, body);
        sendJson(res, 200, updated);
        return true;
      }
      if (method === "DELETE" && id) {
        const result = await deleteReservacion(id);
        sendJson(res, 200, result);
        return true;
      }
    }
    if (resource === "solicitudes" || resource === "solicitudes_acceso") {
      if (method === "GET" && !id) {
        const data = await getAllSolicitudes();
        sendJson(res, 200, data);
        return true;
      }
      if (method === "POST") {
        const body = await parseJsonBody(req);
        const created = await createSolicitud(body);
        sendJson(res, 201, created);
        return true;
      }
      if ((method === "PUT" || method === "PATCH") && id) {
        const body = await parseJsonBody(req);
        const updated = await updateSolicitudStatus(
          id,
          body.estatus,
          body.comentario,
          body.procesador_nombre
        );
        sendJson(res, 200, updated);
        return true;
      }
    }
    if (resource === "bitacora") {
      if (method === "GET") {
        const logs = await getAllBitacora();
        sendJson(res, 200, logs);
        return true;
      }
      if (method === "POST") {
        const body = await parseJsonBody(req);
        const created = await createBitacoraLog(body);
        sendJson(res, 201, created);
        return true;
      }
    }
    sendJson(res, 404, { error: `M\xE9todo ${method} no soportado para ${pathname}` });
    return true;
  } catch (err) {
    console.error(`[API Handler Error] ${method} ${pathname}:`, err);
    sendJson(res, 500, {
      error: err.message || "Error interno del servidor de base de datos",
      detail: process.env.NODE_ENV === "development" ? err.stack : void 0
    });
    return true;
  }
}

// server/entrypoint.ts
async function handler(req, res) {
  try {
    const handled = await handleApiRequest(req, res);
    if (!handled) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: `Ruta no encontrada: ${req.url}` }));
    }
  } catch (err) {
    console.error("[API Serverless Handler Error]:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: err.message || "Error en servidor" }));
  }
}
export {
  handler as default
};
