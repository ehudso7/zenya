import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/api-middleware'
import { contactFormSchema } from '@/lib/validations'
import { validateRequest } from '@/lib/validation-middleware'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Email template for contact form submissions
const createEmailTemplate = (name: string, email: string, subject: string, message: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Contact Form Submission - Zenya AI</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
    .field { margin-bottom: 20px; }
    .label { font-weight: 600; color: #4a5568; margin-bottom: 5px; display: block; }
    .value { background: white; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; }
    .message-content { white-space: pre-wrap; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #718096; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📧 New Contact Form Submission</h1>
    <p>Someone has reached out through the Zenya AI contact form</p>
  </div>
  <div class="content">
    <div class="field">
      <label class="label">From:</label>
      <div class="value">${name} &lt;${email}&gt;</div>
    </div>
    <div class="field">
      <label class="label">Subject:</label>
      <div class="value">${subject}</div>
    </div>
    <div class="field">
      <label class="label">Message:</label>
      <div class="value message-content">${message}</div>
    </div>
    <div class="footer">
      <p>Submitted at: ${new Date().toLocaleString()}</p>
      <p>Reply directly to this email to respond to ${name}.</p>
    </div>
  </div>
</body>
</html>
`

async function sendContactEmail(name: string, email: string, subject: string, message: string) {
  // Try Resend first (most reliable for transactional emails)
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      
      await resend.emails.send({
        from: 'Zenya AI Contact <noreply@zenya.ai>',
        to: [process.env.CONTACT_EMAIL || 'contact@zenya.ai'],
        replyTo: email,
        subject: `[Zenya AI] ${subject}`,
        html: createEmailTemplate(name, email, subject, message),
        text: `New contact form submission from ${name} (${email})\n\nSubject: ${subject}\n\nMessage:\n${message}`
      })
      return { success: true, provider: 'Resend' }
    } catch (error) {
      console.error('Resend email failed:', error)
    }
  }

  // Fallback to NodeMailer with SMTP (for custom email providers)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const nodemailer = await import('nodemailer')
      
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      await transporter.sendMail({
        from: `"Zenya AI Contact" <${process.env.SMTP_USER}>`,
        to: process.env.CONTACT_EMAIL || 'contact@zenya.ai',
        replyTo: email,
        subject: `[Zenya AI] ${subject}`,
        html: createEmailTemplate(name, email, subject, message),
        text: `New contact form submission from ${name} (${email})\n\nSubject: ${subject}\n\nMessage:\n${message}`
      })
      return { success: true, provider: 'SMTP' }
    } catch (error) {
      console.error('SMTP email failed:', error)
    }
  }

  // If no email service is configured, log and store in database
  console.warn('No email service configured. Contact form submission will be stored in database only.')
  return { success: false, provider: 'none' }
}

export async function POST(request: NextRequest) {
  return withRateLimit(request, async (req) => {
    try {
      // Validate request body
      const { data, error: validationError } = await validateRequest(req, contactFormSchema)
      
      if (validationError) {
        return validationError
      }

      const { name, email, subject, message } = data!

      // Store contact form submission in database for tracking
      const supabase = await createServerSupabaseClient()
      
      const { error: dbError } = await supabase
        .from('contact_submissions')
        .insert({
          name,
          email,
          subject,
          message,
          submitted_at: new Date().toISOString(),
          ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown'
        })

      if (dbError) {
        console.error('Failed to store contact submission:', dbError)
        // Continue anyway - email is more important than storage
      }

      // Send email notification
      const emailResult = await sendContactEmail(name, email, subject, message)
      
      if (emailResult.success) {
        console.warn(`Contact form email sent successfully via ${emailResult.provider}`)
        
        return NextResponse.json({
          success: true,
          message: 'Thank you for contacting us! We\'ll get back to you within 24 hours.'
        })
      } else {
        // Even if email fails, acknowledge receipt if we stored it
        if (!dbError) {
          return NextResponse.json({
            success: true,
            message: 'Thank you for contacting us! Your message has been received and we\'ll get back to you soon.'
          })
        }
        
        // Both email and storage failed
        return NextResponse.json(
          { error: 'Failed to process your message. Please try again or contact us directly.' },
          { status: 500 }
        )
      }
    } catch (_error) {
      console.error('Contact form error:', _error)
      return NextResponse.json(
        { error: 'Failed to send message. Please try again later.' },
        { status: 500 }
      )
    }
  }, 'contact')
}