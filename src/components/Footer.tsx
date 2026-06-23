import { Link } from 'react-router-dom'

const aboutLinks = [
  { to: '/', label: 'Home' },
  { to: '/analyze', label: 'Analyze' },
  { to: '/guide', label: 'Guide' },
  { to: '/history', label: 'History' }
]

const services = [
  'AI Classification',
  'Lab Step Guide',
  'Bacteria Reference',
]

export default function Footer() {
  return (
    <footer className="bg-navy mt-10 text-white">
      <div className="px-4 md:px-10 py-5 md:py-7">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10">

          {/* Logo + tagline */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="border border-white rounded-sm">
                <img
                  src="/hydroscope-logo.svg"
                  alt="Hydroscope"
                  className="w-10 h-10"
                />
              </div>
              <div>
                <p className="md:text-lg text-base font-bold leading-tight">Hydroscope</p>
                <p className="md:text-sm text-xs text-white/60 leading-tight">AI Classification System</p>
              </div>
            </div>
            <p className="md:text-sm text-xs text-white/70 max-w-sm ">
              Leading the future of bacterial classification with AI and high-precision microscopy
            </p>
          </div>

          {/* About Hydroscope */}
          <div>
            <h3 className="font-semibold md:text-sm text-xs mb-5">About Hydroscope</h3>
            <ul className="flex flex-col gap-3">
              {aboutLinks.map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="md:text-sm text-xs text-white/70 hover:text-white flex items-center gap-2 transition-colors"
                  >
                    <span className="text-white/50 text-base leading-none">›</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Our Services */}
          <div>
            <h3 className="font-semibold md:text-sm text-xs mb-5">Our Services</h3>
            <ul className="flex flex-col gap-3">
              {services.map(service => (
                <li key={service} className="md:text-sm text-xs text-white/70 flex items-center gap-2">
                  {service}
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-6 md:mt-10 pt-4 md:pt-6 border-t border-white/10">
          <p className="md:text-sm text-xs text-white/60">© 2026 Hydroscope, All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}
