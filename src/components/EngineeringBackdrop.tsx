import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { usePanelStore } from '../state/panelStore'

function createConcreteTexture(repeatX = 1, repeatY = 1): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#9aa5b4'
  ctx.fillRect(0, 0, 512, 512)

  // Subtle aggregate & weathering speckle
  for (let i = 0; i < 6500; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 512
    const size = 1 + Math.random() * 2.5
    const shade = Math.random() > 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.09)'
    ctx.fillStyle = shade
    ctx.fillRect(x, y, size, size)
  }

  // Concrete slab expansion joints
  ctx.strokeStyle = 'rgba(51, 65, 85, 0.28)'
  ctx.lineWidth = 2
  for (let i = 0; i <= 512; i += 128) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, 512)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, i)
    ctx.lineTo(512, i)
    ctx.stroke()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(repeatX, repeatY)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function createCorrugatedMetalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  for (let x = 0; x < 256; x += 8) {
    const grad = ctx.createLinearGradient(x, 0, x + 8, 0)
    grad.addColorStop(0, '#475569')
    grad.addColorStop(0.5, '#7c8b9e')
    grad.addColorStop(1, '#475569')
    ctx.fillStyle = grad
    ctx.fillRect(x, 0, 8, 256)
  }

  // Horizontal panel seams
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.25)'
  ctx.lineWidth = 2
  for (let y = 64; y < 256; y += 64) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(256, y)
    ctx.stroke()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(3, 1)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function createSolarTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#071630'
  ctx.fillRect(0, 0, 512, 512)

  const cols = 6
  const rows = 8
  const cw = 512 / cols
  const ch = 512 / rows

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cw
      const y = r * ch
      const grad = ctx.createLinearGradient(x, y, x + cw, y + ch)
      grad.addColorStop(0, (r + c) % 2 === 0 ? '#0d2b5c' : '#0a234c')
      grad.addColorStop(1, '#071936')
      ctx.fillStyle = grad
      ctx.fillRect(x + 2.5, y + 2.5, cw - 5, ch - 5)

      // Fine horizontal finger lines
      ctx.fillStyle = 'rgba(203, 213, 225, 0.14)'
      for (let fy = 6; fy < ch - 4; fy += 6) {
        ctx.fillRect(x + 3, y + fy, cw - 6, 0.8)
      }

      // 3 Silver busbars per cell
      ctx.fillStyle = 'rgba(226, 232, 240, 0.55)'
      ctx.fillRect(x + cw * 0.22, y + 2.5, 1.4, ch - 5)
      ctx.fillRect(x + cw * 0.50, y + 2.5, 1.4, ch - 5)
      ctx.fillRect(x + cw * 0.78, y + 2.5, 1.4, ch - 5)
    }
  }

  // White/silver cell spacing grid
  ctx.strokeStyle = 'rgba(203, 213, 225, 0.65)'
  ctx.lineWidth = 2.5
  for (let c = 0; c <= cols; c++) {
    ctx.beginPath()
    ctx.moveTo(c * cw, 0)
    ctx.lineTo(c * cw, 512)
    ctx.stroke()
  }
  for (let r = 0; r <= rows; r++) {
    ctx.beginPath()
    ctx.moveTo(0, r * ch)
    ctx.lineTo(512, r * ch)
    ctx.stroke()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

function createCircuitFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#060a14'
  ctx.fillRect(0, 0, 1024, 1024)

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)'
  ctx.lineWidth = 1
  const step = 64
  for (let i = 0; i <= 1024; i += step) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, 1024)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, i)
    ctx.lineTo(1024, i)
    ctx.stroke()
  }

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)'
  ctx.lineWidth = 2.5
  const traces = [
    [[128, 128], [256, 128], [320, 192], [448, 192]],
    [[896, 192], [768, 192], [704, 256], [576, 256]],
    [[192, 832], [320, 832], [384, 768], [512, 768]],
    [[832, 768], [704, 768], [640, 704], [512, 704]],
    [[128, 512], [256, 512], [320, 448]],
    [[896, 512], [768, 512], [704, 576]]
  ]
  traces.forEach((pts) => {
    ctx.beginPath()
    pts.forEach(([x, y], idx) => {
      if (idx === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()
    pts.forEach(([x, y], idx) => {
      if (idx === 0 || idx === pts.length - 1) {
        ctx.fillStyle = '#38bdf8'
        ctx.beginPath()
        ctx.arc(x, y, 4.5, 0, Math.PI * 2)
        ctx.fill()
      }
    })
  })

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(3, 3)
  return tex
}

const ElectricMotor: React.FC<{ position: [number, number, number]; rotation?: [number, number, number] }> = ({
  position,
  rotation = [0, 0.45, 0]
}) => {
  const shaftRef = useRef<THREE.Group>(null)
  const isPowered = usePanelStore((s) => s.isPowered)
  const isEStopActive = usePanelStore((s) => s.isEStopActive)
  const isRunning = usePanelStore((s) => s.isRunning)

  useFrame((_, delta) => {
    if (shaftRef.current && isPowered && !isEStopActive && isRunning) {
      shaftRef.current.rotation.x += delta * 14
    }
  })

  const noRay = () => null

  return (
    <group position={position} rotation={rotation}>
      {/* Main Stator Core */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow raycast={noRay}>
        <cylinderGeometry args={[0.165, 0.165, 0.30, 28]} />
        <meshStandardMaterial color="#1d3b5c" metalness={0.78} roughness={0.26} envMapIntensity={1.4} />
      </mesh>
      {/* 16 Precision Cooling Fins */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[0, Math.sin(angle) * 0.17, Math.cos(angle) * 0.17]}
            rotation={[angle, 0, 0]}
            castShadow
            raycast={noRay}
          >
            <boxGeometry args={[0.27, 0.009, 0.024]} />
            <meshStandardMaterial color="#1d3b5c" metalness={0.82} roughness={0.24} />
          </mesh>
        )
      })}
      {/* Rear Fan Shroud Cowl */}
      <mesh position={[-0.20, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow raycast={noRay}>
        <cylinderGeometry args={[0.172, 0.165, 0.11, 28]} />
        <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Front Drive End Bell */}
      <mesh position={[0.175, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow raycast={noRay}>
        <cylinderGeometry args={[0.165, 0.135, 0.055, 28]} />
        <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Terminal Junction Box + Brass Cable Gland */}
      <mesh position={[0.02, 0.205, 0]} castShadow raycast={noRay}>
        <boxGeometry args={[0.11, 0.075, 0.11]} />
        <meshStandardMaterial color="#0f172a" metalness={0.65} roughness={0.32} />
      </mesh>
      <mesh position={[0.02, 0.205, 0.068]} rotation={[Math.PI / 2, 0, 0]} raycast={noRay}>
        <cylinderGeometry args={[0.014, 0.014, 0.028, 12]} />
        <meshStandardMaterial color="#d97706" metalness={0.92} roughness={0.2} />
      </mesh>
      {/* Lifting Eyebolt on top */}
      <mesh position={[-0.08, 0.195, 0]} raycast={noRay}>
        <torusGeometry args={[0.022, 0.006, 10, 20]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.18} />
      </mesh>
      {/* Brushed Aluminum Nameplate */}
      <mesh position={[0, 0.05, 0.178]} raycast={noRay}>
        <boxGeometry args={[0.11, 0.055, 0.004]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.22} />
      </mesh>
      {/* Cast Mounting Feet + 4 Hex Bolts */}
      <mesh position={[0, -0.17, 0]} receiveShadow castShadow raycast={noRay}>
        <boxGeometry args={[0.28, 0.035, 0.30]} />
        <meshStandardMaterial color="#1e293b" metalness={0.75} roughness={0.38} />
      </mesh>
      {[
        [-0.11, -0.148, 0.12],
        [0.11, -0.148, 0.12],
        [-0.11, -0.148, -0.12],
        [0.11, -0.148, -0.12]
      ].map((pos, idx) => (
        <mesh key={idx} position={pos as [number, number, number]} raycast={noRay}>
          <cylinderGeometry args={[0.011, 0.011, 0.015, 6]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.18} />
        </mesh>
      ))}
      {/* Rotating Precision Shaft + Keyed Coupling */}
      <group ref={shaftRef} position={[0.25, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow raycast={noRay}>
          <cylinderGeometry args={[0.026, 0.026, 0.14, 20]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.98} roughness={0.1} />
        </mesh>
        <mesh position={[0.045, 0, 0]} rotation={[0, 0, Math.PI / 2]} raycast={noRay}>
          <cylinderGeometry args={[0.042, 0.042, 0.036, 16]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.75} roughness={0.28} />
        </mesh>
        <mesh position={[0.045, 0.038, 0]} raycast={noRay}>
          <boxGeometry args={[0.038, 0.014, 0.014]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
    </group>
  )
}

const SolarPanelArray: React.FC<{ position: [number, number, number]; rotation?: [number, number, number] }> = ({
  position,
  rotation = [0, -0.45, 0]
}) => {
  const solarTex = useMemo(() => createSolarTexture(), [])
  const noRay = () => null

  return (
    <group position={position} rotation={rotation}>
      {/* Aluminum A-Frame Ground Racking */}
      <mesh position={[-0.22, 0.19, -0.06]} castShadow raycast={noRay}>
        <boxGeometry args={[0.024, 0.38, 0.024]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.88} roughness={0.22} />
      </mesh>
      <mesh position={[0.22, 0.19, -0.06]} castShadow raycast={noRay}>
        <boxGeometry args={[0.024, 0.38, 0.024]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.88} roughness={0.22} />
      </mesh>
      <mesh position={[-0.22, 0.14, 0.06]} rotation={[-0.45, 0, 0]} castShadow raycast={noRay}>
        <boxGeometry args={[0.020, 0.30, 0.020]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.88} roughness={0.22} />
      </mesh>
      <mesh position={[0.22, 0.14, 0.06]} rotation={[-0.45, 0, 0]} castShadow raycast={noRay}>
        <boxGeometry args={[0.020, 0.30, 0.020]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.88} roughness={0.22} />
      </mesh>
      {/* Crossbar & Base Rails */}
      <mesh position={[0, 0.012, 0]} receiveShadow raycast={noRay}>
        <boxGeometry args={[0.56, 0.024, 0.28]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.35} />
      </mesh>
      {/* Tilted Photovoltaic Module */}
      <group position={[0, 0.37, 0]} rotation={[-0.55, 0, 0]}>
        {/* Anodized Aluminum Frame */}
        <mesh castShadow receiveShadow raycast={noRay}>
          <boxGeometry args={[0.66, 0.46, 0.024]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.18} />
        </mesh>
        {/* Monocrystalline Silicon Cell Matrix */}
        <mesh position={[0, 0, 0.013]} raycast={noRay}>
          <planeGeometry args={[0.62, 0.42]} />
          <meshStandardMaterial
            map={solarTex}
            metalness={0.62}
            roughness={0.08}
            envMapIntensity={1.8}
          />
        </mesh>
        {/* Rear Junction Box */}
        <mesh position={[0, 0.10, -0.022]} raycast={noRay}>
          <boxGeometry args={[0.09, 0.07, 0.022]} />
          <meshStandardMaterial color="#0f172a" metalness={0.2} roughness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

const PowerElectronicsPCB: React.FC<{ position: [number, number, number]; rotation?: [number, number, number]; scale?: number }> = ({
  position,
  rotation = [0, 0.3, 0],
  scale = 1
}) => {
  const noRay = () => null
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Matte FR4 PCB Substrate */}
      <mesh receiveShadow castShadow raycast={noRay}>
        <boxGeometry args={[0.30, 0.012, 0.24]} />
        <meshStandardMaterial color="#064e3b" metalness={0.25} roughness={0.42} />
      </mesh>
      {/* Main IC Chip + Finned Aluminum Heatsink */}
      <mesh position={[-0.03, 0.014, 0]} castShadow raycast={noRay}>
        <boxGeometry args={[0.10, 0.014, 0.10]} />
        <meshStandardMaterial color="#0f172a" metalness={0.2} roughness={0.38} />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[-0.03, 0.030, -0.038 + i * 0.015]} castShadow raycast={noRay}>
          <boxGeometry args={[0.085, 0.020, 0.004]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.2} />
        </mesh>
      ))}
      {/* Gold Gull-Wing IC Pins */}
      {[-1, 1].map((dir) =>
        Array.from({ length: 6 }).map((_, i) => {
          const offset = -0.038 + i * 0.015
          return (
            <React.Fragment key={`${dir}-${i}`}>
              <mesh position={[-0.03 + offset, 0.01, dir * 0.058]} raycast={noRay}>
                <boxGeometry args={[0.006, 0.004, 0.018]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.15} />
              </mesh>
              <mesh position={[-0.03 + dir * 0.058, 0.01, offset]} raycast={noRay}>
                <boxGeometry args={[0.018, 0.004, 0.006]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.15} />
              </mesh>
            </React.Fragment>
          )
        })
      )}
      {/* Toroidal Copper Inductor Coil */}
      <mesh position={[0.085, 0.024, -0.045]} rotation={[Math.PI / 2, 0, 0]} castShadow raycast={noRay}>
        <torusGeometry args={[0.022, 0.009, 12, 24]} />
        <meshStandardMaterial color="#d97706" metalness={0.92} roughness={0.18} />
      </mesh>
      {/* Electrolytic Capacitors (3x) */}
      {[-0.04, 0.01, 0.06].map((cz, i) => (
        <group key={i} position={[0.09, 0.026, 0.04 + cz * 0.6]}>
          <mesh castShadow raycast={noRay}>
            <cylinderGeometry args={[0.013, 0.013, 0.038, 16]} />
            <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.020, 0]} raycast={noRay}>
            <cylinderGeometry args={[0.012, 0.012, 0.002, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.15} />
          </mesh>
        </group>
      ))}
      {/* Gold Pin Header Strip */}
      <mesh position={[-0.125, 0.014, 0]} raycast={noRay}>
        <boxGeometry args={[0.018, 0.014, 0.16]} />
        <meshStandardMaterial color="#0f172a" metalness={0.2} roughness={0.5} />
      </mesh>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[-0.125, 0.026, -0.065 + i * 0.0185]} raycast={noRay}>
          <boxGeometry args={[0.004, 0.016, 0.004]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.96} roughness={0.15} />
        </mesh>
      ))}
      {/* Tiny Glowing PCB Status LED */}
      <mesh position={[-0.11, 0.012, 0.095]} raycast={noRay}>
        <boxGeometry args={[0.008, 0.008, 0.008]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={3.5} />
      </mesh>
    </group>
  )
}

