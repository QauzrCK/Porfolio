import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, Html, Sky } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { PanelModel } from './PanelModel'
import { CameraRig } from './CameraRig'
import { EngineeringBackdrop } from './EngineeringBackdrop'
import { usePanelStore } from '../state/panelStore'

const LoadingFallback: React.FC = () => (
  <Html center>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      color: '#38bdf8',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '14px',
      letterSpacing: '0.1em',
      background: 'rgba(15, 23, 42, 0.85)',
      padding: '18px 24px',
      borderRadius: '12px',
      border: '1px solid rgba(56, 189, 248, 0.3)',
      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        border: '3px solid rgba(56, 189, 248, 0.2)',
        borderTopColor: '#38bdf8',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <span>LOADING 3D PANEL...</span>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  </Html>
)

export const ControlPanelScene: React.FC = () => {
  const isEStopActive = usePanelStore((s) => s.isEStopActive)

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0.52, 0.14, 1.98], fov: 42 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0
        }}
      >
        <color attach="background" args={['#b8d4ec']} />
        <fog attach="fog" args={['#c8dff2', 12, 34]} />

        <Sky
          distance={450000}
          sunPosition={[12, 8, 10]}
          turbidity={4.5}
          rayleigh={1.1}
          mieCoefficient={0.005}
          mieDirectionalG={0.82}
        />

        {/* Natural Daylight & Industrial Bounce Lighting */}
        <ambientLight intensity={0.45} color="#e2e8f0" />
        <hemisphereLight args={['#dbeafe', '#64748b', 0.95]} />
        <directionalLight
          position={[5.5, 7.5, 5.5]}
          intensity={2.8}
          color="#fff7ed"
          castShadow
          shadow-mapSize={2048}
          shadow-bias={-0.0002}
          shadow-normalBias={0.02}
          shadow-camera-left={-4.5}
          shadow-camera-right={4.5}
          shadow-camera-top={4.5}
          shadow-camera-bottom={-4.5}
          shadow-camera-near={0.5}
          shadow-camera-far={22}
        />
        <directionalLight position={[-4.0, 2.5, 2.5]} intensity={0.85} color="#bae6fd" />
        <pointLight position={[0, 1.6, -1.8]} intensity={0.8} color="#38bdf8" />
        <pointLight position={[-1.4, 0.5, 1.2]} intensity={0.45} color="#fde68a" />
        {isEStopActive && (
          <pointLight position={[0, 0.95, 0.9]} intensity={3.2} distance={4.5} color="#ef4444" />
        )}

        <Suspense fallback={<LoadingFallback />}>
          <group position={[0, 0, 0]}>
            <PanelModel />
          </group>

          <EngineeringBackdrop />

          <ContactShadows
            position={[0, -0.558, 0]}
            opacity={0.7}
            scale={3.6}
            blur={2.0}
            far={1.6}
            color="#000000"
          />

          {/* Realistic Outdoor Sky & Ground-Bounce Environment for Physically-Based Reflections */}
          <Environment resolution={512}>
            <group rotation={[-Math.PI / 3, 0, 0]}>
              <Lightformer
                form="circle"
                intensity={5.5}
                color="#fffbeb"
                scale={[3.5, 3.5, 1]}
                position={[4, 4, 3]}
              />
              <Lightformer
                form="rect"
                intensity={2.8}
                color="#e0f2fe"
                scale={[12, 6, 1]}
                position={[0, 4, 0]}
              />
              <Lightformer
                form="rect"
                intensity={1.6}
                color="#bae6fd"
                scale={[8, 3, 1]}
                position={[-5, 1.5, -2]}
                target={[0, 0, 0]}
              />
              <Lightformer
                form="rect"
                intensity={0.9}
                color="#94a3b8"
                scale={[12, 12, 1]}
                position={[0, -4, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
              />
            </group>
          </Environment>
        </Suspense>

        <CameraRig />

        <EffectComposer>
          <Bloom
            mipmapBlur
            luminanceThreshold={1.1}
            intensity={0.45}
          />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
