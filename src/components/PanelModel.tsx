import React, { useRef, useMemo, useEffect } from 'react'
import { useGLTF, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { usePanelStore } from '../state/panelStore'
import panelData from '../data/panelComponents.json'
import {
  playBreakerClunk,
  playDialClick,
  playButtonPress,
  playEStopSlam
} from '../utils/soundEffects'

const INTERACTIVE_COMPONENTS = [
  'main_breaker',
  'emergency_stop',
  'selector_switch',
  'push_button_start',
  'indicator_led_power',
  'indicator_led_fault',
  'gauge_voltmeter',
  'gauge_ammeter',
  'plc_controller',
  'cooling_fan',
  'enclosure_door'
]

// Identify interactive ancestor
function getInteractiveId(obj: THREE.Object3D | null): string | null {
  let curr: THREE.Object3D | null = obj
  while (curr) {
    if (curr.name && INTERACTIVE_COMPONENTS.includes(curr.name)) {
      return curr.name
    }
    curr = curr.parent
  }
  return null
}

// Procedural brushed-metal texture for realistic specular sheen
function createBrushedMetalMap(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#808080'
  ctx.fillRect(0, 0, 256, 256)
  for (let y = 0; y < 256; y++) {
    const shade = 110 + Math.floor(Math.random() * 40)
    ctx.fillStyle = `rgb(${shade},${shade},${shade})`
    ctx.fillRect(0, y, 256, 1)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(3, 3)
  return tex
}

function getHoverDetails(id: string): { title: string; lines: string[] } {
  const entry = (panelData as any)[id]
  if (!entry) return { title: id, lines: [] }

  const lines: string[] = []
  if (entry.contacts && entry.contacts.length > 0) {
    entry.contacts.forEach((c: any) => lines.push(`${c.label}: ${c.value}`))
  } else if (entry.education && entry.education.length > 0) {
    entry.education.forEach((e: any) => {
      lines.push(e.university ? `${e.degree}: ${e.university}` : `${e.degree}: —`)
    })
  } else if (entry.skills && entry.skills.length > 0) {
    lines.push(...entry.skills.slice(0, 4))
    if (entry.skills.length > 4) lines.push(`+${entry.skills.length - 4} more...`)
  } else if (entry.techSkills && entry.techSkills.length > 0) {
    entry.techSkills.slice(0, 4).forEach((s: any) => lines.push(s.category))
    if (entry.techSkills.length > 4) lines.push(`+${entry.techSkills.length - 4} more...`)
  } else if (entry.subtitle) {
    lines.push(entry.subtitle)
  }

  return { title: entry.title || id, lines }
}

// Create numbered analog gauge dial texture
function createGaugeDialTexture(unit: string, maxVal: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#f4f4f0'
  ctx.fillRect(0, 0, 512, 512)

  const cx = 256
  const cy = 285
  const r = 175

  // Outer subtle arc
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(cx, cy, r, -Math.PI / 2 - 0.87, -Math.PI / 2 + 0.87)
  ctx.stroke()

  // Numbers at 5 major divisions
  ctx.fillStyle = '#0f172a'
  ctx.font = '700 32px "JetBrains Mono", monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let i = 0; i <= 5; i++) {
    const frac = i / 5
    const ang = -Math.PI / 2 - 0.87 + frac * 1.74
    const nx = cx + Math.cos(ang) * (r - 45)
    const ny = cy + Math.sin(ang) * (r - 45)
    ctx.fillText(String(Math.round(frac * maxVal)), nx, ny)
  }

  // Unit label
  ctx.fillStyle = '#0284c7'
  ctx.font = '700 44px "Chakra Petch", sans-serif'
  ctx.fillText(unit, cx, 360)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

// Create crisp silkscreen label texture for control legends
function createSilkscreenTexture(text: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 96
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#181c24'
  ctx.fillRect(0, 0, 512, 96)

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)'
  ctx.lineWidth = 4
  ctx.strokeRect(2, 2, 508, 92)

  ctx.fillStyle = '#f8fafc'
  ctx.font = '700 40px "JetBrains Mono", monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 256, 48)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

// Create crisp 3D nameplate textures for the cabinet front plates
function createPlateTexture(
  lines: string[],
  bg: string,
  fg: string,
  width: number,
  height: number,
  fontSize: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = bg
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = fg
  ctx.font = `700 ${fontSize}px "Chakra Petch", "Segoe UI", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const lineHeight = fontSize * 1.15
  const totalH = lines.length * lineHeight
  const startY = (height - totalH) / 2 + lineHeight / 2

  lines.forEach((line, idx) => {
    ctx.fillText(line, width / 2, startY + idx * lineHeight)
  })

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

const MODEL_URL = `${import.meta.env.BASE_URL}models/electrical_panel.glb`
const DRACO_URL = `${import.meta.env.BASE_URL}draco/`

export const PanelModel: React.FC = () => {
  const { scene } = useGLTF(MODEL_URL, DRACO_URL)
  
  // Clone scene so materials can be safely individualized
  const clonedScene = useMemo(() => scene.clone(true), [scene])

  // Nameplate, Gauge Dial & Silkscreen textures
  const namePlateTex = useMemo(
    () => createPlateTexture(['Chanawit Krobbang'], '#1e222b', '#f8fafc', 1024, 165, 68),
    []
  )
  const rolePlateTex = useMemo(
    () => createPlateTexture(['Electrical', 'Engineer'], '#f2c20a', '#0f172a', 512, 192, 62),
    []
  )
  const voltDialTex = useMemo(() => createGaugeDialTexture('VOLTS AC', 500), [])
  const ampDialTex = useMemo(() => createGaugeDialTexture('AMPS AC', 50), [])
  const lblBreaker = useMemo(() => createSilkscreenTexture('ABOUT ME'), [])
  const lblSelector = useMemo(() => createSilkscreenTexture('PROJECTS'), [])
  const lblStart = useMemo(() => createSilkscreenTexture('RESUME'), [])
  const lblEStop = useMemo(() => createSilkscreenTexture('E-STOP'), [])
  const lblVolt = useMemo(() => createSilkscreenTexture('SOFT SKILLS'), [])
  const lblAmp = useMemo(() => createSilkscreenTexture('TECH SKILLS'), [])

  // Zustand Store
  const isPowered = usePanelStore((s) => s.isPowered)
  const isEStopActive = usePanelStore((s) => s.isEStopActive)
  const selectorMode = usePanelStore((s) => s.selectorMode)
  const isRunning = usePanelStore((s) => s.isRunning)
  const isStartButtonPressed = usePanelStore((s) => s.isStartButtonPressed)
  const isDoorOpen = usePanelStore((s) => s.isDoorOpen)
  const targetVoltage = usePanelStore((s) => s.targetVoltage)
  const targetCurrent = usePanelStore((s) => s.targetCurrent)
  const selectedComponent = usePanelStore((s) => s.selectedComponent)
  const hoveredComponent = usePanelStore((s) => s.hoveredComponent)

  const toggleBreaker = usePanelStore((s) => s.toggleBreaker)
  const toggleEStop = usePanelStore((s) => s.toggleEStop)
  const cycleSelector = usePanelStore((s) => s.cycleSelector)
  const pressStartButton = usePanelStore((s) => s.pressStartButton)
  const setSelectedComponent = usePanelStore((s) => s.setSelectedComponent)
  const setHoveredComponent = usePanelStore((s) => s.setHoveredComponent)

  // References to animated nodes
  const nodesRef = useRef<{
    mainBreaker: THREE.Object3D | null
    eStop: THREE.Object3D | null
    selector: THREE.Object3D | null
    startButton: THREE.Object3D | null
    voltmeterNeedle: THREE.Object3D | null
    ammeterNeedle: THREE.Object3D | null
    fan: THREE.Object3D | null
    ledPower: THREE.Mesh | null
    ledFault: THREE.Mesh | null
    plc: THREE.Object3D | null
  }>({
    mainBreaker: null,
    eStop: null,
    selector: null,
    startButton: null,
    voltmeterNeedle: null,
    ammeterNeedle: null,
    fan: null,
    ledPower: null,
    ledFault: null,
    plc: null
  })

  // Simulated live telemetry values for dampening
  const liveVoltage = useRef(targetVoltage)
  const liveCurrent = useRef(targetCurrent)
  const fanVelocity = useRef(0)
  const baseZRef = useRef({ eStop: 0.145, startButton: 0.144 })

  // Door hinge pivot & hover debounce
  const doorPivotRef = useRef<THREE.Group>(null)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Brushed metal map
  const brushedMap = useMemo(() => createBrushedMetalMap(), [])

  // Configure materials, clone materials per mesh, disable glass/interior raycasting, and attach door parts
  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true

        // Clone material so hover tints don't affect shared instances
        if (mesh.material) {
          const enhanceMat = (m: THREE.Material) => {
            const cloned = m.clone() as THREE.MeshStandardMaterial
            if (cloned.isMeshStandardMaterial) {
              cloned.envMapIntensity = 1.35
              if (mesh.name.includes('glass')) {
                cloned.roughness = 0.04
                cloned.metalness = 0.05
                cloned.envMapIntensity = 2.4
                cloned.transparent = true
                cloned.opacity = 0.24
              } else if (cloned.metalness > 0.25) {
                cloned.roughnessMap = brushedMap
                cloned.bumpMap = brushedMap
                cloned.bumpScale = 0.0014
              } else {
                // Subtle industrial powder-coat texture on painted steel / molded parts
                cloned.bumpMap = brushedMap
                cloned.bumpScale = 0.00045
                cloned.roughness = Math.max(cloned.roughness, 0.34)
              }
              cloned.needsUpdate = true
            }
            return cloned
          }
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map(enhanceMat)
          } else {
            mesh.material = enhanceMat(mesh.material)
          }
        }

        // Disable raycasting on glass covers and decorative interior/cabinet shell
        const parentId = getInteractiveId(mesh)
        if (
          mesh.name.includes('glass') ||
          mesh.name === 'enclosure_window_glass' ||
          mesh.name === 'gauge_voltmeter_glass' ||
          mesh.name === 'gauge_ammeter_glass' ||
          parentId === null
        ) {
          mesh.raycast = () => null
        }
      }
    })

    // Cache specific animated object references
    nodesRef.current.mainBreaker = clonedScene.getObjectByName('main_breaker') || null
    nodesRef.current.eStop = clonedScene.getObjectByName('emergency_stop') || null
    nodesRef.current.selector = clonedScene.getObjectByName('selector_switch') || null
    nodesRef.current.startButton = clonedScene.getObjectByName('push_button_start') || null
    nodesRef.current.voltmeterNeedle = clonedScene.getObjectByName('gauge_voltmeter_needle') || null
    nodesRef.current.ammeterNeedle = clonedScene.getObjectByName('gauge_ammeter_needle') || null
    nodesRef.current.fan = clonedScene.getObjectByName('cooling_fan') || null
    nodesRef.current.ledPower = (clonedScene.getObjectByName('indicator_led_power') as THREE.Mesh) || null
    nodesRef.current.ledFault = (clonedScene.getObjectByName('indicator_led_fault') as THREE.Mesh) || null
    nodesRef.current.plc = clonedScene.getObjectByName('plc_controller') || null

    // Attach door and all door-mounted controls to the left-hinge pivot so they swing open together
    const doorPivot = doorPivotRef.current
    if (doorPivot) {
      doorPivot.updateMatrixWorld(true)
      clonedScene.updateMatrixWorld(true)
      const doorParts = [
        'enclosure_door',
        'enclosure_window_glass',
        'main_breaker',
        'emergency_stop',
        'selector_switch',
        'push_button_start',
        'indicator_led_power',
        'indicator_led_fault',
        'gauge_voltmeter',
        'gauge_ammeter'
      ]
      doorParts.forEach((name) => {
        const obj = clonedScene.getObjectByName(name)
        if (obj && obj.parent !== doorPivot) {
          doorPivot.attach(obj)
        }
      })
    }

    // Record local Z positions AFTER attaching to doorPivot so depression stays flush on the door
    if (nodesRef.current.eStop) baseZRef.current.eStop = nodesRef.current.eStop.position.z
    if (nodesRef.current.startButton) baseZRef.current.startButton = nodesRef.current.startButton.position.z
  }, [clonedScene, brushedMap])

  // Apply hover and selection visual highlights
  useEffect(() => {
    const applyHighlights = (root: THREE.Object3D | null) => {
      if (!root) return
      root.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh
          const parentId = getInteractiveId(mesh)
          const isHovered = parentId !== null && parentId === hoveredComponent
          const isSelected = parentId !== null && parentId === selectedComponent

          const mat = mesh.material as THREE.MeshStandardMaterial
          if (mat && mat.emissive) {
            if (mesh.name === 'indicator_led_power' || mesh.name === 'indicator_led_fault') {
              return
            }

            if (isSelected) {
              mat.emissive.setHex(0x38bdf8)
              mat.emissiveIntensity = 0.4
            } else if (isHovered) {
              mat.emissive.setHex(0x06b6d4)
              mat.emissiveIntensity = 0.25
            } else {
              mat.emissive.setHex(0x000000)
              mat.emissiveIntensity = 0.0
            }
          }
        }
      })
    }

    applyHighlights(clonedScene)
    applyHighlights(doorPivotRef.current)
  }, [clonedScene, hoveredComponent, selectedComponent])

  // Animation Loop
  useFrame((state, delta) => {
    const nodes = nodesRef.current
    const time = state.clock.getElapsedTime()

    // 0. Hinged Door Swing (0 closed, -105 deg open)
    if (doorPivotRef.current) {
      const targetDoorRot = isDoorOpen ? -Math.PI * 0.58 : 0
      doorPivotRef.current.rotation.y = THREE.MathUtils.damp(
        doorPivotRef.current.rotation.y,
        targetDoorRot,
        7,
        delta
      )
    }

    // 1. Main Breaker Lever Rotation (0 rad when OFF, Math.PI/2 rad when ON)
    if (nodes.mainBreaker) {
      const targetBreakerAngle = isPowered ? Math.PI / 2 : 0
      nodes.mainBreaker.rotation.y = THREE.MathUtils.damp(
        nodes.mainBreaker.rotation.y,
        targetBreakerAngle,
        14,
        delta
      )
    }

    // 2. Emergency Stop Depression (depresses along -Z)
    if (nodes.eStop) {
      const targetEStopZ = isEStopActive ? baseZRef.current.eStop - 0.011 : baseZRef.current.eStop
      nodes.eStop.position.z = THREE.MathUtils.damp(
        nodes.eStop.position.z,
        targetEStopZ,
        16,
        delta
      )
    }

    // 3. Selector Switch Rotation (-45° OFF, 0° MANUAL, +45° AUTO)
    if (nodes.selector) {
      let targetSelectorAngle = 0
      if (selectorMode === 'OFF') targetSelectorAngle = -Math.PI / 4
      else if (selectorMode === 'AUTO') targetSelectorAngle = Math.PI / 4
      else targetSelectorAngle = 0 // MANUAL

      nodes.selector.rotation.y = THREE.MathUtils.damp(
        nodes.selector.rotation.y,
        targetSelectorAngle,
        14,
        delta
      )
    }

    // 4. Start Push Button Depression (depresses along -Z momentarily)
    if (nodes.startButton) {
      const targetButtonZ = isStartButtonPressed ? baseZRef.current.startButton - 0.006 : baseZRef.current.startButton
      nodes.startButton.position.z = THREE.MathUtils.damp(
        nodes.startButton.position.z,
        targetButtonZ,
        20,
        delta
      )
    }

    // 5. Cooling Fan Rotation (Spins around X axis)
    if (nodes.fan) {
      const targetFanVelocity = isPowered ? 28.0 : 0.0
      fanVelocity.current = THREE.MathUtils.damp(
        fanVelocity.current,
        targetFanVelocity,
        isPowered ? 3.5 : 1.5,
        delta
      )
      nodes.fan.rotation.x += fanVelocity.current * delta
    }

    // 6. Power LED Indicator (Green)
    if (nodes.ledPower) {
      const mat = nodes.ledPower.material as THREE.MeshStandardMaterial
      if (mat && mat.emissive) {
        const targetIntensity = isPowered ? 3.0 : 0.0
        mat.emissiveIntensity = THREE.MathUtils.damp(
          mat.emissiveIntensity,
          targetIntensity,
          12,
          delta
        )
      }
    }

    // 7. Fault LED Indicator (Red, blinks on E-Stop)
    if (nodes.ledFault) {
      const mat = nodes.ledFault.material as THREE.MeshStandardMaterial
      if (mat && mat.emissive) {
        if (isEStopActive) {
          // 2.5Hz pulsating flash
          const blink = Math.sin(time * 15.0) > 0 ? 3.5 : 0.4
          mat.emissiveIntensity = blink
        } else {
          mat.emissiveIntensity = THREE.MathUtils.damp(
            mat.emissiveIntensity,
            0.0,
            12,
            delta
          )
        }
      }
    }

    // 8. Meter Needles Dampening with Jitter
    // Voltage: 0 - 500V range -> angle +0.85 (0V) to -0.85 (500V)
    const voltageNoise = (isPowered && isRunning) ? (Math.sin(time * 30.0) * 0.8 + Math.cos(time * 12.0) * 0.5) : 0
    liveVoltage.current = THREE.MathUtils.damp(
      liveVoltage.current,
      targetVoltage + voltageNoise,
      8,
      delta
    )
    if (nodes.voltmeterNeedle) {
      const vRatio = Math.max(0, Math.min(1, liveVoltage.current / 500))
      nodes.voltmeterNeedle.rotation.z = 0.85 - vRatio * 1.70
    }

    // Current: 0 - 50A range -> angle +0.85 (0A) to -0.85 (50A)
    const currentNoise = (isPowered && isRunning) ? (Math.sin(time * 18.0) * 0.4 + Math.sin(time * 45.0) * 0.2) : 0
    liveCurrent.current = THREE.MathUtils.damp(
      liveCurrent.current,
      targetCurrent + currentNoise,
      8,
      delta
    )
    if (nodes.ammeterNeedle) {
      const aRatio = Math.max(0, Math.min(1, liveCurrent.current / 50))
      nodes.ammeterNeedle.rotation.z = 0.85 - aRatio * 1.70
    }
  })

  // Raycasting Handlers with smooth debounce
  const handlePointerOver = (e: any) => {
    e.stopPropagation()
    const id = getInteractiveId(e.object)
    if (id) {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
        hoverTimeoutRef.current = null
      }
      setHoveredComponent(id)
      document.body.style.cursor = 'pointer'
    }
  }

  const handlePointerOut = (e: any) => {
    e.stopPropagation()
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredComponent(null)
      document.body.style.cursor = 'auto'
    }, 110)
  }

  const handleClick = (e: any) => {
    e.stopPropagation()
    const id = getInteractiveId(e.object)
    if (!id) return

    // 1. Functional Behavior + Tactile Mechanical Audio
    if (id === 'main_breaker') {
      toggleBreaker()
      playBreakerClunk()
    } else if (id === 'emergency_stop') {
      toggleEStop()
      playEStopSlam(!isEStopActive)
    } else if (id === 'selector_switch') {
      cycleSelector()
      playDialClick()
    } else if (id === 'push_button_start') {
      pressStartButton()
      playButtonPress()
    }

    // 2. Camera focus & Detail Panel selection
    setSelectedComponent(id)
  }

  // Compute hover tooltip anchor & details
  const hoverInfo = useMemo(() => {
    if (!hoveredComponent) return null
    const entry = (panelData as any)[hoveredComponent]
    const t = entry?.target || [0, 0, 0]
    const pos: [number, number, number] = [
      t[0],
      t[1] + (hoveredComponent === 'enclosure_door' ? 0.56 : 0.11),
      hoveredComponent === 'cooling_fan' ? 0.08 : 0.20
    ]
    return { pos, ...getHoverDetails(hoveredComponent) }
  }, [hoveredComponent])

  return (
    <group>
      <primitive
        object={clonedScene}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      />

      {/* Hinged Front Door Pivot (rotates open around left hinges) */}
      <group
        ref={doorPivotRef}
        position={[-0.375, 0, 0.12]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        {/* Black nameplate: Chanawit Krobbang */}
        <mesh position={[0.225, 0.445, 0.0152]} raycast={() => null}>
          <planeGeometry args={[0.275, 0.042]} />
          <meshStandardMaterial
            map={namePlateTex}
            roughness={0.45}
            metalness={0.2}
            polygonOffset
            polygonOffsetFactor={-1}
          />
        </mesh>
        {/* Yellow plate: Electrical Engineer */}
        <mesh position={[0.575, 0.445, 0.0152]} raycast={() => null}>
          <planeGeometry args={[0.116, 0.042]} />
          <meshStandardMaterial
            map={rolePlateTex}
            roughness={0.4}
            metalness={0.08}
            polygonOffset
            polygonOffsetFactor={-1}
          />
        </mesh>

        {/* Left Analog Gauge Dial Face (Voltmeter -> Soft Skills) */}
        <mesh position={[0.225, -0.02, 0.0265]} raycast={() => null}>
          <circleGeometry args={[0.056, 32]} />
          <meshStandardMaterial
            map={voltDialTex}
            roughness={0.35}
            metalness={0.05}
            polygonOffset
            polygonOffsetFactor={-2}
          />
        </mesh>

        {/* Right Analog Gauge Dial Face (Ammeter -> Tech Skills) */}
        <mesh position={[0.525, -0.02, 0.0265]} raycast={() => null}>
          <circleGeometry args={[0.056, 32]} />
          <meshStandardMaterial
            map={ampDialTex}
            roughness={0.35}
            metalness={0.05}
            polygonOffset
            polygonOffsetFactor={-2}
          />
        </mesh>

        {/* Silkscreen Legend Plates */}
        <mesh position={[0.225, -0.105, 0.0155]} raycast={() => null}>
          <planeGeometry args={[0.11, 0.022]} />
          <meshStandardMaterial map={lblVolt} roughness={0.45} metalness={0.15} polygonOffset polygonOffsetFactor={-1} />
        </mesh>
        <mesh position={[0.525, -0.105, 0.0155]} raycast={() => null}>
          <planeGeometry args={[0.11, 0.022]} />
          <meshStandardMaterial map={lblAmp} roughness={0.45} metalness={0.15} polygonOffset polygonOffsetFactor={-1} />
        </mesh>
        <mesh position={[0.155, -0.325, 0.0155]} raycast={() => null}>
          <planeGeometry args={[0.11, 0.022]} />
          <meshStandardMaterial map={lblBreaker} roughness={0.45} metalness={0.15} polygonOffset polygonOffsetFactor={-1} />
        </mesh>
        <mesh position={[0.375, -0.325, 0.0155]} raycast={() => null}>
          <planeGeometry args={[0.11, 0.022]} />
          <meshStandardMaterial map={lblSelector} roughness={0.45} metalness={0.15} polygonOffset polygonOffsetFactor={-1} />
        </mesh>
        <mesh position={[0.515, -0.365, 0.0155]} raycast={() => null}>
          <planeGeometry args={[0.10, 0.020]} />
          <meshStandardMaterial map={lblStart} roughness={0.45} metalness={0.15} polygonOffset polygonOffsetFactor={-1} />
        </mesh>
        <mesh position={[0.625, -0.365, 0.0155]} raycast={() => null}>
          <planeGeometry args={[0.10, 0.020]} />
          <meshStandardMaterial map={lblEStop} roughness={0.45} metalness={0.15} polygonOffset polygonOffsetFactor={-1} />
        </mesh>
      </group>

      {/* Floating Hover Details Card with smooth spring pop-up */}
      {hoverInfo && (
        <Html
          position={hoverInfo.pos}
          center
          style={{ pointerEvents: 'none' }}
          zIndexRange={[50, 0]}
        >
          <div
            key={hoveredComponent}
            style={{
              minWidth: '190px',
              maxWidth: '280px',
              background: 'rgba(248, 250, 252, 0.90)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(15, 23, 42, 0.14)',
              borderRadius: '12px',
              padding: '10px 14px',
              boxShadow: '0 12px 28px rgba(15, 23, 42, 0.18), 0 2px 6px rgba(15, 23, 42, 0.08)',
              color: '#0f172a',
              fontFamily: "'Outfit', sans-serif",
              pointerEvents: 'none',
              animation: 'hoverPopIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            <style>{`
              @keyframes hoverPopIn {
                0% {
                  opacity: 0;
                  transform: translateY(8px) scale(0.90);
                }
                100% {
                  opacity: 1;
                  transform: translateY(-6px) scale(1);
                }
              }
            `}</style>
            <div style={{
              fontFamily: "'Chakra Petch', sans-serif",
              fontSize: '13px',
              fontWeight: 700,
              color: '#0284c7',
              letterSpacing: '0.03em',
              marginBottom: hoverInfo.lines.length > 0 ? '5px' : '0'
            }}>
              {hoverInfo.title}
            </div>
            {hoverInfo.lines.map((line, i) => (
              <div
                key={i}
                style={{
                  fontSize: '11.5px',
                  color: '#334155',
                  lineHeight: 1.4,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {line}
              </div>
            ))}
            <div style={{
              marginTop: '6px',
              fontSize: '10px',
              fontFamily: "'JetBrains Mono', monospace",
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}>
              Click to inspect
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

useGLTF.preload(MODEL_URL, DRACO_URL)
