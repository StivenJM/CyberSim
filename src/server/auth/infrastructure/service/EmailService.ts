import nodemailer from 'nodemailer'
import type { TransportOptions } from 'nodemailer'

export interface EmailService {
  sendConfirmationEmail(email: string, token: string, nombre: string): Promise<void>
  sendPasswordResetEmail(email: string, token: string, nombre: string): Promise<void>
}

export class NodemailerEmailService implements EmailService {
  private transporter: nodemailer.Transporter
  private fromEmail: string
  private frontendUrl: string

  constructor(smtpConfig: TransportOptions, fromEmail: string, frontendUrl: string) {
    this.transporter = nodemailer.createTransport(smtpConfig)
    this.fromEmail = fromEmail
    this.frontendUrl = frontendUrl
  }

  async sendConfirmationEmail(email: string, token: string, nombre: string): Promise<void> {
    const confirmationUrl = `${this.frontendUrl}/auth/confirm?token=${token}`

    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to: email,
        subject: 'Confirma tu cuenta - CyberSim',
        html: this.getConfirmationEmailTemplate(nombre, confirmationUrl),
      })
    } catch (error) {
      console.error('Error al enviar email de confirmación:', error)
      throw new Error('No se pudo enviar el email de confirmación. Inténtalo más tarde.')
    }
  }

  async sendPasswordResetEmail(email: string, token: string, nombre: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${token}`

    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to: email,
        subject: 'Recuperación de contraseña - CyberSim',
        html: this.getPasswordResetEmailTemplate(nombre, resetUrl),
      })
    } catch (error) {
      console.error('Error al enviar email de recuperación:', error)
      throw new Error('No se pudo enviar el email de recuperación. Inténtalo más tarde.')
    }
  }

  private getConfirmationEmailTemplate(nombre: string, confirmationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verificación de cuenta — CyberSim</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #050505; font-family: 'Segoe UI', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding: 48px 20px;">
            <tr>
              <td align="center">
                <table width="580" cellpadding="0" cellspacing="0" style="max-width: 580px; width: 100%;">

                  <!-- Header -->
                  <tr>
                    <td style="background-color: #0a0a0a; border-top: 1px solid #2a2a2a; border-left: 1px solid #2a2a2a; border-right: 1px solid #2a2a2a; border-radius: 2px 2px 0 0; padding: 40px 48px 36px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td>
                            <p style="margin: 0; font-size: 11px; color: #606060; letter-spacing: 3px; text-transform: uppercase; font-weight: bold;">Escuela Politécnica Nacional</p>
                            <p style="margin: 8px 0 0; font-size: 24px; font-weight: 300; color: #e8e8e8; letter-spacing: 6px; text-transform: uppercase; font-weight: bold;">CyberSim</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Divider -->
                  <tr>
                    <td style="background-color: #111; border-left: 1px solid #2a2a2a; border-right: 1px solid #2a2a2a; padding: 0 48px;">
                      <div style="height: 1px; background-color: #1e1e1e;"></div>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="background-color: #111; border-left: 1px solid #2a2a2a; border-right: 1px solid #2a2a2a; padding: 44px 48px;">
                      <p style="margin: 0; font-size: 22px; font-weight: 300; color: #d8d8d8; line-height: 1.4;">Bienvenido, <span style="color: #ffffff; font-weight: 400;">${nombre}</span></p>
                      <div style="height: 1px; background-color: #1e1e1e; margin: 28px 0;"></div>
                      <p style="margin: 0 0 28px; font-size: 14px; color: #666; line-height: 1.8;">
                        Tu registro ha sido recibido. Para activar tu acceso a la plataforma CyberSim, es necesario verificar tu dirección de correo electrónico mediante el enlace a continuación.
                      </p>
                      <table cellpadding="0" cellspacing="0" style="margin: 36px 0;">
                        <tr>
                          <td style="background-color: #e8e8e8; border-radius: 2px; padding: 15px 36px;">
                            <a href="${confirmationUrl}" style="font-size: 12px; color: #0a0a0a; text-decoration: none; letter-spacing: 2px; font-weight: 600; text-transform: uppercase;">Verificar cuenta</a>
                          </td>
                        </tr>
                      </table>
                      <div style="height: 1px; background-color: #1a1a1a; margin-bottom: 24px;"></div>
                      <p style="margin: 0 0 10px; font-size: 11px; color: #444; letter-spacing: 1.5px; text-transform: uppercase;">Enlace directo</p>
                      <p style="margin: 0; font-size: 11px; color: #606060; word-break: break-all; font-family: 'Courier New', monospace; line-height: 1.6;">${confirmationUrl}</p>
                      <div style="height: 1px; background-color: #1a1a1a; margin: 28px 0;"></div>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td width="48%" style="vertical-align: top;">
                            <p style="margin: 0 0 6px; font-size: 10px; color: #444; letter-spacing: 1.5px; text-transform: uppercase;">Validez del enlace</p>
                            <p style="margin: 0; font-size: 13px; color: #555;">24 horas desde su emisión</p>
                          </td>
                          <td width="4%" style="background-color: #1e1e1e;"></td>
                          <td width="48%" style="padding-left: 20px; vertical-align: top;">
                            <p style="margin: 0 0 6px; font-size: 10px; color: #444; letter-spacing: 1.5px; text-transform: uppercase;">¿No reconoces esto?</p>
                            <p style="margin: 0; font-size: 13px; color: #555;">Ignora este mensaje sin problema</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #0a0a0a; border-bottom: 1px solid #2a2a2a; border-left: 1px solid #2a2a2a; border-right: 1px solid #2a2a2a; border-radius: 0 0 2px 2px; padding: 20px 48px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td><p style="margin: 0; font-size: 10px; color: #555; letter-spacing: 1.5px; text-transform: uppercase;">Correo automático · No responder</p></td>
                          <td style="text-align: right;"><p style="margin: 0; font-size: 10px; color: #555; letter-spacing: 1px;">© 2026 CyberSim · EPN</p></td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `
  }

  private getPasswordResetEmailTemplate(nombre: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Restablecimiento de contraseña — CyberSim</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #050505; font-family: 'Segoe UI', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding: 48px 20px;">
            <tr>
              <td align="center">
                <table width="580" cellpadding="0" cellspacing="0" style="max-width: 580px; width: 100%;">

                  <!-- Header -->
                  <tr>
                    <td style="background-color: #0a0a0a; border-top: 1px solid #2a2a2a; border-left: 1px solid #2a2a2a; border-right: 1px solid #2a2a2a; border-radius: 2px 2px 0 0; padding: 40px 48px 36px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td>
                            <p style="margin: 0; font-size: 11px; color: #606060; letter-spacing: 3px; text-transform: uppercase; font-weight: bold;">Escuela Politécnica Nacional</p>
                            <p style="margin: 8px 0 0; font-size: 24px; font-weight: 300; color: #e8e8e8; letter-spacing: 6px; text-transform: uppercase; font-weight: bold;">CyberSim</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Divider -->
                  <tr>
                    <td style="background-color: #111; border-left: 1px solid #2a2a2a; border-right: 1px solid #2a2a2a; padding: 0 48px;">
                      <div style="height: 1px; background-color: #1e1e1e;"></div>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="background-color: #111; border-left: 1px solid #2a2a2a; border-right: 1px solid #2a2a2a; padding: 44px 48px;">
                      <p style="margin: 0; font-size: 22px; font-weight: 300; color: #d8d8d8; line-height: 1.4;">Hola, <span style="color: #ffffff; font-weight: 400;">${nombre}</span></p>
                      <div style="height: 1px; background-color: #1e1e1e; margin: 28px 0;"></div>
                      <p style="margin: 0 0 28px; font-size: 14px; color: #666; line-height: 1.8;">
                        Recibimos una solicitud de restablecimiento de contraseña para esta cuenta. Si la realizaste tú, utiliza el enlace a continuación. En caso contrario, no se requiere ninguna acción.
                      </p>
                      <table cellpadding="0" cellspacing="0" style="margin: 36px 0;">
                        <tr>
                          <td style="background-color: #c0a060; border-radius: 2px; padding: 15px 36px;">
                            <a href="${resetUrl}" style="font-size: 12px; color: #0a0a0a; text-decoration: none; letter-spacing: 2px; font-weight: 600; text-transform: uppercase;">Restablecer contraseña</a>
                          </td>
                        </tr>
                      </table>
                      <div style="height: 1px; background-color: #1a1a1a; margin-bottom: 24px;"></div>
                      <p style="margin: 0 0 10px; font-size: 11px; color: #444; letter-spacing: 1.5px; text-transform: uppercase;">Enlace directo</p>
                      <p style="margin: 0; font-size: 11px; color: #606060; word-break: break-all; font-family: 'Courier New', monospace; line-height: 1.6;">${resetUrl}</p>
                      <div style="height: 1px; background-color: #1a1a1a; margin: 28px 0;"></div>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td width="48%" style="vertical-align: top;">
                            <p style="margin: 0 0 6px; font-size: 10px; color: #444; letter-spacing: 1.5px; text-transform: uppercase;">Validez del enlace</p>
                            <p style="margin: 0; font-size: 13px; color: #555;">24 horas desde su emisión</p>
                          </td>
                          <td width="4%" style="background-color: #1e1e1e;"></td>
                          <td width="48%" style="padding-left: 20px; vertical-align: top;">
                            <p style="margin: 0 0 6px; font-size: 10px; color: #8a7040; letter-spacing: 1.5px; text-transform: uppercase;">Si no fuiste tú</p>
                            <p style="margin: 0; font-size: 13px; color: #555;">Tu cuenta permanece segura. Ignora este correo.</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #0a0a0a; border-bottom: 1px solid #2a2a2a; border-left: 1px solid #2a2a2a; border-right: 1px solid #2a2a2a; border-radius: 0 0 2px 2px; padding: 20px 48px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td><p style="margin: 0; font-size: 10px; color: #555; letter-spacing: 1.5px; text-transform: uppercase;">Correo automático · No responder</p></td>
                          <td style="text-align: right;"><p style="margin: 0; font-size: 10px; color: #555; letter-spacing: 1px;">© 2026 CyberSim · EPN</p></td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `
  }
}
