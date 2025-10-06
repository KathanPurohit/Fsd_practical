import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Brain, Trophy, Zap, Shield, Users, Target } from 'lucide-react'

const HomePage: React.FC = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Advanced Anti-Cheat",
      description: "Real-time monitoring with AI-powered detection"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Gamification",
      description: "Achievements, leaderboards, and skill progression"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Real-time Battles",
      description: "Head-to-head competitions with live spectators"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "3D Interface",
      description: "Immersive floating question cards and animations"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Social Features",
      description: "Teams, guilds, and mentorship programs"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Analytics",
      description: "Comprehensive performance tracking and insights"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-20 pb-16"
      >
        <h1 className="text-7xl font-bold text-white mb-6">
          🧠 MindMaze
        </h1>
        <h2 className="text-3xl font-bold text-purple-400 mb-4">
          Ultimate Quiz Platform
        </h2>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Experience the most advanced, secure, and engaging quiz platform with cutting-edge 
          anti-cheat mechanisms and revolutionary gamification.
        </p>
        
        <div className="flex justify-center space-x-6">
          <Link
            to="/login"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-8 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
          >
            Get Started
          </Link>
          <Link
            to="/categories"
            className="bg-white/10 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-lg hover:bg-white/20 transition-all border border-white/20"
          >
            Browse Categories
          </Link>
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-6xl mx-auto px-6 pb-16"
      >
        <h3 className="text-4xl font-bold text-white text-center mb-12">
          Revolutionary Features
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all"
            >
              <div className="text-purple-400 mb-4">
                {feature.icon}
              </div>
              <h4 className="text-xl font-bold text-white mb-2">
                {feature.title}
              </h4>
              <p className="text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white/5 backdrop-blur-sm py-16"
      >
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">10K+</div>
              <div className="text-gray-400">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">50K+</div>
              <div className="text-gray-400">Quizzes Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">99.9%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-gray-400">Support</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default HomePage
