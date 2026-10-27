import { useEffect, useRef, useState } from 'react'
import { startRoom, DEFAULT_ROOM } from './room'
import { DEFAULT_LOOK, HAIRS, HIJABS, isHijab, TOPS, BOTTOMS, DRESSES, BODIES, FULLNESS, NECKS, SHOES, GW, GH, buildDoll, drawDoll, shade } from './girl'

const STORE = 'dollie-look-v5'
const HEX = /^#?([0-9a-f]{6})$/i
const ICON = 3
const ROOM_SCALE = 4
const ROOM_STORE = 'dollie-room-v1'
const LINES = {
  intro: 'Welcome to dollie.exe, a cozy dress-up game with an aesthetic atmosphere! Play the game to give me and my room a whole new look.',
  playing: 'Click the arrows to try on different styles. Use the color picker to change the colors. When you love your look, you can download it!',
  rules: "Here's how to play and how you can use your dolls. Come back whenever you're ready to play!"
}

const HOW_TO = [
  ['', <>press the <b>play game</b> button to open the closet and start styling.</>],
  ['', 'flip through the sections to mix and match pieces for your look.'],
  ['dresses vs. separates:', 'picking a dress swaps out the tops and bottoms, and picking tops or bottoms swaps them back in.'],
  ['colors:', 'use the color picker or type in a hex code to recolor any section.'],
  ['room:', 'switch to the room colors to recolor the walls, floor, bed, rug, furniture, mirror, lamp, heart, computer, and sign. the name box at the top of the closet changes what your sign says, and it shows up in your room download.'],
  ['download', 'just your doll or download your whole room too.'],
  ['reset', 'brings back the default look.'],
  ['extras:', 'click dollie to make her hop, and click the lamp to turn the light on or off.'],
  ['', 'your look saves automatically in this browser, so it will be here when you come back.']
]

const DESKTOP = [
  ['move:', 'drag the closet.exe title bar to move it around the room.'],
  ['resize:', 'drag any edge or corner of closet.exe to make it bigger or smaller. it stops shrinking at the size where everything still fits.'],
  ['minimize:', 'press the dash to tuck closet.exe away at the bottom of the room so you can see your whole look. press the arrow on the little bar to bring it back.'],
  ['maximize:', 'press the square to make closet.exe fill the whole screen, and press it again to return to its normal size.']
]

