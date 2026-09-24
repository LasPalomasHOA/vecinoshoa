import type { IncomingMessage, ServerResponse } from 'http';
import { handleApiRequest } from './router';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const handled = await handleApiRequest(req, res);
    if (!handled) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: `Ruta no encontrada: ${req.url}` }));
    }
  } catch (err: any) {
    console.error('[API Serverless Handler Error]:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: err.message || 'Error en servidor' }));
  }
}
