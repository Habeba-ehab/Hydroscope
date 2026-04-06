import Hero from './Hero'
import AboutUs from './AboutUs'
import HowItWorks from './HowItWorks'
import SupportedBacteria from './SupportedBacteria'
import WhyHydroScope from './WhyHydroScope'

export default function Home() {
  return (
    <div className="px-4 md:px-10">
      <div className="min-h-[calc(100dvh-5rem)] flex items-center md:mb-10">
        <Hero />
      </div>
      <AboutUs />
      <HowItWorks />
      <SupportedBacteria />
      <WhyHydroScope />
    </div>
  )
}
