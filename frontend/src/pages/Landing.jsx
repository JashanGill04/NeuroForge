import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LandingNav from '../components/landing/LandingNav'
import HeroSection from '../components/landing/HeroSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import StackSection from '../components/landing/StackSection'
import RoadmapSection from '../components/landing/RoadmapSection'
import StatsBand from '../components/landing/StatsBand'
import TestimonialsSection from '../components/landing/TestimonialsSection'
import FaqSection from '../components/landing/FaqSection'
import CtaFooter from '../components/landing/CtaFooter'

export default function Landing() {
  const { isAuthenticated, login } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="landing">
      <LandingNav onLogin={login} />
      <HeroSection onLogin={login} />
      <FeaturesSection />
      <StackSection />
      <RoadmapSection />
      <StatsBand />
      <TestimonialsSection />
      <FaqSection />
      <CtaFooter onLogin={login} />
    </div>
  )
}
