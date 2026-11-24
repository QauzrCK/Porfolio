import React from 'react'
import { Activity, Zap, AlertTriangle, ShieldCheck } from 'lucide-react'
import { usePanelStore } from '../../state/panelStore'

export const TelemetryBar: React.FC = () => {
  const isPowered = usePanelStore((s) => s.isPowered)
  const isEStopActive = usePanelStore((s) => s.isEStopActive)
  const selectorMode = usePanelStore((s) => s.selectorMode)
  const isRunning = usePanelStore((s) => s.isRunning)
  const targetVoltage = usePanelStore((s) => s.targetVoltage)
  const targetCurrent = usePanelStore((s) => s.targetCurrent)

  return (
    <div className="telemetry-hud ui-interactive">
      {/* Power Status */}
      <div className="telemetry-item">
        <span className="telemetry-label">MAIN BUS</span>
        <span className="telemetry-val">
          <span className={`status-dot ${isPowered ? 'active' : 'inactive'}`} />
          {isPowered ? '400V ON' : 'ISOLATED'}
        </span>
      </div>

      {/* Safety System */}
      <div className="telemetry-item">
        <span className="telemetry-label">SAFETY RELAY</span>
        <span className="telemetry-val">
          {isEStopActive ? (
            <>
              <span className="status-dot fault" />
              <span style={{ color: '#ef4444' }}>TRIPPED</span>
            </>
          ) : (
            <>
              <span className="status-dot active" />
              <span style={{ color: '#86efac' }}>HEALTHY</span>
            </>
          )}
        </span>
      </div>

      {/* Mode */}
      <div className="telemetry-item">
        <span className="telemetry-label">CONTROL MODE</span>
        <span className="telemetry-val" style={{ color: '#38bdf8' }}>
          {selectorMode}
        </span>
      </div>

      {/* Voltmeter Readout */}
      <div className="telemetry-item">
        <span className="telemetry-label">BUS VOLTAGE</span>
        <span className="telemetry-val">
          <Zap size={14} color="#f59e0b" />
          {Math.round(targetVoltage)} V
        </span>
      </div>

      {/* Ammeter Readout */}
      <div className="telemetry-item">
        <span className="telemetry-label">TOTAL CURRENT</span>
        <span className="telemetry-val">
          <Activity size={14} color="#38bdf8" />
          {targetCurrent.toFixed(1)} A
        </span>
      </div>
    </div>
  )
}
