import { useState, useEffect, useMemo } from 'react'
import { CanvasTexture, Vector3, Color, BufferGeometry, Float32BufferAttribute } from 'three'
import { useThree } from '@react-three/fiber'
import {Sky, Float, Text, ScrollControls, useGLTF } from "@react-three/drei"

import Scene from './Components/Scene.jsx'
import Ocean from "./Components/Ocean.jsx"
import Lamp from './Components/Lamp.jsx'
import CameraScroll from './Components/CameraScroll.jsx'

import "./App.css";
import ScrollHelper from "./Components/ScrollHelper.jsx";

function getSunParams(mode, date) {
  if (mode === 'dark') {
    return { angle: -0.1, intensity: 0.05, sky: { turbidity: 10, rayleigh: 2, mieCoefficient: 0.05, mieDirectionalG: 0.3 } }
  }
  if (mode === 'light') {
    return { angle: 0.5, intensity: 1.5, sky: { turbidity: 2, rayleigh: 0.5, mieCoefficient: 0.005, mieDirectionalG: 0.7 } }
  }

  const hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600
  const t = ((hour - 6) / 12) * Math.PI
  let angle = Math.sin(t)
  if (hour < 6 || hour > 18) angle = -0.2
  const intensity = Math.max(0.05, angle * 2.5)
  const turb = 2 + (1 - Math.max(0, angle)) * 8
  return {
    angle: Math.max(-0.3, angle),
    intensity,
    sky: {
      turbidity: turb,
      rayleigh: 0.5 + (1 - Math.max(0, angle)) * 1.5,
      mieCoefficient: 0.005 + (1 - Math.max(0, angle)) * 0.045,
      mieDirectionalG: 0.7,
    }
  }
}

function NightSkyBackground() {
  const { scene } = useThree()
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 2
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    const grad = ctx.createLinearGradient(0, 0, 0, 256)
    grad.addColorStop(0, '#05050f')
    grad.addColorStop(0.3, '#0a0a1a')
    grad.addColorStop(0.6, '#0d1128')
    grad.addColorStop(0.85, '#151535')
    grad.addColorStop(1, '#1a1a3a')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 2, 256)
    const tex = new CanvasTexture(canvas)
    tex.magFilter = 1043
    tex.minFilter = 1043
    return tex
  }, [])

  useEffect(() => {
    scene.background = texture
    return () => { scene.background = null }
  }, [scene, texture])

  return null
}

export default function App({ mode, onModeChange }) {
  const { nodes } = useGLTF('./Model/House.glb')
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    if (mode !== 'auto') return
    setNow(new Date())
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [mode])

  const params = useMemo(() => getSunParams(mode, now), [mode, now])
  const angle = params.angle

  const sunDir = useMemo(() => {
    const d = new Vector3(Math.cos(angle * 1.5), angle + 0.3, Math.sin(angle * 1.2)).normalize()
    return d
  }, [angle])

  const sunDistance = 300
  const sunPos = useMemo(() => sunDir.clone().multiplyScalar(sunDistance), [sunDir])
  const visualDist = 180
  const visualSunPos = useMemo(() => sunDir.clone().multiplyScalar(visualDist), [sunDir])

  const ambientIntensity = useMemo(() => Math.max(0.05, angle * 0.5 + 0.3), [angle])

  const glowTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
    gradient.addColorStop(0, 'rgba(255, 240, 200, 1)')
    gradient.addColorStop(0.1, 'rgba(255, 220, 150, 0.6)')
    gradient.addColorStop(0.3, 'rgba(255, 180, 80, 0.15)')
    gradient.addColorStop(1, 'rgba(255, 120, 20, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 256, 256)
    return new CanvasTexture(canvas)
  }, [])

  const moonGlowTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
    gradient.addColorStop(0, 'rgba(220, 230, 255, 1)')
    gradient.addColorStop(0.1, 'rgba(200, 215, 255, 0.5)')
    gradient.addColorStop(0.3, 'rgba(180, 200, 255, 0.1)')
    gradient.addColorStop(1, 'rgba(150, 180, 255, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 256, 256)
    return new CanvasTexture(canvas)
  }, [])

  const starPositions = useMemo(() => {
    const count = 2000
    const positions = new Float32Array(count * 3)
    const radius = 180
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.cos(phi) * 0.6
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
    }
    const geom = new BufferGeometry()
    geom.setAttribute('position', new Float32BufferAttribute(positions, 3))
    return geom
  }, [])

  const skySunPos = useMemo(() => sunDir.toArray(), [sunDir])
  const showSun = angle > 0
  const isNight = mode === 'dark' || (mode === 'auto' && angle < 0)
  const moonDir = useMemo(() => new Vector3(-sunDir.x, -sunDir.y + 0.2, -sunDir.z).normalize(), [sunDir])
  const moonPos = useMemo(() => moonDir.clone().multiplyScalar(visualDist), [moonDir])

  const textColor = useMemo(() => {
    const c = new Color(0xf4eadb)
    c.multiplyScalar(Math.max(0.3, angle + 0.3))
    return `#${c.getHexString()}`
  }, [angle])

  return (
    <>
      <ambientLight intensity={ambientIntensity} color={mode === 'dark' ? '#111122' : '#ffffff'} />
      <directionalLight position={sunPos} intensity={params.intensity} />

      <Ocean mode={mode} sunDir={sunDir} />
      {isNight ? <NightSkyBackground /> : <Sky sunPosition={skySunPos} {...params.sky} />}


      {showSun && (
        <group position={visualSunPos}>
          <mesh>
            <sphereGeometry args={[4, 32, 32]} />
            <meshBasicMaterial color="#ffeedd" />
          </mesh>
          <sprite scale={[30, 30, 1]}>
            <spriteMaterial map={glowTexture} transparent depthWrite={false} />
          </sprite>
          <sprite scale={[60, 60, 1]}>
            <spriteMaterial map={glowTexture} transparent opacity={0.3} depthWrite={false} />
          </sprite>
        </group>
      )}

      {isNight && (
        <group position={moonPos}>
          <mesh>
            <sphereGeometry args={[3.5, 32, 32]} />
            <meshBasicMaterial color="#e8ecf5" />
          </mesh>
          <sprite scale={[25, 25, 1]}>
            <spriteMaterial map={moonGlowTexture} transparent depthWrite={false} />
          </sprite>
          <sprite scale={[50, 50, 1]}>
            <spriteMaterial map={moonGlowTexture} transparent opacity={0.3} depthWrite={false} />
          </sprite>
        </group>
      )}

      {isNight && (
        <points geometry={starPositions}>
          <pointsMaterial size={0.8} color="#ffffff" transparent opacity={1} sizeAttenuation depthWrite={false} />
        </points>
      )}
      {isNight && (
        <points geometry={starPositions}>
          <pointsMaterial size={1.5} color="#ccddff" transparent opacity={0.3} sizeAttenuation depthWrite={false} />
        </points>
      )}

      <Float rotationIntensity={0.9}>
          <Text
            font="./fonts/font.ttf"
            position-y={ 15 }
            rotation-y={ 0.48 * Math.PI }
            curveRadius={ -50 }
            fontSize={ 5 }
            color={textColor}
          >
            Abir's House
        </Text>
      </Float>

      <Lamp mode={mode} onModeChange={onModeChange} position={[8, 2.05, 4]} />

      <Scene nodes={ nodes }/>
     
          
      <ScrollControls pages={25} damping={0.2}>    
        <CameraScroll nodes={ nodes }/>
      </ScrollControls>

      <ScrollHelper/>
      
    </>
  )
}

useGLTF.preload('./Model/House.glb')
