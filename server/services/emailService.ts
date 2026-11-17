import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

if (typeof dotenv?.config === 'function') {
  dotenv.config();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

  if (!user || !pass) {
    throw new Error('Faltan las variables de entorno SMTP_USER y SMTP_PASS para enviar correos.');
  }

  const from = process.env.SMTP_FROM?.trim() || `"Las Palomas HOA" <${user}>`;
  const replyTo = process.env.SMTP_REPLY_TO?.trim() || user;
  const delayMs = parseInt(process.env.SMTP_DELAY_MS || '1200', 10);

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
        rejectUnauthorized: process.env.NODE_ENV === 'production'
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

    // Extract first 120 chars for preheader snippet
    const previewSnippet = escapeHtml(personalizedBody.replace(/\s+/g, ' ').substring(0, 120));
    const safeSubject = escapeHtml(finalSubject);

    // Clean plain text version (Crucial for SpamAssassin and filters that check multipart/alternative balance)
    const plainText = `${finalSubject}\n\nEstimado(a) ${dest.nombre || 'Propietario(a)'}:\n\n${personalizedBody}\n\n---\nAsociación de Condóminos Las Palomas Seaside Golf Community\nAdministración HOA\nBlvd. Costero 150, Sandy Beach, C.P. 83550, Puerto Peñasco, Sonora, México.\nPara actualizar tus preferencias de notificación o aclarar dudas, responde directamente a este correo.`;

    // Formatear párrafos limpios (escapando HTML antes de insertar etiquetas <p> y <br/>)
    const formattedParagraphs = escapeHtml(personalizedBody)
      .split('\n\n')
      .map(p => `<p style="margin: 0 0 16px 0; line-height: 1.6; color: #1e293b; font-size: 15px;">${p.replace(/\n/g, '<br/>')}</p>`)
      .join('');

    // HTML optimizado contra filtros de spam (Gmail, Outlook, Yahoo)
    // Cumple con CAN-SPAM, incluye preheader invisible, lang="es", y pie con dirección física y opt-out
    const html = `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <title>${safeSubject}</title>
</head>
<body style="margin: 0; padding: 20px 10px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%;">
  
  <!-- Preheader invisible: evita que el cliente muestre código o texto roto en la vista previa -->
  <div style="display: none; font-size: 1px; color: #f1f5f9; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
    ${previewSnippet}...
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #cbd5e1; overflow: hidden;">
    
    <!-- Encabezado Institucional -->
    <tr>
      <td style="background-color: #0f766e; padding: 24px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 19px; font-weight: 700; letter-spacing: 0.5px; line-height: 1.3;">LAS PALOMAS SEASIDE GOLF COMMUNITY</h1>
        <p style="margin: 4px 0 0 0; color: #99f6e4; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Gestión Residencial & Administración HOA</p>
      </td>
    </tr>

    <!-- Barra de Asunto -->
    <tr>
      <td style="padding: 14px 24px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #475569;">
        <strong style="color: #0f766e;">Asunto:</strong> ${safeSubject}
      </td>
    </tr>

    <!-- Cuerpo del Mensaje -->
    <tr>
      <td style="padding: 28px 24px; font-size: 15px; line-height: 1.6; color: #1e293b;">
        ${formattedParagraphs}
      </td>
    </tr>

    <!-- Pie Institucional Cumplimiento Anti-Spam / CAN-SPAM -->
    <tr>
      <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 12px; line-height: 1.5; color: #64748b;">
        <p style="margin: 0 0 6px 0; font-weight: 700; color: #334155;">Asociación de Condóminos Las Palomas Seaside Golf Community</p>
        <p style="margin: 0 0 10px 0; color: #64748b; font-size: 11px;">Blvd. Costero 150, Sandy Beach, C.P. 83550, Puerto Peñasco, Sonora, México.</p>
        <p style="margin: 0; font-size: 11px; color: #94a3b8; border-top: 1px dashed #cbd5e1; padding-top: 10px;">
          Recibes este comunicado oficial como propietario o residente registrado en Las Palomas.<br/>
          Si deseas modificar tus canales de contacto o consideras que recibiste esto por error, responde directamente a este correo.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // Extraer dominio para generar Message-ID profesional
    const senderDomain = from.includes('@') ? from.split('@')[1].replace(/>.*/, '').trim() : 'laspalomas.com';
    const uniqueMessageId = `<hoanotif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@${senderDomain}>`;

    try {
      // Envío con cabeceras estándar requeridas por Gmail y Yahoo (RFC 2369 / RFC 8058)
      await transporter.sendMail({
        from,
        to: dest.email,
        replyTo,
        subject: finalSubject,
        text: plainText,
        html,
        messageId: uniqueMessageId,
        headers: {
          'X-Mailer': 'LasPalomas-HOA-Notification/2.0',
          'Precedence': 'bulk',
          'List-Unsubscribe': `<mailto:${replyTo}?subject=Cancelar-Suscripcion>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          'X-Auto-Response-Suppress': 'OOF, AutoReply'
        }
      });
      results.push({ email: dest.email, success: true });
    } catch (err: any) {
      console.error(`[SMTP Error to ${dest.email}]:`, err.message);
      results.push({ email: dest.email, success: false, error: err.message });
    }

    // Delay preventivo entre envíos para no disparar los filtros de ráfaga/burst de Gmail / Outlook
    if (payload.destinatarios.length > 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return {
    total: payload.destinatarios.length,
    sent: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results
  };
}
