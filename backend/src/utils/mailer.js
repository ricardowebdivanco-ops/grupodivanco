import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Debug: verificar variables de entorno
console.log('🔧 [MAILER] Configuración SMTP:');
console.log('   MAIL_HOST:', process.env.MAIL_HOST);
console.log('   MAIL_PORT:', process.env.MAIL_PORT);
console.log('   MAIL_USER:', process.env.MAIL_USER);
console.log('   MAIL_PASS:', process.env.MAIL_PASS ? '***configurado***' : 'NO CONFIGURADO');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function sendMail({ to, subject, text, html, from }) {
  return transporter.sendMail({
    from: from || process.env.MAIL_USER,
    to,
    subject,
    text,
    html,
  });
}

export async function sendRegistrationMail(to) {
  return sendMail({
    to,
    subject: 'Registro exitoso',
    text: '¡Bienvenido! Tu registro fue exitoso.',
  });
}

export async function sendPasswordRecoveryMail(to, token) {
  const recoveryUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  return sendMail({
    to,
    subject: 'Recuperación de contraseña',
    text: `Para recuperar tu contraseña, haz clic en el siguiente enlace: ${recoveryUrl}`,
    html: `<p>Para recuperar tu contraseña, haz clic en el siguiente enlace:</p><a href="${recoveryUrl}">${recoveryUrl}</a>`
  });
}

