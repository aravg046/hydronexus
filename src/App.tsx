import { useEffect } from "react"
import HydroSimulation from "./components/HydroSimulation"
import NanofibreField from "./components/NanofibreField"
import PASelfAssembly from "./components/PASelfAssembly"
import { team } from "./data/team"
import { references } from "./data/references"

/* ---------- small layout helpers (edit text freely; structure lives in styles.css) ---------- */
const Section = (p: { id: string; tone: "dark" | "light"; variant?: string; children: any }) => (
  <section id={p.id} className={"sec " + p.tone + (p.variant ? " " + p.variant : "")}>
    <div className="inner">{p.children}</div>
  </section>
)
const Head = (p: { label: string; title: string; intro?: string; badge?: string }) => (
  <header className="head reveal">
    <div className="label">{p.label}</div>
    <h2>{p.title}</h2>
    {p.intro ? <p className="lead">{p.intro}</p> : null}
    {p.badge ? <span className="badge">{p.badge}</span> : null}
  </header>
)
const Col = (p: { tag?: string; title: string; children: any }) => (
  <div className="col reveal">
    {p.tag ? <div className="label">{p.tag}</div> : null}
    <h3>{p.title}</h3>
    <p>{p.children}</p>
  </div>
)
const Card = (p: { tag?: string; title: string; children: any; inverse?: boolean }) => (
  <div className={"card reveal" + (p.inverse ? " inverse" : "")}>
    {p.tag ? <div className="label">{p.tag}</div> : null}
    <h3>{p.title}</h3>
    <p>{p.children}</p>
  </div>
)
const Tube = (p: { single: boolean }) => (
  <div className="tube">
    <div className="ch ch1"><span>CH 1</span></div><i />
    <div className={"ch ch2 " + (p.single ? "strong" : "soft")}><span>CH 2</span></div><i />
    <div className={"ch ch3 " + (p.single ? "faint" : "strong")}><span>CH 3</span></div>
  </div>
)

const nav: [string, string][] = [["Background", "background"], ["Hypothesis", "hypothesis"], ["Design", "design"], ["MixStix", "mixstix"], ["Simulation", "simulation"], ["Method", "method"], ["Applications", "applications"], ["References", "references"], ["Team", "team"]]

const conditions = [
  { n: 1, g: "ISS MICROGRAVITY  \u00b7  \u2248 0 g", mode: "Single-stage triggering", arm: "Arm A \u00b7 control", single: true, tubes: "1 flight tube + 1 flight backup" },
  { n: 2, g: "ISS MICROGRAVITY  \u00b7  \u2248 0 g", mode: "Sequential triggering", arm: "Arm B \u00b7 core arm", single: false, tubes: "1 flight tube + 1 flight backup" },
  { n: 3, g: "EARTH GRAVITY  \u00b7  \u2193 1 g", mode: "Single-stage triggering", arm: "Arm A \u00b7 ground control", single: true, tubes: "1 ground-control MixStix + 3 lab replicates" },
  { n: 4, g: "EARTH GRAVITY  \u00b7  \u2193 1 g", mode: "Sequential triggering", arm: "Arm B \u00b7 ground control", single: false, tubes: "1 ground-control MixStix + 3 lab replicates" },
]

const predicted: [string, string, string, string][] = [
  ["Sedimentation", "May settle dense clusters vertically (high oligomer settling and bottom compaction).", "Greatly reduced (about 10\u207b\u2076 g ambient).", "Uniform vertical and radial density."],
  ["Buoyancy convection", "Density-driven fluid currents can occur and can disrupt fibre alignment.", "Minimised; transport mainly by diffusion.", "Undisturbed, linear fibril growth."],
  ["Ionic transport", "Convection can dominate; convective mixing and local trapping.", "Closer to diffusion-controlled (Fickian) transport.", "Controlled multi-layer crosslinking."],
  ["Nanofibre architecture", "May vary across the sample; random aggregated clusters possible.", "May be more uniform; could develop a different spatial distribution (an ordered, isotropic mesh).", "Tailored pore-size distribution."],
  ["Network porosity", "May vary with local gelation conditions.", "May show more consistent, or simply different, pore architecture.", "Tailored pore dimensions."],
  ["Mechanical stiffness", "May vary regionally (variable bulk shear modulus G\u2032).", "May change if network architecture changes (consistent isotropic elasticity).", "Tunable stiffness and yield stress."],
]

