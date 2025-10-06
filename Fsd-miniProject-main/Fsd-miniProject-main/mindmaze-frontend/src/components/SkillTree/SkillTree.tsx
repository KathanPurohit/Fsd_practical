import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Zap, 
  Shield, 
  Target, 
  Crown, 
  Star, 
  Lock, 
  CheckCircle,
  Sparkles
} from 'lucide-react'

interface SkillNode {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  cost: number
  unlocked: boolean
  level: number
  maxLevel: number
  category: 'performance' | 'defense' | 'speed' | 'special'
  prerequisites?: string[]
  position: { x: number; y: number }
  effects: {
    pointsMultiplier?: number
    streakBonus?: number
    timeBonus?: number
    accuracyBonus?: number
  }
}

interface SkillTreeProps {
  userLevel: number
  availablePoints: number
  onSkillUnlock: (skillId: string) => void
}

const SkillTree: React.FC<SkillTreeProps> = ({ userLevel, availablePoints, onSkillUnlock }) => {
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null)
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null)

  const skills: SkillNode[] = [
    // Performance Skills
    {
      id: 'accuracy_master',
      name: 'Accuracy Master',
      description: 'Increases accuracy bonus by 10% per level',
      icon: <Target className="w-6 h-6" />,
      cost: 2,
      unlocked: true,
      level: 1,
      maxLevel: 5,
      category: 'performance',
      position: { x: 100, y: 100 },
      effects: { accuracyBonus: 0.1 }
    },
    {
      id: 'point_multiplier',
      name: 'Point Multiplier',
      description: 'Increases base points by 15% per level',
      icon: <Star className="w-6 h-6" />,
      cost: 3,
      unlocked: false,
      level: 0,
      maxLevel: 3,
      category: 'performance',
      prerequisites: ['accuracy_master'],
      position: { x: 200, y: 100 },
      effects: { pointsMultiplier: 0.15 }
    },
    {
      id: 'perfect_score',
      name: 'Perfect Score',
      description: 'Bonus points for 100% accuracy',
      icon: <Crown className="w-6 h-6" />,
      cost: 5,
      unlocked: false,
      level: 0,
      maxLevel: 1,
      category: 'performance',
      prerequisites: ['point_multiplier'],
      position: { x: 300, y: 100 },
      effects: { pointsMultiplier: 0.5 }
    },

    // Speed Skills
    {
      id: 'quick_thinking',
      name: 'Quick Thinking',
      description: 'Reduces time penalty for fast answers',
      icon: <Zap className="w-6 h-6" />,
      cost: 2,
      unlocked: true,
      level: 2,
      maxLevel: 5,
      category: 'speed',
      position: { x: 100, y: 200 },
      effects: { timeBonus: 0.1 }
    },
    {
      id: 'lightning_reflexes',
      name: 'Lightning Reflexes',
      description: 'Bonus points for answering within 5 seconds',
      icon: <Sparkles className="w-6 h-6" />,
      cost: 4,
      unlocked: false,
      level: 0,
      maxLevel: 3,
      category: 'speed',
      prerequisites: ['quick_thinking'],
      position: { x: 200, y: 200 },
      effects: { timeBonus: 0.3 }
    },

    // Defense Skills
    {
      id: 'anti_cheat_shield',
      name: 'Anti-Cheat Shield',
      description: 'Reduces false positive detection',
      icon: <Shield className="w-6 h-6" />,
      cost: 3,
      unlocked: false,
      level: 0,
      maxLevel: 3,
      category: 'defense',
      position: { x: 100, y: 300 },
      effects: {}
    },
    {
      id: 'focus_master',
      name: 'Focus Master',
      description: 'Maintains concentration during long quizzes',
      icon: <Brain className="w-6 h-6" />,
      cost: 4,
      unlocked: false,
      level: 0,
      maxLevel: 2,
      category: 'defense',
      prerequisites: ['anti_cheat_shield'],
      position: { x: 200, y: 300 },
      effects: { streakBonus: 0.2 }
    },

    // Special Skills
    {
      id: 'streak_master',
      name: 'Streak Master',
      description: 'Increases streak multiplier effectiveness',
      icon: <Zap className="w-6 h-6" />,
      cost: 5,
      unlocked: false,
      level: 0,
      maxLevel: 2,
      category: 'special',
      prerequisites: ['perfect_score', 'lightning_reflexes'],
      position: { x: 300, y: 200 },
      effects: { streakBonus: 0.5 }
    }
  ]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'performance': return 'from-green-500 to-green-700'
      case 'speed': return 'from-yellow-500 to-yellow-700'
      case 'defense': return 'from-blue-500 to-blue-700'
      case 'special': return 'from-purple-500 to-purple-700'
      default: return 'from-gray-500 to-gray-700'
    }
  }

  const canUnlockSkill = (skill: SkillNode) => {
    if (skill.unlocked || skill.level >= skill.maxLevel) return false
    if (availablePoints < skill.cost) return false
    
    if (skill.prerequisites) {
      return skill.prerequisites.every(prereq => {
        const prereqSkill = skills.find(s => s.id === prereq)
        return prereqSkill?.unlocked && prereqSkill.level > 0
      })
    }
    
    return true
  }

  const handleSkillClick = (skill: SkillNode) => {
    if (canUnlockSkill(skill)) {
      onSkillUnlock(skill.id)
    }
    setSelectedSkill(skill)
  }

  const getSkillStatus = (skill: SkillNode) => {
    if (skill.unlocked && skill.level >= skill.maxLevel) return 'maxed'
    if (skill.unlocked) return 'unlocked'
    if (canUnlockSkill(skill)) return 'available'
    return 'locked'
  }

  const getSkillIcon = (skill: SkillNode) => {
    const status = getSkillStatus(skill)
    
    switch (status) {
      case 'maxed':
        return <CheckCircle className="w-8 h-8 text-green-400" />
      case 'unlocked':
        return <div className="relative">
          {skill.icon}
          <div className="absolute -top-1 -right-1 bg-green-400 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {skill.level}
          </div>
        </div>
      case 'available':
        return skill.icon
      case 'locked':
        return <Lock className="w-6 h-6 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-5xl font-bold text-white mb-4">🧠 Skill Tree</h1>
        <p className="text-xl text-gray-300 mb-6">Unlock powerful abilities to enhance your quiz performance</p>
        
        <div className="flex justify-center space-x-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{userLevel}</div>
            <div className="text-gray-400">Level</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-400">{availablePoints}</div>
            <div className="text-gray-400">Skill Points</div>
          </div>
        </div>
      </motion.div>

      {/* Skill Tree Canvas */}
      <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 min-h-96">
        <div className="relative w-full h-96">
          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full">
            {skills.map(skill => {
              if (!skill.prerequisites) return null
              
              return skill.prerequisites.map(prereqId => {
                const prereq = skills.find(s => s.id === prereqId)
                if (!prereq) return null
                
                return (
                  <line
                    key={`${prereq.id}-${skill.id}`}
                    x1={prereq.position.x}
                    y1={prereq.position.y}
                    x2={skill.position.x}
                    y2={skill.position.y}
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth="2"
                    strokeDasharray={prereq.unlocked ? "0" : "5,5"}
                  />
                )
              })
            })}
          </svg>

          {/* Skill Nodes */}
          {skills.map(skill => {
            const status = getSkillStatus(skill)
            const isHovered = hoveredSkill === skill.id
            
            return (
              <motion.div
                key={skill.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: skill.position.x, top: skill.position.y }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => handleSkillClick(skill)}
                  onMouseEnter={() => setHoveredSkill(skill.id)}
                  onMouseLeave={() => setHoveredSkill(null)}
                  className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                    status === 'maxed' ? 'bg-gradient-to-br from-green-500 to-green-700' :
                    status === 'unlocked' ? 'bg-gradient-to-br from-blue-500 to-blue-700' :
                    status === 'available' ? 'bg-gradient-to-br from-purple-500 to-purple-700' :
                    'bg-gradient-to-br from-gray-500 to-gray-700'
                  } ${isHovered ? 'ring-4 ring-white/50' : ''}`}
                >
                  <div className="text-white">
                    {getSkillIcon(skill)}
                  </div>
                  
                  {/* Cost indicator */}
                  {status === 'available' && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                      {skill.cost}
                    </div>
                  )}
                </button>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Skill Details Panel */}
      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getCategoryColor(selectedSkill.category)} flex items-center justify-center`}>
                  {selectedSkill.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedSkill.name}</h3>
                  <p className="text-gray-400 capitalize">{selectedSkill.category}</p>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedSkill(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="mt-6">
              <p className="text-gray-300 mb-4">{selectedSkill.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Current Level</p>
                  <p className="text-white font-bold">{selectedSkill.level}/{selectedSkill.maxLevel}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Cost</p>
                  <p className="text-white font-bold">{selectedSkill.cost} points</p>
                </div>
              </div>
              
              {Object.keys(selectedSkill.effects).length > 0 && (
                <div className="mt-4">
                  <p className="text-gray-400 text-sm mb-2">Effects</p>
                  <div className="space-y-1">
                    {selectedSkill.effects.pointsMultiplier && (
                      <p className="text-green-400">+{Math.round(selectedSkill.effects.pointsMultiplier * 100)}% Points</p>
                    )}
                    {selectedSkill.effects.streakBonus && (
                      <p className="text-blue-400">+{Math.round(selectedSkill.effects.streakBonus * 100)}% Streak Bonus</p>
                    )}
                    {selectedSkill.effects.timeBonus && (
                      <p className="text-yellow-400">+{Math.round(selectedSkill.effects.timeBonus * 100)}% Time Bonus</p>
                    )}
                    {selectedSkill.effects.accuracyBonus && (
                      <p className="text-purple-400">+{Math.round(selectedSkill.effects.accuracyBonus * 100)}% Accuracy</p>
                    )}
                  </div>
                </div>
              )}
              
              {canUnlockSkill(selectedSkill) && (
                <button
                  onClick={() => onSkillUnlock(selectedSkill.id)}
                  className="mt-6 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  Unlock Skill ({selectedSkill.cost} points)
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SkillTree
