import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Brain, 
  Atom, 
  Globe, 
  Calculator, 
  BookOpen, 
  Zap,
  Trophy,
  Users,
  Target,
  Clock
} from 'lucide-react'

interface Category {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  questionCount: number
  averageScore: number
  color: string
  gradient: string
}

const CategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading categories
    setTimeout(() => {
      setCategories([
        {
          id: 'science',
          name: 'Science',
          description: 'Explore the wonders of physics, chemistry, and biology',
          icon: <Atom className="w-8 h-8" />,
          difficulty: 'medium',
          questionCount: 150,
          averageScore: 75,
          color: 'text-blue-400',
          gradient: 'from-blue-500 to-cyan-500'
        },
        {
          id: 'mathematics',
          name: 'Mathematics',
          description: 'Challenge your logical thinking and problem-solving skills',
          icon: <Calculator className="w-8 h-8" />,
          difficulty: 'hard',
          questionCount: 200,
          averageScore: 68,
          color: 'text-green-400',
          gradient: 'from-green-500 to-emerald-500'
        },
        {
          id: 'geography',
          name: 'Geography',
          description: 'Discover countries, capitals, and world landmarks',
          icon: <Globe className="w-8 h-8" />,
          difficulty: 'easy',
          questionCount: 120,
          averageScore: 82,
          color: 'text-purple-400',
          gradient: 'from-purple-500 to-violet-500'
        },
        {
          id: 'literature',
          name: 'Literature',
          description: 'Test your knowledge of books, authors, and literary works',
          icon: <BookOpen className="w-8 h-8" />,
          difficulty: 'medium',
          questionCount: 100,
          averageScore: 71,
          color: 'text-orange-400',
          gradient: 'from-orange-500 to-red-500'
        },
        {
          id: 'technology',
          name: 'Technology',
          description: 'Stay updated with the latest in tech and programming',
          icon: <Brain className="w-8 h-8" />,
          difficulty: 'expert',
          questionCount: 180,
          averageScore: 65,
          color: 'text-cyan-400',
          gradient: 'from-cyan-500 to-blue-500'
        },
        {
          id: 'history',
          name: 'History',
          description: 'Journey through time and explore historical events',
          icon: <Trophy className="w-8 h-8" />,
          difficulty: 'medium',
          questionCount: 160,
          averageScore: 73,
          color: 'text-yellow-400',
          gradient: 'from-yellow-500 to-orange-500'
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/20'
      case 'medium': return 'text-yellow-400 bg-yellow-400/20'
      case 'hard': return 'text-orange-400 bg-orange-400/20'
      case 'expert': return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-white mb-2">Loading Categories...</h2>
          <p className="text-gray-400">Preparing your quiz options</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-16 pb-8"
      >
        <h1 className="text-6xl font-bold text-white mb-4">🎯 Quiz Categories</h1>
        <p className="text-xl text-gray-300 mb-8">Choose your challenge and test your knowledge</p>
        
        {/* Quick Stats */}
        <div className="flex justify-center space-x-8 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{categories.length}</div>
            <div className="text-gray-400">Categories</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold text-white">
              {categories.reduce((sum, cat) => sum + cat.questionCount, 0)}
            </div>
            <div className="text-gray-400">Questions</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold text-white">
              {Math.round(categories.reduce((sum, cat) => sum + cat.averageScore, 0) / categories.length)}%
            </div>
            <div className="text-gray-400">Avg Score</div>
          </div>
        </div>
      </motion.div>

      {/* Categories Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <Link to={`/quiz/${category.id}`}>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all transform hover:scale-105 border border-white/20 hover:border-white/40">
                  {/* Category Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-br ${category.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <div className="text-white">
                      {category.icon}
                    </div>
                  </div>

                  {/* Category Info */}
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-400 mb-4 line-clamp-2">
                    {category.description}
                  </p>

                  {/* Difficulty Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(category.difficulty)}`}>
                      {category.difficulty.toUpperCase()}
                    </span>
                    <div className="flex items-center space-x-1 text-gray-400">
                      <Target className="w-4 h-4" />
                      <span className="text-sm">{category.questionCount} questions</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 text-gray-400">
                      <Trophy className="w-4 h-4" />
                      <span>{category.averageScore}% avg</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>1.2k players</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${category.gradient}`}
                        style={{ width: `${category.averageScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Battle Mode CTA */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="max-w-4xl mx-auto px-6 pb-16"
      >
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30">
          <div className="text-center">
            <Zap className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Ready for Battle?</h2>
            <p className="text-gray-300 mb-6">
              Challenge other players in real-time head-to-head competitions
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/battle/quick"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-8 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
              >
                Quick Battle
              </Link>
              <Link
                to="/battle/tournament"
                className="bg-white/10 backdrop-blur-sm text-white font-bold py-3 px-8 rounded-lg hover:bg-white/20 transition-all border border-white/20"
              >
                Tournament
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default CategoryPage