const groups: [string, "students" | "mentors" | "leadership", string][] = [["Student researchers", "students", "student"], ["Faculty mentors", "mentors", "faculty"], ["School leadership", "leadership", "faculty"]]

export default function App() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".reveal"))
    if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target) } }), { threshold: 0.15 })
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [])

  return (
    <>
      <nav className="nav">
        <a className="logo" href="#home"><span className="dot" />HydroNexus</a>
        <div className="links">{nav.map(([t, id]) => <a key={id} href={"#" + id}>{t}</a>)}</div>
      </nav>

      {/* ---------------- HERO ---------------- */}
      <section id="home" className="hero">
        <div className="hero-visual"><NanofibreField /></div>
        <div className="hero-fade" />
        <div className="inner hero-inner">
          <div className="hero-text">
            <div className="label">Team HydroNexus  &middot;  Voyager MixStix Student Research Program</div>
            <h1>Sequentially Triggered Peptide Hydrogels</h1>
            <p className="lead">How does the timing of the ionic trigger shape a self-assembling nanofibre network, and does gravity change that effect? We plan to test it with a three-chamber MixStix tube on the International Space Station, next to identical ground controls.</p>
            <span className="badge">Proposal stage  &middot;  no results yet</span>
            <p className="small muted">Flight is subject to the programme&rsquo;s engineering and safety approval. The fibre graphic is a conceptual illustration, not microscopy.</p>
            <div className="buttons"><a className="btn primary" href="#design">Explore the experiment</a><a className="btn ghost" href="#simulation">Open the 3D simulation</a></div>
          </div>
          <div className="facts">
            {[["4", "experimental conditions: ISS or Earth, single-stage or sequential"], ["3", "chambers in each MixStix tube"], ["2", "crew activations per tube"], ["0", "flight results so far. This site shows a plan, not data."]].map(([n, t]) => (
              <div className="fact reveal" key={n}><div className="stat">{n}</div><p className="small muted">{t}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- BACKGROUND ---------------- */}
      <Section id="background" tone="light" variant="g1">
        <Head label="Research background" title="Self-assembling peptides, switched on by salt" intro="Established science first: what peptide amphiphiles are, how salt triggers gelation, and why gravity may matter." badge="Established background" />
        <div className="panel reveal"><div className="label">From molecule to network  &middot;  established background, simplified</div><div className="schematic"><PASelfAssembly /></div></div>
        <div className="grid">
          <Col tag="01" title="Dissolved">A peptide amphiphile (PA) has a hydrophobic alkyl tail attached to a hydrophilic peptide segment with charged residues. Repulsion between the charges keeps it dissolved.</Col>
          <Col tag="02" title="Screened">Counterions, usually monovalent or divalent salts such as calcium chloride, screen those charges. In a PA solution, a higher salt concentration sped up the structural transition [2].</Col>
          <Col tag="03" title="Assembled">Hydrophobic interaction and hydrogen bonding pull the molecules into long, thin nanofibres.</Col>
          <Col tag="04" title="Networked">The nanofibres tangle into a three-dimensional hydrogel. Designed PAs can form nanofibre scaffolds that resemble the extracellular matrix [1].</Col>
        </div>
        <div className="grid wide">
          <Col title="Why control matters">Gelation speed and network architecture matter for cell encapsulation, scaffolds for stem-cell differentiation and controlled drug delivery.</Col>
          <Col title="The kinetics challenge">Gelation speed depends on conditions such as salt concentration [2]. We expect that very fast gelation can leave a gel inhomogeneous; that is a working premise of this proposal, not an established result.</Col>
          <Col title="Microgravity">On the ISS (about 10&#8315;&#8310; g ambient) sedimentation and buoyancy-driven convection are greatly reduced and transport is mostly diffusion-controlled. A review of hydrogels in simulated microgravity discusses how changes in fluid dynamics, mass transport and mechanical forces can influence network formation and crosslinking [3].</Col>
        </div>
        <p className="muted narrow reveal">Why this question: peptide self-assembly, salt-triggered gelation and microgravity effects on related biomaterials have each been studied. Our new variable is the sequence of gel formation. As far as we know, this combination has not been reported.</p>
      </Section>

      {/* ---------------- PROBLEM ---------------- */}
      <Section id="problem" tone="dark" variant="g2">
        <Head label="Research problem" title="Why gravity may disturb gel formation" intro="On Earth, gravity changes how a forming material distributes itself. Three mechanisms may get in the way of uniform assembly at 1 g." badge="Background and our working explanation" />
        <div className="grid wide">
          {[["Sedimentation", "Dense assemblies, ionic clusters and aggregates settle along the gravity vector before cross-linking stabilises.", "Can set up vertical density gradients and regional structural compaction."],
            ["Buoyancy-driven convection", "Local concentration changes and heat release (for example from exothermic ion binding) cause density differences that drive currents and eddies.", "Can disrupt ordered assembly and fragile nanofibre alignment, and cause chaotic flow shearing."],
            ["Regional ionic heterogeneity", "Convective flow and rapid local gelation give unequal ion exposure. Adding all the salt at once can cause fast surface gelation that forms a diffusion barrier and stops salt reaching the core.", "Can start premature local gelation in high-ion zones while neighbouring regions stay under-crosslinked."]].map(([t, e, i]) => (
            <div className="col reveal" key={t}><h3>{t}</h3><div className="label">On Earth (1 g)</div><p>{e}</p><div className="label">Possible impact</div><p>{i}</p></div>
          ))}
        </div>
        <blockquote className="pull reveal"><div className="label">Our working explanation  &middot;  hypothesis, to be tested</div>Ordinary mixing causes fast local assembly near the point where fluid is injected. That can build a physical barrier that slows further ion transport, so uniform or multi-layered nanofibre networks are harder to get. Delivering the salt in two controlled stages is one way to separate the moment assembly starts from the moment it finishes.</blockquote>
      </Section>

      {/* ---------------- HYPOTHESIS ---------------- */}
      <Section id="hypothesis" tone="light" variant="g3">
        <Head label="Our hypothesis" title="What we expect sequential triggering to change" intro="Research question: does sequential ionic triggering produce a more uniform and controllable peptide-amphiphile hydrogel network in microgravity than conventional single-stage gelation?" badge="Our research hypothesis" />
        <div className="grid wide">
          <Card tag={"H0  \u00b7  NULL HYPOTHESIS"} title="No difference">There is no difference in gel structure (fibre diameter, porosity, regional uniformity, aggregate count) between single-stage and two-stage gelation, and microgravity does not change any such difference.</Card>
          <Card tag={"H1  \u00b7  ALTERNATIVE HYPOTHESIS"} title="A measurable difference">Two-stage ionic triggering produces a measurably different, and possibly more uniform, peptide-amphiphile network than single-stage gelation, and the size of this difference is not the same on the ISS as on Earth.</Card>
          <Card inverse tag={"CENTRAL HYPOTHESIS  \u00b7  TEAM HYDRONEXUS"} title="Timing changes the structure">Controlling the timing and sequence of ionic triggering in low-Earth orbit microgravity will change self-assembly kinetics and the spatial organisation of the nanofibres, and may give higher regional uniformity, more consistent pore architecture and fewer aggregates than single-stage gelation or 1 g ground controls.</Card>
        </div>
        <div className="grid versus">
          <Card tag={"SINGLE-STAGE  \u00b7  CONTROL"} title="All the salt at once">The full salt dose meets the PA solution at Activation 1. Chamber 3 holds only water, a blank that keeps volume and crew steps identical.</Card>
          <Card inverse tag={"SEQUENTIAL  \u00b7  CORE ARM"} title="A first dose, then the rest">A smaller first dose (25% of the salt, tested range 20 to 50%) starts assembly. After an incubation, the remaining 75% arrives at Activation 2.</Card>
        </div>
        <div className="tint reveal"><div className="label">A stronger version  &middot;  a prediction to test, not an expected result</div><p>Multi-stage triggering in microgravity may let a preliminary nanofibre template align before secondary crosslinking, giving a layered, uniform nanofibre density and a controllable pore network that may not be reachable under 1 g. We do not assume the gel will be stronger or more ordered; the experiment has to show that.</p></div>
      </Section>

      {/* ---------------- DESIGN ---------------- */}
      <Section id="design" tone="dark" variant="g4">
        <Head label="Experimental design" title="Four conditions, one variable at a time" intro="The design crosses the timing of salt delivery (single-stage or sequential) with gravity (Earth or ISS). Everything else is kept identical between arms." badge="Proposed methodology" />
        <div className="grid matrix">
          {conditions.map((c) => (
            <div className="cell reveal" key={c.n}>
              <div className="row between"><div className="stat cyan">{c.n}</div><div className="label muted">{c.g}</div></div>
              <Tube single={c.single} />
              <h3>{c.mode}</h3><p className="small muted">{c.arm}</p>
              <p className="small">{c.single ? "Chamber 2: full salt dose (100%). Chamber 3: water blank, no salt." : "Chamber 2: stage-1 dose (25%). Chamber 3: stage-2 dose (remaining 75%)."}</p>
              <div className="ruled"><div className="label cyan">Tubes</div><p className="small muted">{c.tubes}</p></div>
            </div>
          ))}
        </div>
        <div className="grid wide">
          <Card title="Tube count (to be confirmed)">The design needs six MixStix tubes: two flight, two flight backup and two ground control. The standard kit in the programme circular contains three. We will confirm with Voyager and the Rakia Mission whether extra units can be flown. If only one flight tube is possible, the fallback is to fly Arm B alone and run both arms on the ground.</Card>
          <Card title="Held constant between arms">PA batch, PA concentration, total salt, final volume, tube geometry, temperature profile, mixing motion, handling and maturation time. Both arms need exactly two crew actions, so crew workload is the same.</Card>
        </div>
      </Section>

      {/* ---------------- MIXSTIX ---------------- */}
      <Section id="mixstix" tone="light" variant="g1">
        <Head label="MixStix mechanism" title="Three chambers, two clamps, two crew actions" intro="The MixStix tube is a flexible silicone tube divided into compartments by clamps. It keeps fluids apart until the crew releases a clamp. Doses and times shown are starting values that will be fixed by Earth trials." badge="Proposed methodology" />
        {[{ t: "Arm A  \u00b7  single-stage (control)", single: true, c2: ["Full salt dose", "100% of the total"], c3: ["Water blank", "adds no salt"] }, { t: "Arm B  \u00b7  sequential (core arm)", single: false, c2: ["Stage-1 dose", "25% of the total (tested 20 to 50%)"], c3: ["Stage-2 dose", "the remaining 75%"] }].map((a) => (
          <div className="panel reveal" key={a.t}>
            <h3>{a.t}</h3>
            <div className="tube big">
              <div className="ch ch1"><span>CHAMBER 1  &middot;  4.0 mL</span><b>PA solution</b><em>about 1% (w/v) to start</em></div><i />
              <div className={"ch ch2 " + (a.single ? "strong" : "soft")}><span>CHAMBER 2  &middot;  2.0 mL</span><b>{a.c2[0]}</b><em>{a.c2[1]}</em></div><i />
              <div className={"ch ch3 " + (a.single ? "faint" : "strong")}><span>CHAMBER 3  &middot;  2.0 mL</span><b>{a.c3[0]}</b><em>{a.c3[1]}</em></div>
            </div>
            <p className="small muted">Result after both steps: same PA, same total salt, same 8.0 mL.</p>
          </div>
        ))}
        <div className="grid timeline">
          <Col tag="STEP 1" title="Activation 1">The crew releases Clamp 1 and mixes Chamber 1 with Chamber 2 using one standard gentle motion. Arm A receives all the salt. Arm B receives the stage-1 dose.</Col>
          <Col tag="STEP 2" title="Incubation">About 30 minutes (tested range 15 to 60). Tubes are held still. Arm B begins to assemble into partial nanofibres while Arm A completes gelation.</Col>
          <Col tag="STEP 3" title="Activation 2">The crew releases Clamp 2 and mixes with the same motion. Arm A receives only water. Arm B receives the remaining salt.</Col>
          <Col tag="STEP 4" title="Maturation and return">Tubes are held at a stable temperature until return to Earth. Ground controls follow the same steps at the same elapsed times, using the ISS temperature log.</Col>
        </div>
      </Section>

      {/* ---------------- SIMULATION ---------------- */}
      <Section id="simulation" tone="dark" variant="g5 wideinner">
        <Head label="Interactive 3D simulation" title="Watch the two triggering methods side by side" intro="A staged, conceptual animation of the MixStix tube. Switch between single-stage and sequential triggering and between Earth gravity and microgravity, or compare all four conditions at once. Drag to rotate, scroll or pinch to zoom." badge={"Conceptual  \u00b7  not molecular dynamics  \u00b7  not experimental data"} />
        <div className="label cyan">Drag to rotate  &middot;  scroll or pinch to zoom  &middot;  switch triggering and gravity, or compare all four conditions</div>
        <div className="sim reveal"><HydroSimulation /></div>
        <div className="grid wide">
          <Col title="What the animation shows">When each clamp is released, how much salt arrives at each activation, sedimentation and convection currents at 1 g, and diffusion-dominated movement in microgravity. About 30 minutes of incubation is compressed into seconds.</Col>
          <Col title="What it does not show">Real fibre structure, measured data or predicted outcomes. The particle rules are simple and illustrative. What the real gels look like is exactly what the experiment is designed to find out.</Col>
        </div>
      </Section>

      {/* ---------------- VIDEO (hidden until a video exists) ---------------- */}
      {/* To add the project video: put the file in /public/video/ or use an embed, then set the iframe src below (currently the YouTube embed https://www.youtube.com/embed/2mL9SMTMmEY); change `true` to `false` to hide the section. */}
      {true ? (
        <Section id="video" tone="dark">
          <Head label="Project demonstration" title="The HydroNexus project video" />
          <div className="video"><iframe title="HydroNexus project video" src="https://www.youtube.com/embed/2mL9SMTMmEY" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>
        </Section>
      ) : null}

      {/* ---------------- METHOD ---------------- */}
      <Section id="method" tone="light" variant="g3">
        <Head label="Research methodology" title="Procedure, variables and observations" intro="Concentrations, dose fractions and times are starting values that will be fixed by Earth trials before the flight documentation is submitted." badge="Proposed methodology" />
        <div className="grid">
          <Col tag="MATERIAL" title="Peptide amphiphile">Custom-synthesised PA with a C16 alkyl tail and a glutamate-rich head group (C16-V3A3E3-type design; final sequence fixed after Earth trials). At least 95% pure by HPLC/MS, stored as lyophilised powder.</Col>
          <Col tag="MATERIAL" title="Ionic trigger">Sterile calcium chloride solution. NaCl or another salt is considered only if Earth trials show better control.</Col>
          <Col tag="MATERIAL" title="Solvent">Ultrapure water or low-ionic-strength buffer, pH about 7.4, degassed and sterile-filtered (0.22 &micro;m) so stray ions and bubbles are avoided.</Col>
          <Col tag="MATERIAL" title="MixStix kit">Flexible silicone tubes (up to 10 cm&sup3;) with clamps and stoppers, in double containment.</Col>
        </div>
        <div className="grid wide">
          <Col tag="VARIABLES" title="Independent">Timing of salt delivery (single-stage or two-stage) and gravity (Earth or ISS).</Col>
          <Col tag="VARIABLES" title="Held constant">PA batch, PA concentration, total salt, final volume, tube geometry, temperature profile, mixing motion, handling and maturation time.</Col>
          <Col tag="VARIABLES" title="Measured">Fibre diameter and distribution, network density and porosity, regional uniformity, aggregates and defects, and stiffness if enough gel remains.</Col>
        </div>
        <h3 className="sub reveal">Procedure</h3>
        <div className="grid timeline">
          <Col tag="STEP 1" title="Ground development">After selection, before documentation. Find the PA gelation threshold, the stage-1 fraction and the incubation time. Test clamps, leaks, bubble removal and the standard mixing motion.</Col>
          <Col tag={"STEP 2  \u00b7  PLANNED JAN TO MAR 2027"} title="Flight documentation">Submit the protocol, reagent safety data and crew step sheet with support from the Rakia Mission.</Col>
          <Col tag={"STEP 3  \u00b7  PLANNED JULY 2027"} title="Preparation and loading">Dissolve fresh solutions, sterile-filter, degas and load the tubes. Remove air, seal with stoppers, apply double containment and refrigerate at about +4 &deg;C.</Col>
          <Col tag={"STEP 4  \u00b7  PLANNED AUG 2027"} title="Launch and stowage">Cold or ambient stowage as approved by the payload provider. A temperature logger travels with the tubes.</Col>
          <Col tag="STEPS 5 TO 8" title="On orbit">Activation 1, incubation, activation 2 and maturation. See the MixStix mechanism above.</Col>
          <Col tag={"STEP 9  \u00b7  PLANNED SEP TO OCT 2027"} title="Post-flight analysis">Inspect, photograph and analyse flight and ground samples side by side.</Col>
        </div>
        <h3 className="sub reveal">Post-flight measurements</h3>
        <div className="grid">
          <Col title="Gel integrity">Macro photographs on arrival, before handling: cracks, bubbles, phase separation, leakage.</Col>
          <Col title="Nanofibre diameter and distribution">Cryo-TEM or Cryo-SEM, at least 100 fibres per sample from at least three regions (both ends and the middle).</Col>
          <Col title="Network density and porosity">Cryo-SEM image analysis; micro-CT or confocal imaging with a fluorescent dye if a facility is available.</Col>
          <Col title="Regional uniformity">Compare the measurements across regions and report the coefficient of variation.</Col>
          <Col title="Aggregates and defects">Count dense clusters or irregular regions per field of view.</Col>
          <Col title="Mechanical properties">Oscillatory rheology (storage modulus G&prime;) or micro-indentation, if enough gel remains.</Col>
        </div>
        <Card title="Controls and data analysis">Each flight arm is a single tube (with an unopened backup), so flight results are only indicative. Three Earth replicates per arm give a baseline range, and a flight difference is reported as meaningful only if it falls outside that Earth range. Samples are coded and analysed without knowing which arm or gravity condition they came from. Known confounds are the crew&rsquo;s mixing motion and the return journey; both are standardised and tested on the ground, and a ground tube is given matched handling.</Card>
      </Section>

      {/* ---------------- EXPECTED ---------------- */}
      <Section id="expected" tone="dark" variant="g2">
        <Head label="Expected observations" title="What we will look for, and what would count" intro="These are predictions to test, not results. They describe the structure we will measure in each of the four conditions." badge={"Predictions  \u00b7  not results"} />
        <div className="grid">
          <Col tag="FIBRE STRUCTURE" title="Fibre size and spread">Fibre diameter and how it varies along the tube. Sequential triggering in microgravity may give a different, possibly more uniform, spatial distribution of nanofibres.</Col>
          <Col tag="POROSITY" title="Pore architecture">Pore size, void fraction and fibre density. Pore architecture may be more consistent, or simply different, in microgravity.</Col>
          <Col tag="UNIFORMITY" title="Regional evenness">Coefficient of variation across both ends and the middle. At 1 g, sedimentation may set up vertical density gradients.</Col>
          <Col tag="AGGREGATION" title="Clusters and defects">Dense clusters or irregular regions per field of view. Fewer aggregates with sequential triggering is a prediction to test.</Col>
        </div>
        <h3 className="sub reveal">Predicted comparison  &middot;  every entry is a prediction to test</h3>
        <div className="grid wide">
          {predicted.map(([t, e, i, s]) => (
            <div className="card reveal dark-card" key={t}><h3>{t}</h3><div className="label muted">Earth 1 g</div><p className="small">{e}</p><div className="label cyan">ISS microgravity (predicted)</div><p className="small">{i}</p><div className="label cyan">Expected benefit of sequential triggering</div><p className="small">{s}</p></div>
          ))}
        </div>
        <div className="tint dark-tint reveal"><div className="label cyan">Actual experimental results</div><h3>None yet.</h3><p>The flight is planned for 2027 and post-flight analysis for September to October 2027. When real data exist they will appear here, clearly separated from the predictions above. The proposal also contains illustrative schematic graphs; they are not measurements, so they are not reproduced on this site.</p></div>
      </Section>

      {/* ---------------- APPLICATIONS ---------------- */}
      <Section id="applications" tone="light" variant="g1">
        <Head label="Applications and future research" title="Possibilities, not outcomes" intro="These are long-term possibilities, not direct medical outcomes of this experiment. The experiment measures gel structure only. It does not test cells, drugs or medical performance." badge={"Potential applications  \u00b7  long-term"} />
        <div className="grid two">
          <div className="card inverse reveal"><h3>For future space exploration</h3>
            {[["In-space biomaterial manufacturing", "Reduced-gravity methods for making custom biological matrices and, in the longer term, baseline methods for scaffolds and wound dressings on crewed missions."], ["Tissue-scaffold engineering for space medicine", "Baseline data on transport and assembly in weightlessness, and a better understanding of how to make consistent materials when gravity-driven processes are absent."], ["Wound care in space", "A more predictable gel structure could, in the long term, make hydrogel dressings more reliable."], ["Less Earth resupply", "Peptide powders are light and storable, and gels can be made on demand from separate liquids."]].map(([t, b]) => <div className="item" key={t}><b>{t}</b><p className="small">{b}</p></div>)}</div>
          <div className="card reveal"><h3>For life on Earth</h3>
            {[["Regenerative medicine", "Insights from diffusion-controlled gelation may help reduce structural aggregates and make hydrogel materials more consistent."], ["Precision scaffold engineering", "Insight into controlling fibre architecture, porosity and mechanical properties, with the long-term aim of fewer structural defects."], ["Controlled drug delivery", "Tuning hydrogel mesh size and porosity could inform the design of delivery vectors with controlled release rates."], ["Artificial tissue research", "Biomaterial manufacturing more broadly."]].map(([t, b]) => <div className="item" key={t}><b>{t}</b><p className="small">{b}</p></div>)}</div>
        </div>
        <Card title="Next steps">Earth trials to fix the PA gelation threshold, stage-1 fraction and incubation time. Confirm with Voyager and the Rakia Mission whether six MixStix tubes can be flown. Submit flight documentation (planned January to March 2027). Analyse flight and ground samples side by side after return (planned September to October 2027).</Card>
      </Section>

      {/* ---------------- REFERENCES ---------------- */}
      <Section id="references" tone="dark" variant="g4">
        <Head label="Research references" title="Key sources" intro="A short list of the key sources behind the background. Numbers match the citations used on this page." />
        <h3 className="sub reveal">Literature review: what the sources support</h3>
        <div className="grid wide">
          <Card tag="SOURCE [1]" title="PA nanofibres can form matrix-like scaffolds">A designed peptide amphiphile can self-assemble into a nanofibre scaffold reminiscent of the extracellular matrix. In that study assembly was triggered by pH.</Card>
          <Card tag="SOURCE [2]" title="Salt changes how fast PAs assemble">In a peptide-amphiphile solution, a higher salt concentration sped up the structural transition, which makes salt a natural trigger to control.</Card>
          <Card tag="SOURCE [3]" title="Gravity-driven transport matters">A 2025 review of hydrogels in simulated (ground-based) microgravity discusses how changes in fluid dynamics, mass transport and mechanical forces can influence network formation and crosslinking.</Card>
          <Card tag="SOURCE [4]" title="A platform for student experiments">MixStix is a flexible tube with three clamped compartments used for student experiments on the space station.</Card>
          <Card tag="OUR POSITION" title="The gap our proposal addresses">As far as we know, sequential salt triggering of a peptide amphiphile combined with microgravity has not been reported. This is the team&rsquo;s statement of what it knows from the sources above, not a systematic review.</Card>
        </div>
        <div className="reflist">
          {references.map((r) => (
            <div className="ref reveal" key={r.n}><div className="label cyan">[{r.n}]</div><div><p>{r.text}</p>{r.url ? <a href={r.url} target="_blank" rel="noreferrer">{r.url}</a> : null}</div></div>
          ))}
        </div>
      </Section>

      {/* ---------------- TEAM ---------------- */}
      <Section id="team" tone="dark" variant="g6">
        <Head label="Team" title="Team HydroNexus" intro="Student researchers from City Montessori School Aliganj I, taking part in the Voyager MixStix Student Research Program with the Rakia Mission." />
        {groups.map(([title, key, kind]) => {
          const people = team.filter((p) => p.category === key)
          if (!people.length) return null
          return (
            <div key={key} className={"team-group " + kind}>
              <div className="label cyan">{title}</div>
              {key === "students" ? <p className="small muted">Both Co-Team Leads share equal leadership of the project.</p> : null}
              <div className="grid people">
                {people.map((p) => (
                  <div className="member reveal" key={p.name}>
                    <div className="avatar">{p.photo ? <img src={p.photo} alt={p.name} /> : p.initials}</div>
                    <div><h3>{p.name}</h3><ul>{p.designations.map((d) => <li key={d}>{d}</li>)}</ul></div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        <div className="card reveal dark-card"><div className="label cyan">Acknowledgements</div><p className="muted">We thank our Teacher-in-Charge, Mukta Ma&rsquo;am, our ISC In-Charge, Sunita Ma&rsquo;am, our Principal, Shivani Ma&rsquo;am, and City Montessori School, Aliganj for their guidance and support, and the Voyager MixStix Student Research Program with the Rakia Mission for the opportunity to propose this experiment.</p></div>
      </Section>

      <footer className="footer">
        <div className="inner">
          <strong>HydroNexus</strong>
          <p className="small muted">Sequentially Triggered Peptide Hydrogels  &middot;  Team HydroNexus  &middot;  City Montessori School Aliganj I  &middot;  Voyager MixStix Student Research Program</p>
          <p className="small muted narrow">A proposal-stage research website. It does not claim ISS approval, experimental results, medical efficacy or tissue-engineering performance. Flight is subject to the programme&rsquo;s engineering and safety approval.</p>
          <p className="small muted">&copy; 2026 Team HydroNexus</p>
        </div>
      </footer>
    </>
  )
}
