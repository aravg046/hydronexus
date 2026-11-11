import * as React from "react"
import { useEffect, useRef } from "react"
import { RenderTarget } from "../shims/framer"

/*
  Conceptual nanofibre field for the HydroNexus hero.
  An illustration of entangled fibres, drawn on a 2D canvas. It is NOT microscopy and NOT data.
  Cheap by design: capped pixel ratio, ~30 fps, pauses off-screen, still frame for reduced-motion users.
*/
function rng(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export default function NanofibreField(props: any) {
  const { fibreColor, accentColor, count, speed, showCaption, caption, style } = props
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const still = RenderTarget.current() === RenderTarget.canvas || (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    const r = rng(2026)
    const K = 7
    const fibres: any[] = []
    for (let i = 0; i < count; i++) {
      const pts: any[] = []
      const y0 = r() * 1.2 - 0.1
      const slope = (r() - 0.5) * 0.9
      for (let k = 0; k < K; k++) {
        const u = k / (K - 1)
        pts.push({ x: u * 1.3 - 0.15, y: y0 + slope * u + (r() - 0.5) * 0.35, ph: r() * 6.28, ax: 0.012 + r() * 0.02, ay: 0.02 + r() * 0.035 })
      }
      fibres.push({ pts, w: 0.7 + r() * 1.6, a: 0.16 + r() * 0.55, hot: r() < 0.28, off: r() * 10 })
    }
    let W = 0, H = 0, raf = 0, visible = true, last = 0
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = canvas.clientWidth || 600
      H = canvas.clientHeight || 400
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H)
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      for (const f of fibres) {
        const p = f.pts.map((q: any) => ({ x: (q.x + Math.sin(t * 0.00035 * speed + q.ph + f.off) * q.ax) * W, y: (q.y + Math.cos(t * 0.0003 * speed + q.ph * 1.3 + f.off) * q.ay) * H }))
        const path = () => {
          ctx.beginPath()
          ctx.moveTo(p[0].x, p[0].y)
          for (let k = 0; k < p.length - 1; k++) {
            const p0 = p[Math.max(k - 1, 0)], p1 = p[k], p2 = p[k + 1], p3 = p[Math.min(k + 2, p.length - 1)]
            ctx.bezierCurveTo(p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6, p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6, p2.x, p2.y)
          }
        }
        ctx.strokeStyle = f.hot ? accentColor : fibreColor
        ctx.globalAlpha = f.a * 0.16
        ctx.lineWidth = f.w * 5
        path(); ctx.stroke()
        ctx.globalAlpha = f.a
        ctx.lineWidth = f.w
        path(); ctx.stroke()
      }
      ctx.globalAlpha = 1
    }
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (!visible || now - last < 33) return
      last = now
      draw(now)
    }
    resize()
    const ro = new ResizeObserver(() => { resize(); draw(9000) })
    ro.observe(canvas)
    const io = new IntersectionObserver((e) => { visible = e[0].isIntersecting }, { threshold: 0.01 })
    io.observe(canvas)
    draw(9000)
    if (!still) raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect() }
  }, [fibreColor, accentColor, count, speed])

  return (
    <div style={{ ...style, position: "relative", width: "100%", height: "100%", overflow: "hidden" }} role="img" aria-label="Conceptual illustration of entangled peptide nanofibres">
      <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
      {showCaption ? <div style={{ position: "absolute", left: 14, bottom: 12, fontFamily: "Inter, system-ui, sans-serif", fontSize: 11, letterSpacing: "0.04em", color: "rgba(243,247,250,0.7)" }}>{caption}</div> : null}
    </div>
  )
}

NanofibreField.defaultProps = { fibreColor: "#F3F7FA", accentColor: "#19C6D2", count: 64, speed: 1, showCaption: false, caption: "Conceptual illustration \u00b7 not microscopy" }
