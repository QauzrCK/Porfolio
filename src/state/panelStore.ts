import { create } from 'zustand'

export type SelectorMode = 'OFF' | 'MANUAL' | 'AUTO'

export interface PanelState {
  // System State
  isPowered: boolean
  isEStopActive: boolean
  selectorMode: SelectorMode
  isRunning: boolean
  isStartButtonPressed: boolean
  isDoorOpen: boolean
  isMuted: boolean

  // Active / Hovered Component
  selectedComponent: string | null
  hoveredComponent: string | null

  // Telemetry (live values for meters and animations)
  targetVoltage: number
  targetCurrent: number

  // Actions
  toggleBreaker: () => void
  toggleEStop: () => void
  cycleSelector: () => void
  pressStartButton: () => void
  toggleDoor: () => void
  toggleMute: () => void
  setSelectedComponent: (id: string | null) => void
  setHoveredComponent: (id: string | null) => void
  resetView: () => void
}

export const usePanelStore = create<PanelState>((set, get) => {
  // Helper to recompute electrical telemetry targets
  const computeTargets = (isPowered: boolean, isEStop: boolean, mode: SelectorMode, isRunning: boolean) => {
    if (!isPowered || isEStop) {
      return { targetVoltage: 0, targetCurrent: 0 }
    }

    // Nominal 400V 3-Phase line voltage
    const baseVoltage = 400
    let targetCurrent = 1.2 // Idle standby current (logic & fan)

    if (mode === 'OFF') {
      return { targetVoltage: baseVoltage, targetCurrent: 1.2 }
    }

    if (mode === 'MANUAL') {
      if (isRunning) {
        targetCurrent = 18.5 // Active motor load
      }
      return { targetVoltage: isRunning ? baseVoltage - 3.5 : baseVoltage, targetCurrent }
    }

    if (mode === 'AUTO') {
      // In AUTO mode, load runs automatically
      targetCurrent = 24.5
      return { targetVoltage: baseVoltage - 5.0, targetCurrent }
    }

    return { targetVoltage: baseVoltage, targetCurrent }
  }

  return {
    isPowered: true,
    isEStopActive: false,
    selectorMode: 'AUTO',
    isRunning: true,
    isStartButtonPressed: false,
    isDoorOpen: false,
    isMuted: false,
    selectedComponent: null,
    hoveredComponent: null,
    targetVoltage: 395,
    targetCurrent: 24.5,

    toggleBreaker: () => {
      const state = get()
      const newPowered = !state.isPowered
      const newRunning = newPowered && !state.isEStopActive && (state.selectorMode === 'AUTO' || (state.selectorMode === 'MANUAL' && state.isRunning))
      const targets = computeTargets(newPowered, state.isEStopActive, state.selectorMode, newRunning)

      set({
        isPowered: newPowered,
        isRunning: newRunning,
        ...targets
      })
    },

    toggleEStop: () => {
      const state = get()
      const newEStop = !state.isEStopActive
      // When E-Stop is triggered, running stops immediately.
      // When released, safety protocol requires manual restart in MANUAL, or AUTO resumes.
      const newRunning = !newEStop && state.isPowered && state.selectorMode === 'AUTO'
      const targets = computeTargets(state.isPowered, newEStop, state.selectorMode, newRunning)

      set({
        isEStopActive: newEStop,
        isRunning: newRunning,
        ...targets
      })
    },

    cycleSelector: () => {
      const state = get()
      const modes: SelectorMode[] = ['OFF', 'MANUAL', 'AUTO']
      const currentIndex = modes.indexOf(state.selectorMode)
      const nextMode = modes[(currentIndex + 1) % modes.length]

      let newRunning = false
      if (state.isPowered && !state.isEStopActive) {
        if (nextMode === 'AUTO') {
          newRunning = true
        } else if (nextMode === 'MANUAL') {
          newRunning = false // Needs start button
        } else {
          newRunning = false
        }
      }

      const targets = computeTargets(state.isPowered, state.isEStopActive, nextMode, newRunning)

      set({
        selectorMode: nextMode,
        isRunning: newRunning,
        ...targets
      })
    },

    pressStartButton: () => {
      const state = get()
      set({ isStartButtonPressed: true })

      // Momentary press release after 180ms
      setTimeout(() => {
        set({ isStartButtonPressed: false })
      }, 180)

      if (state.isPowered && !state.isEStopActive && state.selectorMode === 'MANUAL') {
        const newRunning = true
        const targets = computeTargets(state.isPowered, state.isEStopActive, state.selectorMode, newRunning)
        set({
          isRunning: newRunning,
          ...targets
        })
      }
    },

    toggleDoor: () => {
      set((s) => ({ isDoorOpen: !s.isDoorOpen }))
    },

    toggleMute: () => {
      set((s) => ({ isMuted: !s.isMuted }))
    },

    setSelectedComponent: (id) => {
      set({ selectedComponent: id })
    },

    setHoveredComponent: (id) => {
      set({ hoveredComponent: id })
    },

    resetView: () => {
      set({ selectedComponent: null })
    }
  }
})
