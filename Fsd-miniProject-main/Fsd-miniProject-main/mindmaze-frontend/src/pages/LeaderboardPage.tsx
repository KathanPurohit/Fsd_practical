import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Crown, Medal, Zap, Target, Users } from 'lucide-react'
import LeaderboardPodium from '../components/3D/LeaderboardPodium'
import { useWebSocket } from '../hooks/useWebSocket'

interface LeaderboardEntry {
  username: string
  score: number
  rank: number
  level: number
  avatar?: string
  streak: number
  total_quizzes: number
  accuracy: number
}

interface LeaderboardData {
  global: LeaderboardEntry[]
  weekly: LeaderboardEntry[]
  monthly: LeaderboardEntry[]
  category: LeaderboardEntry[]
}

const LeaderboardPage: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null)
  const [selectedTab, setSelectedTab] = useState<'global' | 'weekly' | 'monthly' | 'category'>('global')
  const [loading, setLoading] = useState(true)
  const { sendMessage } = useWebSocket()

  useEffect(() => {
    fetchLeaderboardData()
    
    // Subscribe to real-time leaderboard updates
    if (sendMessage) {
      sendMessage({
        type: 'subscribe_leaderboard',
        leaderboard_type: 'global'
      })
    }
  }, [])

  const fetchLeaderboardData = async () => {
    try {
      const response = await fetch('/api/leaderboard')
      if (response.ok) {
        const data = await response.json()
        console.log('Leaderboard data received:', data)
        setLeaderboardData(data)
      } else {
        console.error('Failed to fetch leaderboard:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400" />
      case 2: return <Medal className="w-6 h-6 text-gray-300" />
      case 3: return <Medal className="w-6 h-6 text-amber-600" />
      default: return <span className="text-gray-400 font-bold">#{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600'
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500'
      case 3: return 'bg-gradient-to-r from-amber-600 to-amber-800'
      default: return 'bg-gradient-to-r from-gray-600 to-gray-800'
    }
  }

  const tabs = [
    { id: 'global', label: 'Global', icon: <Trophy className="w-4 h-4" /> },
    { id: 'weekly', label: 'Weekly', icon: <Zap className="w-4 h-4" /> },
    { id: 'monthly', label: 'Monthly', icon: <Target className="w-4 h-4" /> },
    { id: 'category', label: 'Category', icon: <Users className="w-4 h-4" /> }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Trophy className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-white mb-2">Loading Leaderboard...</h2>
          <p className="text-gray-400">Fetching the latest rankings</p>
        </motion.div>
      </div>
    )
  }

  const currentData = leaderboardData?.[selectedTab] || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-16 pb-8"
      >
        <h1 className="text-6xl font-bold text-white mb-4">🏆 Leaderboard</h1>
        <p className="text-xl text-gray-300">See who's dominating the quiz world</p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center mb-8"
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                selectedTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* 3D Podium for Top 3 */}
      {currentData.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <LeaderboardPodium entries={currentData.slice(0, 3)} animated={true} />
        </motion.div>
      )}

      {/* Full Leaderboard List */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="max-w-4xl mx-auto px-6 pb-16"
      >
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Complete Rankings
          </h2>
          
          <div className="space-y-3">
            {currentData.map((entry, index) => (
              <motion.div
                key={entry.username}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className={`p-4 rounded-lg transition-all hover:scale-105 ${
                  entry.rank <= 3 
                    ? getRankColor(entry.rank) 
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getRankIcon(entry.rank)}
                      <span className="text-white font-bold text-lg">
                        {entry.username}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-300">
                      <span>Level {entry.level}</span>
                      <span>•</span>
                      <span>{entry.total_quizzes} quizzes</span>
                      <span>•</span>
                      <span>{Math.round(entry.accuracy * 100)}% accuracy</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        {entry.score.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">points</div>
                    </div>
                    
                    {entry.streak > 0 && (
                      <div className="flex items-center space-x-1 text-orange-400">
                        <Zap className="w-4 h-4" />
                        <span className="font-bold">{entry.streak}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="max-w-4xl mx-auto px-6 pb-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {currentData.length}
            </div>
            <div className="text-gray-400">Total Players</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {currentData.length > 0 ? Math.round(currentData.reduce((acc, entry) => acc + entry.accuracy, 0) / currentData.length * 100) : 0}%
            </div>
            <div className="text-gray-400">Average Accuracy</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <Zap className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {currentData.length > 0 ? Math.max(...currentData.map(entry => entry.streak)) : 0}
            </div>
            <div className="text-gray-400">Highest Streak</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default LeaderboardPage
