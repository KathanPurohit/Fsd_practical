import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Trophy, Zap, Target, Brain } from 'lucide-react'
import FloatingQuestionCard from '../components/3D/FloatingQuestionCard'
import ParticleEffect from '../components/3D/ParticleEffect'
import { useWebSocket } from '../hooks/useWebSocket'
import { useAuth } from '../hooks/useAuth'

interface Question {
  id: string
  question: string
  options: string[]
  correct_answer: string
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  time_limit: number
  points: number
}

interface QuizSession {
  id: string
  category: string
  questions: Question[]
  current_question: number
  time_remaining: number
  score: number
  streak: number
  total_questions: number
}

const QuizPage: React.FC = () => {
  const { category } = useParams<{ category: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { sendMessage } = useWebSocket()
  
  const [session, setSession] = useState<QuizSession | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [particleType, setParticleType] = useState<'correct' | 'wrong' | 'celebration'>('correct')
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [quizComplete, setQuizComplete] = useState(false)
  const [finalScore, setFinalScore] = useState(0)

  useEffect(() => {
    if (!user || !category) {
      navigate('/categories')
      return
    }

    // Start quiz session
    startQuiz()
  }, [user, category])

  const generateWrongAnswers = (correctAnswer: string, question: string): string[] => {
    const wrongAnswers: string[] = []
    
    // Try to parse as number for math questions
    const numAnswer = parseFloat(correctAnswer)
    if (!isNaN(numAnswer)) {
      // Generate wrong numbers around the correct answer
      wrongAnswers.push((numAnswer + 1).toString())
      wrongAnswers.push((numAnswer - 1).toString())
      wrongAnswers.push((numAnswer * 2).toString())
      wrongAnswers.push((numAnswer + 2).toString())
    } else {
      // For text answers, generate common wrong answers
      const commonWrongAnswers = [
        'London', 'Berlin', 'Tokyo', 'Moscow', 'Madrid',
        'George Washington', 'Abraham Lincoln', 'Thomas Jefferson',
        '1944', '1946', '1943', '1947',
        'China', 'Canada', 'Brazil', 'Australia',
        'Amazon', 'Mississippi', 'Yangtze', 'Yellow River',
        '3', '4', '5', '6', '7', '8',
        'Saturn', 'Venus', 'Mercury', 'Neptune',
        '60', '30', '45', '90',
        'Dog', 'Cat', 'Horse', 'Pig',
        '365', '364', '367', '368'
      ]
      
      // Add some random wrong answers
      const shuffled = commonWrongAnswers.sort(() => Math.random() - 0.5)
      wrongAnswers.push(...shuffled.slice(0, 3))
    }
    
    // Remove duplicates and the correct answer
    return [...new Set(wrongAnswers)].filter(answer => 
      answer.toLowerCase() !== correctAnswer.toLowerCase()
    ).slice(0, 3)
  }

  useEffect(() => {
    if (timeRemaining > 0 && !isAnswered) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0 && !isAnswered) {
      handleTimeUp()
    }
  }, [timeRemaining, isAnswered])

  const startQuiz = async () => {
    try {
      const response = await fetch(`/api/quiz/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          category, 
          difficulty: 'medium',
          question_count: 10 
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Transform backend response to frontend format
        const sessionData = {
          id: data.session_id,
          category: data.category,
          questions: data.questions.map((q: any, index: number) => {
            // Generate multiple choice options if not provided
            let options = q.options || q.wrong_answers
            if (!options) {
              // Generate wrong answers based on the correct answer
              const correctAnswer = q.answer
              const wrongAnswers = generateWrongAnswers(correctAnswer, q.question)
              options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5)
            }
            
            return {
              id: q.id || `q${index}`,
              question: q.question || q.puzzle,
              options: options,
              correct_answer: q.answer || q.correct_answer,
              difficulty: data.difficulty || 'medium',
              time_limit: q.time_limit || 30,
              points: q.points || 10
            }
          }),
          current_question: 0,
          time_remaining: data.time_limit || 300,
          score: 0,
          streak: 0,
          total_questions: data.questions.length
        }
        
        setSession(sessionData)
        setCurrentQuestion(sessionData.questions[0])
        setTimeRemaining(sessionData.questions[0].time_limit)
      } else {
        // Fallback to sample data if API fails
        console.log('API failed, using sample data')
        const sampleSession = {
          id: 'sample-session',
          category: category || 'science',
          questions: [
            {
              id: '1',
              question: 'What is the capital of France?',
              options: ['London', 'Berlin', 'Paris', 'Madrid'],
              correct_answer: 'Paris',
              difficulty: 'medium',
              time_limit: 30,
              points: 10
            },
            {
              id: '2',
              question: 'Which planet is known as the Red Planet?',
              options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
              correct_answer: 'Mars',
              difficulty: 'easy',
              time_limit: 25,
              points: 8
            },
            {
              id: '3',
              question: 'What is 2 + 2?',
              options: ['3', '4', '5', '6'],
              correct_answer: '4',
              difficulty: 'easy',
              time_limit: 20,
              points: 5
            }
          ],
          current_question: 0,
          time_remaining: 30,
          score: 0,
          streak: 0,
          total_questions: 3
        }
        
        setSession(sampleSession)
        setCurrentQuestion(sampleSession.questions[0])
        setTimeRemaining(sampleSession.questions[0].time_limit)
      }
    } catch (error) {
      console.error('Failed to start quiz:', error)
      // Use sample data as fallback
      const sampleSession = {
        id: 'sample-session',
        category: category || 'science',
        questions: [
          {
            id: '1',
            question: 'What is the capital of France?',
            options: ['London', 'Berlin', 'Paris', 'Madrid'],
            correct_answer: 'Paris',
            difficulty: 'medium',
            time_limit: 30,
            points: 10
          },
          {
            id: '2',
            question: 'Which planet is known as the Red Planet?',
            options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
            correct_answer: 'Mars',
            difficulty: 'easy',
            time_limit: 25,
            points: 8
          },
          {
            id: '3',
            question: 'What is 2 + 2?',
            options: ['3', '4', '5', '6'],
            correct_answer: '4',
            difficulty: 'easy',
            time_limit: 20,
            points: 5
          }
        ],
        current_question: 0,
        time_remaining: 30,
        score: 0,
        streak: 0,
        total_questions: 3
      }
      
      setSession(sampleSession)
      setCurrentQuestion(sampleSession.questions[0])
      setTimeRemaining(sampleSession.questions[0].time_limit)
    }
  }

  const handleAnswer = (answer: string) => {
    if (isAnswered) return

    setSelectedAnswer(answer)
    setIsAnswered(true)

    const isCorrect = answer === currentQuestion?.correct_answer
    setParticleType(isCorrect ? 'correct' : 'wrong')
    setShowParticles(true)

    // Update score and streak
    if (session && currentQuestion) {
      const newScore = session.score + (isCorrect ? currentQuestion.points : 0)
      const newStreak = isCorrect ? session.streak + 1 : 0
      
      setSession({
        ...session,
        score: newScore,
        streak: newStreak
      })
    }

    // Move to next question after delay
    setTimeout(() => {
      nextQuestion()
    }, 2000)
  }

  const handleTimeUp = () => {
    if (isAnswered) return

    setIsAnswered(true)
    setSelectedAnswer('')
    setParticleType('wrong')
    setShowParticles(true)

    setTimeout(() => {
      nextQuestion()
    }, 2000)
  }

  const nextQuestion = () => {
    if (!session || !currentQuestion) return

    const nextIndex = session.current_question + 1
    
    if (nextIndex >= session.total_questions) {
      // Quiz complete
      completeQuiz()
    } else {
      // Next question
      const nextQuestion = session.questions[nextIndex]
      setCurrentQuestion(nextQuestion)
      setTimeRemaining(nextQuestion.time_limit)
      setIsAnswered(false)
      setSelectedAnswer(null)
      setShowParticles(false)
      
      setSession({
        ...session,
        current_question: nextIndex
      })
    }
  }

  const completeQuiz = async () => {
    if (!session) return

    setQuizComplete(true)
    setFinalScore(session.score)
    setParticleType('celebration')
    setShowParticles(true)

    // Submit quiz results
    try {
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          user_id: user?.username,
          score: session.score,
          total_questions: session.total_questions,
          correct_answers: Math.floor(session.score / 10), // Approximate
          time_taken: 0, // Would be calculated
          accuracy: Math.floor(session.score / 10) / session.total_questions
        })
      })
      
      if (!response.ok) {
        console.log('Quiz submission failed, but continuing with demo')
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error)
    }

    // Return to categories after celebration
    setTimeout(() => {
      navigate('/categories')
    }, 5000)
  }

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '🟢'
      case 'medium': return '🟡'
      case 'hard': return '🔴'
      case 'expert': return '🟣'
      default: return '⚪'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500'
      case 'medium': return 'text-yellow-500'
      case 'hard': return 'text-red-500'
      case 'expert': return 'text-purple-500'
      default: return 'text-gray-500'
    }
  }

  if (!session || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-white mb-2">Loading Quiz...</h2>
          <p className="text-gray-400">Preparing your questions</p>
        </motion.div>
      </div>
    )
  }

  if (quizComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative">
        <ParticleEffect 
          type={particleType} 
          active={showParticles} 
          onComplete={() => setShowParticles(false)}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-6 animate-bounce" />
          <h1 className="text-6xl font-bold text-white mb-4">Quiz Complete!</h1>
          <h2 className="text-4xl font-bold text-purple-400 mb-2">{finalScore} Points</h2>
          <p className="text-xl text-gray-300 mb-8">Great job, {user?.username}!</p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="space-y-4"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-white mb-4">Quiz Summary</h3>
              <div className="space-y-2 text-gray-300">
                <div className="flex justify-between">
                  <span>Questions:</span>
                  <span>{session.total_questions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Score:</span>
                  <span className="text-purple-400 font-bold">{finalScore}</span>
                </div>
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span className="capitalize">{category}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 bg-[url('/particles.svg')] opacity-20"></div>
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 left-0 right-0 z-10 p-6"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/categories')}
              className="text-white hover:text-purple-400 transition-colors"
            >
              ← Back to Categories
            </button>
            <div className="text-white">
              <span className="text-sm text-gray-400">Category:</span>
              <span className="ml-2 font-semibold capitalize">{category}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Score */}
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-bold">{session.score}</span>
            </div>
            
            {/* Streak */}
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-orange-400" />
              <span className="text-white font-bold">{session.streak}</span>
            </div>
            
            {/* Timer */}
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-red-400" />
              <span className={`font-bold ${timeRemaining <= 10 ? 'text-red-400' : 'text-white'}`}>
                {timeRemaining}s
              </span>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Question {session.current_question + 1} of {session.total_questions}</span>
            <span>{Math.round(((session.current_question + 1) / session.total_questions) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((session.current_question + 1) / session.total_questions) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Main Quiz Area */}
      <div className="flex items-center justify-center min-h-screen pt-32 pb-16">
        <div className="w-full max-w-4xl mx-auto px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotateY: -180 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="relative"
            >
              {/* Question Info */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <span className="text-2xl">{getDifficultyIcon(currentQuestion.difficulty)}</span>
                  <span className={`text-lg font-semibold ${getDifficultyColor(currentQuestion.difficulty)}`}>
                    {currentQuestion.difficulty.toUpperCase()}
                  </span>
                  <span className="text-white">•</span>
                  <span className="text-lg text-gray-300">{currentQuestion.points} points</span>
                </div>
              </div>

              {/* 3D Question Card */}
              <div className="h-96">
                <FloatingQuestionCard
                  question={currentQuestion.question}
                  options={currentQuestion.options}
                  onAnswer={handleAnswer}
                  isAnswered={isAnswered}
                  correctAnswer={currentQuestion.correct_answer}
                  userAnswer={selectedAnswer}
                  difficulty={currentQuestion.difficulty}
                />
              </div>
            </motion.div>
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

export default QuizPage
