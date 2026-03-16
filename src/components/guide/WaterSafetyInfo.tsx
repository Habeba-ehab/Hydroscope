const bacteria = [
  {
    name: 'E. coli',
    description:
      'Some pathotypes cause severe diarrhea, mainly affecting children in low-income regions and travelers. Enterohaemorrhagic Escherichia coli (EHEC), includes the strain O157:H7 which can cause bloody diarrhea and hemolytic uremic syndrome (HUS), a life-threatening condition leading to kidney failure.',
  },
  {
    name: 'Vibrio',
    description:
      'Severe diarrheal disease leading to rapid dehydration and death if untreated. Vibrio cholerae serogroups O1 and O139 are responsible for millions of cases and tens of thousands of deaths annually. Cholera outbreaks have surged in recent years, driven by climate change and conflicts, with cases emerging in countries where it was previously not present.',
  },
  {
    name: 'Salmonella',
    description:
      'Typhoidal Salmonella cause fever, abdominal pain, and severe, life-threatening complications like intestinal perforation. It mainly affects children in endemic areas, with travel-related cases elsewhere. Non-typhoidal salmonella is a common cause of diarrhoea.',
  },
  {
    name: 'Pseudomonas',
    description:
      'It can cause infections in people with weakened immune systems. These infections include skin infections, ear infections (swimmer\'s ear), urinary tract infections, and lung infections. It is also known for causing serious hospital-acquired infections.',
  },
  {
    name: 'Enterobacter',
    description:
      'Mainly infect hospitalized or immunocompromised patients. They can cause urinary tract infections, respiratory infections, wound infections, and bloodstream infections. Some species are also associated with hospital-acquired infections.',
  },
  {
    name: 'Klebsiella',
    description:
      'Klebsiella pneumoniae is a bacterium that normally lives in the human intestines but can cause disease when it spreads to other parts of the body. It commonly causes pneumonia, urinary tract infections, and bloodstream infections. In healthcare settings it may also cause wound or surgical site infections. Some strains are antibiotic-resistant, making infections difficult to treat.',
  },
]

export default function WaterSafetyInfo() {
  return (
    <section className="px-4 md:px-10 py-12 border-t border-gray-100">

      {/* Section 1 — Introduction */}
      <div className="max-w-4xl mx-auto mb-12">
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
      <div className="max-w-4xl mx-auto">
        <h2 className="font-heading text-xl md:text-3xl font-bold text-navy leading-tight mb-5">
          2. Types of Pathogenic Bacteria in Water
        </h2>
        <p className="font-body text-lightnavy text-sm md:text-base leading-relaxed mb-8">
          Safe drinking-water, sanitation, and hygiene (WASH) are essential for preventing infectious
          diseases caused by a wide range of bacteria, viruses, protozoa, and helminths. Most of these
          pathogens are enteric — affecting the gastrointestinal tract following ingestion and causing
          illnesses ranging from mild diarrhea to life-threatening conditions, especially in children.
          WASH-related diseases contribute to over 1.4 million deaths annually, with diarrheal diseases
          being a leading cause. The benefits of investing in WASH are high, with every dollar invested
          yielding 3.9 dollars in return. Fecal waste from humans and/or animals is a key source of
          exposure of enteric pathogens. These pathogens can spread via contaminated drinking-water,
          recreational water, food and fomites, as well as from direct person-to-person contact — with
          six pathogens contributing to the greatest burden:{' '}
          <em>E. coli</em>, <em>Vibrio cholerae</em>, <em>Salmonella</em> spp.,{' '}
          <em>Pseudomonas</em>, <em>Enterobacter</em>, <em>Klebsiella</em>.
        </p>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="bg-navy text-white">
                <th className="text-left px-5 py-3 font-semibold w-36">Pathogen</th>
                <th className="text-left px-5 py-3 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              {bacteria.map((b, i) => (
                <tr
                  key={b.name}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-lightnavy/5'}
                >
                  <td className="px-5 py-4 align-top font-semibold italic text-bluenavy whitespace-nowrap">
                    {b.name}
                  </td>
                  <td className="px-5 py-4 align-top text-lightnavy leading-relaxed">
                    {b.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </section>
  )
}
