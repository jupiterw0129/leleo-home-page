// 阿蒙 Shimeji

const BASE = '/shimeji/'
const GRAVITY = 0.5
const MAX_INSTANCES = 10
const SPLIT_COOLDOWN_MIN = 20000
const SPLIT_COOLDOWN_MAX = 35000

const images = {}
for (let i = 1; i <= 46; i++) {
  const img = new Image()
  img.src = BASE + 'shime' + i + '.png'
  images['shime' + i] = img
}

const ANIMS = {
  stand:    { f: ['shime1'],                              ax: 64, ay: 128, d: Infinity },
  walk:     { f: ['shime1','shime2','shime1','shime3'],   ax: 64, ay: 128, d: 150 },
  fall:     { f: ['shime4'],                              ax: 64, ay: 128, d: Infinity },
  bounce:   { f: ['shime18','shime19'],                   ax: 64, ay: 128, d: 80 },
  sit:      { f: ['shime11'],                             ax: 64, ay: 128, d: Infinity },
  lie:      { f: ['shime21'],                             ax: 64, ay: 128, d: Infinity },
  crawl:    { f: ['shime20','shime20','shime21','shime21'], ax: 64, ay: 128, d: 150 },
  breed:    { f: ['shime1','shime38','shime39','shime40','shime41'], ax: 64, ay: 128, d: 150 },
  dragged:  { f: ['shime9'],                              ax: 64, ay: 128, d: Infinity },
  resist:   { f: ['shime5','shime6'],                     ax: 64, ay: 128, d: 80 },
}

class Shimeji {
  constructor(x, y) {
    this.x = x; this.y = y
    this.vx = 0; this.vy = 0
    this.facingRight = Math.random() > 0.5
    this.state = 'fall'; this.anim = 'fall'
    this.fIdx = 0; this.fTimer = 0; this.sTimer = 0
    this.onFloor = false; this.walkDir = 1
  }

  update(dt) {
    if (this.state === 'dragged') return
    const s = dt / 16.67
    this.vy += GRAVITY * s
    this.x += this.vx * s
    this.y += this.vy * s

    const floor = window.innerHeight - 65
    if (this.y >= floor && this.vy >= 0) {
      if (Math.abs(this.vy) > 4 && this.state === 'fall') {
        this.vy = -Math.abs(this.vy) * 0.35
        this.anim = 'bounce'; this.fIdx = 0
      } else {
        this.y = floor; this.vy = 0
        if (!this.onFloor) { this.onFloor = true; this.changeState('stand') }
      }
    } else if (this.y < floor - 10) {
      this.onFloor = false
    }

    if (this.x < 30) { this.x = 30; this.walkDir = 1; this.facingRight = true }
    if (this.x > window.innerWidth - 30) { this.x = window.innerWidth - 30; this.walkDir = -1; this.facingRight = false }

    this.sTimer += dt; this.fTimer += dt
    const anim = ANIMS[this.anim]
    if (anim && this.fTimer >= anim.d) { this.fTimer = 0; this.fIdx = (this.fIdx + 1) % anim.f.length }

    if (this.state === 'stand') {
      if (this.sTimer > 2000 + Math.random() * 3000) {
        const r = Math.random(); this.changeState(r < 0.6 ? 'walk' : r < 0.9 ? 'sit' : 'lie')
      }
    } else if (this.state === 'walk') {
      this.x += this.walkDir * 2 * s; this.facingRight = this.walkDir > 0
      if (this.sTimer > 3000 + Math.random() * 4000) {
        if (Math.random() < 0.3) this.changeState('sit')
        else { this.walkDir = Math.random() > 0.5 ? 1 : -1; this.facingRight = this.walkDir > 0; this.sTimer = 0 }
      }
    } else if (this.state === 'sit') {
      if (this.sTimer > 4000 + Math.random() * 6000) this.changeState('stand')
    } else if (this.state === 'lie') {
      if (this.sTimer > 3000 + Math.random() * 5000) this.changeState('stand')
    } else if (this.state === 'breed') {
      if (this.sTimer > 900) this.changeState('stand')
    }

    if (this.anim === 'bounce' && this.sTimer > 200 && this.vy < 0) this.anim = 'fall'
  }

  changeState(s) {
    this.state = s; this.sTimer = 0; this.fIdx = 0; this.fTimer = 0
    switch (s) {
      case 'stand': this.anim = 'stand'; this.vx = 0; break
      case 'walk': this.anim = 'walk'; this.walkDir = this.facingRight ? 1 : -1; break
      case 'sit': this.anim = 'sit'; this.vx = 0; break
      case 'lie': this.anim = 'lie'; this.vx = 0; break
      case 'fall': this.anim = 'fall'; break
      case 'breed': this.anim = 'breed'; this.vx = 0; break
      case 'dragged': this.anim = 'dragged'; this.vx = 0; this.vy = 0; break
    }
  }

  draw(ctx) {
    const anim = ANIMS[this.anim]
    if (!anim) return
    const img = images[anim.f[this.fIdx % anim.f.length]]
    if (!img || !img.complete) return
    ctx.save()
    if (!this.facingRight) {
      ctx.translate(this.x, 0); ctx.scale(-1, 1)
      ctx.drawImage(img, -anim.ax, this.y - anim.ay)
    } else {
      ctx.drawImage(img, this.x - anim.ax, this.y - anim.ay)
    }
    ctx.restore()
  }

