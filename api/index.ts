import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleApiRequest } from '../server/router';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const handled = await handleApiRequest(req, res);
    if (!handled) {
      res.status(404).json({ error: `Ruta no encontrada: ${req.url}` });
    }
  } catch (err: any) {
    console.error('[Vercel Serverless Function Error]:', err);
    res.status(500).json({
      error: err.message || 'Error en función de servidor Vercel',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }
}
