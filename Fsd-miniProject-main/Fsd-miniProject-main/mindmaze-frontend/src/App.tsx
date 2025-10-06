import React, { Suspense, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { ErrorBoundary } from 'react-error-boundary'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from 'react-query'

// Components
import Layout from './components/Layout/Layout'
import LoadingSpinner from './components/UI/LoadingSpinner'
import ErrorFallback from './components/UI/ErrorFallback'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import CategoryPage from './pages/CategoryPage'
import QuizPage from './pages/QuizPage'
import ProfilePage from './pages/ProfilePage'
import LeaderboardPage from './pages/LeaderboardPage'
import AdminPage from './pages/AdminPage'

// Components
import SkillTree from './components/SkillTree/SkillTree'
import BattleArena from './components/BattleMode/BattleArena'

// Hooks
import { useWebSocket } from './hooks/useWebSocket'
import { useAuth } from './hooks/useAuth'

// Styles
import './App.css'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
})

function App() {
  const { user, isAuthenticated } = useAuth()
  const { connect, disconnect } = useWebSocket()

  useEffect(() => {
    if (isAuthenticated && user) {
      connect(user.username)
    } else {
      disconnect()
    }

    return () => disconnect()
  }, [isAuthenticated, user, connect, disconnect])

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
              <Suspense fallback={<LoadingSpinner />}>
                <Layout>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/categories" element={<CategoryPage />} />
                    <Route path="/quiz/:category" element={<QuizPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/skill-tree" element={<SkillTree userLevel={15} availablePoints={8} onSkillUnlock={(id) => console.log('Unlock skill:', id)} />} />
                    <Route path="/battle/:battleId" element={<BattleArena 
                      battleId="test-battle"
                      player1={{ username: "Player1", score: 150, streak: 3, health: 80, isReady: true }}
                      player2={{ username: "Player2", score: 120, streak: 2, health: 70, isReady: true }}
                      currentQuestion={{
                        id: "1",
                        question: "What is the capital of France?",
                        options: ["London", "Berlin", "Paris", "Madrid"],
                        correct_answer: "Paris",
                        difficulty: "medium",
                        time_limit: 30,
                        points: 10
                      }}
                      questionNumber={1}
                      totalQuestions={5}
                      onAnswer={(answer) => console.log('Answer:', answer)}
                      onBattleComplete={(winner) => console.log('Winner:', winner)}
                    />} />
                  </Routes>
                </Layout>
              </Suspense>
              
              {/* Global Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#1e293b',
                    color: '#f8fafc',
                    border: '1px solid #334155',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#f8fafc',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#f8fafc',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  )
}

export default App
