import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  User, 
  Trophy, 
  Zap, 
  Target, 
  Crown, 
  Star,
  Settings,
  LogOut,
  Edit3
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'stats' | 'settings'>('overview')

  const achievements = [
    { id: 'first_quiz', name: 'First Steps', description: 'Complete your first quiz', icon: '🎯', unlocked: true },
    { id: 'speed_demon', name: 'Speed Demon', description: 'Answer 10 questions in under 30 seconds', icon: '⚡', unlocked: true },
    { id: 'accuracy_master', name: 'Accuracy Master', description: 'Achieve 95% accuracy in any quiz', icon: '🎯', unlocked: false },
    { id: 'streak_king', name: 'Streak King', description: 'Get a 20-question streak', icon: '🔥', unlocked: false },
    { id: 'quiz_master', name: 'Quiz Master', description: 'Complete 100 quizzes', icon: '👑', unlocked: false }
  ]

  const stats = {
    totalQuizzes: 45,
    totalQuestions: 450,
    correctAnswers: 360,
    averageAccuracy: 80,
    bestStreak: 15,
    totalTime: 1800, // minutes
    rank: 127,
    level: 12
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <User className="w-4 h-4" /> },
    { id: 'achievements', label: 'Achievements', icon: <Trophy className="w-4 h-4" /> },
    { id: 'stats', label: 'Statistics', icon: <Target className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ]

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <User className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Please log in</h2>
          <p className="text-gray-400 mb-6">You need to be logged in to view your profile</p>
          <Link
            to="/login"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Go to Login
          </Link>
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
        className="bg-white/10 backdrop-blur-sm border-b border-white/10 p-6"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">{user.username[0].toUpperCase()}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{user.username}</h1>
                <p className="text-gray-400">Level {user.level} • {user.total_points.toLocaleString()} points</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/skill-tree"
                className="bg-white/10 backdrop-blur-sm text-white font-medium py-2 px-4 rounded-lg hover:bg-white/20 transition-all border border-white/20"
              >
                Skill Tree
              </Link>
              <button
                onClick={logout}
                className="bg-red-600/20 text-red-400 font-medium py-2 px-4 rounded-lg hover:bg-red-600/30 transition-all border border-red-600/30"
              >
                <LogOut className="w-4 h-4 inline mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-4xl mx-auto p-6"
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 flex space-x-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Points</p>
                      <p className="text-3xl font-bold text-white">{user.total_points.toLocaleString()}</p>
                    </div>
                    <Trophy className="w-8 h-8 text-yellow-400" />
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Level</p>
                      <p className="text-3xl font-bold text-white">{user.level}</p>
                    </div>
                    <Star className="w-8 h-8 text-purple-400" />
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Quiz Coins</p>
                      <p className="text-3xl font-bold text-white">{user.quiz_coins}</p>
                    </div>
                    <Zap className="w-8 h-8 text-orange-400" />
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Experience</p>
                      <p className="text-3xl font-bold text-white">{user.experience}</p>
                    </div>
                    <Target className="w-8 h-8 text-blue-400" />
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-white">Completed Science quiz</span>
                    </div>
                    <span className="text-gray-400 text-sm">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-white">Unlocked "Speed Demon" achievement</span>
                    </div>
                    <span className="text-gray-400 text-sm">1 day ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-white">Leveled up to Level {user.level}</span>
                    </div>
                    <span className="text-gray-400 text-sm">3 days ago</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-6 rounded-lg border ${
                      achievement.unlocked 
                        ? 'bg-white/10 border-green-500/30' 
                        : 'bg-white/5 border-gray-600/30'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`text-4xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                        {achievement.icon}
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold ${achievement.unlocked ? 'text-white' : 'text-gray-500'}`}>
                          {achievement.name}
                        </h3>
                        <p className={`text-sm ${achievement.unlocked ? 'text-gray-300' : 'text-gray-600'}`}>
                          {achievement.description}
                        </p>
                        {achievement.unlocked && (
                          <div className="flex items-center space-x-1 mt-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 text-sm font-medium">Unlocked</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Quiz Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Quizzes</span>
                      <span className="text-white font-bold">{stats.totalQuizzes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Questions Answered</span>
                      <span className="text-white font-bold">{stats.totalQuestions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Correct Answers</span>
                      <span className="text-white font-bold">{stats.correctAnswers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Average Accuracy</span>
                      <span className="text-white font-bold">{stats.averageAccuracy}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Best Streak</span>
                      <span className="text-white font-bold">{stats.bestStreak}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Time</span>
                      <span className="text-white font-bold">{Math.floor(stats.totalTime / 60)}h {stats.totalTime % 60}m</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Rankings</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Global Rank</span>
                      <span className="text-white font-bold">#{stats.rank}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Level</span>
                      <span className="text-white font-bold">{stats.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Percentile</span>
                      <span className="text-white font-bold">Top 15%</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Account Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Username</label>
                    <input
                      type="text"
                      value={user.username}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={user.email || 'Not provided'}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
                      readOnly
                    />
                  </div>
                  <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                    <Edit3 className="w-4 h-4 inline mr-2" />
                    Edit Profile
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default ProfilePage
