import Hero from '../components/landing/Hero'
import AboutUs from '../components/landing/AboutUs'
import HowItWorks from '../components/landing/HowItWorks'
import SupportedBacteria from '../components/landing/SupportedBacteria'
import WhyHydroScope from '../components/landing/WhyHydroScope'

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
