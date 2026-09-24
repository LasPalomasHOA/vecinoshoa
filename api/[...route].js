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
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === "development" && duration > 500) {
      console.log(`[DB Slow Query] ${duration}ms: ${text.substring(0, 80)}...`);
    }
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
    SELECT id, nombres, apellidos, telefono, email, created_at, updated_at
    FROM ${T.huespedes()}
    ORDER BY nombres ASC, apellidos ASC;
  `);
  return res.rows;
}
async function getHuespedById(id) {
  return queryOne(`
    SELECT id, nombres, apellidos, telefono, email, created_at, updated_at
    FROM ${T.huespedes()}
    WHERE id = $1;
  `, [id]);
}
async function createHuesped(data) {
  const res = await query(`
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
async function updateHuesped(id, data) {
  const fields = ["updated_at = CURRENT_TIMESTAMP"];
  const values = [];
  let idx = 1;
  if (data.nombres !== void 0) {
    fields.push(`nombres = $${idx++}`);
    values.push(data.nombres.trim());
  }
  if (data.apellidos !== void 0) {
    fields.push(`apellidos = $${idx++}`);
    values.push(data.apellidos.trim());
  }
  if (data.telefono !== void 0) {
    fields.push(`telefono = $${idx++}`);
    values.push(data.telefono);
  }
  if (data.email !== void 0) {
    fields.push(`email = $${idx++}`);
    values.push(data.email.trim().toLowerCase());
  }
  values.push(id);
  const res = await query(`
    UPDATE ${T.huespedes()}
    SET ${fields.join(", ")}
    WHERE id = $${idx}
    RETURNING id, nombres, apellidos, telefono, email, created_at, updated_at;
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
      CAST(balance AS FLOAT) as balance, estado, created_at, updated_at
    FROM ${T.reservaciones()}
    ORDER BY fecha_checkin DESC, id DESC;
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
      CAST(balance AS FLOAT) as balance, estado, created_at, updated_at
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
  const res = await query(`
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
    data.tipo_huesped || "Due\xF1o",
    data.fecha_checkin,
    data.fecha_checkout,
    data.numero_ocupantes || 1,
    data.numero_autos || 0,
    data.notas || null,
    data.brazaletes || null,
    data.vehiculo_info || null,
    data.balance || 0,
    data.estado || "Confirmada"
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
      CAST(balance AS FLOAT) as balance, estado, created_at, updated_at;
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
    ORDER BY created_at DESC, id DESC;
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
  const tableCounts = {};
  const schema = getQuotedSchema();
  const tables = ["edificios", "grupos_propiedad", "usuarios", "propiedades", "propiedad_usuarios", "huespedes", "reservaciones", "solicitudes_acceso"];
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
    "solicitudes_acceso"
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
