import { useInView } from '../../hooks/useInView'

export default function AboutUs() {
  const { ref, inView } = useInView()

  const anim = (name: string, delay: string) =>
    inView
      ? { animation: `${name} 0.7s ease both ${delay}` }
      : { opacity: 0 }

  return (
    <section className="-mx-4 md:-mx-10 px-4 md:px-10 md:py-14 py-6 bg-lightnavy/10" ref={ref}>
      <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">

        {/* Image */}
        <div
          className="w-full md:w-xl md:shrink-0"
          style={anim('fadeInLeft', '0s')}
        >
          <img
            src="/laboratory.jpg"
            alt="Laboratory"
            className="w-full h-72 md:h-105 object-cover rounded-br-4xl rounded-tl-4xl shadow-md"
          />
        </div>

        {/* Text */}
        <div className="w-full md:flex-1">
          <p
            className="font-body text-bluenavy md:text-lg text-base font-semibold tracking-widest uppercase mb-4"
            style={anim('fadeInRight', '0.15s')}
          >
            • About Us •
          </p>
          <h2
            className="font-heading text-xl md:text-4xl md:w-2xl font-bold text-navy leading-tight mb-5"
            style={anim('fadeInRight', '0.3s')}
          >
            Bridging The Gap Between Microbiology And AI
          </h2>
          <p
            className="font-body text-lightnavy md:w-2xl leading-relaxed text-sm md:text-lg"
            style={anim('fadeInRight', '0.45s')}
          >
            Our journey began by observing the critical challenges in modern microbiology,
            where traditional bacterial identification remains a slow, manual process prone
            to human error. We witnessed how researchers and technicians struggled with high
            workloads and the risks of misidentification. This sparked a simple yet powerful
            question: why not bridge the gap between microbiology and AI?
          </p>
        </div>

      </div>
    </section>
  )
}
