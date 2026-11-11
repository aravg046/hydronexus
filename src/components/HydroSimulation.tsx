import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { RenderTarget } from "../shims/framer"
import * as THREE from "three"

/*
  HydroNexus MixStix simulation (conceptual).
  Sections in this file:
    1. SIMULATION  - pure particle logic, no rendering (edit here to change the behaviour)
    2. SCENE       - Three.js model of the three-chamber MixStix tube
    3. UI          - captions, labels and controls
  This is an educational animation of the proposed method. It is not molecular dynamics and not experimental data.
*/

/* ---------------------------------- 1. SIMULATION ---------------------------------- */
const T_ACT1 = 4
const T_ACT2 = 18
const T_END = 36
const R = 0.5
const XLO = -2
const XHI = 2
const RC = 0.4
const C0 = 4
const K_A = 1.0

function mulberry32(a: number) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function gauss(r: () => number) {
  let u = 0
  while (u === 0) u = r()
  const v = r()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}
function disk(r: () => number, rad: number): number[] {
  for (;;) {
    const y = (r() * 2 - 1) * rad
    const z = (r() * 2 - 1) * rad
    if (y * y + z * z <= rad * rad) return [y, z]
  }
}
function region(x: number, a1: boolean, a2: boolean) {
  return a2 ? 0 : a1 ? (x < 1 ? 0 : 2) : x < 0 ? 0 : x < 1 ? 1 : 2
}
function sm(x: number) {
  x = Math.max(0, Math.min(1, x))
  return x * x * (3 - 2 * x)
}

type Mode = "single" | "sequential"
type Gravity = "micro" | "earth"
type View = "focus" | "compare"

function createSim(mode: Mode, gravity: Gravity, nPA = 260, nIon = 90) {
  const r = mulberry32(12345)
  const r2 = mulberry32(777)
  const s: any = {
    mode, gravity, nPA, nIon, rng: mulberry32(99),
    px: new Float32Array(nPA), py: new Float32Array(nPA), pz: new Float32Array(nPA),
    pa: new Float32Array(nPA), pl: new Uint8Array(nPA),
    ix: new Float32Array(nIon), iy: new Float32Array(nIon), iz: new Float32Array(nIon),
    iorigin: new Uint8Array(nIon), regP: new Int8Array(nPA), regI: new Int8Array(nIon),
    locA: new Float32Array(nIon), locI: new Float32Array(nPA), cnt: new Float32Array(nIon),
  }
  for (let i = 0; i < nPA; i++) {
    const d = disk(r, R * 0.9)
    s.px[i] = XLO + r() * 2
    s.py[i] = d[0]
    s.pz[i] = d[1]
  }
  const n2 = mode === "single" ? nIon : Math.round(nIon * 0.25)
  for (let j = 0; j < nIon; j++) {
    const d = disk(r2, R * 0.9)
    const c2 = j < n2
    s.iorigin[j] = c2 ? 1 : 2
    s.ix[j] = c2 ? r2() : 1 + r2()
    s.iy[j] = d[0]
    s.iz[j] = d[1]
  }
  return s
}

