import * as React from "react"

/*
  Simplified schematic of peptide-amphiphile (PA) self-assembly: molecule, charge screening by salt ions,
  cylindrical nanofibre cross-section (tails inside, charged heads outside), entangled network.
  Generic established picture, not to scale, not data.
*/
const TEAL = "#1FB5A6", AMBER = "#FFB347"

function Molecule(p: any) {
  const { x, y, s, tail, charge } = p
  return (
    <g transform={"translate(" + x + "," + y + ") scale(" + s + ")"}>
      <path d="M0,0 q7,9 0,18 q-7,9 0,18 q7,9 0,18 q-7,9 0,18" fill="none" stroke={tail} strokeWidth={3} strokeLinecap="round" />
      {[-10, -26, -42].map((yy) => (<circle key={yy} cx={0} cy={yy} r={7} fill={TEAL} />))}
      {charge ? [-10, -26, -42].map((yy) => (<text key={"c" + yy} x={12} y={yy + 4} fontSize={12} fontWeight={700} fill={charge}>{"\u2212"}</text>)) : null}
    </g>
  )
}

export default function PASelfAssembly(props: any) {
  const { theme, l1, l2, l3, l4, note, style } = props
  const dark = theme === "dark"
  const ink = dark ? "#F3F7FA" : "#10243A"
  const soft = dark ? "rgba(243,247,250,0.7)" : "rgba(16,36,58,0.7)"
  const line = dark ? "rgba(243,247,250,0.28)" : "rgba(16,36,58,0.25)"
  const tail = dark ? "rgba(243,247,250,0.85)" : "rgba(16,36,58,0.8)"
  const heads: number[] = []
  for (let i = 0; i < 14; i++) heads.push((i / 14) * Math.PI * 2)
  const FONT = "Geist, Inter, system-ui, sans-serif"
  const arrow = (x: number, label: string) => (
    <g>
      <line x1={x - 34} y1={150} x2={x + 34} y2={150} stroke={line} strokeWidth={1.5} />
      <path d={"M" + (x + 28) + ",144 L" + (x + 36) + ",150 L" + (x + 28) + ",156"} fill="none" stroke={line} strokeWidth={1.5} />
      <text x={x} y={136} textAnchor="middle" fontSize={13} fill={soft} fontFamily={FONT}>{label}</text>
    </g>
  )
  const cap = (x: number, t1: string) => (
    <text x={x} y={300} textAnchor="middle" fontSize={16} fontWeight={600} fill={ink} fontFamily={FONT}>{t1}</text>
  )
  return (
    <div style={{ ...style, width: "100%", height: "100%" }} role="img" aria-label="Schematic of peptide-amphiphile self-assembly into a nanofibre network">
      <svg viewBox="0 0 1200 380" style={{ width: "100%", height: "100%", display: "block" }} preserveAspectRatio="xMidYMid meet">
        <Molecule x={80} y={130} s={1.1} tail={tail} charge={ink} />
        <Molecule x={150} y={160} s={0.9} tail={tail} charge={ink} />
        <Molecule x={215} y={120} s={1} tail={tail} charge={ink} />
        <text x={80} y={232} fontSize={13} fill={soft} fontFamily={FONT}>charged peptide</text>
        <text x={150} y={252} fontSize={13} fill={soft} fontFamily={FONT}>alkyl tail</text>
        {cap(150, l1)}
        {arrow(310, "+ salt ions")}
        <Molecule x={400} y={130} s={1.1} tail={tail} charge={null} />
        <Molecule x={470} y={160} s={0.9} tail={tail} charge={null} />
        <Molecule x={535} y={120} s={1} tail={tail} charge={null} />
        {[[420, 82], [488, 118], [556, 76], [392, 100], [510, 92], [458, 66]].map((q, i) => (<circle key={i} cx={q[0]} cy={q[1]} r={6.5} fill={AMBER} />))}
        <text x={470} y={252} textAnchor="middle" fontSize={13} fill={soft} fontFamily={FONT}>{"Ca\u00b2\u207a screens charges"}</text>
        {cap(470, l2)}
        {arrow(630, "assembly")}
        <g transform="translate(760,140)">
          <circle r={74} fill="none" stroke={line} strokeDasharray="3 5" />
          {heads.map((a, i) => (
            <g key={i}>
              <line x1={Math.cos(a) * 14} y1={Math.sin(a) * 14} x2={Math.cos(a) * 48} y2={Math.sin(a) * 48} stroke={tail} strokeWidth={3} strokeLinecap="round" />
              <circle cx={Math.cos(a) * 58} cy={Math.sin(a) * 58} r={7} fill={TEAL} />
            </g>
          ))}
          {heads.filter((_, i) => i % 2 === 0).map((a, i) => (<circle key={"i" + i} cx={Math.cos(a + 0.2) * 90} cy={Math.sin(a + 0.2) * 90} r={5.5} fill={AMBER} />))}
          <text x={0} y={4} textAnchor="middle" fontSize={13} fill={soft} fontFamily={FONT}>core</text>
        </g>
        <text x={760} y={252} textAnchor="middle" fontSize={13} fill={soft} fontFamily={FONT}>tails inside, heads outside</text>
        {cap(760, l3)}
        {arrow(890, "entangle")}
        <g fill="none" stroke={TEAL} strokeWidth={3} strokeLinecap="round">
          <path d="M960,70 C1010,110 1060,60 1130,100" />
          <path d="M955,200 C1010,150 1070,210 1135,170" />
          <path d="M990,60 C975,120 1030,170 1010,235" />
          <path d="M1070,55 C1090,120 1040,150 1075,238" />
          <path d="M1120,70 C1110,130 1150,170 1118,230" />
          <path d="M950,140 C1000,125 1040,135 1100,125" />
        </g>
        {[[1000, 92], [1052, 113], [1018, 148], [1076, 150], [1105, 118], [1004, 205], [1090, 195]].map((q, i) => (<circle key={i} cx={q[0]} cy={q[1]} r={4.5} fill={AMBER} />))}
        {cap(1045, l4)}
        <text x={600} y={352} textAnchor="middle" fontSize={13} fill={soft} fontFamily={FONT}>{note}</text>
      </svg>
    </div>
  )
}

PASelfAssembly.defaultProps = { theme: "light", l1: "1  Dissolved PA", l2: "2  Charges screened", l3: "3  Cylindrical nanofibre", l4: "4  Entangled network", note: "Simplified schematic, not to scale. The final PA sequence is fixed after Earth trials." }
