import React from 'react'
import { Power, AlertOctagon, Sliders, Play, Gauge, Cpu, Fan, Box } from 'lucide-react'
import { usePanelStore } from '../../state/panelStore'

interface ChipConfig {
  id: string
  label: string
  icon: React.ReactNode
}

const CHIPS: ChipConfig[] = [
  { id: 'main_breaker', label: 'About Me', icon: <Power size={13} /> },
  { id: 'enclosure_door', label: 'Education', icon: <Box size={13} /> },
  { id: 'selector_switch', label: 'Projects', icon: <Sliders size={13} /> },
  { id: 'gauge_ammeter', label: 'Tech Skills', icon: <Gauge size={13} /> },
  { id: 'gauge_voltmeter', label: 'Soft Skills', icon: <Gauge size={13} /> },
  { id: 'cooling_fan', label: 'Certifications', icon: <Fan size={13} /> },
  { id: 'push_button_start', label: 'Resume', icon: <Play size={13} /> },
  { id: 'plc_controller', label: 'Contacts', icon: <Cpu size={13} /> },
  { id: 'emergency_stop', label: 'Urgent Hire', icon: <AlertOctagon size={13} /> }
]

export const ComponentChips: React.FC = () => {
  const selectedComponent = usePanelStore((s) => s.selectedComponent)
  const setSelectedComponent = usePanelStore((s) => s.setSelectedComponent)

  return (
    <div className="chips-container ui-interactive">
      {CHIPS.map((chip) => {
        const isActive = selectedComponent === chip.id
        return (
          <button
            key={chip.id}
            className={`chip-btn ${isActive ? 'active' : ''}`}
            onClick={() => setSelectedComponent(chip.id)}
          >
            {chip.icon}
            {chip.label}
          </button>
        )
      })}
    </div>
  )
}
