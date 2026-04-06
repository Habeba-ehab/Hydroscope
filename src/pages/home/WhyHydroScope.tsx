import { Link } from 'react-router-dom'
import { useInView } from '../../hooks/useInView'

const stats = [
  { value: '30', unit: 's', label: 'To classify your sample' },
  { value: '6', unit: 'sp.', label: 'Bacteria detected' },
  { value: '24/7', unit: '', label: 'Available anytime' },
]

const features = [
  {
    num: '01',
    title: 'Instant Classification',
    desc: 'Upload a microscope image and receive a species classification in seconds — no culturing, no waiting overnight.',
    tag: 'Speed',
  },
  {
    num: '02',
    title: 'Tailored Lab Steps',
    desc: 'Get step-by-step guidance written for the exact bacteria in your sample, not a generic one-size-fits-all protocol.',
    tag: 'Guidance',
  },
  {
    num: '03',
    title: 'No Experience Required',
    desc: 'Designed for students still learning morphology. The AI bridges the gap between what you see and what it means.',
    tag: 'Accessibility',
  },
  {
    num: '04',
    title: 'Always Available',
    desc: 'No TA office hours, no lab scheduling. HydroScope works from your laptop or phone whenever you need it.',
    tag: 'Availability',
  },
]

export default function WhyHydroScope() {
  const { ref: headerRef, inView: headerInView } = useInView(0.2)
  const { ref: cardsRef, inView: cardsInView } = useInView(0.15)
  const { ref: ctaRef, inView: ctaInView } = useInView(0.3)

  return (
    <>
      {/* Header + Stats */}
      <section ref={headerRef} className="py-20">
        <div
          style={headerInView ? { animation: 'fadeInUp 0.5s ease both 0s' } : { opacity: 0 }}
        >
          <p className="font-body text-bluenavy md:text-lg text-base font-semibold tracking-widest uppercase mb-4">
            · Why HydroScope ·
          </p>
          <h2 className="font-heading text-2xl md:text-4xl font-bold text-navy leading-tight mb-6">
            Built for Students,{' '}
            Not Just{' '}
            <em className="italic text-bluenavy">Specialists</em>
          </h2>
          <p className="font-body text-lightnavy text-sm md:text-base max-w-2xl leading-relaxed mb-12">
            Traditional bacterial identification was designed for fully equipped labs with
            experienced technicians. HydroScope brings that capability to any student, at any
            stage, during any lab session.
          </p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-16 md:gap-52">
          {stats.map(({ value, unit, label }, i) => (
            <div
              key={label}
              className="flex flex-col items-center"
              style={
                headerInView
                  ? { animation: `fadeInUp 0.5s ease both ${0.2 + i * 0.1}s` }
                  : { opacity: 0 }
              }
            >
              <p className="font-heading text-3xl md:text-6xl font-bold text-navy leading-none">
                {value}<span className="text-xl md:text-3xl">{unit}</span>
              </p>
              <p className="font-body text-xs md:text-base text-lightnavy mt-2 max-w-25 leading-snug text-center">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Cards */}
      <section ref={cardsRef} className="-mx-4 md:-mx-10 px-4 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {features.map(({ num, title, desc, tag }, i) => (
            <div
              key={num}
              className="bg-lightnavy/10 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col gap-3"
              style={
                cardsInView
                  ? { animation: `fadeInUp 0.5s ease both ${i * 0.1}s` }
                  : { opacity: 0 }
              }
            >
              <span className="font-heading text-5xl font-bold text-navy leading-none">
                {num}
              </span>
              <h3 className="font-body text-base font-semibold text-navy">{title}</h3>
              <p className="font-body text-sm text-lightnavy leading-relaxed flex-1">{desc}</p>
              <div>
                <span className="font-body text-xs text-navy  bg-lightnavy/30 rounded-full px-3 py-1">
                  {tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        ref={ctaRef}
        className="-mx-4 md:-mx-10 px-6 md:px-16 md:pt-20 pt-10 md:pb-10"
      >
        <div
          style={ctaInView ? { animation: 'fadeInUp 0.6s ease both 0s' } : { opacity: 0 }}
        >
          <h2 className="font-heading text-2xl md:text-4xl font-bold text-navy leading-tight mb-3">
            Ready to try it on your{' '}
            <em className="italic text-bluenavy">next sample?</em>
          </h2>
          <p className="font-body text-sm md:text-base text-lightnavy max-w-md leading-relaxed mb-8">
            Upload your microscope image and let HydroScope do the rest — free for students.
          </p>
          <Link
            to="/analyze"
            className="bg-navy text-white md:text-base text-sm md:px-8 md:py-3.5 px-4 py-3 rounded-full font-medium transition-opacity hover:opacity-90"
          >
            Start Analyzing
          </Link>
        </div>
      </section>
    </>
  )
}
