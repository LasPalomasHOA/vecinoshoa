import type { IncomingMessage, ServerResponse } from 'http';
import * as hoaService from './services/hoaService.ts';
import { sendBroadcastEmail } from './services/emailService.ts';

export interface ApiRequest extends IncomingMessage {
  body?: any;
  query?: Record<string, string>;
  params?: Record<string, string>;
}

export interface ApiResponse extends ServerResponse {
  status?: (statusCode: number) => ApiResponse;
  json?: (data: any) => ApiResponse;
  send?: (data: any) => ApiResponse;
}

// Helper to parse JSON body
export async function parseJsonBody(req: IncomingMessage): Promise<any> {
  if ((req as any).body) return (req as any).body;

  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

// Standard JSON response sender
export function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.end(JSON.stringify(data));
}

function badRequest(res: ServerResponse, message: string): true {
  sendJson(res, 400, { error: message });
  return true;
}

const isNonEmptyString = (val: unknown): val is string =>
  typeof val === 'string' && val.trim().length > 0;

const isPositiveInt = (val: unknown): boolean =>
  typeof val === 'number' && Number.isInteger(val) && val > 0;

const isValidDateStr = (val: unknown): val is string =>
  typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val);

export async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const method = (req.method || 'GET').toUpperCase();

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.end();
    return true;
  }

  // Determine requested route path (compatible with Vite dev server and Vercel Serverless)
  let rawUrl = req.url || '/';
  const vercelReq = req as any;

  const forwardedUri = (req.headers['x-forwarded-uri'] || req.headers['x-vercel-matched-path'] || req.headers['x-matched-path']) as string | undefined;
  if (forwardedUri && forwardedUri.startsWith('/api') && !forwardedUri.includes('index.js')) {
    rawUrl = forwardedUri;
  }

  if (vercelReq.query && vercelReq.query.route) {
    const routeVal = Array.isArray(vercelReq.query.route) 
      ? vercelReq.query.route.join('/') 
      : vercelReq.query.route;
    rawUrl = `/api/${routeVal}`;
  }

  const url = new URL(rawUrl.startsWith('http') ? rawUrl : `http://${req.headers.host || 'localhost'}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`);
  let pathname = url.pathname.replace(/\/+$/, '') || '/';

  // Extract resource and id from path (e.g. /api/propiedades/12 or /propiedades/12)
  const cleanPath = pathname.replace(/^\/api\/?/, '').replace(/^\//, '');
  const parts = cleanPath.split('/').filter(Boolean);
  const resource = (parts[0] || '').toLowerCase();
  const idStr = parts[1];
  const id = idStr && !isNaN(parseInt(idStr, 10)) ? parseInt(idStr, 10) : undefined;

  // Recognized resources in our system
  const validResources = [
    'health',
    'bootstrap',
    'edificios',
    'grupos_propiedad',
    'grupos',
    'usuarios',
    'propiedades',
    'propiedad_usuarios',
    'huespedes',
    'reservaciones',
    'solicitudes',
    'solicitudes_acceso',
    'bitacora',
    'comunicados'
  ];

  if (!validResources.includes(resource)) {
    // If not starting with /api and not a recognized resource, let next middleware handle it
    if (!pathname.startsWith('/api')) {
      return false;
    }
    sendJson(res, 404, { error: `Endpoint '/api/${cleanPath}' no encontrado` });
    return true;
  }

  try {
    // -------------------------------------------------------------
    // 0. Bootstrap / Initial Unified Data Load
    // -------------------------------------------------------------
    if (resource === 'bootstrap' && method === 'GET') {
      const data = await hoaService.getBootstrapData();
      sendJson(res, 200, data);
      return true;
    }

    // -------------------------------------------------------------
    // Health & System Check
    // -------------------------------------------------------------
    if (resource === 'health') {
      const includeCounts = url.searchParams.get('counts') === 'true';
      const health = await hoaService.getDatabaseHealth(includeCounts);
      sendJson(res, 200, health);
      return true;
    }

    // -------------------------------------------------------------
    // 1. EDIFICIOS
    // -------------------------------------------------------------
    if (resource === 'edificios') {
      if (method === 'GET' && !id) {
        const data = await hoaService.getAllEdificios();
        sendJson(res, 200, data);
        return true;
      }
      if (method === 'GET' && id) {
        const item = await hoaService.getEdificioById(id);
        if (!item) return sendJson(res, 404, { error: 'Edificio no encontrado' }), true;
        sendJson(res, 200, item);
        return true;
      }
      if (method === 'POST') {
        const body = await parseJsonBody(req);
        if (!isNonEmptyString(body.nombre)) {
          return badRequest(res, 'El nombre del edificio es obligatorio.');
        }
        const created = await hoaService.createEdificio(body);
        sendJson(res, 201, created);
        return true;
      }
      if ((method === 'PUT' || method === 'PATCH') && id) {
        const body = await parseJsonBody(req);
        const updated = await hoaService.updateEdificio(id, body);
        sendJson(res, 200, updated);
        return true;
      }
      if (method === 'DELETE' && id) {
        const result = await hoaService.deleteEdificio(id);
        sendJson(res, 200, result);
        return true;
      }
    }

    // -------------------------------------------------------------
    // 2. GRUPOS DE PROPIEDAD
    // -------------------------------------------------------------
    if (resource === 'grupos_propiedad' || resource === 'grupos') {
      if (method === 'GET' && !id) {
        const data = await hoaService.getAllGrupos();
        sendJson(res, 200, data);
        return true;
      }
      if (method === 'GET' && id) {
        const item = await hoaService.getGrupoById(id);
        if (!item) return sendJson(res, 404, { error: 'Grupo no encontrado' }), true;
        sendJson(res, 200, item);
        return true;
      }
      if (method === 'POST') {
        const body = await parseJsonBody(req);
        if (!isNonEmptyString(body.nombre)) {
          return badRequest(res, 'El nombre del grupo es obligatorio.');
        }
        const created = await hoaService.createGrupo(body);
        sendJson(res, 201, created);
        return true;
      }
      if ((method === 'PUT' || method === 'PATCH') && id) {
        const body = await parseJsonBody(req);
        const updated = await hoaService.updateGrupo(id, body);
        sendJson(res, 200, updated);
        return true;
      }
      if (method === 'DELETE' && id) {
        const result = await hoaService.deleteGrupo(id);
        sendJson(res, 200, result);
        return true;
      }
    }

    // -------------------------------------------------------------
    // 3. USUARIOS / PROPIETARIOS
    // -------------------------------------------------------------
    if (resource === 'usuarios') {
      if (method === 'GET' && !id) {
        const data = await hoaService.getAllUsuarios();
        sendJson(res, 200, data);
        return true;
      }
      if (method === 'GET' && id) {
        const item = await hoaService.getUsuarioById(id);
        if (!item) return sendJson(res, 404, { error: 'Usuario no encontrado' }), true;
        sendJson(res, 200, item);
        return true;
      }
      if (method === 'POST') {
        const body = await parseJsonBody(req);
        if (!isNonEmptyString(body.email) || !body.email.includes('@')) {
          return badRequest(res, 'Un correo electrónico válido es obligatorio.');
        }
        if (!isNonEmptyString(body.nombre) || !isNonEmptyString(body.apellido)) {
          return badRequest(res, 'El nombre y apellido del usuario son obligatorios.');
        }
        const created = await hoaService.createUsuario(body);
        sendJson(res, 201, created);
        return true;
      }
      if ((method === 'PUT' || method === 'PATCH') && id) {
        const body = await parseJsonBody(req);
        const updated = await hoaService.updateUsuario(id, body);
        sendJson(res, 200, updated);
        return true;
      }
      if (method === 'DELETE' && id) {
        const result = await hoaService.deleteUsuario(id);
        sendJson(res, 200, result);
        return true;
      }
    }

    // -------------------------------------------------------------
    // 4. PROPIEDADES
    // -------------------------------------------------------------
    if (resource === 'propiedades') {
      if (method === 'GET' && !id) {
        const data = await hoaService.getAllPropiedades();
        sendJson(res, 200, data);
        return true;
      }
      if (method === 'GET' && id) {
        const item = await hoaService.getPropiedadById(id);
        if (!item) return sendJson(res, 404, { error: 'Propiedad no encontrada' }), true;
        sendJson(res, 200, item);
        return true;
      }
      if (method === 'POST') {
        const body = await parseJsonBody(req);
        const { ownerId, ...propData } = body;
        if (!isNonEmptyString(propData.nombre) || !isPositiveInt(Number(propData.edificio_id))) {
          return badRequest(res, 'El nombre de la propiedad y un edificio_id válido son obligatorios.');
        }
        const created = await hoaService.createPropiedad(propData, ownerId);
        sendJson(res, 201, created);
        return true;
      }
      if ((method === 'PUT' || method === 'PATCH') && id) {
        const body = await parseJsonBody(req);
        const { ownerId, ...propData } = body;
        const updated = await hoaService.updatePropiedad(id, propData, ownerId);
        sendJson(res, 200, updated);
        return true;
      }
      if (method === 'DELETE' && id) {
        const result = await hoaService.deletePropiedad(id);
        sendJson(res, 200, result);
        return true;
      }
    }

    // -------------------------------------------------------------
    // 5. ASIGNACIÓN PROPIEDAD - USUARIOS
    // -------------------------------------------------------------
    if (resource === 'propiedad_usuarios') {
      if (method === 'GET') {
        const data = await hoaService.getAllPropiedadUsuarios();
        sendJson(res, 200, data);
        return true;
      }
      if (method === 'POST') {
        const body = await parseJsonBody(req);
        const created = await hoaService.createPropiedadUsuario(body);
        sendJson(res, 201, created);
        return true;
      }
      if (method === 'DELETE' && id) {
        const result = await hoaService.deletePropiedadUsuario(id);
        sendJson(res, 200, result);
        return true;
      }
    }

    // -------------------------------------------------------------
    // 6. HUÉSPEDES
    // -------------------------------------------------------------
    if (resource === 'huespedes') {
      if (method === 'GET' && !id) {
        const data = await hoaService.getAllHuespedes();
        sendJson(res, 200, data);
        return true;
      }
      if (method === 'GET' && id) {
        const item = await hoaService.getHuespedById(id);
        if (!item) return sendJson(res, 404, { error: 'Huésped no encontrado' }), true;
        sendJson(res, 200, item);
        return true;
      }
      if (method === 'POST') {
        const body = await parseJsonBody(req);
        if (!isNonEmptyString(body.nombres)) {
          return badRequest(res, 'El nombre del huésped es obligatorio.');
        }
        const created = await hoaService.createHuesped(body);
        sendJson(res, 201, created);
        return true;
      }
      if ((method === 'PUT' || method === 'PATCH') && id) {
        const body = await parseJsonBody(req);
        const updated = await hoaService.updateHuesped(id, body);
        sendJson(res, 200, updated);
        return true;
      }
      if (method === 'DELETE' && id) {
        const result = await hoaService.deleteHuesped(id);
        sendJson(res, 200, result);
        return true;
      }
    }

    // -------------------------------------------------------------
    // 7. RESERVACIONES
    // -------------------------------------------------------------
    if (resource === 'reservaciones') {
      if (method === 'GET' && !id) {
        const startDate = url.searchParams.get('startDate') || undefined;
        const endDate = url.searchParams.get('endDate') || undefined;
        const estado = url.searchParams.get('estado') || undefined;
        const limitParam = url.searchParams.get('limit');
        const offsetParam = url.searchParams.get('offset');
        const data = await hoaService.getAllReservaciones({
          startDate,
          endDate,
          estado,
          limit: limitParam ? parseInt(limitParam, 10) : undefined,
          offset: offsetParam ? parseInt(offsetParam, 10) : undefined,
        });
        sendJson(res, 200, data);
        return true;
      }
      if (method === 'GET' && id) {
        const item = await hoaService.getReservacionById(id);
        if (!item) return sendJson(res, 404, { error: 'Reservación no encontrada' }), true;
        sendJson(res, 200, item);
        return true;
      }
      if (method === 'POST') {
        const body = await parseJsonBody(req);
        const { huespedData, ...resData } = body;
        if (!isPositiveInt(Number(resData.propiedad_id))) {
          return badRequest(res, 'Un propiedad_id válido es obligatorio.');
        }
        if (!isValidDateStr(resData.fecha_checkin) || !isValidDateStr(resData.fecha_checkout)) {
          return badRequest(res, 'Las fechas fecha_checkin y fecha_checkout (YYYY-MM-DD) son obligatorias.');
        }
        if (resData.fecha_checkout < resData.fecha_checkin) {
          return badRequest(res, 'La fecha de salida no puede ser anterior a la fecha de entrada.');
        }
        if (!isPositiveInt(Number(resData.huesped_id)) && !isNonEmptyString(huespedData?.nombres)) {
          return badRequest(res, 'Debe especificar un huesped_id o el nombre del huésped.');
        }
        const created = await hoaService.createReservacion(resData, huespedData);
        sendJson(res, 201, created);
        return true;
      }
      if ((method === 'PUT' || method === 'PATCH') && id) {
        const body = await parseJsonBody(req);
        const { huespedData, ...resData } = body;
        if (resData.fecha_checkin !== undefined && !isValidDateStr(resData.fecha_checkin)) {
          return badRequest(res, 'Formato inválido para fecha_checkin (YYYY-MM-DD).');
        }
        if (resData.fecha_checkout !== undefined && !isValidDateStr(resData.fecha_checkout)) {
          return badRequest(res, 'Formato inválido para fecha_checkout (YYYY-MM-DD).');
        }
        if (resData.fecha_checkin && resData.fecha_checkout && resData.fecha_checkout < resData.fecha_checkin) {
          return badRequest(res, 'La fecha de salida no puede ser anterior a la fecha de entrada.');
        }
        const updated = await hoaService.updateReservacion(id, resData, huespedData);
        sendJson(res, 200, updated);
        return true;
      }
      if (method === 'DELETE' && id) {
        const result = await hoaService.deleteReservacion(id);
        sendJson(res, 200, result);
        return true;
      }
    }

    // -------------------------------------------------------------
    // 8. SOLICITUDES DE ACCESO
    // -------------------------------------------------------------
    if (resource === 'solicitudes' || resource === 'solicitudes_acceso') {
      if (method === 'GET' && !id) {
        const estatus = url.searchParams.get('estatus') || undefined;
        const limitParam = url.searchParams.get('limit');
        const offsetParam = url.searchParams.get('offset');
        const data = await hoaService.getAllSolicitudes({
          estatus,
          limit: limitParam ? parseInt(limitParam, 10) : undefined,
          offset: offsetParam ? parseInt(offsetParam, 10) : undefined,
        });
        sendJson(res, 200, data);
        return true;
      }
      if (method === 'POST') {
        const body = await parseJsonBody(req);
        if (!isPositiveInt(Number(body.propiedad_id)) || !isNonEmptyString(body.solicitud) || !isValidDateStr(body.fecha_esperada)) {
          return badRequest(res, 'propiedad_id, solicitud y fecha_esperada (YYYY-MM-DD) son obligatorios.');
        }
        const created = await hoaService.createSolicitud(body);
        sendJson(res, 201, created);
        return true;
      }
      if ((method === 'PUT' || method === 'PATCH') && id) {
        const body = await parseJsonBody(req);
        const updated = await hoaService.updateSolicitud(id, body);
        sendJson(res, 200, updated);
        return true;
      }
      if (method === 'DELETE' && id) {
        const result = await hoaService.deleteSolicitud(id);
        sendJson(res, 200, result);
        return true;
      }
    }

    // -------------------------------------------------------------
    // 9. BITÁCORA DE AUDITORÍA & CONTROL DE ACCESO
    // -------------------------------------------------------------
    if (resource === 'bitacora') {
      if (method === 'GET') {
        const logs = await hoaService.getAllBitacora();
        sendJson(res, 200, logs);
        return true;
      }
      if (method === 'POST') {
        const body = await parseJsonBody(req);
        const created = await hoaService.createBitacoraLog(body);
        sendJson(res, 201, created);
        return true;
      }
    }

    // -------------------------------------------------------------
    // 10. COMUNICADOS & EMAIL BROADCAST
    // -------------------------------------------------------------
    if (resource === 'comunicados') {
      if (method === 'POST') {
        const body = await parseJsonBody(req);
        if (!isNonEmptyString(body.asunto) || !isNonEmptyString(body.contenido) || !Array.isArray(body.destinatarios) || body.destinatarios.length === 0) {
          return badRequest(res, 'asunto, contenido y al menos un destinatario son obligatorios.');
        }
        const result = await sendBroadcastEmail(body);
        sendJson(res, 200, result);
        return true;
      }
    }

    sendJson(res, 404, { error: `Método ${method} no soportado para ${pathname}` });
    return true;

  } catch (err: any) {
    console.error(`[API Handler Error] ${method} ${pathname}:`, err);
    sendJson(res, 500, { 
      error: err.message || 'Error interno del servidor de base de datos',
      detail: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
    return true;
  }
}
