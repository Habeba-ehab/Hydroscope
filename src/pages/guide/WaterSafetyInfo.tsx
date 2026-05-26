import { useNavigate } from 'react-router-dom'
import { FlaskConical } from 'lucide-react'

const bacteria = [
  {
    shortName: 'E. coli',
    fullName: 'Escherichia coli',
    gramType: 'Negative',
    morphology: 'Rod-shaped',
    description:
      'Some pathotypes cause severe diarrhea, mainly affecting children in low-income regions and travelers. Enterohaemorrhagic Escherichia coli (EHEC), includes the strain O157:H7 which can cause bloody diarrhea and hemolytic uremic syndrome (HUS), a life-threatening condition leading to kidney failure.',
  },
  {
    shortName: 'Vibrio',
    fullName: 'Vibrio cholerae',
    gramType: 'Negative',
    morphology: 'Comma-shaped',
    description:
      'Severe diarrheal disease leading to rapid dehydration and death if untreated. Vibrio cholerae serogroups O1 and O139 are responsible for millions of cases and tens of thousands of deaths annually. Cholera outbreaks have surged in recent years, driven by climate change and conflicts, with cases emerging in countries where it was previously not present.',
  },
  {
    shortName: 'Salmonella',
    fullName: 'Salmonella',
    gramType: 'Negative',
    morphology: 'Rod-shaped',
    description:
      'Typhoidal Salmonella cause fever, abdominal pain, and severe, life-threatening complications like intestinal perforation. It mainly affects children in endemic areas, with travel-related cases elsewhere. Non-typhoidal salmonella is a common cause of diarrhoea.',
  },
  {
    shortName: 'Pseudomonas',
    fullName: 'Pseudomonas aeruginosa',
    gramType: 'Negative',
    morphology: 'Rod-shaped',
    description:
      'It can cause infections in people with weakened immune systems. These infections include skin infections, ear infections (swimmer\'s ear), urinary tract infections, and lung infections. It is also known for causing serious hospital-acquired infections.',
  },
  {
    shortName: 'Enterobacter',
    fullName: 'Enterobacter',
    gramType: 'Negative',
    morphology: 'Rod-shaped',
    description:
      'Mainly infect hospitalized or immunocompromised patients. They can cause urinary tract infections, respiratory infections, wound infections, and bloodstream infections. Some species are also associated with hospital-acquired infections.',
  },
  {
    shortName: 'Klebsiella',
    fullName: 'Klebsiella pneumoniae',
    gramType: 'Negative',
    morphology: 'Rod-shaped',
    description:
      'Klebsiella pneumoniae is a bacterium that normally lives in the human intestines but can cause disease when it spreads to other parts of the body. It commonly causes pneumonia, urinary tract infections, and bloodstream infections. In healthcare settings it may also cause wound or surgical site infections. Some strains are antibiotic-resistant, making infections difficult to treat.',
  },
]

export default function WaterSafetyInfo() {
  const navigate = useNavigate()

  return (
    <section className="px-4 md:px-10 py-12 border-t border-gray-100">

      {/* Section 1 — Introduction */}
      <div className="max-w-full mx-auto mb-12 px-4 md:px-10">
        <p className="font-body text-bluenavy text-sm font-semibold tracking-widest uppercase mb-2">
          · Background ·
        </p>
        <h2 className="font-heading text-xl md:text-3xl font-bold text-navy leading-tight mb-5">
          1. Introduction About Water Safety and Quality
        </h2>
        <p className="font-body text-lightnavy text-sm md:text-base leading-relaxed">
          Aquatic systems are significantly affected by anthropogenic activities, which compromise
          microbiological water quality through contamination from sources such as agricultural
          fertilizers, untreated wastewater, and other pollutants of human origin. The continuous
          variability in the microbiological quality of water presents significant challenges for
          ensuring the production of safe drinking water in compliance with public health regulations.
          Numerous joint initiatives are focused on researching methodologies for monitoring,
          predicting, and managing microbiological water quality. Although bacteria may be present in
          bottled waters at low concentrations they are usually harmless, and outbreaks of human
          illness associated with bottled water are infrequent compared to those linked to tap water.
          Inadequate treatment of surface water can lead to the presence of pathogenic microorganisms
          in the drinking water supply, posing serious risks to public health. Monitoring bottled water
          for specific pathogens is difficult because pathogens tend to be present intermittently and
          in very low numbers.
        </p>
      </div>

      {/* Section 2 — Types of pathogenic bacteria */}
      <div className="max-w-full mx-auto px-4 md:px-10">
        <h2 className="font-heading text-xl md:text-3xl font-bold text-navy leading-tight mb-3">
          2. Types of Pathogenic Bacteria in Water
        </h2>
        <p className="font-body text-lightnavy text-sm md:text-base leading-relaxed mb-10">
          Safe drinking-water, sanitation, and hygiene (WASH) are essential for preventing infectious
          diseases caused by a wide range of bacteria, viruses, protozoa, and helminths. Most of these
          pathogens are enteric — affecting the gastrointestinal tract following ingestion and causing
          illnesses ranging from mild diarrhea to life-threatening conditions, especially in children.
          WASH-related diseases contribute to over 1.4 million deaths annually, with diarrheal diseases
          being a leading cause. Fecal waste from humans and/or animals is a key source of
          exposure of enteric pathogens, with six pathogens contributing to the greatest burden:{' '}
          <em>E. coli</em>, <em>Vibrio cholerae</em>, <em>Salmonella</em> spp.,{' '}
          <em>Pseudomonas</em>, <em>Enterobacter</em>, <em>Klebsiella</em>.
        </p>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {bacteria.map(b => (
            <div
              key={b.fullName}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-navy/20 transition-all duration-200 overflow-hidden flex flex-col"
            >
              {/* Accent bar */}
              <div className="h-1.5 w-full bg-linear-to-r from-[#1a6c8c] to-[#2a9cc0] shrink-0" />

              <div className="flex flex-col flex-1 p-5">
                {/* Name */}
                <div className="mb-3">
                  <h3 className="font-heading text-lg font-bold text-navy leading-tight">
                    {b.shortName}
                  </h3>
                  <p className="font-body text-xs italic text-lightnavy mt-0.5">
                    {b.fullName}
                  </p>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="font-body text-[10px] font-semibold px-2.5 py-1 rounded-full border bg-[#1a6c8c]/8 text-[#1a6c8c] border-[#1a6c8c]/20">
                    Gram {b.gramType}
                  </span>
                  <span className="font-body text-[10px] font-semibold px-2.5 py-1 rounded-full border bg-gray-50 text-gray-500 border-gray-200">
                    {b.morphology}
                  </span>
                </div>

                {/* Description */}
                <p className="font-body text-xs text-lightnavy leading-relaxed flex-1 mb-5">
                  {b.description}
                </p>

                {/* CTA */}
                <button
                  onClick={() => navigate(`/treatment?bacteria=${encodeURIComponent(b.fullName)}`)}
                  className="w-full flex items-center justify-center gap-2 bg-[#1a6c8c] hover:bg-[#155a75] text-white rounded-xl px-4 py-2.5 font-body text-xs font-semibold transition-colors cursor-pointer"
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  View Treatment Protocol
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  )
}
