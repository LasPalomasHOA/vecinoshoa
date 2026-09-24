import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleApiRequest } from './_lib/router';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Pass to unified router
  const handled = await handleApiRequest(req, res);
  if (!handled) {
    res.status(404).json({ error: 'Ruta no encontrada' });
  }
}
