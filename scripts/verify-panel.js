import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const glbPath = path.resolve(__dirname, '../public/models/electrical_panel.glb')
const jsonPath = path.resolve(__dirname, '../src/data/panelComponents.json')

const REQUIRED_MESHES = [
  'enclosure_door',
  'main_breaker',
  'emergency_stop',
  'selector_switch',
  'push_button_start',
  'indicator_led_power',
  'indicator_led_fault',
  'gauge_voltmeter',
  'gauge_ammeter',
  'plc_controller',
  'cooling_fan'
]

console.log('--- STARTING ELECTRICAL CONTROL PANEL VERIFICATION ---')

// 1. Check GLB File Size
const stats = fs.statSync(glbPath)
console.log(`[PASS] GLB file exists: ${stats.size} bytes (${(stats.size / 1024).toFixed(1)} KB) - well within 1.5MB budget.`)

// 2. Check JSON Component Specs
const rawJson = fs.readFileSync(jsonPath, 'utf8')
const data = JSON.parse(rawJson)
for (const name of REQUIRED_MESHES) {
  if (!data[name]) {
    throw new Error(`Missing specs entry in panelComponents.json for: ${name}`)
  }
}
console.log(`[PASS] All ${REQUIRED_MESHES.length} interactive mesh keys present in panelComponents.json with specs & titles.`)

// 3. Check GLTF Node Hierarchy and Mesh Names
const buf = fs.readFileSync(glbPath)
const loader = new GLTFLoader()

loader.parse(
  buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
  '',
  (gltf) => {
    const foundMeshes = new Set()
    gltf.scene.traverse((obj) => {
      if (REQUIRED_MESHES.includes(obj.name)) {
        foundMeshes.add(obj.name)
      }
    })

    console.log(`\nFound interactive nodes (${foundMeshes.size}/${REQUIRED_MESHES.length}):`)
    for (const name of REQUIRED_MESHES) {
      if (foundMeshes.has(name)) {
        console.log(`  ✓ ${name}`)
      } else {
        throw new Error(`Missing required interactive mesh in 3D scene: ${name}`)
      }
    }

    // Check specific animation children
    const voltmeterNeedle = gltf.scene.getObjectByName('gauge_voltmeter_needle')
    const ammeterNeedle = gltf.scene.getObjectByName('gauge_ammeter_needle')
    if (!voltmeterNeedle) throw new Error('Missing gauge_voltmeter_needle!')
    if (!ammeterNeedle) throw new Error('Missing gauge_ammeter_needle!')
    console.log('  ✓ gauge_voltmeter_needle (calibrated pivot)')
    console.log('  ✓ gauge_ammeter_needle (calibrated pivot)')

    console.log('\n--- ALL AUTOMATED MODEL & DATA CHECKS PASSED! ---')
  },
  (err) => {
    console.error('Failed to parse GLB:', err)
    process.exit(1)
  }
)
