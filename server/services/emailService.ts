import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

if (typeof dotenv?.config === 'function') {
  dotenv.config();
}

export async function sendBroadcastEmail(payload: {
  asunto: string;
  categoria: string;
  contenido: string;
  destinatarios: Array<{
    nombre: string;
    email: string;
    condominio?: string;
    torre?: string;
  }>;
}) {
  const user = (process.env.SMTP_USER || 'integradorpro.yec@gmail.com').trim();
  const pass = (process.env.SMTP_PASS || 'qheulhyenjwsmnxa').replace(/\s+/g, '');
  const from = process.env.SMTP_FROM || `"Las Palomas HOA" <${user}>`;

  // Configuración directa con el servicio oficial de Gmail (igual que en proyectos productivos como RockyPrint)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass
    }
  });

  const results: Array<{ email: string; success: boolean; error?: string }> = [];
  console.log(`[SMTP Broadcast] Despachando ${payload.destinatarios.length} correo(s) desde ${user}...`);

  for (const dest of payload.destinatarios) {
    if (!dest.email || !dest.email.includes('@')) continue;

    const rawSubject = (payload.asunto || '').trim();
    const finalSubject = rawSubject
      ? (rawSubject.length < 8 && !rawSubject.toLowerCase().includes('hoa') ? `Aviso HOA — ${rawSubject}` : rawSubject)
      : 'Comunicado Oficial — Las Palomas Seaside Golf Community';

    const personalizedBody = payload.contenido
      .replace(/{nombre_propietario}/g, dest.nombre || 'Propietario(a)')
      .replace(/{condominio}/g, dest.condominio || 'Condominio')
      .replace(/{torre}/g, dest.torre || 'Torre');

    // Clean plain text version
    const plainText = `${finalSubject}\n\n${personalizedBody}\n\n---\nLas Palomas Seaside Golf Community\nAdministración HOA`;

    // Formatear saltos de línea a párrafos limpios
    const formattedParagraphs = personalizedBody
      .split('\n\n')
      .map(p => `<p style="margin: 0 0 14px 0; line-height: 1.6; color: #334155; font-size: 14px;">${p.replace(/\n/g, '<br/>')}</p>`)
      .join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 20px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0; overflow: hidden;">
    
    <!-- Encabezado -->
    <div style="background: linear-gradient(135deg, #134e4a 0%, #0f172a 100%); padding: 24px; text-align: center;">
      <h2 style="margin: 0; color: #ffffff; font-size: 17px; font-weight: 800; letter-spacing: 0.5px;">LAS PALOMAS SEASIDE GOLF COMMUNITY</h2>
      <p style="margin: 4px 0 0 0; color: #5eead4; font-size: 11px; font-weight: 600; text-transform: uppercase;">Gestión Residencial & HOA</p>
    </div>

    <!-- Asunto -->
    <div style="background-color: #f1f5f9; padding: 12px 24px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #475569;">
      <strong>Asunto:</strong> ${finalSubject}
    </div>

    <!-- Contenido -->
    <div style="padding: 24px; font-size: 14px; line-height: 1.6; color: #334155;">
      ${formattedParagraphs}
    </div>

    <!-- Pie de página -->
    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b;">
      <p style="margin: 0 0 3px 0; font-weight: 600;">Asociación de Condóminos Las Palomas Seaside Golf Community</p>
      <p style="margin: 0; color: #94a3b8;">Blvd. Costero 150, Sandy Beach, Puerto Peñasco, Sonora, México.</p>
    </div>

  </div>
</body>
</html>`;

    try {
      await transporter.sendMail({
        from,
        to: dest.email,
        replyTo: user,
        subject: finalSubject,
        text: plainText,
        html
      });
      console.log(`[SMTP Success] Correo entregado exitosamente a: ${dest.email}`);
      results.push({ email: dest.email, success: true });
    } catch (err: any) {
      console.error(`[SMTP Error to ${dest.email}]:`, err.message);
      results.push({ email: dest.email, success: false, error: err.message });
    }
  }

  return {
    total: payload.destinatarios.length,
    sent: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results
  };
}
