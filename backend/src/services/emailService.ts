// backend/src/services/emailService.ts
import nodemailer from "nodemailer";

/**
 * Crear transportador de email
 */
const createTransporter = () => {
  // Configuración base
  const config: any = {
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  };

  // En desarrollo, ignorar certificados SSL autofirmados
  if (process.env.NODE_ENV === "development") {
    config.tls = {
      rejectUnauthorized: false
    };
  }

  if (process.env.EMAIL_SERVICE === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      ...config,
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    ...config,
  });
};

/**
 * Enviar email de recuperación de contraseña
 */
export const sendPasswordResetEmail = async (
  to: string,
  resetUrl: string,
  userName: string
): Promise<boolean> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Sistema de Vuelos" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: "Recuperación de Contraseña - Sistema de Vuelos",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .container { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; padding: 30px; color: white; }
            .content { background: white; color: #333; padding: 30px; border-radius: 8px; margin-top: 20px; }
            .button { display: inline-block; background: linear-gradient(135deg, #005f7f 0%, #003b5e 100%); color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 30px; color: white; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 style="margin: 0;">🔐 Recuperación de Contraseña</h1>
            
            <div class="content">
              <h2>Hola ${userName},</h2>
              
              <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en el Sistema de Vuelos.</p>
              
              <p>Para crear una nueva contraseña, haz clic en el siguiente botón:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
              </div>
              
              <p>O copia y pega este enlace en tu navegador:</p>
              <p style="background: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all;">
                ${resetUrl}
              </p>
              
              <div class="warning">
                <strong>⚠️ Importante:</strong>
                <ul style="margin: 10px 0;">
                  <li>Este enlace es válido por <strong>1 hora</strong></li>
                  <li>Solo puedes usarlo <strong>una vez</strong></li>
                  <li>Si no solicitaste este cambio, ignora este email</li>
                </ul>
              </div>
              
              <p>Si tienes problemas, contacta con nuestro equipo de soporte.</p>
              
              <p style="margin-top: 30px;">
                Saludos,<br>
                <strong>Equipo de Sistema de Vuelos</strong>
              </p>
            </div>
            
            <div class="footer">
              <p>Este es un email automático, por favor no respondas a este mensaje.</p>
              <p>© ${new Date().getFullYear()} Sistema de Vuelos. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hola ${userName},

Recibimos una solicitud para restablecer la contraseña de tu cuenta.

Para crear una nueva contraseña, visita el siguiente enlace:
${resetUrl}

Este enlace es válido por 1 hora y solo puede usarse una vez.

Si no solicitaste este cambio, ignora este email.

Saludos,
Equipo de Sistema de Vuelos
      `.trim(),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email enviado:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Error enviando email:", error);
    return false;
  }
};

/**
 * Verificar configuración de email
 */
export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("✅ Configuración de email verificada correctamente");
    return true;
  } catch (error) {
    console.error("❌ Error en configuración de email:", error);
    return false;
  }
};