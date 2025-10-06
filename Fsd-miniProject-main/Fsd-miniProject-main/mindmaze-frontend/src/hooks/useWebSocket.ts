import { useState, useEffect, useRef } from 'react'

interface WebSocketMessage {
  type: string
  [key: string]: any
}

export const useWebSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connect = (username: string) => {
    if (socket) {
      socket.close()
    }

    setConnectionStatus('connecting')
    
    try {
      const ws = new WebSocket(`ws://localhost:8000/ws/${username}`)
      
      ws.onopen = () => {
        console.log('WebSocket connected')
        setSocket(ws)
        setIsConnected(true)
        setConnectionStatus('connected')
        reconnectAttempts.current = 0
      }
      
      ws.onclose = () => {
        console.log('WebSocket disconnected')
        setSocket(null)
        setIsConnected(false)
        setConnectionStatus('disconnected')
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})`)
            connect(username)
          }, 2000 * reconnectAttempts.current)
        }
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnectionStatus('error')
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('WebSocket message received:', data)
          // Handle different message types here
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      setConnectionStatus('error')
    }
  }

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    if (socket) {
      socket.close()
    }
    
    setSocket(null)
    setIsConnected(false)
    setConnectionStatus('disconnected')
    reconnectAttempts.current = 0
  }

  const sendMessage = (message: WebSocketMessage) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message))
      return true
    } else {
      console.warn('WebSocket is not connected')
      return false
    }
  }

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (socket) {
        socket.close()
      }
    }
  }, [])

  return {
    socket,
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    sendMessage
  }
}