  hitTest(mx, my) {
    const anim = ANIMS[this.anim]
    const ax = anim ? anim.ax : 64; const ay = anim ? anim.ay : 128
    return mx >= this.x - ax && mx <= this.x - ax + 130 && my >= this.y - ay && my <= this.y - ay + 130
  }
}

class ShimejiManager {
  constructor(canvas) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d')
    this.instances = []; this.running = false; this.lastTime = 0
    this.splitTimer = 5000
    this.dragTarget = null; this.dragOffX = 0; this.dragOffY = 0
    this.lastClickTime = 0; this.lastClickTarget = null
    this._bF = this._frame.bind(this); this._bD = this._onDown.bind(this)
    this._bM = this._onMove.bind(this); this._bU = this._onUp.bind(this)
    this._bR = this._resize.bind(this)
  }

  start() {
    this._resize()
    window.addEventListener('resize', this._bR)
    document.addEventListener('pointerdown', this._bD)
    document.addEventListener('pointermove', this._bM)
    document.addEventListener('pointerup', this._bU)
    this.running = true; this.lastTime = performance.now()
    this._spawn(window.innerWidth / 2, -100)
    requestAnimationFrame(this._bF)
  }

  stop() {
    this.running = false
    window.removeEventListener('resize', this._bR)
    document.removeEventListener('pointerdown', this._bD)
    document.removeEventListener('pointermove', this._bM)
    document.removeEventListener('pointerup', this._bU)
    this.instances = []
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  _resize() { this.canvas.width = window.innerWidth; this.canvas.height = window.innerHeight }

  _spawn(x, y) {
    if (this.instances.length >= MAX_INSTANCES) return null
    const s = new Shimeji(x, y); this.instances.push(s); return s
  }

  _split() {
    if (this.instances.length >= MAX_INSTANCES) return
    const parent = this.instances[Math.floor(Math.random() * this.instances.length)]
    if (!parent || parent.state === 'dragged' || parent.state === 'breed' || parent.state === 'fall') return
    parent.changeState('breed')
    setTimeout(() => {
      if (this.instances.length >= MAX_INSTANCES) return
      const cx = parent.x + (parent.facingRight ? 40 : -40)
      const c = this._spawn(Math.max(30, Math.min(window.innerWidth - 30, cx)), parent.y - 10)
      if (c) { c.vy = -5; c.vx = parent.facingRight ? 3 : -3; c.changeState('fall') }
    }, 800)
  }

  _frame(now) {
    if (!this.running) return
    const dt = Math.min(50, now - this.lastTime); this.lastTime = now

    this.splitTimer += dt
    if (this.splitTimer >= SPLIT_COOLDOWN_MIN + Math.random() * (SPLIT_COOLDOWN_MAX - SPLIT_COOLDOWN_MIN)) {
      this.splitTimer = 0; this._split()
    }

    for (const s of this.instances) { if (s !== this.dragTarget) s.update(dt) }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    for (const s of this.instances) s.draw(this.ctx)
    requestAnimationFrame(this._bF)
  }

  _find(x, y) {
    for (let i = this.instances.length - 1; i >= 0; i--) {
      if (this.instances[i].hitTest(x, y)) return this.instances[i]
    }
    return null
  }

  _onDown(e) {
    const t = this._find(e.clientX, e.clientY)
    if (!t) return
    const now = Date.now()
    if (t === this.lastClickTarget && now - this.lastClickTime < 350) {
      this.instances = this.instances.filter(s => s !== t)
      this.lastClickTarget = null; this.lastClickTime = 0; return
    }
    this.lastClickTime = now; this.lastClickTarget = t
    this.dragTarget = t; this.dragOffX = t.x - e.clientX; this.dragOffY = t.y - e.clientY
    t.changeState('dragged'); document.body.style.cursor = 'grabbing'
    e.preventDefault()
  }

  _onMove(e) {
    if (!this.dragTarget) { document.body.style.cursor = this._find(e.clientX, e.clientY) ? 'grab' : ''; return }
    this.dragTarget.x = e.clientX + this.dragOffX; this.dragTarget.y = e.clientY + this.dragOffY
  }

  _onUp() {
    if (!this.dragTarget) return
    this.dragTarget.vy = Math.random() * -3 - 2; this.dragTarget.vx = (Math.random() - 0.5) * 6
    this.dragTarget.changeState('fall'); this.dragTarget = null
    document.body.style.cursor = ''
  }
}

let manager = null

export async function startShimeji() {
  if (manager) return
  const canvas = document.createElement('canvas')
  canvas.id = 'shimejiCanvas'
  canvas.style.cssText = 'position:fixed;left:0;top:0;z-index:99998;pointer-events:none;'
  document.body.appendChild(canvas)
  manager = new ShimejiManager(canvas)
  manager.start()
}

export function stopShimeji() {
  if (manager) { manager.stop(); manager = null }
  const canvas = document.getElementById('shimejiCanvas')
  if (canvas) canvas.remove()
}

export function isShimejiRunning() { return !!manager }
