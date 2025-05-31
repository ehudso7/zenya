import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/landing">
          <Button variant="ghost" className="mb-8 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-lg mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Zenya, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p>
              Zenya is an AI-powered learning platform designed to help neurodiverse adults learn through personalized, adaptive micro-lessons. Our service includes:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>AI tutoring and conversational learning</li>
              <li>Mood-adaptive content delivery</li>
              <li>Progress tracking and gamification</li>
              <li>Educational content across various subjects</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p>To use certain features of Zenya, you may need to create an account. You agree to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
            <p>You agree NOT to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Use Zenya for any illegal or harmful purposes</li>
              <li>Attempt to hack, reverse engineer, or compromise our systems</li>
              <li>Share inappropriate or offensive content</li>
              <li>Impersonate others or provide false information</li>
              <li>Use automated systems to access the service</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Medical Disclaimer</h2>
            <p className="font-semibold mb-2">
              IMPORTANT: Zenya is NOT a medical service or therapy replacement.
            </p>
            <p>
              Zenya is an educational tool designed to support learning. It is not intended to diagnose, treat, cure, or prevent any medical condition, including ADHD or other neurodevelopmental conditions. Always consult with qualified healthcare professionals for medical advice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <p>
              All content, features, and functionality of Zenya are owned by us and are protected by international copyright, trademark, and other intellectual property laws. You may not:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Copy, modify, or distribute our content without permission</li>
              <li>Use our trademarks or logos without authorization</li>
              <li>Create derivative works based on our service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. User Content</h2>
            <p>
              By submitting content to Zenya (such as responses to lessons), you grant us a non-exclusive, worldwide, royalty-free license to use, process, and improve our service. You retain ownership of your content.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Payment Terms</h2>
            <p>If you purchase a subscription:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Payments are processed securely through our payment provider</li>
              <li>Subscriptions auto-renew unless cancelled</li>
              <li>Refunds are handled according to our refund policy</li>
              <li>Prices may change with notice</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, ZENYA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
            <p>
              We may terminate or suspend your account at any time for violations of these Terms. You may cancel your account at any time through your account settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. We will notify you of material changes by posting the new Terms and updating the "Last updated" date. Your continued use constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
            <p>
              These Terms are governed by the laws of [Your Jurisdiction], without regard to conflict of law principles.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
            <p>
              For questions about these Terms, please contact us at:
            </p>
            <p className="mt-2">
              Email: legal@zenya.app<br />
              Address: [Your Company Address]
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}