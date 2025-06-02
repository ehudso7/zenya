import { Metadata } from 'next'
import LandingPage from './landing/page'

export const metadata: Metadata = {
  title: 'Zenya - Your AI Learning Companion',
  description: 'Calm, focused AI tutoring built for neurodiverse learners',
}

export default function RootPage() {
  // Render the landing page content directly instead of redirecting
  return <LandingPage />
}