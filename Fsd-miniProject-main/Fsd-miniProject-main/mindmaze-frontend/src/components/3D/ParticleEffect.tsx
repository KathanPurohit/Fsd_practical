import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

interface ParticleEffectProps {
  type: 'correct' | 'wrong' | 'celebration'
  active: boolean
  onComplete?: () => void
}

const ParticleSystem: React.FC<{
  type: 'correct' | 'wrong' | 'celebration'
  active: boolean
  onComplete?: () => void
}> = ({ type, active, onComplete }) => {
  const pointsRef = useRef<THREE.Points>(null)
  const particleCount = type === 'celebration' ? 1000 : 500

  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Initial positions (start from center)
      positions[i3] = 0
      positions[i3 + 1] = 0
      positions[i3 + 2] = 0
      
      // Random velocities based on type
      if (type === 'correct') {
        // Green particles exploding outward
        velocities[i3] = (Math.random() - 0.5) * 10
        velocities[i3 + 1] = Math.random() * 8 + 2
        velocities[i3 + 2] = (Math.random() - 0.5) * 10
      } else if (type === 'wrong') {
        // Red particles falling down
        velocities[i3] = (Math.random() - 0.5) * 6
        velocities[i3 + 1] = -Math.random() * 8 - 2
        velocities[i3 + 2] = (Math.random() - 0.5) * 6
      } else if (type === 'celebration') {
        // Colorful particles in all directions
        velocities[i3] = (Math.random() - 0.5) * 15
        velocities[i3 + 1] = (Math.random() - 0.5) * 15
        velocities[i3 + 2] = (Math.random() - 0.5) * 15
      }
    }
    
    return { positions, velocities }
  }, [type, particleCount])

  const colors = useMemo(() => {
    const colorArray = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      if (type === 'correct') {
        // Green to yellow gradient
        colorArray[i3] = Math.random() * 0.3 + 0.1     // R: 0.1-0.4
        colorArray[i3 + 1] = Math.random() * 0.5 + 0.7 // G: 0.7-1.2
        colorArray[i3 + 2] = Math.random() * 0.2 + 0.1 // B: 0.1-0.3
      } else if (type === 'wrong') {
        // Red to orange gradient
        colorArray[i3] = Math.random() * 0.5 + 0.8     // R: 0.8-1.3
        colorArray[i3 + 1] = Math.random() * 0.3 + 0.1 // G: 0.1-0.4
        colorArray[i3 + 2] = Math.random() * 0.2 + 0.1 // B: 0.1-0.3
      } else if (type === 'celebration') {
        // Rainbow colors
        const hue = Math.random() * 360
        const color = new THREE.Color().setHSL(hue / 360, 0.8, 0.6)
        colorArray[i3] = color.r
        colorArray[i3 + 1] = color.g
        colorArray[i3 + 2] = color.b
      }
    }
    
    return colorArray
  }, [type, particleCount])

  useFrame((state, delta) => {
    if (!active || !pointsRef.current) return

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array
    const velocities = particles.velocities
    let allParticlesGone = true

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Update positions
      positions[i3] += velocities[i3] * delta
      positions[i3 + 1] += velocities[i3 + 1] * delta
      positions[i3 + 2] += velocities[i3 + 2] * delta
      
      // Apply gravity for wrong answers
      if (type === 'wrong') {
        velocities[i3 + 1] -= 5 * delta
      }
      
      // Check if particle is still visible
      if (Math.abs(positions[i3]) < 20 && Math.abs(positions[i3 + 1]) < 20 && Math.abs(positions[i3 + 2]) < 20) {
        allParticlesGone = false
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true

    // Complete animation when all particles are gone
    if (allParticlesGone && onComplete) {
      onComplete()
    }
  })

  if (!active) return null

  return (
    <Points ref={pointsRef} positions={particles.positions} colors={colors}>
      <PointMaterial
        size={0.1}
        sizeAttenuation={true}
        vertexColors={true}
        transparent={true}
        opacity={0.8}
      />
    </Points>
  )
}

const ParticleEffect: React.FC<ParticleEffectProps> = ({ type, active, onComplete }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <ParticleSystem type={type} active={active} onComplete={onComplete} />
      </Canvas>
    </div>
  )
}

export default ParticleEffect
