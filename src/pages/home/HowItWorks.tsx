import { Fragment } from 'react'
import type { CSSProperties } from 'react'
import { useInView } from '../../hooks/useInView'

const steps = [
  {
    number: '01',
    title: 'Upload Your Sample',
    description:
      'Photograph your bacteria slide through the microscope and upload it directly to HydroScope.',
  },
  {
    number: '02',
    title: 'AI Identifies It',
    description:
      'The model scans your image, identifies the bacteria species, and cross-references its lab knowledge base instantly.',
  },
  {
    number: '03',
    title: 'Get Your Lab Guide',
    description:
      'Receive step-by-step lab instructions tailored to your exact sample — like a TA available 24/7.',
  },
]

// Animation timing (seconds) — sequential: card slides up → node activates → line fills → next card
const CARD = (i: number) => 0.1 + i * 0.95
const NODE = (i: number) => CARD(i) + 0.75
const LINE = (i: number) => NODE(i) + 0.45

export default function HowItWorks() {
  const { ref, inView } = useInView(0.2)

  const cardStyle = (i: number): CSSProperties =>
    inView
      ? { animation: `fadeInUp 1s ease both ${CARD(i)}s` }
      : { opacity: 0 }

  const nodeStyle = (i: number): CSSProperties =>
    inView
      ? {
          animation: `nodeActivate 0.6s ease both ${NODE(i)}s, nodePulse 1s ease ${NODE(i) + 0.3}s`,
        }
      : { backgroundColor: 'rgba(15,48,82,0.07)', color: '#0F3052' }

  const lineStyle = (i: number): CSSProperties =>
    inView
      ? { animation: `lineGrow 0.8s ease both ${LINE(i)}s` }
      : { width: 0 }

  const vertLineStyle = (i: number): CSSProperties =>
    inView
      ? { animation: `lineGrowV 0.8s ease both ${LINE(i)}s` }
      : { height: 0 }

  return (
    <section className="py-20 pb-6 md:pb-10" ref={ref}>

      {/* Header — same style as About Us */}
      <div
        className="mb-16"
        style={inView ? { animation: 'fadeInUp 0.6s ease both 0s' } : { opacity: 0 }}
      >
        <p className="font-body text-bluenavy md:text-lg text-base font-semibold tracking-widest uppercase mb-4">
          • How It Works •
        </p>
        <h2 className="font-heading text-xl md:text-4xl font-bold text-navy leading-tight md:mb-20 mb-2">
          Three Steps To Your <span className="text-bluenavy italic">Answer</span>
        </h2>
      </div>

      {/* Steps row */}
      <div className="relative flex flex-col md:flex-row">

        {/* Desktop connector lines — positioned between node centres */}
        {/* Each step is flex-1 (1/3 width). Node centres at 1/6, 3/6, 5/6. Node radius = 1.25rem (w-10/2) */}
        {[0, 1].map(i => (
          <div
            key={i}
            className="hidden md:block absolute top-5 h-0.5 bg-navy/15 overflow-hidden"
            style={{
              left:  i === 0 ? 'calc(100% / 6 + 1.25rem)' : 'calc(50% + 1.25rem)',
              right: i === 0 ? 'calc(50% + 1.25rem)'       : 'calc(100% / 6 + 1.25rem)',
            }}
          >
            <div
              className="absolute inset-y-0 left-0 bg-navy"
              style={lineStyle(i)}
            />
          </div>
        ))}

        {/* Step cards */}
        {steps.map((step, i) => (
          <Fragment key={i}>
            <div
              className="flex-1 flex flex-row md:flex-col items-start md:items-center md:text-center md:px-6"
              style={cardStyle(i)}
            >
              {/* Left col (mobile): node + vertical connector that stretches to match text height */}
              <div className={`flex flex-col items-center shrink-0 mr-4 md:mr-0 md:self-auto ${i < steps.length - 1 ? 'self-stretch' : ''}`}>
                {/* Node */}
                <div
                  className="w-10 h-10 rounded-full border-2 border-navy flex items-center justify-center font-bold text-sm relative z-10 md:mb-5"
                  style={nodeStyle(i)}
                >
                  {step.number}
                </div>

                {/* Vertical connector — mobile only, not on last step */}
                {i < steps.length - 1 && (
                  <div className="md:hidden flex-1 w-0.5 bg-navy/15 overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 bg-navy" style={vertLineStyle(i)} />
                  </div>
                )}
              </div>

              {/* Text */}
              <div className={`${i < steps.length - 1 ? 'pb-6' : ''} md:pb-0`}>
                <h3 className="text-lg font-semibold text-navy mb-2">{step.title}</h3>
                <p className="font-body text-lightnavy md:text-sm text-xs leading-relaxed max-w-xs">{step.description}</p>
              </div>
            </div>
          </Fragment>
        ))}

      </div>
    </section>
  )
}