const MOBILE = [
  ['closet:', 'closet.exe sits right under the room, so scroll down to find it. use the avatar and room tabs at the top to switch between styling your doll and styling your room.'],
  ['look around:', 'tap the little arrow in the corner of the room to look left or right and see the rest of the room.']
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
        <h2>controls</h2>
        <h3>on desktop</h3>
        <ul>
          {DESKTOP.map(([term, text], i) => <li key={i}>{term && <b>{term}</b>} {text}</li>)}
        </ul>
        <h3>on mobile</h3>
        <ul>
          {MOBILE.map(([term, text], i) => <li key={i}>{term && <b>{term}</b>} {text}</li>)}
        </ul>
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

function load(key, fallback) {
  try {
    const saved = JSON.parse(localStorage.getItem(key))
    return saved ? { ...fallback, ...saved } : fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    return
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
  const out = document.createElement('canvas')
  out.width = c.width
  out.height = c.height
  const octx = out.getContext('2d')
  octx.filter = 'contrast(1.05) saturate(1.1)'
  octx.drawImage(c, 0, 0)
  saveCredited(out, 'dollie.png')
}

async function downloadRoom(room, colors) {
  await document.fonts.load('40px "Allura"')
  const c = document.createElement('canvas')
  c.width = room.width * ROOM_SCALE
  c.height = room.height * ROOM_SCALE
  const ctx = c.getContext('2d')
  ctx.imageSmoothingEnabled = false
  ctx.filter = 'contrast(1.05) saturate(1.1)'
  ctx.drawImage(room, 0, 0, c.width, c.height)
  ctx.filter = 'none'
  ctx.save()
  ctx.translate(c.width * 0.4, c.height * 0.45)
  ctx.scale(c.width / c.height, 1)
  const r = Math.hypot(0.6 * c.height, 0.55 * c.height)
  const v = ctx.createRadialGradient(0, 0, 0, 0, 0, r)
  v.addColorStop(0.35, 'rgba(5,2,8,0)')
  v.addColorStop(1, 'rgba(5,2,8,0.65)')
  ctx.fillStyle = v
  ctx.fillRect(-c.width, -c.height, c.width * 2, c.height * 2)
  ctx.restore()
  const text = (colors.signText || '').trim() || 'dollie.exe'
  const sign = colors.sign || '#ff4fae'
  ctx.font = `${Math.round(c.width * Math.min(0.07, 0.7 / text.length))}px "Allura"`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.lineWidth = Math.max(1, c.width * 0.0012)
  ctx.strokeStyle = sign === '#ff4fae' ? '#ffc4e1' : shade(sign, 0.55)
  ctx.shadowColor = sign
  ctx.shadowBlur = c.width * 0.012
  for (let i = 0; i < 3; i++) ctx.strokeText(text, c.width * 0.81, c.height * 0.18)
  saveCredited(c, 'dollie-room.png')
}

function saveCredited(c, name) {
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
    a.download = name
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

function Stepper({ label, onStep, dim, onAll }) {
  return (
    <div className={dim ? 'step step-dim' : 'step'}>
      <span className="step-label">{label}</span>
      <button type="button" className="mini-arrow" aria-label={`previous ${label}`} onClick={() => onStep(-1)}>&lt;</button>
      <button type="button" className="mini-arrow" aria-label={`next ${label}`} onClick={() => onStep(1)}>&gt;</button>
      <button type="button" className="all-btn" aria-label={`see all ${label}`} onClick={onAll}>all</button>
    </div>
  )
}

const CROPS = { hair: [0, 36, 3], headwear: [0, 36, 3], face: [2, 28, 4], neck: [2, 28, 4], shoes: [44, 24, 3] }

function Thumb({ look, crop }) {
  const ref = useRef(null)
  const [top, rows, scale] = crop || [0, GH, 2]

  useEffect(() => {
    const ctx = ref.current.getContext('2d')
    ctx.clearRect(0, 0, ref.current.width, ref.current.height)
    drawDoll(ctx, buildDoll(look), 0, -top * scale, scale)
  }, [look, top, scale])

  return <canvas ref={ref} width={GW * scale} height={rows * scale} />
}

function PickerWindow({ name, options, onPick, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="picker-backdrop" onPointerDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <section className="picker" role="dialog" aria-label={`${name} options`}>
        <header className="closet-bar">
          <span>{name}.exe</span>
          <button type="button" className="closet-close" aria-label="Close" onClick={onClose}>&times;</button>
        </header>
        <div className="picker-grid">
          {options.map(o => (
            <button key={o.id} type="button" className={o.on ? 'pick pick-on' : 'pick'} aria-pressed={o.on} aria-label={`${name} ${o.label}`} onClick={() => onPick(o)}>
              {o.empty ? <span className="pick-off">off</span> : <Thumb look={o.look} crop={CROPS[name]} />}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

const cycle = (list, current, dir) => list[(Math.max(0, list.indexOf(current)) + dir + list.length) % list.length]

function App() {
  const mainRef = useRef(null)
  const grainRef = useRef(null)
  const roomRef = useRef(null)
  const [look, setLook] = useState(() => load(STORE, DEFAULT_LOOK))
  const [roomColors, setRoomColors] = useState(() => load(ROOM_STORE, DEFAULT_ROOM))
  const [playing, setPlaying] = useState(false)
  const [pick, setPick] = useState('skin')
  const [mode, setMode] = useState('avatar')
  const [picker, setPicker] = useState(null)
  const [rules, setRules] = useState(false)
  const [lookRight, setLookRight] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [maxed, setMaxed] = useState(false)
  const [geo, setGeo] = useState(null)
  const closetRef = useRef(null)
  const dragRef = useRef(null)

  useEffect(() => {
    const room = startRoom(mainRef.current, grainRef.current)
    roomRef.current = room
    return room.stop
  }, [])

  useEffect(() => {
    roomRef.current?.setLook(look)
    save(STORE, look)
  }, [look])

  useEffect(() => {
    roomRef.current?.setColors(roomColors)
    save(ROOM_STORE, roomColors)
  }, [roomColors])

  const signText = (roomColors.signText || '').trim() || 'dollie.exe'
  const signStyle = {
    fontSize: `${Math.min(7, 70 / signText.length)}cqw`,
    ...(roomColors.sign && roomColors.sign !== '#ff4fae' ? { '--sign-hi': shade(roomColors.sign, 0.55), '--sign-mid': shade(roomColors.sign, 0.3), '--sign-deep': roomColors.sign } : {})
  }

  useEffect(() => {
    const reset = () => setGeo(null)
    window.addEventListener('resize', reset)
    return () => window.removeEventListener('resize', reset)
  }, [])

  const begin = (mode, dir) => (e) => {
    const el = closetRef.current
    if (!el || maxed || minimized || e.target.closest('button') || window.matchMedia('(max-width: 700px)').matches) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { mode, dir, sx: e.clientX, sy: e.clientY, g: geo || { l: el.offsetLeft, t: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight } }
  }

  const drag = (e) => {
    const d = dragRef.current
    const el = closetRef.current
    if (!d || !el) return
    const pw = el.offsetParent.clientWidth
    const ph = el.offsetParent.clientHeight
    const minW = pw * 0.56
    const minH = ph * 0.6
    const dx = e.clientX - d.sx
    const dy = e.clientY - d.sy
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(v, hi))
    let { l, t, w, h } = d.g
    if (d.mode === 'move') {
      l = clamp(d.g.l + dx, 0, pw - w)
      t = clamp(d.g.t + dy, 0, ph - h)
    } else {
      if (d.dir.includes('e')) w = clamp(d.g.w + dx, minW, pw - d.g.l)
      if (d.dir.includes('s')) h = clamp(d.g.h + dy, minH, ph - d.g.t)
      if (d.dir.includes('w')) { w = clamp(d.g.w - dx, minW, d.g.l + d.g.w); l = d.g.l + d.g.w - w }
      if (d.dir.includes('n')) { h = clamp(d.g.h - dy, minH, d.g.t + d.g.h); t = d.g.t + d.g.h - h }
    }
    setGeo({ l, t, w, h })
  }

  const endDrag = () => { dragRef.current = null }

  const dressOn = look.dress !== 'none'
  const hijabOn = isHijab(look.hijab)
  const headOn = look.hijab !== 'none'
  const swatches = [
    ['skin', 'skin'],
    ...(hijabOn ? [] : [['hair', 'hair']]),
    ...(headOn ? [['hijabColor', 'headwear']] : []),
    ['brows', 'brows'], ['eyes', 'eyes'], ['lips', 'lips'], ['liner', 'lip liner'], ['blush', 'blush'],
    ...(dressOn ? [['dressColor', 'dress']] : [['topColor', 'top'], ['bottomColor', 'bottom']]),
    ...(look.shoe === 'kneeboots' || (dressOn ? ['long', 'abaya'].includes(look.dress) : ['pants', 'wideleg', 'maxi'].includes(look.bottom)) ? [] : [['socks', 'socks']]),
    ['shoes', 'shoes']
  ]
  const roomSwatches = [['wall', 'wall'], ['floor', 'floor'], ['bed', 'bed'], ['rug', 'rug'], ['furniture', 'furniture'], ['mirror', 'mirror'], ['lamp', 'lamp'], ['heart', 'heart'], ['computer', 'computer'], ['sign', 'sign']]
  const isRoom = roomSwatches.some(([key]) => key === pick)
  const active = (isRoom ? roomSwatches : swatches).find(([key]) => key === pick) || swatches[0]
  const activeValue = isRoom ? roomColors[active[0]] : look[active[0]]
  const setActive = (v) => isRoom
    ? setRoomColors(r => ({ ...r, [active[0]]: v }))
    : setLook(l => ({ ...l, [active[0]]: v, ...(active[0] === 'blush' ? { blushOn: true } : {}), ...(active[0] === 'liner' ? { linerOn: true } : {}), ...(active[0] === 'socks' ? { socksOn: true } : {}) }))
  const swatchButton = ([key, label], value) => (
    <button
      key={key}
      type="button"
      className={key === active[0] ? 'swatch swatch-on' : 'swatch'}
      aria-pressed={key === active[0]}
      onClick={() => setPick(key)}
    >
      <span className="swatch-chip" style={{ background: value }} />
      {label}
    </button>
  )
  const hairIndex = Math.max(0, HAIRS.findIndex(h => h.hairStyle === look.hairStyle && h.hairLength === look.hairLength && h.bangs === look.bangs))

  const stepHair = (dir) => setLook(l => ({ ...l, ...HAIRS[(hairIndex + dir + HAIRS.length) % HAIRS.length] }))
  const stepIn = (key, list, extra = {}) => (dir) => setLook(l => ({ ...l, [key]: cycle(list, l[key], dir), ...extra }))

  const pickers = {
    body: () => BODIES.map(b => ({ id: b, label: b, on: look.body === b, look: { ...look, body: b }, apply: { body: b } })),
    face: () => FULLNESS.map(f => ({ id: f, label: f, on: look.fullness === f, look: { ...look, fullness: f }, apply: { fullness: f } })),
    neck: () => NECKS.map(f => ({ id: f, label: f, on: look.neck === f, look: { ...look, neck: f }, apply: { neck: f } })),
    shoes: () => SHOES.map(s => ({ id: s, label: s, on: look.shoe === s, look: { ...look, shoe: s }, apply: { shoe: s } })),
    hair: () => HAIRS.map((h, i) => ({ id: i, label: String(i + 1), on: i === hairIndex && !hijabOn, look: { ...look, ...h, ...(hijabOn ? { hijab: 'none' } : {}) }, apply: { ...h, ...(hijabOn ? { hijab: 'none' } : {}) } })),
    headwear: () => HIJABS.map(k => ({ id: k, label: k, empty: k === 'none', on: look.hijab === k, look: { ...look, hijab: k }, apply: { hijab: k } })),
    tops: () => TOPS.map(t => ({ id: t, label: t, on: !dressOn && look.top === t, look: { ...look, top: t, dress: 'none' }, apply: { top: t, dress: 'none' } })),
    bottoms: () => BOTTOMS.map(b => ({ id: b, label: b, on: !dressOn && look.bottom === b, look: { ...look, bottom: b, dress: 'none' }, apply: { bottom: b, dress: 'none' } })),
    dresses: () => DRESSES.map(d => ({ id: d, label: d, empty: d === 'none', on: look.dress === d, look: { ...look, dress: d }, apply: { dress: d } }))
  }

  return (
    <main className={playing ? 'app' : 'app app-intro'}>
      <div className="stage">
        <div className="view">
          <div className={lookRight ? 'room room-right' : 'room'}>
            <canvas ref={mainRef} className="room-main" width="376" height="197" aria-label="Dollie's bedroom" />
            <canvas ref={grainRef} className="room-grain" width="376" height="197" aria-hidden="true" />
            <span className="room-sign" aria-hidden="true" style={signStyle}>{signText}</span>
            <div className="room-vignette" aria-hidden="true" />
          </div>
          {!playing && !rules && (
            <button type="button" className="play" onClick={() => { setPlaying(true); setLookRight(false) }}>play game</button>
          )}
          {lookRight
            ? <button type="button" className="look-arrow look-left" aria-label="Look left" onClick={() => setLookRight(false)}>&lt;</button>
            : <button type="button" className="look-arrow look-right" aria-label="Look right" onClick={() => setLookRight(true)}>&gt;</button>}
        </div>

        {rules && <RulesPage />}
        <button type="button" className="rules-btn" aria-pressed={rules} aria-label={rules ? 'back' : 'rules'} onClick={() => setRules(r => !r)}>
          {rules ? 'back' : <><span className="rules-word">rules</span><span className="rules-q">?</span></>}
        </button>

        {playing && !rules && (
          <section ref={closetRef} className={`closet${minimized ? ' closet-min' : ''}${maxed && !minimized ? ' closet-max' : ''}`} aria-label="closet" style={geo && !maxed && !minimized ? { left: geo.l, top: geo.t, width: geo.w, height: geo.h, maxWidth: 'none', maxHeight: 'none' } : undefined}>
            <header className="closet-bar" onPointerDown={begin('move')} onPointerMove={drag} onPointerUp={endDrag} onPointerCancel={endDrag}>
              <h2>closet.exe</h2>
              <span className="closet-btns">
                {minimized ? (
                  <button type="button" className="closet-close" aria-label="Restore closet" onClick={() => setMinimized(false)}>&#9650;</button>
                ) : (
                  <>
                    <button type="button" className="closet-close closet-min-btn" aria-label="Minimize closet" onClick={() => setMinimized(true)}>&ndash;</button>
                    <button type="button" className="closet-close closet-max-btn" aria-label={maxed ? 'Restore closet size' : 'Maximize closet'} aria-pressed={maxed} onClick={() => setMaxed(m => !m)}>{maxed ? '❐' : '□'}</button>
                    <button type="button" className="closet-close" aria-label="Close closet" onClick={() => setPlaying(false)}>&times;</button>
                  </>
                )}
              </span>
            </header>
            <div className="closet-body" data-mode={mode}>
              <label className="sign-name">
                <span>neon sign label:</span>
                <input
                  type="text"
                  value={roomColors.signText ?? 'dollie.exe'}
                  maxLength={14}
                  spellCheck="false"
                  onChange={(e) => setRoomColors(r => ({ ...r, signText: e.target.value }))}
                />
              </label>
              <div className="mode-tabs">
                {['avatar', 'room'].map(m => (
                  <button key={m} type="button" className={mode === m ? 'mode-tab mode-tab-on' : 'mode-tab'} aria-pressed={mode === m} onClick={() => { setMode(m); setPick(m === 'room' ? 'wall' : 'skin') }}>
                    {m}
                  </button>
                ))}
              </div>
              <div className="steps only-avatar">
                <Stepper label="body" onStep={stepIn('body', BODIES)} onAll={() => setPicker('body')} />
                <Stepper label="face" onStep={stepIn('fullness', FULLNESS)} onAll={() => setPicker('face')} />
                <Stepper label="neck" onStep={stepIn('neck', NECKS)} onAll={() => setPicker('neck')} />
                <Stepper label="hair" onStep={stepHair} dim={hijabOn} onAll={() => setPicker('hair')} />
                <Stepper label="headwear" onStep={stepIn('hijab', HIJABS)} onAll={() => setPicker('headwear')} />
                <Stepper label="tops" onStep={stepIn('top', TOPS, { dress: 'none' })} dim={dressOn} onAll={() => setPicker('tops')} />
                <Stepper label="bottoms" onStep={stepIn('bottom', BOTTOMS, { dress: 'none' })} dim={dressOn} onAll={() => setPicker('bottoms')} />
                <Stepper label="shoes" onStep={stepIn('shoe', SHOES)} onAll={() => setPicker('shoes')} />
                <Stepper label="dresses" onStep={stepIn('dress', DRESSES)} dim={!dressOn} onAll={() => setPicker('dresses')} />
              </div>
              <div className="palette">
                <span className="swatch-group swatch-group-doll only-avatar">doll</span>
                <div className="swatches only-avatar">
                  {swatches.map((s) => swatchButton(s, look[s[0]]))}
                </div>
                <span className="swatch-group only-room">room</span>
                <div className="swatches only-room">
                  {roomSwatches.map((s) => swatchButton(s, roomColors[s[0]]))}
                </div>
                <p className="hex-hint"><span aria-hidden="true">&#9660;</span> Use the color picker or type a hex code to change colors.</p>
                <HexInput label={active[1]} value={activeValue} onChange={setActive} />
                {active[0] === 'blush' && (
                  <button type="button" className="mini-toggle" aria-pressed={!look.blushOn} onClick={() => setLook(l => ({ ...l, blushOn: !l.blushOn }))}>
                    {look.blushOn ? 'remove blush' : 'add blush'}
                  </button>
                )}
                {active[0] === 'socks' && (
                  <button type="button" className="mini-toggle" aria-pressed={look.socksOn === false} onClick={() => setLook(l => ({ ...l, socksOn: l.socksOn === false }))}>
                    {look.socksOn === false ? 'add socks' : 'remove socks'}
                  </button>
                )}
                {active[0] === 'liner' && (
                  <button type="button" className="mini-toggle" aria-pressed={look.linerOn} onClick={() => setLook(l => ({ ...l, linerOn: !l.linerOn }))}>
                    {look.linerOn ? 'remove lip liner' : 'add lip liner'}
                  </button>
                )}
              </div>
              <div className="closet-actions">
                <button type="button" className="btn" onClick={() => downloadLook(look)}>download doll</button>
                <button type="button" className="btn" onClick={() => downloadRoom(mainRef.current, roomColors)}>download room</button>
                <button type="button" className="btn btn-ghost" onClick={() => { setLook(DEFAULT_LOOK); setRoomColors(DEFAULT_ROOM) }}>reset</button>
              </div>
            </div>
            {!minimized && !maxed && ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].map((dir) => (
              <span key={dir} className={`closet-handle closet-handle-${dir}`} aria-hidden="true" onPointerDown={begin('resize', dir)} onPointerMove={drag} onPointerUp={endDrag} onPointerCancel={endDrag} />
            ))}
          </section>
        )}
      </div>

      {picker && (
        <PickerWindow
          name={picker}
          options={pickers[picker]()}
          onPick={(o) => { setLook(l => ({ ...l, ...o.apply })); setPicker(null) }}
          onClose={() => setPicker(null)}
        />
      )}

      <div className="vn-box">
        <span className="vn-name">DOLLIE</span>
        <h1 className="vn-line">{rules ? LINES.rules : playing ? LINES.playing : LINES.intro}</h1>
      </div>
    </main>
  )
}

export default App
