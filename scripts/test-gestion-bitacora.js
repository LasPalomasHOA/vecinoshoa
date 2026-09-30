import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const rawUrl = process.env.CUSTOM_DB_URL || process.env.DATABASE_URL || '';
const cleanUrl = rawUrl.replace(/[\?&]sslmode=[^&]+/, '').replace(/[\?&]supa=[^&]+/, '');
const pool = new Pool({
  connectionString: cleanUrl + (cleanUrl.includes('?') ? '&' : '?') + 'sslmode=no-verify',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const client = await pool.connect();
  try {
    const events = [];

    // 1. Reservaciones events (Check-in, Check-out, Creaciones)
    const res = await client.query(`
      SELECT 
        r.id,
        r.codigo,
        r.propiedad_id,
        p.nombre AS propiedad_nombre,
        h.nombres AS huesped_nombre,
        r.tipo_huesped,
        TO_CHAR(r.fecha_checkin, 'YYYY-MM-DD') AS fecha_checkin,
        TO_CHAR(r.fecha_checkout, 'YYYY-MM-DD') AS fecha_checkout,
        r.brazaletes,
        r.vehiculo_info,
        r.estado,
        r.created_at,
        r.updated_at
      FROM gestion_residencial.reservaciones r
      LEFT JOIN gestion_residencial.propiedades p ON r.propiedad_id = p.id
      LEFT JOIN gestion_residencial.huespedes h ON r.huesped_id = h.id
      ORDER BY COALESCE(r.updated_at, r.created_at) DESC;
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
          descripcion: `Completó Check-In en "${r.propiedad_nombre || 'Condominio'}" para ${r.huesped_nombre || 'Huésped'}. Brazaletes: "${r.brazaletes || 'Asignados'}"${r.vehiculo_info ? `, Vehículo: "${r.vehiculo_info}"` : ''}.`,
          entidad_nombre: `${r.propiedad_nombre || 'Unidad'} / ${r.codigo}`,
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
          descripcion: `Procesó Check-Out y liberación de la unidad "${r.propiedad_nombre || 'Condominio'}" para reservación #${r.codigo}.`,
          entidad_nombre: `${r.propiedad_nombre || 'Unidad'} / ${r.codigo}`,
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
        descripcion: `Registró reservación #${r.codigo} en "${r.propiedad_nombre || 'Condominio'}" para ${r.huesped_nombre || 'Huésped'} (${r.fecha_checkin} al ${r.fecha_checkout}, tipo: ${r.tipo_huesped}).`,
        entidad_nombre: `${r.propiedad_nombre || 'Unidad'} / ${r.codigo}`,
        entidad_id: r.id,
        detalles: {
          codigo: r.codigo,
          fechas: `${r.fecha_checkin} al ${r.fecha_checkout}`,
          tipo_huesped: r.tipo_huesped,
          esquema: 'gestion_residencial.reservaciones'
        }
      });
    }

    // 2. Solicitudes de acceso in gestion_residencial
    const sol = await client.query(`
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
      FROM gestion_residencial.solicitudes_acceso s
      LEFT JOIN gestion_residencial.propiedades p ON s.propiedad_id = p.id
      ORDER BY s.created_at DESC;
    `);

    for (const s of sol.rows) {
      if (s.solicitud?.startsWith('[Bitácora Supervisor]')) {
        events.push({
          id: `BIT-NOT-${s.id}`,
          timestamp: new Date(s.created_at).toISOString(),
          usuario_nombre: s.procesador_nombre || 'Carlos Méndez',
          usuario_email: 'supervisor@laspalomas.com',
          usuario_rol: 'Supervisor',
          accion: 'NOTA_SUPERVISOR',
          modulo: 'Sistema',
          descripcion: s.solicitud.replace('[Bitácora Supervisor]', '').trim(),
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

    // 3. Propiedades in gestion_residencial
    const props = await client.query(`
      SELECT p.id, p.nombre, p.cuota_hoa, p.moneda, p.estado, e.nombre AS torre_nombre, p.created_at, p.updated_at
      FROM gestion_residencial.propiedades p
      LEFT JOIN gestion_residencial.edificios e ON p.edificio_id = e.id
      ORDER BY p.created_at DESC;
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

    // 4. Usuarios in gestion_residencial
    const users = await client.query(`
      SELECT id, nombre, apellido, email, rol, status, created_at
      FROM gestion_residencial.usuarios
      ORDER BY created_at DESC, id DESC;
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

    // Sort all events by timestamp DESC
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    console.log('Total gestion_residencial bitacora events:', events.length);
    console.log('First 5 events from gestion_residencial:\n', JSON.stringify(events.slice(0, 5), null, 2));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
