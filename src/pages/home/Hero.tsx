import { Link } from 'react-router-dom'
import Cookies from 'js-cookie'

export default function Hero() {
  return (
    <section className="w-full">

      {/* Left: copy */}
      <div className="w-full md:flex-1 md:max-w-2xl">

        {/* Badge */}
        <div
          className="inline-flex items-center gap-1.5 border border-navy/20 bg-navy/5 text-navy text-xs md:text-sm px-3 py-1 md:px-4 md:py-1.5 rounded-full mb-6 font-medium"
          style={{ animation: 'fadeInUp 0.5s ease both 0.1s' }}
        >
          <svg className="w-3 h-3 md:w-4 md:h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            <path d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
          AI-Powered Lab Assistant
        </div>

        {/* Heading */}
        <h1
          className="font-heading text-3xl md:text-5xl font-bold text-navy leading-[1.15] mb-5"
          style={{ animation: 'fadeInUp 0.5s ease both 0.25s' }}
        >
          {Cookies.get('user_name') ? `Welcome back, ${Cookies.get('user_name')}!` : 'Welcome to HydroScope'}
        </h1>
        <h3
          className="font-heading text-xl md:text-3xl font-semibold text-navy leading-[1.15] mb-5"
          style={{ animation: 'fadeInUp 0.5s ease both 0.4s' }}
        >
          AI Bacterial Classification System
        </h3>

        {/* Subtitle */}
        <p
          className="font-body text-lightnavy text-base md:text-lg leading-relaxed mb-8"
          style={{ animation: 'fadeInUp 0.5s ease both 0.55s' }}
        >
          Allow AI to analyze your water and uncover the bacteria within, clearly, simply, and reliably.
        </p>

        {/* CTAs */}
        <div className="flex flex-row items-center justify-start gap-4 md:gap-5" style={{ animation: 'fadeInUp 0.5s ease both 0.7s' }}>
          <Link
            to="/analyze"
            className="bg-navy text-white md:text-base text-sm md:px-8 md:py-3.5 px-4 py-3 rounded-full font-medium transition-opacity hover:opacity-90">
            Start Analyzing
          </Link>
          <Link to="/guide" className="text-navy font-medium md:text-base text-sm flex items-center gap-1.5 group">
            How it works
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>

    </section>
  )
}
