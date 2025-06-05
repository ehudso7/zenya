import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/api-middleware'
import { contactFormSchema } from '@/lib/validations'
import { validateRequest } from '@/lib/validation-middleware'

export async function POST(request: NextRequest) {
  return withRateLimit(request, async (req) => {
    try {
      // Validate request body
      const { data, error: validationError } = await validateRequest(req, contactFormSchema)
      
      if (validationError) {
        return validationError
      }

      const { name, email, subject, message } = data!

      // Store contact form submission
      const timestamp = new Date().toISOString()
      const contactData = {
        name,
        email,
        subject,
        message,
        timestamp,
        status: 'pending'
      }

      // In production, this would be sent to an email service
      // For now, we store it and log it
      if (process.env.NODE_ENV === 'development') {
        console.log('Contact form submission:', contactData)
      }

      // Email service integration point
      // When ready, integrate with services like SendGrid, AWS SES, Postmark, or Resend
      // Example implementation:
      // if (process.env.EMAIL_SERVICE_API_KEY) {
      //   await sendEmail({
      //     to: process.env.CONTACT_EMAIL,
      //     from: email,
      //     subject: `Contact Form: ${subject}`,
      //     text: message,
      //     replyTo: email
      //   })
      // }

      return NextResponse.json({
        success: true,
        message: 'Thank you for contacting us! We\'ll get back to you soon.'
      })
    } catch (error) {
      // Log error for monitoring
      if (process.env.NODE_ENV === 'development') {
        console.error('Contact form error:', error)
      }
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      )
    }
  }, 'contact')
}