function stepSim(s: any, t: number, dt: number) {
  const a1 = t >= T_ACT1
  const a2 = t >= T_ACT2
  const earth = s.gravity === "earth"
  const rng = s.rng
  const pulse =
    t >= T_ACT1 && t < T_ACT1 + 1.5 ? 0.6 * (1 - (t - T_ACT1) / 1.5)
    : t >= T_ACT2 && t < T_ACT2 + 1.5 ? 0.6 * (1 - (t - T_ACT2) / 1.5) : 0
  const e1 = a1 ? Math.exp(-(t - T_ACT1) / 9) : 0
  const e2 = a2 ? Math.exp(-(t - T_ACT2) / 9) : 0
  const env = earth ? Math.max(e1, e2) : 0
  const xc = a2 ? 0 : -0.5
  const hl = a2 ? 2 : 1.5
  const { nPA, nIon, px, py, pz, pa, pl, ix, iy, iz, regP, regI, locA, locI, cnt } = s
  const stir = (t >= T_ACT1 && t < T_ACT1 + dt) || (t >= T_ACT2 && t < T_ACT2 + dt)
  if (stir) {
    const hiP = a2 ? XHI : 1
    for (let i = 0; i < nPA; i++) if (!pl[i] && rng() < 0.6) px[i] = XLO + rng() * (hiP - XLO)
    for (let j = 0; j < nIon; j++) {
      const o = s.iorigin[j]
      const lo = o === 1 ? (a1 ? XLO : 0) : a2 ? XLO : 1
      const hi = o === 1 ? (a2 ? XHI : 1) : XHI
      if (rng() < 0.6) ix[j] = lo + rng() * (hi - lo)
    }
  }
  for (let i = 0; i < nPA; i++) { regP[i] = region(px[i], a1, a2); locI[i] = 0 }
  for (let j = 0; j < nIon; j++) { regI[j] = region(ix[j], a1, a2); locA[j] = 0; cnt[j] = 0 }
  const rc2 = RC * RC
  for (let i = 0; i < nPA; i++) {
    for (let j = 0; j < nIon; j++) {
      if (regP[i] !== regI[j]) continue
      const dx = px[i] - ix[j], dy = py[i] - iy[j], dz = pz[i] - iz[j]
      if (dx * dx + dy * dy + dz * dz < rc2) { locI[i] += 1; locA[j] += pa[i]; cnt[j] += 1 }
    }
  }
  for (let i = 0; i < nPA; i++) {
    const target = sm(locI[i] / C0)
    if (target > pa[i]) {
      pa[i] += K_A * (target - pa[i]) * dt
      if (pa[i] > 0.97) { pa[i] = 1; pl[i] = 1 }
    }
    if (pl[i]) continue
    const sg = Math.sqrt(2 * 0.004 * dt)
    let x = px[i] + sg * gauss(rng)
    let y = py[i] + sg * gauss(rng)
    let z = pz[i] + sg * gauss(rng)
    if (pulse) { x += pulse * 0.05 * gauss(rng); y += pulse * 0.05 * gauss(rng); z += pulse * 0.05 * gauss(rng) }
    if (earth) {
      y -= 0.025 * (0.4 + 1.2 * pa[i]) * dt
      if (env) {
        x += 0.5 * 0.16 * env * (py[i] / R) * dt
        y -= 0.5 * 0.16 * env * 0.4 * Math.max(-1, Math.min(1, (px[i] - xc) / hl)) * dt
      }
    }
    const hi = a2 ? XHI : a1 ? 1 : 0
    x = Math.max(XLO, Math.min(hi, x))
    const rr = Math.hypot(y, z)
    const lim = R * 0.92
    if (rr > lim) { y *= lim / rr; z *= lim / rr }
    px[i] = x; py[i] = y; pz[i] = z
  }
  for (let j = 0; j < nIon; j++) {
    const la = cnt[j] ? locA[j] / cnt[j] : 0
    const D = 0.06 / (1 + 5 * la)
    const sg = Math.sqrt(2 * D * dt)
    let x = ix[j] + sg * gauss(rng)
    let y = iy[j] + sg * gauss(rng)
    let z = iz[j] + sg * gauss(rng)
    if (pulse) { x += pulse * 0.06 * gauss(rng); y += pulse * 0.06 * gauss(rng); z += pulse * 0.06 * gauss(rng) }
    if (earth && env) {
      x += 0.16 * env * (iy[j] / R) * dt
      y -= 0.16 * env * 0.4 * Math.max(-1, Math.min(1, (ix[j] - xc) / hl)) * dt
    }
    const o = s.iorigin[j]
    const lo = o === 1 ? (a1 ? XLO : 0) : a2 ? XLO : 1
    const hi = o === 1 ? (a2 ? XHI : 1) : XHI
    x = Math.max(lo, Math.min(hi, x))
    const rr = Math.hypot(y, z)
    const lim = R * 0.92
    if (rr > lim) { y *= lim / rr; z *= lim / rr }
    ix[j] = x; iy[j] = y; iz[j] = z
  }
}

const TEAL = "#1FB5A6"
const AMBER = "#FFB347"
const CORAL = "#FF6F61"
const CYAN = "#19C6D2"
const WHITE = "#F3F7FA"

const COND = [
  { gravity: "micro" as Gravity, mode: "single" as Mode, title: "1 \u00b7 ISS microgravity \u00b7 single-stage", g: "\u2248 0 g", sub: "C2: 100% salt \u00b7 C3: water blank" },
  { gravity: "micro" as Gravity, mode: "sequential" as Mode, title: "2 \u00b7 ISS microgravity \u00b7 sequential", g: "\u2248 0 g", sub: "C2: 25% salt \u00b7 C3: 75% salt" },
  { gravity: "earth" as Gravity, mode: "single" as Mode, title: "3 \u00b7 Earth 1 g \u00b7 single-stage", g: "\u2193 1 g", sub: "C2: 100% salt \u00b7 C3: water blank" },
  { gravity: "earth" as Gravity, mode: "sequential" as Mode, title: "4 \u00b7 Earth 1 g \u00b7 sequential", g: "\u2193 1 g", sub: "C2: 25% salt \u00b7 C3: 75% salt" },
]

function stageInfo(t: number, mode: Mode | null) {
  if (t < T_ACT1) return { name: "Loaded \u00b7 clamps closed", text: "Each chamber holds its own liquid. Both arms use the same PA, the same total salt and the same 8.0 mL." }
  if (t < T_ACT1 + 2) return { name: "Activation 1 \u00b7 Clamp 1 released", text: mode === "single" ? "Chamber 1 (PA) mixes with the full salt dose (100%)." : mode === "sequential" ? "Chamber 1 (PA) mixes with the stage-1 dose (25% of the salt)." : "Single-stage arms get 100% of the salt. Sequential arms get 25%." }
  if (t < T_ACT2) return { name: "Incubation (time compressed)", text: mode === "single" ? "Assembly can run on quickly after the full dose." : mode === "sequential" ? "Partial assembly begins while the rest of the salt is held back." : "Single-stage arms can finish assembling early. Sequential arms only start." }
  if (t < T_ACT2 + 2) return { name: "Activation 2 \u00b7 Clamp 2 released", text: mode === "single" ? "Chamber 3 holds only water, so no salt is added." : mode === "sequential" ? "The remaining 75% of the salt joins the mixture." : "Single-stage arms get only water. Sequential arms get the remaining 75%." }
  if (t < T_END) return { name: "Maturation", text: "Tubes are held still. Ground controls follow the same steps at the same elapsed times." }
  return { name: "End of animation", text: "Conceptual end state. How the real gels look is what the experiment will test." }
}

