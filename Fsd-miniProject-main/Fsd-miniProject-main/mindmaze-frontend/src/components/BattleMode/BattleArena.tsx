import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Crown, Sword, Shield, Target, Clock } from 'lucide-react'
import FloatingQuestionCard from '../3D/FloatingQuestionCard'
import ParticleEffect from '../3D/ParticleEffect'
import { useWebSocket } from '../../hooks/useWebSocket'

interface BattlePlayer {
  username: string
  score: number
  streak: number
  health: number
  avatar?: string
  isReady: boolean
  answerTime?: number
}

interface BattleQuestion {
  id: string
  question: string
  options: string[]
  correct_answer: string
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  time_limit: number
  points: number
}

interface BattleArenaProps {
  battleId: string
  player1: BattlePlayer
  player2: BattlePlayer
  currentQuestion: BattleQuestion
  questionNumber: number
  totalQuestions: number
  onAnswer: (answer: string) => void
  onBattleComplete: (winner: string) => void
}

const BattleArena: React.FC<BattleArenaProps> = ({
  battleId,
  player1,
  player2,
  currentQuestion,
  questionNumber,
  totalQuestions,
  onAnswer,
  onBattleComplete
}) => {
  const [timeRemaining, setTimeRemaining] = useState(currentQuestion.time_limit)
  const [showParticles, setShowParticles] = useState(false)
  const [particleType, setParticleType] = useState<'correct' | 'wrong' | 'celebration'>('correct')
  const [battlePhase, setBattlePhase] = useState<'preparation' | 'question' | 'answer' | 'result' | 'complete'>('preparation')
  const { sendMessage } = useWebSocket()

  useEffect(() => {
    if (timeRemaining > 0 && battlePhase === 'question') {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0 && battlePhase === 'question') {
      handleTimeUp()
    }
  }, [timeRemaining, battlePhase])

  useEffect(() => {
    // Start battle after 3 seconds of preparation
    if (battlePhase === 'preparation') {
      const timer = setTimeout(() => {
        setBattlePhase('question')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [battlePhase])

  const handleAnswer = (answer: string) => {
    if (battlePhase !== 'question') return

    setBattlePhase('answer')
    const isCorrect = answer === currentQuestion.correct_answer
    setParticleType(isCorrect ? 'correct' : 'wrong')
    setShowParticles(true)

    onAnswer(answer)

    // Show result for 2 seconds then move to next question
    setTimeout(() => {
      if (questionNumber >= totalQuestions) {
        setBattlePhase('complete')
        const winner = player1.score > player2.score ? player1.username : player2.username
        onBattleComplete(winner)
      } else {
        setBattlePhase('preparation')
        setTimeRemaining(currentQuestion.time_limit)
        setShowParticles(false)
      }
    }, 2000)
  }

  const handleTimeUp = () => {
    setBattlePhase('answer')
    setParticleType('wrong')
    setShowParticles(true)
    onAnswer('')

    setTimeout(() => {
      if (questionNumber >= totalQuestions) {
        setBattlePhase('complete')
        const winner = player1.score > player2.score ? player1.username : player2.username
        onBattleComplete(winner)
      } else {
        setBattlePhase('preparation')
        setTimeRemaining(currentQuestion.time_limit)
        setShowParticles(false)
      }
    }, 2000)
  }

  const getHealthColor = (health: number) => {
    if (health > 75) return 'text-green-400'
    if (health > 50) return 'text-yellow-400'
    if (health > 25) return 'text-orange-400'
    return 'text-red-400'
  }

  const getHealthBarColor = (health: number) => {
    if (health > 75) return 'bg-green-400'
    if (health > 50) return 'bg-yellow-400'
    if (health > 25) return 'bg-orange-400'
    return 'bg-red-400'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Battle Arena Background */}
      <div className="absolute inset-0 bg-[url('/battle-arena.svg')] opacity-20"></div>
      
      {/* Player 1 (Left Side) */}
      <div className="absolute left-6 top-1/2 transform -translate-y-1/2">
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-lg p-6 min-w-64"
        >
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-2 flex items-center justify-center">
              <span className="text-white font-bold text-xl">{player1.username[0].toUpperCase()}</span>
            </div>
            <h3 className="text-xl font-bold text-white">{player1.username}</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Score</span>
              <span className="text-white font-bold">{player1.score}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Streak</span>
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4 text-orange-400" />
                <span className="text-white font-bold">{player1.streak}</span>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-400">Health</span>
                <span className={`font-bold ${getHealthColor(player1.health)}`}>{player1.health}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${getHealthBarColor(player1.health)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${player1.health}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Player 2 (Right Side) */}
      <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-lg p-6 min-w-64"
        >
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full mx-auto mb-2 flex items-center justify-center">
              <span className="text-white font-bold text-xl">{player2.username[0].toUpperCase()}</span>
            </div>
            <h3 className="text-xl font-bold text-white">{player2.username}</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Score</span>
              <span className="text-white font-bold">{player2.score}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Streak</span>
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4 text-orange-400" />
                <span className="text-white font-bold">{player2.streak}</span>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-400">Health</span>
                <span className={`font-bold ${getHealthColor(player2.health)}`}>{player2.health}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${getHealthBarColor(player2.health)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${player2.health}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Battle Status */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center"
        >
          <div className="flex items-center justify-center space-x-4 mb-2">
            <Sword className="w-6 h-6 text-red-400" />
            <span className="text-white font-bold text-lg">BATTLE ARENA</span>
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          
          <div className="text-gray-400 text-sm">
            Question {questionNumber} of {totalQuestions}
          </div>
          
          {battlePhase === 'question' && (
            <div className="flex items-center justify-center space-x-2 mt-2">
              <Clock className="w-4 h-4 text-red-400" />
              <span className={`font-bold ${timeRemaining <= 10 ? 'text-red-400' : 'text-white'}`}>
                {timeRemaining}s
              </span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Question Area */}
      <div className="flex items-center justify-center min-h-screen pt-32 pb-16">
        <div className="w-full max-w-4xl mx-auto px-6">
          <AnimatePresence mode="wait">
            {battlePhase === 'preparation' && (
              <motion.div
                key="preparation"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-6"
                />
                <h2 className="text-4xl font-bold text-white mb-4">Prepare for Battle!</h2>
                <p className="text-xl text-gray-300">Get ready for the next question...</p>
              </motion.div>
            )}

            {battlePhase === 'question' && (
              <motion.div
                key="question"
                initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotateY: -180 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="relative"
              >
                <div className="h-96">
                  <FloatingQuestionCard
                    question={currentQuestion.question}
                    options={currentQuestion.options}
                    onAnswer={handleAnswer}
                    difficulty={currentQuestion.difficulty}
                  />
                </div>
              </motion.div>
            )}

            {battlePhase === 'answer' && (
              <motion.div
                key="answer"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <h2 className="text-4xl font-bold text-white mb-4">Answer Submitted!</h2>
                <p className="text-xl text-gray-300">Waiting for results...</p>
              </motion.div>
            )}

            {battlePhase === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <Crown className="w-24 h-24 text-yellow-400 mx-auto mb-6 animate-bounce" />
                <h1 className="text-6xl font-bold text-white mb-4">Battle Complete!</h1>
                <h2 className="text-4xl font-bold text-purple-400 mb-8">
                  {player1.score > player2.score ? player1.username : player2.username} Wins!
                </h2>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Particle Effects */}
      <ParticleEffect 
        type={particleType} 
        active={showParticles} 
        onComplete={() => setShowParticles(false)}
      />
    </div>
  )
}

export default BattleArena
