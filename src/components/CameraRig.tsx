import React, { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { usePanelStore } from '../state/panelStore'
import panelData from '../data/panelComponents.json'

const DEFAULT_CAMERA_POS = new THREE.Vector3(0.52, 0.14, 1.98)
const DEFAULT_TARGET = new THREE.Vector3(0, -0.02, 0)

export const CameraRig: React.FC = () => {
  const { camera } = useThree()
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const selectedComponent = usePanelStore((s) => s.selectedComponent)

  const targetCamPos = useRef(DEFAULT_CAMERA_POS.clone())
  const targetLookAt = useRef(DEFAULT_TARGET.clone())
  const isTransitioning = useRef(false)

  // Update target coordinates when selectedComponent changes
  useEffect(() => {
    if (selectedComponent && (panelData as any)[selectedComponent]) {
      const data = (panelData as any)[selectedComponent]
      targetCamPos.current.set(
        data.cameraOffset[0],
        data.cameraOffset[1],
        data.cameraOffset[2]
      )
      targetLookAt.current.set(
        data.target[0],
        data.target[1],
        data.target[2]
      )
    } else {
      targetCamPos.current.copy(DEFAULT_CAMERA_POS)
      targetLookAt.current.copy(DEFAULT_TARGET)
    }
    isTransitioning.current = true
  }, [selectedComponent])

  useFrame((_, delta) => {
    if (!isTransitioning.current || !controlsRef.current) return

    // Smoothly interpolate camera position
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamPos.current.x, 6, delta)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamPos.current.y, 6, delta)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamPos.current.z, 6, delta)

    // Smoothly interpolate orbit target
    const currentTarget = controlsRef.current.target
    currentTarget.x = THREE.MathUtils.damp(currentTarget.x, targetLookAt.current.x, 6, delta)
    currentTarget.y = THREE.MathUtils.damp(currentTarget.y, targetLookAt.current.y, 6, delta)
    currentTarget.z = THREE.MathUtils.damp(currentTarget.z, targetLookAt.current.z, 6, delta)

    controlsRef.current.update()

    // Stop dampening when camera is close enough to target
    const distPos = camera.position.distanceTo(targetCamPos.current)
    const distTarget = currentTarget.distanceTo(targetLookAt.current)
    if (distPos < 0.005 && distTarget < 0.005) {
      isTransitioning.current = false
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan={false}
      enableDamping={true}
      dampingFactor={0.05}
      minDistance={0.35}
      maxDistance={3.2}
      minPolarAngle={Math.PI / 4} // ~45 deg
      maxPolarAngle={Math.PI * 0.72} // ~130 deg
      minAzimuthAngle={-Math.PI / 2.2} // ~81 deg left
      maxAzimuthAngle={Math.PI / 2.2} // ~81 deg right
      onStart={() => {
        // If user manually grabs controls, pause automated transition
        isTransitioning.current = false
      }}
    />
  )
}
