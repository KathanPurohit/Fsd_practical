import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md mx-auto p-8"
      >
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-white mb-4">Oops! Something went wrong</h1>
        <p className="text-gray-400 mb-6">
          We encountered an unexpected error. Don't worry, our team has been notified.
        </p>
        
        <details className="text-left mb-6 p-4 bg-white/10 rounded-lg">
          <summary className="text-gray-300 cursor-pointer">Error Details</summary>
          <pre className="text-red-400 text-sm mt-2 overflow-auto">
            {error.message}
          </pre>
        </details>
        
        <button
          onClick={resetErrorBoundary}
          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors mx-auto"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Try Again</span>
        </button>
      </motion.div>
    </div>
  )
}

export default ErrorFallback
