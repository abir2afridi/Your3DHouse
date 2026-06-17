import { useState, useMemo, useRef } from 'react'
import { CanvasTexture } from 'three'

export default function Lamp({ mode, onModeChange, position }) {
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef()
  const isOn = mode === 'light'

  const glowTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    if (isOn) {
      gradient.addColorStop(0, 'rgba(255, 220, 100, 1)')
      gradient.addColorStop(0.3, 'rgba(255, 180, 50, 0.4)')
      gradient.addColorStop(1, 'rgba(255, 150, 20, 0)')
    } else {
      gradient.addColorStop(0, 'rgba(60, 60, 70, 0.5)')
      gradient.addColorStop(0.3, 'rgba(30, 30, 40, 0.15)')
      gradient.addColorStop(1, 'rgba(10, 10, 20, 0)')
    }
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 128, 128)
    return new CanvasTexture(canvas)
  }, [isOn])

  const tooltipTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 160
    canvas.height = 36
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = 'rgba(0,0,0,0.75)'
    const r = 8
    ctx.beginPath()
    ctx.moveTo(r, 0)
    ctx.lineTo(160 - r, 0)
    ctx.quadraticCurveTo(160, 0, 160, r)
    ctx.lineTo(160, 36 - r)
    ctx.quadraticCurveTo(160, 36, 160 - r, 36)
    ctx.lineTo(r, 36)
    ctx.quadraticCurveTo(0, 36, 0, 36 - r)
    ctx.lineTo(0, r)
    ctx.quadraticCurveTo(0, 0, r, 0)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#ffd866'
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(isOn ? '☽  Turn OFF' : '☀  Turn ON', 80, 18)
    return new CanvasTexture(canvas)
  }, [isOn])

  const toggle = () => {
    onModeChange(isOn ? 'dark' : 'light')
  }

  const s = 2
  const pointerProps = {
    onPointerEnter: (e) => { e.stopPropagation(); setHovered(true) },
    onPointerLeave: () => setHovered(false),
    onClick: toggle,
  }

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, -0.5 * s, 0]} {...pointerProps}>
        <cylinderGeometry args={[0.08 * s, 0.12 * s, 1.2 * s, 8]} />
        <meshStandardMaterial color="#6b4226" />
      </mesh>
      <mesh position={[0, 0.25 * s, 0]} {...pointerProps}>
        <boxGeometry args={[0.4 * s, 0.1 * s, 0.4 * s]} />
        <meshStandardMaterial color="#5a3a1e" />
      </mesh>
      <mesh position={[0, 0.5 * s, 0]} {...pointerProps}>
        <boxGeometry args={[0.1 * s, 0.3 * s, 0.1 * s]} />
        <meshStandardMaterial color="#7a5030" />
      </mesh>
      <mesh position={[0, 0.7 * s, 0]} {...pointerProps}>
        <coneGeometry args={[0.25 * s, 0.2 * s, 6]} />
        <meshStandardMaterial color="#5a3a1e" />
      </mesh>
      <mesh position={[0, 0.35 * s, 0]} {...pointerProps}>
        <sphereGeometry args={[0.12 * s, 12, 12]} />
        <meshStandardMaterial
          color={isOn ? '#ffdd77' : '#1a1a1a'}
          emissive={isOn ? '#ffaa44' : '#000'}
          emissiveIntensity={isOn ? 3 : 0}
        />
      </mesh>
      {isOn && (
        <sprite position={[0, 0.35 * s, 0]} scale={[2 * s, 2 * s, 1]}>
          <spriteMaterial map={glowTexture} transparent depthWrite={false} />
        </sprite>
      )}
      {hovered && (
        <sprite position={[0, 1.4 * s, 0]} scale={[1.6, 0.4, 1]}>
          <spriteMaterial map={tooltipTexture} transparent depthWrite={false} />
        </sprite>
      )}
    </group>
  )
}
