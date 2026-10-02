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
  const host = process.env.SMTP_HOST?.trim();
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE === 'false' ? false : (port === 465 || !process.env.SMTP_SECURE);
  const user = (process.env.SMTP_USER || 'integradorpro.yec@gmail.com').trim();
  const pass = (process.env.SMTP_PASS || 'qheulhyenjwsmnxa').replace(/\s+/g, '');
  const from = process.env.SMTP_FROM || `"Las Palomas HOA" <${user}>`;

  // Configuración de transporte
  let transporter: any;

  if (host && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  } else {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass
      }
    });
  }

  const results: Array<{ email: string; success: boolean; error?: string }> = [];

  for (const dest of payload.destinatarios) {
    if (!dest.email || !dest.email.includes('@')) continue;

    const rawSubject = (payload.asunto || '').trim();
    const finalSubject = rawSubject || 'Comunicado Oficial — Las Palomas Seaside Golf Community';

    const personalizedBody = payload.contenido
      .replace(/{nombre_propietario}/g, dest.nombre || 'Propietario(a)')
      .replace(/{condominio}/g, dest.condominio || 'Condominio')
      .replace(/{torre}/g, dest.torre || 'Torre')
      .replace(/{fecha_actual}/g, new Date().toLocaleDateString('es-MX', { dateStyle: 'long' }))
      .replace(/{administrador}/g, 'Administración Las Palomas');

    // Clean plain text version
    const plainText = `${finalSubject}\n\n${personalizedBody}\n\n---\nLas Palomas Seaside Golf Community\nAdministración HOA\nBlvd. Costero 150, Sandy Beach, Puerto Peñasco, Sonora, México.`;

    // Formatear saltos de línea a párrafos limpios
    const formattedParagraphs = personalizedBody
      .split('\n\n')
      .map(p => `<p style="margin: 0 0 16px 0; line-height: 1.6; color: #1e293b; font-size: 15px;">${p.replace(/\n/g, '<br/>')}</p>`)
      .join('');

    // HTML limpio, estándar y 100% amigable con filtros de correo (Gmail, Outlook, Yahoo)
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 15px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #cbd5e1; overflow: hidden;">
    <tr>
      <td style="background-color: #0f766e; padding: 22px 24px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 18px; font-weight: bold; letter-spacing: 0.5px;">LAS PALOMAS SEASIDE GOLF COMMUNITY</h1>
        <p style="margin: 4px 0 0 0; color: #99f6e4; font-size: 12px; text-transform: uppercase;">Gestión Residencial & HOA</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 16px 24px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #475569;">
        <strong>Asunto:</strong> ${finalSubject}
      </td>
    </tr>
    <tr>
      <td style="padding: 24px; font-size: 15px; line-height: 1.6; color: #1e293b;">
        ${formattedParagraphs}
      </td>
    </tr>
    <tr>
      <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b;">
        <p style="margin: 0 0 4px 0; font-weight: bold; color: #334155;">Asociación de Condóminos Las Palomas Seaside Golf Community</p>
        <p style="margin: 0; color: #94a3b8;">Blvd. Costero 150, Sandy Beach, Puerto Peñasco, Sonora, México.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

    try {
      // Envío estándar sin cabeceras artificiales que provoquen rechazo SPF/DKIM en Gmail
      await transporter.sendMail({
        from: `"Las Palomas HOA" <${user}>`,
        to: dest.email,
        replyTo: user,
        subject: finalSubject,
        text: plainText,
        html
      });
      results.push({ email: dest.email, success: true });
    } catch (err: any) {
      console.error(`[SMTP Error to ${dest.email}]:`, err.message);
      results.push({ email: dest.email, success: false, error: err.message });
    }

    // Pequeño delay de 250ms entre envíos para evitar detección de ráfaga automática
    if (payload.destinatarios.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 250));
    }
  }

  return {
    total: payload.destinatarios.length,
    sent: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results
  };
}
