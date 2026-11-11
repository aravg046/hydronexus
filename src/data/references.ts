// Numbers here must match the [n] citations used in src/App.tsx.
export type Ref = { n: number; text: string; url?: string; note: string }
export const references: Ref[] = [
  { n: 1, text: "Hartgerink, J. D., Beniash, E. and Stupp, S. I. Self-assembly and mineralization of peptide-amphiphile nanofibers. Science, 2001, 294, 1684-1688.", url: "https://doi.org/10.1126/science.1063187", note: "Designed PA nanofibre scaffold resembling the extracellular matrix; assembly in that study was pH-triggered." },
  { n: 2, text: "Effects of salt concentrations on the structural transitions of peptide-amphiphile solution. MRS Online Proceedings Library, Cambridge University Press, 2014.", url: "https://doi.org/10.1557/opl.2014.40", note: "In a PA solution, a higher salt concentration sped up the structural transition." },
  { n: 3, text: "Sepahvandi, A., Johnson, J., Arasan, A., Cataldo, R. and Ghoreishian, S. M. Hydrogels in simulated microgravity: thermodynamics at play. Gels, 2025, 11(5), 342.", url: "https://doi.org/10.3390/gels11050342", note: "Review of hydrogels in simulated (ground-based) microgravity." },
  { n: 4, text: "Rugg, D. Launching From the Classroom to Careers: Students Gain Valuable Skills Through Research on the Space Station. ISS National Laboratory, 7 November 2024.", url: "https://issnationallab.org/?p=44891", note: "Describes MixStix tubes with three clamped compartments used in student experiments." },
]
