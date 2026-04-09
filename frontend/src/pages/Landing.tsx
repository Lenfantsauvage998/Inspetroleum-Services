import React, { useEffect } from 'react'
import HeroSection from '../components/landing/HeroSection'
import WhoWeAre from '../components/landing/WhoWeAre'
import SolutionSpotlights from '../components/landing/SolutionSpotlights'
import NewsSection from '../components/landing/NewsSection'
import CallToAction from '../components/landing/CallToAction'

const Landing: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

  return (
    <div>
      <HeroSection />
      <WhoWeAre />

      {/* Section divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-200" />
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#8DBF2E]" />
            <span className="w-2 h-2 rounded-full bg-[#A6CE39]" />
            <span className="w-2 h-2 rounded-full bg-[#4F7F1F]" />
          </div>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
      </div>

      <SolutionSpotlights />
      <NewsSection />
      <CallToAction />
    </div>
  )
}

export default Landing