const smooth = (x: number) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x) }
const GRID: number[][] = [[-1.45, 0.8], [-1.45, -0.8], [1.45, 0.8], [1.45, -0.8]]
const FONT = "Geist, Inter, system-ui, -apple-system, 'Segoe UI', sans-serif"

/* callouts: labels with connector lines (focus view only). fixed = share of width/height, off = pixel offset from the anchor */
const CALLS: any[] = [
  { key: "tube", color: WHITE, text: "Outer MixStix tube", anchor: [-1.7, 0.5], off: [-40, -84] },
  { key: "clamp1", color: WHITE, text: "Clamp 1", anchor: [0, 0.6], off: [-30, -60] },
  { key: "clamp2", color: WHITE, text: "Clamp 2", anchor: [1, 0.6], off: [30, -60] },
  { key: "mix", color: WHITE, text: "Mixing direction", anchor: [0.2, 0.8], off: [0, -118], mix: true },
  { key: "grav", color: WHITE, text: "Gravity", anchor: [-2.4, 0.0], off: [-6, 98], earth: true },
  { key: "c1", color: TEAL, text: "Chamber 1", anchor: [-1, -0.5], off: [0, 70] },
  { key: "c2", color: AMBER, text: "Chamber 2", anchor: [0.5, -0.5], off: [0, 70] },
  { key: "c3", color: CORAL, text: "Chamber 3", anchor: [1.5, -0.5], off: [0, 70] },
  { key: "part", color: AMBER, text: "Particle movement", ion: 5, fixed: [0.56, 0.87] },
  { key: "gel", color: CYAN, text: "Hydrogel formation region", gel: true, fixed: [0.27, 0.87] },
]
function callSub(key: string, mode: Mode, gravity: Gravity) {
  if (key === "tube") return "flexible silicone, double containment"
  if (key === "clamp1") return "released at Activation 1"
  if (key === "clamp2") return "released at Activation 2"
  if (key === "grav") return "1 g pulls particles downward"
  if (key === "mix") return "the crew\u2019s gentle motion"
  if (key === "c1") return "Peptide-amphiphile solution \u00b7 4.0 mL"
  if (key === "c2") return mode === "single" ? "Ionic trigger \u00b7 full dose (100%)" : "Ionic trigger \u00b7 stage-1 dose (25%)"
  if (key === "c3") return mode === "single" ? "Water blank \u00b7 no salt" : "Ionic trigger \u00b7 stage-2 dose (75%)"
  if (key === "part") return gravity === "earth" ? "settling and convection currents (conceptual)" : "random diffusion only (conceptual)"
  return "network fibres assemble where salt meets PA"
}

