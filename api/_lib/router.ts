import type { IncomingMessage, ServerResponse } from 'http';
import * as hoaService from './services/hoaService.ts';

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

export async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';
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

  // Only handle routes starting with /api/
  if (!pathname.startsWith('/api')) {
    return false;
  }

  const endpoint = pathname.replace(/^\/api/, '');
  const parts = endpoint.split('/').filter(Boolean);
  const resource = parts[0] || '';
  const idStr = parts[1];
  const id = idStr ? parseInt(idStr, 10) : undefined;

  try {
    // -------------------------------------------------------------
    // Health & System Check
    // -------------------------------------------------------------
    if (resource === 'health') {
      const health = await hoaService.getDatabaseHealth();
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
        const data = await hoaService.getAllReservaciones();
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
        const created = await hoaService.createReservacion(resData, huespedData);
        sendJson(res, 201, created);
        return true;
      }
      if ((method === 'PUT' || method === 'PATCH') && id) {
        const body = await parseJsonBody(req);
        const updated = await hoaService.updateReservacion(id, body);
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
        const data = await hoaService.getAllSolicitudes();
        sendJson(res, 200, data);
        return true;
      }
      if (method === 'POST') {
        const body = await parseJsonBody(req);
        const created = await hoaService.createSolicitud(body);
        sendJson(res, 201, created);
        return true;
      }
      if ((method === 'PUT' || method === 'PATCH') && id) {
        const body = await parseJsonBody(req);
        const updated = await hoaService.updateSolicitudStatus(
          id, 
          body.estatus, 
          body.comentario, 
          body.procesador_nombre
        );
        sendJson(res, 200, updated);
        return true;
      }
    }

    // Unmatched API route
    sendJson(res, 404, { error: `Endpoint '${pathname}' no encontrado` });
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
