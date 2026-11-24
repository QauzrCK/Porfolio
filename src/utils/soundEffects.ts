import { usePanelStore } from '../state/panelStore'

let audioCtx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (usePanelStore.getState().isMuted) return null
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return null
    audioCtx = new AudioContextClass()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

export function playBreakerClunk() {
  const ctx = getCtx()
  if (!ctx) return
  const now = ctx.currentTime

  // Low mechanical thud
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(140, now)
  osc.frequency.exponentialRampToValueAtTime(42, now + 0.09)
  gain.gain.setValueAtTime(0.28, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.12)
}

export function playDialClick() {
  const ctx = getCtx()
  if (!ctx) return
  const now = ctx.currentTime

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'square'
  osc.frequency.setValueAtTime(950, now)
  osc.frequency.exponentialRampToValueAtTime(320, now + 0.035)
  gain.gain.setValueAtTime(0.10, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.045)
}

export function playButtonPress() {
  const ctx = getCtx()
  if (!ctx) return
  const now = ctx.currentTime

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(520, now)
  osc.frequency.exponentialRampToValueAtTime(220, now + 0.045)
  gain.gain.setValueAtTime(0.14, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.055)
}

export function playEStopSlam(tripped: boolean) {
  const ctx = getCtx()
  if (!ctx) return
  const now = ctx.currentTime

  // Heavy latch thud
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(tripped ? 110 : 180, now)
  osc.frequency.exponentialRampToValueAtTime(38, now + 0.12)
  gain.gain.setValueAtTime(0.22, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.15)

  // Subtle alert chirp if tripped
  if (tripped) {
    const beep = ctx.createOscillator()
    const bGain = ctx.createGain()
    beep.type = 'sine'
    beep.frequency.setValueAtTime(880, now + 0.06)
    bGain.gain.setValueAtTime(0.08, now + 0.06)
    bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
    beep.connect(bGain)
    bGain.connect(ctx.destination)
    beep.start(now + 0.06)
    beep.stop(now + 0.23)
  }
}

export function playDoorSwing() {
  const ctx = getCtx()
  if (!ctx) return
  const now = ctx.currentTime

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(320, now)
  osc.frequency.exponentialRampToValueAtTime(160, now + 0.06)
  gain.gain.setValueAtTime(0.10, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.075)
}