export default function HydroSimulation(props: any) {
  const { defaultView, defaultMode, defaultGravity, autoPlay, accent, background, radius, showControls, showCallouts, disclaimer, startTime, style } = props
  const mountRef = useRef<HTMLDivElement>(null)
  const labelRefs = useRef<Record<string, any>>({})
  const lineRefs = useRef<Record<string, any>>({})
  const handles = useRef<any>({})
  const [view, setView] = useState<View>(defaultView)
  const [mode, setMode] = useState<Mode>(defaultMode)
  const [gravity, setGravity] = useState<Gravity>(defaultGravity)
  const [playing, setPlaying] = useState<boolean>(!!autoPlay)
  const [speed, setSpeed] = useState<number>(1)
  const [uiT, setUiT] = useState<number>(0)
  const [failed, setFailed] = useState<boolean>(false)
  const [narrow, setNarrow] = useState<boolean>(false)
  const ctl = useRef<any>({})
  ctl.current = { view, mode, gravity, playing, speed, narrow, showCallouts }

  /* ------------------------------- 2. SCENE ------------------------------- */
  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    let renderer: any
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch (e) {
      setFailed(true)
      return
    }
    const isCanvas = RenderTarget.current() === RenderTarget.canvas
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:grab"
    mount.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
    scene.add(new THREE.AmbientLight(0xffffff, 1.0))
    const dl = new THREE.DirectionalLight(0xffffff, 1.1)
    dl.position.set(3, 5, 4)
    scene.add(dl)

    const cLow = new THREE.Color(TEAL)
    const cHigh = new THREE.Color(0xa6f3f7)
    const tmp = new THREE.Color()
    const dummy = new THREE.Object3D()
    const disposables: any[] = []

    const tubes: any[] = COND.map((cd, idx) => {
      const group = new THREE.Group()
      const shellMat = new THREE.MeshStandardMaterial({ color: 0xf3f7fa, transparent: true, opacity: 0.1, roughness: 0.2, side: THREE.DoubleSide, depthWrite: false })
      disposables.push(shellMat)
      const liquids: any[] = []
      const spans: number[][] = [[-2, 0], [0, 1], [1, 2]]
      const chamberCol = [TEAL, AMBER, CORAL]
      const liqOpacity = [0.24, cd.mode === "single" ? 0.32 : 0.16, cd.mode === "single" ? 0.05 : 0.3]
      spans.forEach((sp, k) => {
        const len = sp[1] - sp[0] - 0.05
        const geo = new THREE.CylinderGeometry(R, R, len, 40, 1, false)
        geo.rotateZ(Math.PI / 2)
        const shell = new THREE.Mesh(geo, shellMat)
        shell.position.x = (sp[0] + sp[1]) / 2
        shell.renderOrder = 3
        group.add(shell)
        const lineMat = new THREE.LineBasicMaterial({ color: new THREE.Color(chamberCol[k]), transparent: true, opacity: 0.95 })
        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), lineMat)
        edges.position.copy(shell.position)
        group.add(edges)
        const lgeo = new THREE.CylinderGeometry(R * 0.94, R * 0.94, len - 0.02, 40, 1, false)
        lgeo.rotateZ(Math.PI / 2)
        const lmat = new THREE.MeshBasicMaterial({ color: new THREE.Color(chamberCol[k]), transparent: true, opacity: liqOpacity[k], depthWrite: false })
        const lm = new THREE.Mesh(lgeo, lmat)
        lm.position.x = shell.position.x
        lm.renderOrder = 2
        group.add(lm)
        liquids.push({ mesh: lm, base: liqOpacity[k] })
        disposables.push(geo, lgeo, lmat, lineMat, edges.geometry)
      })
      const clamps: any[] = []
      ;[0, 1].forEach((k) => {
        const cg = new THREE.Group()
        const ringGeo = new THREE.TorusGeometry(R + 0.05, 0.035, 12, 56)
        ringGeo.rotateY(Math.PI / 2)
        const ringMat = new THREE.MeshStandardMaterial({ color: 0xf3f7fa, emissive: 0x4a5560, transparent: true, opacity: 1 })
        const discGeo = new THREE.CylinderGeometry(R, R, 0.03, 40, 1, false)
        discGeo.rotateZ(Math.PI / 2)
        const discMat = new THREE.MeshBasicMaterial({ color: 0xf3f7fa, transparent: true, opacity: 0.3, depthWrite: false })
        const ring = new THREE.Mesh(ringGeo, ringMat)
        const disc = new THREE.Mesh(discGeo, discMat)
        ring.renderOrder = 4
        disc.renderOrder = 4
        cg.add(ring)
        cg.add(disc)
        cg.position.x = k
        group.add(cg)
        clamps.push({ g: cg, mats: [ringMat, discMat] })
        disposables.push(ringGeo, ringMat, discGeo, discMat)
      })
      /* mixing arrows (shown while the crew mixes) and a gravity arrow (Earth tubes only) */
      const mix = new THREE.Group()
      const a1 = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0.45, 0.88, 0), 0.9, 0xf3f7fa, 0.2, 0.12)
      const a2 = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(-0.45, 0.88, 0), 0.9, 0xf3f7fa, 0.2, 0.12)
      mix.add(a1)
      mix.add(a2)
      mix.visible = false
      group.add(mix)
      let gArrow: any = null
      if (cd.gravity === "earth") {
        gArrow = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(-2.4, 0.4, 0), 0.8, 0xf3f7fa, 0.22, 0.14)
        group.add(gArrow)
      }
      const sim = createSim(cd.mode, cd.gravity)
      const rodGeo = new THREE.CylinderGeometry(0.011, 0.011, 1, 5)
      const rodMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
      const pa = new THREE.InstancedMesh(rodGeo, rodMat, sim.nPA)
      pa.frustumCulled = false
      const quats: any[] = []
      const qr = mulberry32(4242)
      for (let i = 0; i < sim.nPA; i++) {
        const q = new THREE.Quaternion()
        q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(qr() - 0.5, qr() - 0.5, qr() - 0.5).normalize())
        quats.push(q)
      }
      group.add(pa)
      const ionGeo = new THREE.SphereGeometry(0.024, 8, 6)
      const ionMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(AMBER) })
      const ions = new THREE.InstancedMesh(ionGeo, ionMat, sim.nIon)
      ions.frustumCulled = false
      group.add(ions)
      disposables.push(rodGeo, rodMat, ionGeo, ionMat)
      scene.add(group)
      return { group, sim, pa, ions, quats, clamps, liquids, cd, mix, gArrow }
    })

    let W = 600, H = 400
    const resize = () => {
      W = mount.clientWidth || 600
      H = mount.clientHeight || 400
      renderer.setSize(W, H, false)
      camera.aspect = W / H
      camera.updateProjectionMatrix()
      const nw = W < 860
      if (nw !== ctl.current.narrow) setNarrow(nw)
    }
    resize()
    const ro = new ResizeObserver(() => { resize(); if (isCanvas) draw(0.5) })
    ro.observe(mount)

    let t = 0
    let acc = 0
    const DT = 1 / 30
    const cam: any = { az: 0.3, el: 0.18, zoom: 1, tAz: 0.3, tEl: 0.18, tZoom: 1, ty: 0, d: 8, init: false }
    const v3 = new THREE.Vector3()

    const updateTube = (tb: any) => {
      const s = tb.sim
      for (let i = 0; i < s.nPA; i++) {
        const a = s.pa[i]
        dummy.position.set(s.px[i], s.py[i], s.pz[i])
        dummy.quaternion.copy(tb.quats[i])
        dummy.scale.set(1, 0.035 + 0.2 * a, 1)
        dummy.updateMatrix()
        tb.pa.setMatrixAt(i, dummy.matrix)
        tmp.copy(cLow).lerp(cHigh, a)
        tb.pa.setColorAt(i, tmp)
      }
      tb.pa.instanceMatrix.needsUpdate = true
      if (tb.pa.instanceColor) tb.pa.instanceColor.needsUpdate = true
      dummy.quaternion.identity()
      dummy.scale.set(1, 1, 1)
      for (let j = 0; j < s.nIon; j++) {
        dummy.position.set(s.ix[j], s.iy[j], s.iz[j])
        dummy.updateMatrix()
        tb.ions.setMatrixAt(j, dummy.matrix)
      }
      tb.ions.instanceMatrix.needsUpdate = true
      const p1 = smooth((t - T_ACT1) / 1.0)
      const p2 = smooth((t - T_ACT2) / 1.0)
      ;[p1, p2].forEach((p, k) => {
        const cl = tb.clamps[k]
        cl.g.position.y = p * 0.9
        cl.mats[0].opacity = 1 - 0.96 * p
        cl.mats[1].opacity = 0.3 * (1 - p)
      })
      tb.liquids[0].mesh.material.opacity = tb.liquids[0].base * (1 - 0.5 * p1)
      tb.liquids[1].mesh.material.opacity = tb.liquids[1].base * (1 - 0.6 * p1)
      tb.liquids[2].mesh.material.opacity = tb.liquids[2].base * (1 - 0.6 * p2)
      const mixing = (t >= T_ACT1 && t < T_ACT1 + 3) || (t >= T_ACT2 && t < T_ACT2 + 3)
      tb.mix.visible = mixing
      tb.mix.position.x = t >= T_ACT2 ? 0.4 : -0.1
    }

    const project = (group: any, lx: number, ly: number, lz: number) => {
      v3.set(lx, ly, lz)
      group.localToWorld(v3)
      v3.project(camera)
      return [(v3.x * 0.5 + 0.5) * W, (-v3.y * 0.5 + 0.5) * H]
    }
    const setTitle = (el: any, group: any, show: boolean) => {
      if (!el) return
      if (!show) { el.style.display = "none"; return }
      const p = project(group, 0, 0.95, 0)
      el.style.display = "block"
      el.style.left = p[0] + "px"
      el.style.top = p[1] + "px"
    }
    const hideCall = (key: string) => {
      const el = labelRefs.current[key], ln = lineRefs.current[key]
      if (el) el.style.display = "none"
      if (ln) ln.style.display = "none"
    }

    let lastUi = -1
    const draw = (dtReal: number) => {
      const c = ctl.current
      const compare = c.view === "compare"
      const focusIdx = (c.gravity === "micro" ? 0 : 2) + (c.mode === "single" ? 0 : 1)
      const k = 1 - Math.exp(-dtReal * 8)
      tubes.forEach((tb, i) => {
        const tx = compare ? GRID[i][0] : 0
        const ty = compare ? GRID[i][1] : 0
        const ts = compare ? 0.62 : i === focusIdx ? 1 : 0.0001
        const g = tb.group
        g.position.x += (tx - g.position.x) * k
        g.position.y += (ty - g.position.y) * k
        const sNow = g.scale.x + (ts - g.scale.x) * k
        g.scale.setScalar(sNow)
        g.visible = sNow > 0.03
        updateTube(tb)
      })
      cam.az += (cam.tAz - cam.az) * Math.min(1, dtReal * 10)
      cam.el += (cam.tEl - cam.el) * Math.min(1, dtReal * 10)
      cam.zoom += (cam.tZoom - cam.zoom) * Math.min(1, dtReal * 10)
      const vTan = Math.tan((camera.fov * Math.PI) / 360)
      const hTan = vTan * camera.aspect
      const nr = c.narrow
      const topRes = W < 640 ? 400 : W < 860 ? 215 : 175
      const botRes = W < 640 ? 190 : W < 860 ? 125 : 85
      const avail = Math.max(H - topRes - botRes, 140)
      const halfW = compare ? 3.3 : 2.7
      const halfH = compare ? 1.5 : 0.85
      const dTarget = Math.max(halfW / hTan, (halfH / vTan) * (H / avail)) * 1.05
      if (!cam.init) { cam.d = dTarget; cam.init = true }
      cam.d += (dTarget - cam.d) * Math.min(1, dtReal * 6)
      const d = cam.d * cam.zoom
      const tyTarget = ((topRes - botRes) / 2 / H) * 2 * cam.d * vTan
      cam.ty += (tyTarget - cam.ty) * Math.min(1, dtReal * 6)
      camera.position.set(d * Math.sin(cam.az) * Math.cos(cam.el), d * Math.sin(cam.el) + cam.ty, d * Math.cos(cam.az) * Math.cos(cam.el))
      camera.lookAt(0, cam.ty, 0)
      renderer.render(scene, camera)
      tubes.forEach((tb, i) => setTitle(labelRefs.current["t" + i], tb.group, compare || false))
      /* callouts + connector lines (focus view, wide screens only) */
      const ft = tubes[focusIdx]
      const showAll = !compare && !nr && c.showCallouts
      const sm: any = ft.sim
      let gx = 0, gy = 0, gz = 0, gn = 0
      for (let i = 0; i < sm.nPA; i++) if (sm.pa[i] > 0.6) { gx += sm.px[i]; gy += sm.py[i]; gz += sm.pz[i]; gn++ }
      const mixing = (t >= T_ACT1 && t < T_ACT1 + 3) || (t >= T_ACT2 && t < T_ACT2 + 3)
      CALLS.forEach((cl) => {
        if (!showAll || (cl.mix && !mixing) || (cl.gel && gn < 10) || (cl.earth && c.gravity !== "earth")) { hideCall(cl.key); return }
        let ax = 0, ay = 0
        if (cl.ion !== undefined) { const p = project(ft.group, sm.ix[cl.ion], sm.iy[cl.ion], sm.iz[cl.ion]); ax = p[0]; ay = p[1] }
        else if (cl.gel) { const p = project(ft.group, gx / gn, gy / gn, gz / gn); ax = p[0]; ay = p[1] }
        else { const p = project(ft.group, cl.anchor[0], cl.anchor[1], 0); ax = p[0]; ay = p[1] }
        const lx = cl.fixed ? cl.fixed[0] * W : ax + cl.off[0]
        const ly = cl.fixed ? cl.fixed[1] * H : ay + cl.off[1]
        const el = labelRefs.current[cl.key], ln = lineRefs.current[cl.key]
        if (el) { el.style.display = "block"; el.style.left = lx + "px"; el.style.top = ly + "px" }
        if (ln) { ln.style.display = "block"; ln.setAttribute("x1", String(ax)); ln.setAttribute("y1", String(ay)); ln.setAttribute("x2", String(lx)); ln.setAttribute("y2", String(ly)) }
      })
      const q = Math.floor(t * 4)
      if (q !== lastUi) { lastUi = q; setUiT(t) }
    }

    const reset = () => {
      tubes.forEach((tb) => { tb.sim = createSim(tb.cd.mode, tb.cd.gravity) })
      t = 0
      acc = 0
      lastUi = -1
      draw(0.5)
    }
    handles.current.reset = reset

    tubes.forEach((tb, i) => {
      const compare = ctl.current.view === "compare"
      const focusIdx = (ctl.current.gravity === "micro" ? 0 : 2) + (ctl.current.mode === "single" ? 0 : 1)
      tb.group.position.set(compare ? GRID[i][0] : 0, compare ? GRID[i][1] : 0, 0)
      tb.group.scale.setScalar(compare ? 0.62 : i === focusIdx ? 1 : 0.0001)
    })

    let raf = 0
    let visible = true
    let last = performance.now()
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dtReal = Math.min(0.1, (now - last) / 1000)
      last = now
      if (!visible) return
      const c = ctl.current
      if (c.playing && t < T_END) {
        acc += dtReal * c.speed
        let n = 0
        while (acc >= DT && n < 6) {
          for (const tb of tubes) stepSim(tb.sim, t, DT)
          t += DT
          acc -= DT
          n++
        }
        if (t >= T_END) { t = T_END; setPlaying(false) }
      }
      draw(dtReal)
    }

    if (isCanvas) {
      for (let k = 0; k < 14 / DT; k++) { for (const tb of tubes) stepSim(tb.sim, t, DT); t += DT }
      draw(0.5)
    } else {
      const pre = Math.max(0, Math.min(T_END, startTime || 0))
      for (let k = 0; k < pre / DT; k++) { for (const tb of tubes) stepSim(tb.sim, t, DT); t += DT }
      raf = requestAnimationFrame(frame)
    }

    const io = new IntersectionObserver((entries) => { visible = entries[0].isIntersecting }, { threshold: 0.01 })
    io.observe(mount)

    const el = renderer.domElement
    const pointers = new Map<number, { x: number; y: number }>()
    let pinch = 0
    const onDown = (e: PointerEvent) => { el.setPointerCapture(e.pointerId); pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); el.style.cursor = "grabbing"; pinch = 0 }
    const onMove = (e: PointerEvent) => {
      const p = pointers.get(e.pointerId)
      if (!p) return
      if (pointers.size === 1) {
        cam.tAz -= (e.clientX - p.x) * 0.006
        cam.tEl = Math.max(-1.2, Math.min(1.2, cam.tEl + (e.clientY - p.y) * 0.006))
      }
      p.x = e.clientX; p.y = e.clientY
      if (pointers.size === 2) {
        const pts = Array.from(pointers.values())
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
        if (pinch) cam.tZoom = Math.max(0.45, Math.min(2.2, cam.tZoom * (pinch / dist)))
        pinch = dist
      }
    }
    const onUp = (e: PointerEvent) => { pointers.delete(e.pointerId); el.style.cursor = "grab"; pinch = 0 }
    const onWheel = (e: WheelEvent) => { e.preventDefault(); cam.tZoom = Math.max(0.45, Math.min(2.2, cam.tZoom * (1 + e.deltaY * 0.001))) }
    const onDbl = () => { cam.tAz = 0.3; cam.tEl = 0.18; cam.tZoom = 1 }
    el.addEventListener("pointerdown", onDown)
    el.addEventListener("pointermove", onMove)
    el.addEventListener("pointerup", onUp)
    el.addEventListener("pointercancel", onUp)
    el.addEventListener("wheel", onWheel, { passive: false })
    el.addEventListener("dblclick", onDbl)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      el.removeEventListener("pointerdown", onDown)
      el.removeEventListener("pointermove", onMove)
      el.removeEventListener("pointerup", onUp)
      el.removeEventListener("pointercancel", onUp)
      el.removeEventListener("wheel", onWheel)
      el.removeEventListener("dblclick", onDbl)
      disposables.forEach((d) => d.dispose && d.dispose())
      tubes.forEach((tb) => { tb.pa.dispose(); tb.ions.dispose() })
      renderer.dispose()
      if (el.parentNode === mount) mount.removeChild(el)
    }
  }, [accent, startTime])

  /* -------------------------------- 3. UI -------------------------------- */
  const compare = view === "compare"
  const info = stageInfo(uiT, compare ? null : mode)
  const chip: React.CSSProperties = { position: "absolute", transform: "translate(-50%, -50%)", display: "none", pointerEvents: "none", whiteSpace: "nowrap", fontFamily: FONT }
  const panel: React.CSSProperties = { background: "rgba(16,36,58,0.86)", border: "1px solid rgba(243,247,250,0.18)", borderRadius: 12, padding: "10px 12px" }
  const btn = (active: boolean, disabled?: boolean): React.CSSProperties => ({
    appearance: "none", border: "1px solid " + (active ? accent : "rgba(243,247,250,0.28)"), background: active ? accent : "rgba(243,247,250,0.06)", color: active ? "#10243A" : "#F3F7FA",
    borderRadius: 999, padding: "7px 12px", fontSize: 12, fontWeight: 600, fontFamily: FONT, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1, lineHeight: 1,
  })
  const Seg = (p: { label: string; options: { v: string; t: string }[]; value: string; onChange: (v: string) => void; disabled?: boolean }) => (
    <div role="group" aria-label={p.label} style={{ display: "flex", gap: 4 }}>
      {p.options.map((o) => (
        <button key={o.v} type="button" aria-pressed={p.value === o.v} disabled={p.disabled} onClick={() => p.onChange(o.v)} style={btn(p.value === o.v, p.disabled)}>{o.t}</button>
      ))}
    </div>
  )
  const swatch = (col: string): React.CSSProperties => ({ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: col, marginRight: 7, flex: "0 0 auto", marginTop: 3 })
  const legendRows: any[] = [
    [TEAL, "Chamber 1", "Peptide-amphiphile (PA) solution"],
    [AMBER, "Chamber 2", compare ? "Ionic trigger: 100% (single-stage) or stage-1, 25% (sequential)" : mode === "single" ? "Ionic trigger: full dose, 100%" : "Ionic trigger: stage-1 dose, 25%"],
    [CORAL, "Chamber 3", compare ? "Water blank (single-stage) or stage-2 ionic solution, 75% (sequential)" : mode === "single" ? "Water blank: no salt" : "Ionic trigger: stage-2 dose, 75%"],
  ]
  const callSubs = (key: string) => callSub(key, mode, gravity)

  return (
    <div role="group" aria-label="Interactive conceptual 3D model of the three-chamber MixStix tube" style={{ ...style, position: "relative", width: "100%", height: "100%", minHeight: 420, overflow: "hidden", borderRadius: radius, background: background, border: "1px solid rgba(243,247,250,0.16)", boxSizing: "border-box", color: "#F3F7FA", fontFamily: FONT }}>
      <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />
      {failed ? (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", fontSize: 14 }}>This 3D view needs WebGL, which is not available here. The diagrams above explain the same steps.</div>
      ) : null}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} aria-hidden="true">
        {CALLS.map((cl) => (
          <line key={cl.key} ref={(el) => { lineRefs.current[cl.key] = el }} stroke={cl.color} strokeWidth={1.2} strokeOpacity={0.85} style={{ display: "none" }} />
        ))}
      </svg>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {COND.map((cd, i) => (
          <div key={"t" + i} ref={(el) => { labelRefs.current["t" + i] = el }} style={{ ...chip, textAlign: "center", fontSize: 12, fontWeight: 600, color: "#F3F7FA", textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>
            <div>{cd.title} <span style={{ color: accent, marginLeft: 6 }}>{cd.g}</span></div>
            <div style={{ fontSize: 10, fontWeight: 500, opacity: 0.8, marginTop: 2 }}>{cd.sub}</div>
          </div>
        ))}
        {CALLS.map((cl) => (
          <div key={cl.key} ref={(el) => { labelRefs.current[cl.key] = el }} style={{ ...chip, background: "rgba(16,36,58,0.92)", border: "1px solid " + cl.color, borderRadius: 8, padding: "5px 9px", textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: cl.color, letterSpacing: "0.02em" }}>{cl.text}</div>
            <div style={{ fontSize: 10, opacity: 0.85, marginTop: 1 }}>{callSubs(cl.key)}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 12, left: 12, right: 12, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-start", pointerEvents: "none" }}>
        <div style={{ flex: "1 1 300px", maxWidth: 440, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ alignSelf: "flex-start", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#F3F7FA", background: "rgba(25,198,210,0.16)", border: "1px solid rgba(25,198,210,0.6)", borderRadius: 999, padding: "5px 10px" }}>{disclaimer}</div>
          <div style={panel}>
            {!compare ? <div style={{ fontSize: 11, opacity: 0.75, marginBottom: 3 }}>{"Condition " + COND[(gravity === "micro" ? 0 : 2) + (mode === "single" ? 0 : 1)].title + "  " + COND[(gravity === "micro" ? 0 : 2) + (mode === "single" ? 0 : 1)].g}</div> : null}
            <div style={{ fontSize: 13, fontWeight: 700, color: accent }}>{info.name}</div>
            <div style={{ fontSize: 12, lineHeight: 1.45, opacity: 0.92, marginTop: 2 }}>{info.text}</div>
          </div>
        </div>
        <div style={{ flex: "1 1 300px", maxWidth: 460, marginLeft: "auto" }}>
          <div style={panel}>
            {legendRows.map((r) => (
              <div key={r[1]} style={{ display: "flex", fontSize: 11, lineHeight: 1.4, marginBottom: 4 }}>
                <span style={swatch(r[0])} />
                <span><b>{r[1]}</b> {"\u00b7 " + r[2]}</span>
              </div>
            ))}
            <div style={{ display: "flex", fontSize: 11, lineHeight: 1.4, marginBottom: 4 }}><span style={{ ...swatch(AMBER), borderRadius: 10 }} /><span>Amber dots: ions of the ionic trigger</span></div>
            <div style={{ display: "flex", fontSize: 11, lineHeight: 1.4 }}><span style={{ ...swatch(TEAL), borderRadius: 10 }} /><span>Teal rods: PA molecules, paler cyan once assembled into fibres</span></div>
            <div style={{ fontSize: 10, opacity: 0.7, marginTop: 6, lineHeight: 1.4 }}>Colours identify chambers. No chemical locking solution is flown; fixation is done on the ground after return.</div>
          </div>
        </div>
      </div>
      {showControls ? (
        <div style={{ position: "absolute", left: 12, right: 12, bottom: 12, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", background: "rgba(16,36,58,0.9)", border: "1px solid rgba(243,247,250,0.18)", borderRadius: 14, padding: 10 }}>
          <button type="button" onClick={() => { if (uiT >= T_END) handles.current.reset && handles.current.reset(); setPlaying(!playing || uiT >= T_END) }} style={btn(true)}>{playing ? "Pause" : "Play"}</button>
          <button type="button" onClick={() => { handles.current.reset && handles.current.reset(); setPlaying(false) }} style={btn(false)}>Reset</button>
          <Seg label="View" value={view} onChange={(v) => setView(v as View)} options={[{ v: "focus", t: "Focus" }, { v: "compare", t: "Compare all 4" }]} />
          <Seg label="Triggering" value={mode} disabled={compare} onChange={(v) => setMode(v as Mode)} options={[{ v: "single", t: "Single-stage" }, { v: "sequential", t: "Sequential" }]} />
          <Seg label="Gravity" value={gravity} disabled={compare} onChange={(v) => setGravity(v as Gravity)} options={[{ v: "micro", t: "ISS microgravity" }, { v: "earth", t: "Earth 1 g" }]} />
          <Seg label="Speed" value={String(speed)} onChange={(v) => setSpeed(Number(v))} options={[{ v: "0.5", t: "0.5x" }, { v: "1", t: "1x" }, { v: "2", t: "2x" }]} />
          <div style={{ position: "relative", flex: "1 1 140px", minWidth: 120, height: 6, background: "rgba(243,247,250,0.18)", borderRadius: 3 }} aria-hidden="true">
            <div style={{ width: Math.min(100, (uiT / T_END) * 100) + "%", height: "100%", background: accent, borderRadius: 3 }} />
            <div style={{ position: "absolute", left: (T_ACT1 / T_END) * 100 + "%", top: -3, width: 2, height: 12, background: "#F3F7FA" }} />
            <div style={{ position: "absolute", left: (T_ACT2 / T_END) * 100 + "%", top: -3, width: 2, height: 12, background: "#F3F7FA" }} />
          </div>
        </div>
      ) : null}
    </div>
  )
}

HydroSimulation.defaultProps = {
  defaultView: "focus", defaultMode: "sequential", defaultGravity: "micro", autoPlay: false, accent: "#19C6D2", background: "#10243A", radius: 20, showControls: true, showCallouts: true, startTime: 0,
  disclaimer: "Conceptual animation \u00b7 not molecular dynamics \u00b7 not experimental data",
}
