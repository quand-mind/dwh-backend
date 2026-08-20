import sgMail from '@sendgrid/mail';

const sendVerificationCodeEmail = async (toEmail, code, userName = '') => {
    try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const greeting = userName ? `Hola, <strong>${userName}</strong>` : 'Hola';

        const htmlContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 28px; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #1a365d; margin: 0; font-size: 24px; font-weight: 700;">La Mundial de Seguros</h2>
                <p style="color: #718096; margin-top: 4px; font-size: 14px;">Portal de Gestión y Servicios</p>
            </div>
            
            <div style="border-top: 1px solid #edf2f7; padding-top: 20px;">
                <p style="color: #2d3748; font-size: 16px; line-height: 1.5; margin: 0 0 16px 0;">
                    ${greeting},
                </p>
                <p style="color: #4a5568; font-size: 15px; line-height: 1.5; margin: 0 0 20px 0;">
                    Has solicitado un código de verificación para continuar con tu proceso de recuperación de contraseña o validación de cuenta.
                </p>
                
                <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border: 1px dashed #cbd5e0; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
                    <span style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #718096; font-weight: 600; display: block; margin-bottom: 8px;">Tu código de seguridad es:</span>
                    <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #2b6cb0; font-family: monospace;">${code}</span>
                </div>
                
                <div style="background-color: #fffaf0; border-left: 4px solid #dd6b20; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px;">
                    <p style="color: #9c4221; font-size: 13px; margin: 0; line-height: 1.4;">
                        ⏱️ Este código es válido por <strong>10 minutos</strong>. No compartas este código con nadie.
                    </p>
                </div>
                
                <p style="color: #a0aec0; font-size: 12px; line-height: 1.4; margin: 0;">
                    Si no solicitaste este código, puedes ignorar este mensaje con total seguridad.
                </p>
            </div>
            
            <div style="border-top: 1px solid #edf2f7; margin-top: 24px; padding-top: 16px; text-align: center;">
                <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                    © ${new Date().getFullYear()} La Mundial de Seguros. Todos los derechos reservados.
                </p>
            </div>
        </div>
        `;

        const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'themultiacount@gmail.com';

        const msg = {
            to: toEmail,
            from: {
                name: 'La Mundial de Seguros',
                email: fromEmail
            },
            subject: `${code} es tu código de verificación - La Mundial de Seguros`,
            text: `Tu código de verificación es: ${code}. Este código es válido por 10 minutos.`,
            html: htmlContent
        };

        const [response] = await sgMail.send(msg);
        return { success: true, statusCode: response.statusCode };
    } catch (error) {
        console.error('Error al enviar correo de verificación con SendGrid:', error);
        if (error.response) {
            console.error('SendGrid error body:', error.response.body);
        }
        return { error: error.message };
    }
};

export default {
    sendVerificationCodeEmail
};
