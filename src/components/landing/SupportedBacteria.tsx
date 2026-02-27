import { useInView } from '../../hooks/useInView'

const bacteria = [
  'Escherichia coli',
  'Salmonella spp.',
  'Klebsiella spp.',
  'Vibrio spp.',
  'Enterobacter spp.',
  'Pseudomonas aeruginosa',
]

export default function SupportedBacteria() {
  const { ref, inView } = useInView(0.2)

  return (
    <section
      ref={ref}
      className="-mx-4 md:-mx-10 px-4 md:px-10 py-20 mt-10 bg-lightnavy/10"
    >
      {/* Header */}
      <div
        className="text-center mb-16"
        style={inView ? { animation: 'fadeInUp 0.6s ease both 0s' } : { opacity: 0 }}
      >
        <h2 className="font-heading text-xl md:text-4xl font-bold text-navy leading-tight mb-4">
          Bacteria We{' '}
          <em className="italic text-bluenavy">Detect</em>
        </h2>
        <p className="font-body text-lightnavy text-sm md:text-base max-w-md mx-auto leading-relaxed">
          Six gram-negative water bacteria identified instantly from your microscope images.
        </p>
      </div>

      {/* Pills */}
      <div className="grid grid-cols-2 items-center md:flex md:flex-wrap justify-center gap-5 md:gap-10 max-w-2xl mx-auto">
        {bacteria.map((name, i) => {
          const fadeDelay = 0.15 + i * 0.1
          const floatDelay = fadeDelay + 0.5 + i * 0.45
          return (
            <span
              key={name}
              className="font-body text-xs md:text-sm font-medium text-white bg-navy border border-gray-200 rounded-full px-3 py-2 md:px-6 md:py-3 shadow-md text-center"
              style={
                inView
                  ? { animation: `fadeInUp 0.5s ease both ${fadeDelay}s, float 3s ease-in-out infinite ${floatDelay}s` }
                  : { opacity: 0 }
              }
            >
              {name}
            </span>
          )
        })}
      </div>
    </section>
  )
}
