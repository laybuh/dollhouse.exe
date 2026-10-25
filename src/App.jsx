import { useEffect, useRef, useState } from 'react'
import { startRoom } from './room'
import { DEFAULT_LOOK, HAIRS, HIJABS, TOPS, BOTTOMS, DRESSES, BODIES, GW, GH, buildDoll, drawDoll } from './girl'

const STORE = 'dollie-look-v5'
const HEX = /^#?([0-9a-f]{6})$/i
const ICON = 3
const LINES = {
  intro: 'Welcome to dollie.exe, a cozy dress-up game with an aesthetic atmosphere! Play the game to give me a whole new look.',
  playing: 'Click the arrows to try on different styles. Use the color picker to change the colors. When you love your look, you can download it!',
  rules: "Here's how to play and how you can use your dolls. Come back whenever you're ready to play!"
}

const HOW_TO = [
  ['', <>press <b>play game</b> to open the closet, letting you start styling.</>],
  ['', 'flip through the sections to mix and match pieces for your look.'],
  ['dresses vs. separates:', 'picking a dress swaps out the tops and bottoms, and picking tops or bottoms swaps them back in.'],
  ['colors:', 'use the color picker or type in a hex code to recolor any section.'],
  ['download', 'saves your doll as a small transparent png icon.'],
  ['reset', 'brings back the default look.'],
  ['extras:', 'click dollie to make her hop, and click the lamp to turn the light on or off.'],
  ['', 'your look saves automatically in this browser, so it will be here when you come back.']
]

const USAGE = [
  ['free for personal use.', 'use your dolls as avatars, profile pictures, fan art, or whatever else you like.'],
  ['give credit', 'to layba.dev whenever you share or post them.'],
  ['no commercial use', 'without a license. that means no selling, merch, ads, or client work.'],
  ['', <>if you need a license, reach out through my <a href="https://layba.dev/contact" target="_blank" rel="noreferrer">contact form</a> or email <a href="mailto:hello@layba.dev">hello@layba.dev</a>.</>]
]

function RulesPage() {
  return (
    <section className="rules-page" aria-label="rules">
      <div className="rules-col">
        <h2>how to play</h2>
        <ul>
          {HOW_TO.map(([term, text], i) => <li key={i}>{term && <b>{term}</b>} {text}</li>)}
        </ul>
      </div>
      <div className="rules-col">
        <h2>usage rules</h2>
        <ul>
          {USAGE.map(([term, text], i) => <li key={i}>{term && <b>{term}</b>} {text}</li>)}
        </ul>
        <p className="rules-license">
          dollie.exe is licensed under <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noreferrer">CC BY-NC 4.0</a>. &copy; 2026 layba.dev
        </p>
      </div>
    </section>
  )
}

function loadLook() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE))
    return saved ? { ...DEFAULT_LOOK, ...saved } : DEFAULT_LOOK
  } catch {
    return DEFAULT_LOOK
  }
}

const CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function textChunk(key, value) {
  const data = new TextEncoder().encode(`tEXt${key}\0${value}`)
  const out = new Uint8Array(data.length + 8)
  const view = new DataView(out.buffer)
  view.setUint32(0, data.length - 4)
  out.set(data, 4)
  let c = 0xffffffff
  for (const b of data) c = CRC[(c ^ b) & 255] ^ (c >>> 8)
  view.setUint32(data.length + 4, (c ^ 0xffffffff) >>> 0)
  return out
}

function downloadLook(look) {
  const c = document.createElement('canvas')
  c.width = GW * ICON
  c.height = GH * ICON
  drawDoll(c.getContext('2d'), buildDoll(look), 0, 0, ICON)
  c.toBlob(async (blob) => {
    const png = new Uint8Array(await blob.arrayBuffer())
    const end = png.length - 12
    const credited = new Blob([
      png.slice(0, end),
      textChunk('Author', 'layba.dev'),
      textChunk('Comment', 'made with dollie.exe by layba.dev'),
      png.slice(end)
    ], { type: 'image/png' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(credited)
    a.download = 'dollie.png'
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  })
}

function HexInput({ label, value, onChange }) {
  const commit = (e) => {
    const m = e.target.value.trim().match(HEX)
    if (m) onChange(`#${m[1].toLowerCase()}`)
    else e.target.value = value
  }

  return (
    <div className="hex">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} aria-label={`${label} color`} />
      <input
        key={value}
        type="text"
        defaultValue={value}
        spellCheck="false"
        maxLength={7}
        aria-label={`${label} hex code`}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur() }}
      />
    </div>
  )
}

function Stepper({ label, index, count, onStep, dim, zeroLabel }) {
  return (
    <div className={dim ? 'step step-dim' : 'step'}>
      <span className="step-label">{label}</span>
      <button type="button" className="mini-arrow" aria-label={`previous ${label}`} onClick={() => onStep(-1)}>&lt;</button>
      <span className="step-count">{zeroLabel && index === 0 ? zeroLabel : zeroLabel ? `${index}/${count - 1}` : `${index + 1}/${count}`}</span>
      <button type="button" className="mini-arrow" aria-label={`next ${label}`} onClick={() => onStep(1)}>&gt;</button>
    </div>
  )
}

const cycle = (list, current, dir) => list[(Math.max(0, list.indexOf(current)) + dir + list.length) % list.length]