// Enviar email de bienvenida a nuevo suscriptor
export async function sendWelcomeEmail(subscriber) {
  try {
    const unsubscribeUrl = `${process.env.FRONTEND_URL}/unsubscribe/${subscriber.unsubscribeToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bienvenido a la Comunidad Divanco</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 30px; }
          .content h2 { color: #1e3a8a; margin-bottom: 20px; font-size: 24px; }
          .content p { margin-bottom: 16px; color: #4b5563; }
          .highlights { background: #f0f9ff; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #3b82f6; }
          .highlights ul { margin: 10px 0; padding-left: 20px; }
          .highlights li { margin-bottom: 8px; color: #374151; }
          .btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; transition: transform 0.2s; }
          .btn:hover { transform: translateY(-2px); }
          .footer { padding: 30px; text-align: center; background: #f8fafc; border-top: 1px solid #e5e7eb; }
          .footer p { margin: 5px 0; color: #6b7280; }
          .unsubscribe { margin-top: 20px; font-size: 12px; color: #9ca3af; }
          .unsubscribe a { color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bienvenido a la Comunidad Divanco ✨</h1>
          </div>
          <div class="content">
            <h2>¡Hola${subscriber.name ? ` ${subscriber.name}` : ''}!</h2>
            <p>Gracias por unirte a nuestra comunidad. Ahora tienes acceso exclusivo a contenido especializado en arquitectura, diseño y construcción.</p>
            
            <div class="highlights">
              <p><strong>Como miembro de nuestra comunidad, recibirás:</strong></p>
              <ul>
                <li>🏗️ Artículos exclusivos sobre tendencias arquitectónicas</li>
                <li>📐 Análisis detallados de nuestros proyectos</li>
                <li>🔧 Consejos profesionales sobre materiales y técnicas</li>
                <li>� Insights del mercado inmobiliario y construcción</li>
                <li>🎯 Invitaciones a eventos y workshops especializados</li>
              </ul>
            </div>
            
            <p>Estamos comprometidos a compartir conocimiento valioso que impulse tu crecimiento profesional en el mundo de la arquitectura y el diseño.</p>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${process.env.FRONTEND_URL}" class="btn">Explorar Contenido Exclusivo</a>
            </div>
            
            <p>¡Bienvenido a bordo! 🚀</p>
          </div>
          <div class="footer">
            <p><strong>Divanco</strong> - Estudio de Arquitectura</p>
            <p>Creando espacios que inspiran</p>
            <div class="unsubscribe">
              <p>Si no deseas recibir más emails, puedes <a href="${unsubscribeUrl}">cancelar tu suscripción aquí</a></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return sendMail({
      to: subscriber.email,
      subject: 'Bienvenido a la Comunidad Divanco ✨',
      html
    });
  } catch (error) {
    console.error('❌ Error enviando email de bienvenida:', error.message);
    throw error;
  }
}

// Enviar notificación de nuevo post del blog
export async function sendBlogNotification(subscribers, blogPost) {
  if (!subscribers || subscribers.length === 0) {
    console.log('📧 No hay suscriptores para notificar');
    return;
  }

  try {
    const postUrl = `${process.env.FRONTEND_URL}/blog/${blogPost.slug}`;
    
    // Enviar emails en lotes para evitar sobrecarga
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < subscribers.length; i += batchSize) {
      batches.push(subscribers.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const emailPromises = batch.map(async (subscriber) => {
        const unsubscribeUrl = `${process.env.FRONTEND_URL}/unsubscribe/${subscriber.unsubscribeToken}`;
        
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Nueva actualización de Divanco</title>
            <style>
              body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
              .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 40px 20px; text-align: center; }
              .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
              .content { padding: 40px 30px; }
              .content h2 { color: #059669; margin-bottom: 20px; font-size: 24px; }
              .content p { margin-bottom: 16px; color: #4b5563; }
              .btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; transition: transform 0.2s; }
              .btn:hover { transform: translateY(-2px); }
              .post-preview { background: #f0fdf4; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #10b981; }
              .post-title { color: #065f46; margin-bottom: 15px; font-size: 22px; font-weight: 600; }
              .post-excerpt { color: #374151; line-height: 1.6; margin-bottom: 15px; }
              .post-meta { color: #6b7280; font-size: 14px; }
              .post-meta strong { color: #374151; }
              .footer { padding: 30px; text-align: center; background: #f8fafc; border-top: 1px solid #e5e7eb; }
              .footer p { margin: 5px 0; color: #6b7280; }
              .unsubscribe { margin-top: 20px; font-size: 12px; color: #9ca3af; }
              .unsubscribe a { color: #6b7280; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Nueva actualización de Divanco 🏗️</h1>
              </div>
              <div class="content">
                <h2>¡Hola${subscriber.name ? ` ${subscriber.name}` : ''}!</h2>
                <p>Tenemos contenido fresco que seguramente te va a interesar. Hemos publicado un nuevo artículo con insights y conocimientos especializados para profesionales como tú.</p>
                
                <div class="post-preview">
                  <h3 class="post-title">${blogPost.title}</h3>
                  ${blogPost.excerpt ? `<p class="post-excerpt">${blogPost.excerpt}</p>` : ''}
                  <div class="post-meta">
                    ${blogPost.author ? `<p><strong>Autor:</strong> ${blogPost.author.name}</p>` : ''}
                    <p><strong>Fecha de publicación:</strong> ${new Date(blogPost.publishedAt).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                </div>
                
                <div style="text-align: center;">
                  <a href="${postUrl}" class="btn">Leer Artículo Completo →</a>
                </div>
                
                <p>Este contenido ha sido cuidadosamente desarrollado para aportar valor a tu práctica profesional. ¡No te lo pierdas!</p>
                
                <p>Saludos cordiales,<br>
                <strong>El equipo de Divanco</strong></p>
              </div>
              <div class="footer">
                <p><strong>Divanco</strong> - Estudio de Arquitectura</p>
                <p>Creando espacios que inspiran</p>
                <div class="unsubscribe">
                  <p>Si no deseas recibir más emails, puedes <a href="${unsubscribeUrl}">cancelar tu suscripción aquí</a></p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `;

        return sendMail({
          to: subscriber.email,
          subject: `Nueva actualización de Divanco 🏗️ - ${blogPost.title}`,
          html
        });
      });

      await Promise.all(emailPromises);
      console.log(`✅ Lote de ${batch.length} notificaciones enviadas`);
      
      // Pausa entre lotes para evitar rate limiting
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`✅ Notificaciones enviadas a ${subscribers.length} suscriptores para: ${blogPost.title}`);
  } catch (error) {
    console.error('❌ Error enviando notificaciones de blog:', error.message);
    throw error;
  }
}

// Enviar confirmación de cancelación de suscripción
export async function sendUnsubscribeConfirmation(subscriber) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Suscripción cancelada</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #95a5a6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .btn { display: inline-block; padding: 10px 20px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Suscripción Cancelada</h1>
          </div>
          <div class="content">
            <h2>Hola${subscriber.name ? ` ${subscriber.name}` : ''}!</h2>
            <p>Tu suscripción a nuestro newsletter ha sido cancelada exitosamente.</p>
            <p>Ya no recibirás notificaciones por email de parte nuestra.</p>
            <p>Si en algún momento cambias de opinión, siempre puedes volver a suscribirte desde nuestro sitio web.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}" class="btn">Visitar nuestro sitio web</a>
            </div>
            <p>¡Gracias por haber sido parte de nuestra comunidad!</p>
          </div>
          <div class="footer">
            <p>Divanco - Estudio de Arquitectura</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return sendMail({
      to: subscriber.email,
      subject: 'Suscripción cancelada - Divanco',
      html
    });
  } catch (error) {
    console.error('❌ Error enviando confirmación de cancelación:', error.message);
    throw error;
  }
}

export default transporter;