const CoolingTower: React.FC<{
  position: [number, number, number]
  scale?: number
  concreteTex: THREE.CanvasTexture
}> = ({ position, scale = 1, concreteTex }) => {
  const noRay = () => null
  const steamRefs = useRef<(THREE.Mesh | null)[]>([])

  const latheGeo = useMemo(() => {
    const pts: THREE.Vector2[] = []
    const steps = 18
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const y = 0.16 + t * 2.24
      // Hyperbolic cooling tower profile: wide base, narrow waist at 70% height, flared top
      const r = 0.60 - 0.24 * Math.sin(t * Math.PI * 0.88) + 0.08 * Math.pow(t, 2)
      pts.push(new THREE.Vector2(r, y))
    }
    return new THREE.LatheGeometry(pts, 32)
  }, [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    for (let i = 0; i < 4; i++) {
      const m = steamRefs.current[i]
      if (!m) continue
      const phase = (t * 0.20 + i * 0.25) % 1
      m.position.y = 2.44 + phase * 1.05
      m.position.x = Math.sin(t * 0.55 + i) * 0.08 + phase * 0.25
      const s = 0.28 + phase * 0.52
      m.scale.set(s, s * 0.7, s)
      const mat = m.material as THREE.MeshStandardMaterial
      mat.opacity = Math.sin(phase * Math.PI) * 0.34
    }
  })

  return (
    <group position={position} scale={scale}>
      {/* Concrete hyperbolic shell */}
      <mesh geometry={latheGeo} castShadow receiveShadow raycast={noRay}>
        <meshStandardMaterial
          map={concreteTex}
          bumpMap={concreteTex}
          bumpScale={0.015}
          color="#d8dee6"
          roughness={0.85}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Top rim ring */}
      <mesh position={[0, 2.4, 0]} rotation={[Math.PI / 2, 0, 0]} raycast={noRay}>
        <torusGeometry args={[0.44, 0.025, 10, 32]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.75} />
      </mesh>
      {/* Dark interior throat */}
      <mesh position={[0, 2.18, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={noRay}>
        <circleGeometry args={[0.41, 24]} />
        <meshStandardMaterial color="#0f172a" roughness={0.95} />
      </mesh>
      {/* Diagonal concrete V-support columns around air intake */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const x = Math.cos(angle) * 0.60
        const z = Math.sin(angle) * 0.60
        return (
          <group key={i} position={[x, 0.09, z]} rotation={[0, -angle, 0]}>
            <mesh rotation={[0.25, 0, 0]} castShadow raycast={noRay}>
              <cylinderGeometry args={[0.016, 0.02, 0.20, 8]} />
              <meshStandardMaterial color="#64748b" roughness={0.85} />
            </mesh>
            <mesh rotation={[-0.25, 0, 0]} castShadow raycast={noRay}>
              <cylinderGeometry args={[0.016, 0.02, 0.20, 8]} />
              <meshStandardMaterial color="#64748b" roughness={0.85} />
            </mesh>
          </group>
        )
      })}
      {/* Rising steam plumes */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          ref={(el) => { steamRefs.current[i] = el }}
          position={[0, 2.5, 0]}
          raycast={noRay}
        >
          <sphereGeometry args={[0.45, 12, 12]} />
          <meshStandardMaterial color="#f8fafc" transparent opacity={0.28} roughness={1} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

const PowerPlantComplex: React.FC = () => {
  const noRay = () => null
  const beacon1Ref = useRef<THREE.MeshStandardMaterial>(null)
  const beacon2Ref = useRef<THREE.MeshStandardMaterial>(null)

  const yardConcreteTex = useMemo(() => createConcreteTexture(12, 12), [])
  const towerConcreteTex = useMemo(() => createConcreteTexture(3, 2), [])
  const corrugatedTex = useMemo(() => createCorrugatedMetalTexture(), [])

  // Overhead catenary transmission line geometries spanning between pylons
  const cableGeos = useMemo(() => {
    const heights = [2.35, 1.9, 1.9]
    const offsets = [0, -0.5, 0.5]
    return heights.map((h, i) => {
      const start = new THREE.Vector3(-2.7 + offsets[i] * 0.4, -0.56 + h, -2.9)
      const end = new THREE.Vector3(3.3 + offsets[i] * 0.4, -0.56 + h, -3.1)
      const mid = start.clone().lerp(end, 0.5)
      mid.y -= 0.42
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
      return new THREE.TubeGeometry(curve, 24, 0.009, 6, false)
    })
  }, [])

  useFrame((state) => {
    const pulse = Math.sin(state.clock.getElapsedTime() * 3.2) > 0.2 ? 3.5 : 0.3
    if (beacon1Ref.current) beacon1Ref.current.emissiveIntensity = pulse
    if (beacon2Ref.current) beacon2Ref.current.emissiveIntensity = pulse
  })

  return (
    <group>
      {/* Expanded Weathered Concrete Plant Yard Floor */}
      <mesh position={[0, -0.566, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={noRay}>
        <circleGeometry args={[20, 64]} />
        <meshStandardMaterial
          map={yardConcreteTex}
          bumpMap={yardConcreteTex}
          bumpScale={0.012}
          color="#94a3b8"
          roughness={0.92}
          metalness={0.04}
        />
      </mesh>
      {/* Yellow safety perimeter ring around the control panel work zone */}
      <mesh position={[0, -0.562, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={noRay}>
        <ringGeometry args={[1.65, 1.72, 64]} />
        <meshStandardMaterial color="#eab308" roughness={0.55} metalness={0.08} />
      </mesh>

      {/* Twin Hyperbolic Cooling Towers (Left Rear) */}
      <CoolingTower position={[-2.9, -0.56, -5.8]} scale={1.12} concreteTex={towerConcreteTex} />
      <CoolingTower position={[-1.35, -0.56, -6.3]} scale={0.98} concreteTex={towerConcreteTex} />

      {/* Main Turbine Hall & Generator Building (Center Rear) */}
      <group position={[0.65, -0.56, -5.4]}>
        {/* Corrugated steel-clad turbine hall */}
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow raycast={noRay}>
          <boxGeometry args={[2.5, 1.5, 1.6]} />
          <meshStandardMaterial
            map={corrugatedTex}
            bumpMap={corrugatedTex}
            bumpScale={0.018}
            color="#94a3b8"
            roughness={0.52}
            metalness={0.55}
          />
        </mesh>
        {/* Lower concrete plinth */}
        <mesh position={[0, 0.14, 0]} receiveShadow raycast={noRay}>
          <boxGeometry args={[2.56, 0.28, 1.66]} />
          <meshStandardMaterial map={towerConcreteTex} color="#64748b" roughness={0.88} />
        </mesh>
        {/* Industrial Roll-up Bay Door */}
        <mesh position={[-0.55, 0.42, 0.806]} raycast={noRay}>
          <planeGeometry args={[0.56, 0.64]} />
          <meshStandardMaterial map={corrugatedTex} color="#334155" metalness={0.6} roughness={0.45} />
        </mesh>
        {/* Yellow Safety Bollards beside Bay Door */}
        {[-0.9, -0.2].map((bx, i) => (
          <mesh key={i} position={[bx, 0.12, 0.88]} castShadow raycast={noRay}>
            <cylinderGeometry args={[0.025, 0.025, 0.24, 10]} />
            <meshStandardMaterial color="#facc15" roughness={0.4} metalness={0.2} />
          </mesh>
        ))}
        {/* Upper roof deck & parapet */}
        <mesh position={[0, 1.54, 0]} castShadow raycast={noRay}>
          <boxGeometry args={[2.6, 0.08, 1.7]} />
          <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.5} />
        </mesh>
        {/* Clerestory illuminated windows */}
        <mesh position={[0, 1.18, 0.805]} raycast={noRay}>
          <planeGeometry args={[2.1, 0.22]} />
          <meshStandardMaterial color="#bae6fd" emissive="#38bdf8" emissiveIntensity={0.65} roughness={0.2} />
        </mesh>
        {/* Vertical structural steel pilasters */}
        {[-1.0, -0.5, 0, 0.5, 1.0].map((px, i) => (
          <mesh key={i} position={[px, 0.75, 0.81]} raycast={noRay}>
            <boxGeometry args={[0.06, 1.48, 0.05]} />
            <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.35} />
          </mesh>
        ))}
        {/* Rooftop steam condensers / vents */}
        {[-0.65, 0, 0.65].map((vx, i) => (
          <mesh key={i} position={[vx, 1.66, -0.2]} raycast={noRay}>
            <cylinderGeometry args={[0.14, 0.16, 0.18, 16]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* Twin Tall Exhaust Smokestacks with Warning Bands (Right Rear) */}
      {[
        { pos: [2.25, -0.56, -5.0] as [number, number, number], h: 3.1, ref: beacon1Ref },
        { pos: [2.95, -0.56, -5.5] as [number, number, number], h: 2.7, ref: beacon2Ref }
      ].map((stack, idx) => (
        <group key={idx} position={stack.pos}>
          <mesh position={[0, stack.h / 2, 0]} castShadow raycast={noRay}>
            <cylinderGeometry args={[0.13, 0.21, stack.h, 20]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.72} metalness={0.15} />
          </mesh>
          {/* Red aviation warning band */}
          <mesh position={[0, stack.h * 0.86, 0]} raycast={noRay}>
            <cylinderGeometry args={[0.142, 0.148, 0.22, 20]} />
            <meshStandardMaterial color="#dc2626" roughness={0.5} />
          </mesh>
          <mesh position={[0, stack.h * 0.74, 0]} raycast={noRay}>
            <cylinderGeometry args={[0.152, 0.158, 0.22, 20]} />
            <meshStandardMaterial color="#dc2626" roughness={0.5} />
          </mesh>
          {/* Blinking aviation beacon */}
          <mesh position={[0, stack.h + 0.04, 0]} raycast={noRay}>
            <sphereGeometry args={[0.04, 10, 10]} />
            <meshStandardMaterial ref={stack.ref} color="#ef4444" emissive="#ef4444" emissiveIntensity={2.5} />
          </mesh>
        </group>
      ))}

      {/* High-Voltage Step-Up Substation Transformer (Right Midground) */}
      <group position={[2.45, -0.56, -2.7]} rotation={[0, -0.35, 0]}>
        <mesh position={[0, 0.36, 0]} castShadow receiveShadow raycast={noRay}>
          <boxGeometry args={[0.75, 0.72, 0.55]} />
          <meshStandardMaterial color="#475569" metalness={0.65} roughness={0.38} />
        </mesh>
        {/* Cooling radiator fins */}
        {[-0.25, -0.08, 0.08, 0.25].map((rx, i) => (
          <mesh key={i} position={[rx, 0.34, 0.31]} raycast={noRay}>
            <boxGeometry args={[0.04, 0.52, 0.08]} />
            <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
        {/* 3 Porcelain HV Bushings */}
        {[-0.2, 0, 0.2].map((bx, i) => (
          <mesh key={i} position={[bx, 0.86, 0]} raycast={noRay}>
            <cylinderGeometry args={[0.032, 0.045, 0.3, 12]} />
            <meshStandardMaterial color="#78350f" roughness={0.25} metalness={0.1} />
          </mesh>
        ))}
      </group>

      {/* High-Voltage Transmission Pylons (Left & Right Midground) */}
      {[
        [-2.7, -0.56, -2.9] as [number, number, number],
        [3.3, -0.56, -3.1] as [number, number, number]
      ].map((pPos, idx) => (
        <group key={idx} position={pPos}>
          {/* Steel mast */}
          <mesh position={[0, 1.35, 0]} castShadow raycast={noRay}>
            <cylinderGeometry args={[0.05, 0.12, 2.7, 4]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.35} />
          </mesh>
          {/* Upper & lower cross-arms */}
          <mesh position={[0, 2.35, 0]} raycast={noRay}>
            <boxGeometry args={[0.95, 0.05, 0.06]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.35} />
          </mesh>
          <mesh position={[0, 1.9, 0]} raycast={noRay}>
            <boxGeometry args={[1.25, 0.05, 0.06]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.35} />
          </mesh>
        </group>
      ))}

      {/* Overhead Catenary Transmission Power Lines */}
      {cableGeos.map((geo, idx) => (
        <mesh key={idx} geometry={geo} raycast={noRay}>
          <meshStandardMaterial color="#1e293b" metalness={0.65} roughness={0.45} />
        </mesh>
      ))}
    </group>
  )
}

const EnergyFlowPulses: React.FC = () => {
  const solarPulseRefs = useRef<(THREE.Mesh | null)[]>([])
  const motorPulseRefs = useRef<(THREE.Mesh | null)[]>([])
  const isPowered = usePanelStore((s) => s.isPowered)
  const isEStopActive = usePanelStore((s) => s.isEStopActive)
  const isRunning = usePanelStore((s) => s.isRunning)

  const solarStart = useMemo(() => new THREE.Vector3(1.08, -0.53, -0.40), [])
  const panelHub = useMemo(() => new THREE.Vector3(0, -0.53, 0), [])
  const motorEnd = useMemo(() => new THREE.Vector3(-1.08, -0.53, -0.35), [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const solarActive = isPowered && !isEStopActive
    const motorActive = solarActive && isRunning

    for (let i = 0; i < 4; i++) {
      const mSolar = solarPulseRefs.current[i]
      if (mSolar) {
        mSolar.visible = solarActive
        if (solarActive) {
          const frac = (t * 0.45 + i * 0.25) % 1
          mSolar.position.lerpVectors(solarStart, panelHub, frac)
        }
      }

      const mMotor = motorPulseRefs.current[i]
      if (mMotor) {
        mMotor.visible = motorActive
        if (motorActive) {
          const frac = (t * 0.65 + i * 0.25) % 1
          mMotor.position.lerpVectors(panelHub, motorEnd, frac)
        }
      }
    }
  })

  return (
    <group>
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={`solar-pulse-${i}`}
          ref={(el) => { solarPulseRefs.current[i] = el }}
          raycast={() => null}
        >
          <sphereGeometry args={[0.016, 12, 12]} />
          <meshStandardMaterial
            color="#fde047"
            emissive="#facc15"
            emissiveIntensity={3.2}
          />
        </mesh>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={`motor-pulse-${i}`}
          ref={(el) => { motorPulseRefs.current[i] = el }}
          raycast={() => null}
        >
          <sphereGeometry args={[0.017, 12, 12]} />
          <meshStandardMaterial
            color="#7dd3fc"
            emissive="#38bdf8"
            emissiveIntensity={3.8}
          />
        </mesh>
      ))}
    </group>
  )
}

export const EngineeringBackdrop: React.FC = () => {
  const floorTex = useMemo(() => createCircuitFloorTexture(), [])
  const noRay = () => null

  return (
    <group>
      {/* Circuit-board industrial floor pad */}
      <mesh position={[0, -0.56, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={noRay}>
        <circleGeometry args={[1.65, 64]} />
        <meshStandardMaterial
          map={floorTex}
          metalness={0.45}
          roughness={0.35}
          envMapIntensity={0.8}
        />
      </mesh>

      {/* Power Plant Complex & Yard */}
      <PowerPlantComplex />

      {/* Panel pedestal base */}
      <mesh position={[0, -0.54, 0]} receiveShadow castShadow raycast={noRay}>
        <cylinderGeometry args={[0.56, 0.62, 0.04, 48]} />
        <meshStandardMaterial color="#1e293b" metalness={0.75} roughness={0.28} />
      </mesh>

      {/* Left: 3-Phase Industrial Electric Motor */}
      <ElectricMotor position={[-1.08, -0.37, -0.35]} rotation={[0, 0.48, 0]} />

      {/* Right: Photovoltaic Solar Panel Array */}
      <SolarPanelArray position={[1.08, -0.56, -0.40]} rotation={[0, -0.45, 0]} />

      {/* Background Detailed Power Electronics & Embedded PCBs */}
      <PowerElectronicsPCB position={[-0.78, -0.55, 0.48]} rotation={[0, 0.42, 0]} scale={0.92} />
      <PowerElectronicsPCB position={[0.80, -0.55, 0.45]} rotation={[0, -0.36, 0]} scale={0.88} />

      {/* Animated Power Flow Pulses */}
      <EnergyFlowPulses />
    </group>
  )
}