function App() {
  const mainRef = useRef(null)
  const grainRef = useRef(null)
  const roomRef = useRef(null)
  const [look, setLook] = useState(loadLook)
  const [playing, setPlaying] = useState(false)
  const [pick, setPick] = useState('skin')
  const [rules, setRules] = useState(false)

  useEffect(() => {
    const room = startRoom(mainRef.current, grainRef.current)
    roomRef.current = room
    return room.stop
  }, [])

  useEffect(() => {
    roomRef.current?.setLook(look)
    try {
      localStorage.setItem(STORE, JSON.stringify(look))
    } catch {
      return
    }
  }, [look])

  const dressOn = look.dress !== 'none'
  const hijabOn = look.hijab !== 'none'
  const swatches = [
    ['skin', 'skin'],
    hijabOn ? ['hijabColor', 'hijab'] : ['hair', 'hair'],
    ['brows', 'brows'], ['eyes', 'eyes'], ['lips', 'lips'], ['blush', 'blush'],
    ...(dressOn ? [['dressColor', 'dress']] : [['topColor', 'top'], ['bottomColor', 'bottom']]),
    ...(!dressOn && look.bottom === 'pleated' ? [['socks', 'socks']] : []),
    ['shoes', 'shoes']
  ]
  const active = swatches.find(([key]) => key === pick) || swatches[0]
  const hairIndex = Math.max(0, HAIRS.findIndex(h => h.hairStyle === look.hairStyle && h.hairLength === look.hairLength && h.bangs === look.bangs))

  const stepHair = (dir) => setLook(l => ({ ...l, ...HAIRS[(hairIndex + dir + HAIRS.length) % HAIRS.length] }))
  const stepIn = (key, list, extra = {}) => (dir) => setLook(l => ({ ...l, [key]: cycle(list, l[key], dir), ...extra }))

  return (
    <main className="app">
      <div className="stage">
        <div className="room">
          <canvas ref={mainRef} className="room-main" width="376" height="197" aria-label="Dollie's bedroom" />
          <canvas ref={grainRef} className="room-grain" width="376" height="197" aria-hidden="true" />
          <span className="room-sign" aria-hidden="true">dollie.exe</span>
          <div className="room-vignette" aria-hidden="true" />
          {!playing && !rules && (
            <button type="button" className="play" onClick={() => setPlaying(true)}>play game</button>
          )}
        </div>

        {rules && <RulesPage />}
        <button type="button" className="rules-btn" aria-pressed={rules} onClick={() => setRules(r => !r)}>
          {rules ? 'back' : 'rules'}
        </button>

        {playing && !rules && (
          <section className="closet" aria-label="closet">
            <header className="closet-bar">
              <span>closet.exe</span>
              <button type="button" className="closet-close" aria-label="Close closet" onClick={() => setPlaying(false)}>&times;</button>
            </header>
            <div className="closet-body">
              <div className="steps">
                <Stepper label="body" index={BODIES.indexOf(look.body)} count={BODIES.length} onStep={stepIn('body', BODIES)} />
                <Stepper label="hair" index={hairIndex} count={HAIRS.length} onStep={stepHair} dim={hijabOn} />
                <Stepper label="hijab" index={HIJABS.indexOf(look.hijab)} count={HIJABS.length} onStep={stepIn('hijab', HIJABS)} zeroLabel="off" />
                <Stepper label="tops" index={TOPS.indexOf(look.top)} count={TOPS.length} onStep={stepIn('top', TOPS, { dress: 'none' })} dim={dressOn} />
                <Stepper label="bottoms" index={BOTTOMS.indexOf(look.bottom)} count={BOTTOMS.length} onStep={stepIn('bottom', BOTTOMS, { dress: 'none' })} dim={dressOn} />
                <Stepper label="dresses" index={DRESSES.indexOf(look.dress)} count={DRESSES.length} onStep={stepIn('dress', DRESSES)} zeroLabel="off" />
              </div>
              <div className="palette">
                <div className="swatches">
                  {swatches.map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      className={key === active[0] ? 'swatch swatch-on' : 'swatch'}
                      aria-pressed={key === active[0]}
                      onClick={() => setPick(key)}
                    >
                      <span className="swatch-chip" style={{ background: look[key] }} />
                      {label}
                    </button>
                  ))}
                </div>
                <p className="hex-hint"><span aria-hidden="true">&#9660;</span> Use the color picker or type a hex code to change colors.</p>
                <HexInput label={active[1]} value={look[active[0]]} onChange={(v) => setLook(l => ({ ...l, [active[0]]: v, ...(active[0] === 'blush' ? { blushOn: true } : {}) }))} />
                {active[0] === 'blush' && (
                  <button type="button" className="mini-toggle" aria-pressed={!look.blushOn} onClick={() => setLook(l => ({ ...l, blushOn: !l.blushOn }))}>
                    {look.blushOn ? 'remove blush' : 'add blush'}
                  </button>
                )}
              </div>
              <div className="closet-actions">
                <button type="button" className="btn" onClick={() => downloadLook(look)}>download</button>
                <button type="button" className="btn btn-ghost" onClick={() => setLook(DEFAULT_LOOK)}>reset</button>
              </div>
            </div>
          </section>
        )}
      </div>

      <div className="vn-box">
        <span className="vn-name">DOLLIE</span>
        <p className="vn-line">{rules ? LINES.rules : playing ? LINES.playing : LINES.intro}</p>
      </div>

      <footer className="credit">
        &copy; 2026 <a href="https://layba.dev" target="_blank" rel="noreferrer">layba.dev</a>
      </footer>
    </main>
  )
}

export default App
