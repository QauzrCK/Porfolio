import React, { useEffect, useState } from 'react'
import { Volume2, VolumeX, RotateCcw, DoorOpen, DoorClosed } from 'lucide-react'
import { ControlPanelScene } from './components/ControlPanelScene'
import { ComponentChips } from './components/ui/ComponentChips'
import { DetailDrawer } from './components/ui/DetailDrawer'
import { usePanelStore } from './state/panelStore'
import { playDoorSwing } from './utils/soundEffects'
import './components/ui/styles.css'

export const App: React.FC = () => {
  const resetView = usePanelStore((s) => s.resetView)
  const toggleDoor = usePanelStore((s) => s.toggleDoor)
  const isDoorOpen = usePanelStore((s) => s.isDoorOpen)
  const isMuted = usePanelStore((s) => s.isMuted)
  const toggleMute = usePanelStore((s) => s.toggleMute)
  const selectedComponent = usePanelStore((s) => s.selectedComponent)
  const [showHint, setShowHint] = useState(true)

  // Fade out the onboarding hint after the first interaction
  useEffect(() => {
    if (selectedComponent) setShowHint(false)
  }, [selectedComponent])

  useEffect(() => {
    if (!showHint) return
    const dismiss = () => setShowHint(false)
    window.addEventListener('pointerdown', dismiss, { once: true })
    window.addEventListener('wheel', dismiss, { once: true })
    return () => {
      window.removeEventListener('pointerdown', dismiss)
      window.removeEventListener('wheel', dismiss)
    }
  }, [showHint])

  // Keyboard shortcuts: 'Escape' to reset camera view, 'Space' to open/close cabinet door
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return

      if (e.key === 'Escape') {
        resetView()
      } else if (e.code === 'Space') {
        e.preventDefault()
        toggleDoor()
        playDoorSwing()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [resetView, toggleDoor])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* 3D WebGL Canvas Layer */}
      <ControlPanelScene />

      {/* Minimal Frosted Glass Portfolio Overlay */}
      <div className="ui-overlay">
        <header className="header-container">
          <div className="project-brand ui-interactive">
            <h1 className="brand-title">Chanawit Krobbang</h1>
            <div className="brand-desc">Electrical Engineer • Interactive 3D Control Panel</div>
          </div>

          <div className="utility-controls ui-interactive">
            <button
              className="chip-btn reset-btn"
              onClick={resetView}
              title="Reset camera to full view (Esc)"
            >
              <RotateCcw size={13} />
              Reset View
            </button>
            <button
              className={`chip-btn ${isDoorOpen ? 'active' : ''}`}
              onClick={() => {
                toggleDoor()
                playDoorSwing()
              }}
              title="Open or close control panel cabinet door (Space)"
            >
              {isDoorOpen ? <DoorOpen size={13} /> : <DoorClosed size={13} />}
              {isDoorOpen ? 'Close Door' : 'Open Door'}
            </button>
            <button
              className="chip-btn"
              onClick={toggleMute}
              title={isMuted ? 'Unmute mechanical sound effects' : 'Mute mechanical sound effects'}
            >
              {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              {isMuted ? 'Muted' : 'Sound'}
            </button>
          </div>
        </header>

        {/* Bottom Onboarding Hint + Centered Portfolio Dock */}
        <footer style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <div className={`hint-pill ${showHint ? '' : 'hidden'}`}>
            Drag to orbit • Scroll to zoom • Click any control
          </div>
          <ComponentChips />
        </footer>

        {/* Right Slide-in Detail Drawer */}
        <DetailDrawer />
      </div>
    </div>
  )
}

export default App
