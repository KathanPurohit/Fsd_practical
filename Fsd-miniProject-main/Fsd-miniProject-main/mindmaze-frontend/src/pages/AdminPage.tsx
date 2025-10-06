import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Users, 
  Shield, 
  Brain, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Zap
} from 'lucide-react'

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalQuizzes: number
  averageAccuracy: number
  antiCheatFlags: number
  suspiciousActivities: number
  platformUptime: number
  responseTime: number
}

interface AntiCheatEvent {
  id: string
  user_id: string
  event_type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  metadata: any
}

interface QuizAnalytics {
  category: string
  totalAttempts: number
  averageScore: number
  completionRate: number
  averageTime: number
}

const AdminPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [antiCheatEvents, setAntiCheatEvents] = useState<AntiCheatEvent[]>([])
  const [quizAnalytics, setQuizAnalytics] = useState<QuizAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d')

  useEffect(() => {
    fetchAdminData()
    
    // Set up real-time updates
    const interval = setInterval(fetchAdminData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [selectedTimeframe])

  const fetchAdminData = async () => {
    try {
      const [statsRes, antiCheatRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/analytics'),
        fetch('/api/admin/anti-cheat'),
        fetch('/api/admin/quiz-analytics')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (antiCheatRes.ok) {
        const antiCheatData = await antiCheatRes.json()
        setAntiCheatEvents(antiCheatData.events || [])
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json()
        setQuizAnalytics(analyticsData)
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-400 bg-green-400/20'
      case 'medium': return 'text-yellow-400 bg-yellow-400/20'
      case 'high': return 'text-orange-400 bg-orange-400/20'
      case 'critical': return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const timeframes = [
    { id: '1d', label: '24 Hours' },
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <BarChart3 className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-white mb-2">Loading Admin Dashboard...</h2>
          <p className="text-gray-400">Fetching platform analytics</p>
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
        className="p-6 border-b border-white/10"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Real-time platform monitoring and analytics</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
            >
              {timeframes.map((tf) => (
                <option key={tf.id} value={tf.id} className="bg-slate-800">
                  {tf.label}
                </option>
              ))}
            </select>
            
            <div className="flex items-center space-x-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Live</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-white">{stats?.totalUsers || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <div className="mt-2 text-sm text-green-400">
              +{stats?.activeUsers || 0} active
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Quizzes</p>
                <p className="text-3xl font-bold text-white">{stats?.totalQuizzes || 0}</p>
              </div>
              <Brain className="w-8 h-8 text-purple-400" />
            </div>
            <div className="mt-2 text-sm text-blue-400">
              {stats?.averageAccuracy || 0}% avg accuracy
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Anti-Cheat Flags</p>
                <p className="text-3xl font-bold text-white">{stats?.antiCheatFlags || 0}</p>
              </div>
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <div className="mt-2 text-sm text-orange-400">
              {stats?.suspiciousActivities || 0} suspicious
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Platform Uptime</p>
                <p className="text-3xl font-bold text-white">{stats?.platformUptime || 0}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
            <div className="mt-2 text-sm text-gray-400">
              {stats?.responseTime || 0}ms avg response
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anti-Cheat Monitoring */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-sm rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Anti-Cheat Monitoring</h2>
            <Shield className="w-6 h-6 text-red-400" />
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {antiCheatEvents.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                <p className="text-gray-400">No suspicious activities detected</p>
              </div>
            ) : (
              antiCheatEvents.slice(0, 10).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(event.severity)}`}>
                      {event.severity.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{event.user_id}</p>
                      <p className="text-gray-400 text-sm">{event.event_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Quiz Analytics */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/10 backdrop-blur-sm rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Quiz Analytics</h2>
            <BarChart3 className="w-6 h-6 text-blue-400" />
          </div>
          
          <div className="space-y-4">
            {quizAnalytics.map((analytics) => (
              <div key={analytics.category} className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-medium capitalize">{analytics.category}</h3>
                  <span className="text-purple-400 font-bold">{analytics.totalAttempts} attempts</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Avg Score</p>
                    <p className="text-white font-medium">{analytics.averageScore}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Completion</p>
                    <p className="text-white font-medium">{analytics.completionRate}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Avg Time</p>
                    <p className="text-white font-medium">{analytics.averageTime}s</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Difficulty</p>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded ${
                            i <= (analytics.averageScore / 20) ? 'bg-purple-400' : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Real-time Activity */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/10 backdrop-blur-sm rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Real-time Activity</h2>
            <Clock className="w-6 h-6 text-green-400" />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white">User "quizmaster" completed Science quiz</span>
              </div>
              <span className="text-gray-400 text-sm">2s ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-white">New user "student123" registered</span>
              </div>
              <span className="text-gray-400 text-sm">5s ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-white">Achievement unlocked: "Speed Demon"</span>
              </div>
              <span className="text-gray-400 text-sm">8s ago</span>
            </div>
          </div>
        </motion.div>

        {/* System Health */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-white/10 backdrop-blur-sm rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">System Health</h2>
            <Target className="w-6 h-6 text-green-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Database</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400 text-sm">Healthy</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">WebSocket</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400 text-sm">Connected</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Anti-Cheat</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400 text-sm">Active</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Analytics</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400 text-sm">Processing</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminPage
