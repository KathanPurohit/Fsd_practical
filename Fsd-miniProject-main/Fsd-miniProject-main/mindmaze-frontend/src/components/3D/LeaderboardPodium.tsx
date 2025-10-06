import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, Box, Cylinder, Environment, OrbitControls } from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'

interface LeaderboardEntry {
  username: string
  score: number
  rank: number
  avatar?: string
  level: number
}

interface LeaderboardPodiumProps {
  entries: LeaderboardEntry[]
  animated?: boolean
}

const PodiumStep: React.FC<{
  position: [number, number, number]
  height: number
  color: string
  rank: number
  entry?: LeaderboardEntry
}> = ({ position, height, color, rank, entry }) => {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current && entry) {
      // Gentle floating animation for top 3
      if (rank <= 3) {
        groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + rank) * 0.05
      }
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Podium base */}
      <Cylinder args={[1, 1, height, 8]} position={[0, height / 2, 0]}>
        <meshStandardMaterial 
          color={color} 
          metalness={0.3} 
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </Cylinder>

      {/* Rank number */}
      <Text
        position={[0, height + 0.5, 0]}
        fontSize={0.8}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        #{rank}
      </Text>

      {/* Username */}
      {entry && (
        <>
          <Text
            position={[0, height + 1.5, 0]}
            fontSize={0.4}
            color="white"
            anchorX="center"
            anchorY="middle"
            maxWidth={2}
            textAlign="center"
            font="/fonts/inter-medium.woff"
          >
            {entry.username}
          </Text>

          {/* Score */}
          <Text
            position={[0, height + 2.2, 0]}
            fontSize={0.3}
            color="#fbbf24"
            anchorX="center"
            anchorY="middle"
            font="/fonts/inter-bold.woff"
          >
            {entry.score.toLocaleString()} pts
          </Text>

          {/* Level */}
          <Text
            position={[0, height + 2.7, 0]}
            fontSize={0.25}
            color="#a78bfa"
            anchorX="center"
            anchorY="middle"
            font="/fonts/inter-regular.woff"
          >
            Level {entry.level}
          </Text>
        </>
      )}

      {/* Glow effect */}
      <Cylinder args={[1.1, 1.1, height + 0.1, 8]} position={[0, height / 2, -0.05]}>
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.3}
        />
      </Cylinder>
    </group>
  )
}

const Spotlight: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      {/* Spotlight beam */}
      <Cylinder args={[0.1, 2, 8, 8]} position={[0, 4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial 
          color="#fbbf24" 
          transparent 
          opacity={0.3}
        />
      </Cylinder>
      
      {/* Light source */}
      <Sphere args={[0.2]} position={[0, 8, 0]}>
        <meshStandardMaterial 
          color="#fbbf24" 
          emissive="#fbbf24"
          emissiveIntensity={0.5}
        />
      </Sphere>
    </group>
  )
}

const LeaderboardPodium: React.FC<LeaderboardPodiumProps> = ({ entries, animated = true }) => {
  const topThree = entries.slice(0, 3)
  const colors = ['#ffd700', '#c0c0c0', '#cd7f32'] // Gold, Silver, Bronze

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full h-96"
    >
      <Canvas
        camera={{ position: [0, 5, 10], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[0, 8, 0]} intensity={2} color="#fbbf24" />
        
        <Environment preset="sunset" />
        
        {/* Podium steps */}
        {topThree.map((entry, index) => {
          const height = 3 - index * 0.8
          const xPosition = (index - 1) * 3
          return (
            <PodiumStep
              key={entry.username}
              position={[xPosition, 0, 0]}
              height={height}
              color={colors[index]}
              rank={entry.rank}
              entry={entry}
            />
          )
        })}

        {/* Spotlights for top 3 */}
        {topThree.map((_, index) => (
          <Spotlight key={index} position={[(index - 1) * 3, 0, 5]} />
        ))}

        {/* Title */}
        <Text
          position={[0, 6, 0]}
          fontSize={0.8}
          color="white"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
        >
          LEADERBOARD
        </Text>

        {/* Trophy icon for winner */}
        {topThree[0] && (
          <Text
            position={[0, 4.5, 0]}
            fontSize={1.5}
            color="#ffd700"
            anchorX="center"
            anchorY="middle"
          >
            🏆
          </Text>
        )}

        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate={animated}
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </motion.div>
  )
}

export default LeaderboardPodium
