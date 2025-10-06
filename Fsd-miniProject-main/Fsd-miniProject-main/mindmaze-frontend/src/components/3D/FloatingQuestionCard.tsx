import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, Box, Sphere, Environment, OrbitControls } from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'

interface FloatingQuestionCardProps {
  question: string
  options: string[]
  onAnswer: (answer: string) => void
  isAnswered?: boolean
  correctAnswer?: string
  userAnswer?: string
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
}

const QuestionCard: React.FC<{
  question: string
  options: string[]
  onAnswer: (answer: string) => void
  isAnswered?: boolean
  correctAnswer?: string
  userAnswer?: string
  difficulty: string
}> = ({ question, options, onAnswer, isAnswered, correctAnswer, userAnswer, difficulty }) => {
  const cardRef = useRef<THREE.Group>(null)
  const [hoveredOption, setHoveredOption] = useState<number | null>(null)

  useFrame((state) => {
    if (cardRef.current) {
      // Gentle floating animation
      cardRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      cardRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
  })

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return '#10b981' // green
      case 'medium': return '#f59e0b' // amber
      case 'hard': return '#ef4444' // red
      case 'expert': return '#8b5cf6' // purple
      default: return '#6366f1' // indigo
    }
  }

  const getOptionColor = (index: number) => {
    if (!isAnswered) {
      return hoveredOption === index ? '#3b82f6' : '#64748b'
    }
    
    const currentOption = options[index]
    
    if (currentOption === correctAnswer) {
      return '#10b981' // green for correct
    }
    
    if (currentOption === userAnswer && userAnswer !== correctAnswer) {
      return '#ef4444' // red for wrong
    }
    
    return '#64748b' // gray for others
  }

  return (
    <group ref={cardRef}>
      {/* Main card */}
      <Box args={[4, 3, 0.2]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color={getDifficultyColor(difficulty)} 
          transparent 
          opacity={0.9}
          metalness={0.3}
          roughness={0.2}
        />
      </Box>

      {/* Question text */}
      <Text
        position={[0, 1, 0.11]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={3.5}
        textAlign="center"
        font="/fonts/inter-bold.woff"
      >
        {question}
      </Text>

      {/* Options */}
      {options.map((option, index) => (
        <group key={index}>
          {/* Option background */}
          <Box 
            args={[3.5, 0.4, 0.1]} 
            position={[0, 0.3 - index * 0.5, 0.11]}
            onClick={() => !isAnswered && onAnswer(option)}
            onPointerOver={() => setHoveredOption(index)}
            onPointerOut={() => setHoveredOption(null)}
          >
            <meshStandardMaterial 
              color={getOptionColor(index)}
              transparent
              opacity={0.8}
            />
          </Box>

          {/* Option text */}
          <Text
            position={[0, 0.3 - index * 0.5, 0.12]}
            fontSize={0.15}
            color="white"
            anchorX="center"
            anchorY="middle"
            maxWidth={3.2}
            textAlign="center"
            font="/fonts/inter-regular.woff"
          >
            {option}
          </Text>
        </group>
      ))}

      {/* Difficulty indicator */}
      <Sphere args={[0.1]} position={[1.8, 1.3, 0.11]}>
        <meshStandardMaterial color={getDifficultyColor(difficulty)} />
      </Sphere>

      {/* Glow effect */}
      <Box args={[4.2, 3.2, 0.05]} position={[0, 0, -0.05]}>
        <meshStandardMaterial 
          color={getDifficultyColor(difficulty)} 
          transparent 
          opacity={0.3}
        />
      </Box>
    </group>
  )
}

const FloatingQuestionCard: React.FC<FloatingQuestionCardProps> = ({
  question,
  options,
  onAnswer,
  isAnswered = false,
  correctAnswer,
  userAnswer,
  difficulty
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full h-full"
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        <Environment preset="sunset" />
        
        <QuestionCard
          question={question}
          options={options}
          onAnswer={onAnswer}
          isAnswered={isAnswered}
          correctAnswer={correctAnswer}
          userAnswer={userAnswer}
          difficulty={difficulty}
        />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </motion.div>
  )
}

export default FloatingQuestionCard
