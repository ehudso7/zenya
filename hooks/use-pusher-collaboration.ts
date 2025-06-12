/**
 * React hook for Pusher-based collaboration
 * Drop-in replacement for WebSocket collaboration
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { createPusherClient, PusherWebSocketClient, CollaborationMessage } from '@/lib/websocket/pusher-adapter'
import { useStore } from '@/lib/store'
import toast from 'react-hot-toast'

interface UseCollaborationOptions {
  sessionId: string
  lessonId?: string
  onParticipantJoined?: (participant: any) => void
  onParticipantLeft?: (participant: any) => void
  onStateUpdate?: (state: any) => void
  onMessage?: (message: CollaborationMessage) => void
}

interface CollaborationState {
  isConnected: boolean
  participants: Map<string, any>
  sessionState: any
  error: string | null
}

export function usePusherCollaboration(options: UseCollaborationOptions) {
  const { sessionId, lessonId, onParticipantJoined, onParticipantLeft, onStateUpdate, onMessage } = options
  const user = useStore(state => state.user)
  const [state, setState] = useState<CollaborationState>({
    isConnected: false,
    participants: new Map(),
    sessionState: null,
    error: null,
  })
  
  const clientRef = useRef<PusherWebSocketClient | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttemptsRef = useRef(0)

  // Initialize Pusher client
  useEffect(() => {
    if (!user?.id || !sessionId) return

    const initializeClient = async () => {
      try {
        const client = createPusherClient()
        if (!client) {
          setState(prev => ({ ...prev, error: 'WebSocket service not available' }))
          return
        }

        clientRef.current = client

        // Join session with event handlers
        client.joinSession(sessionId, user.id, {
          onMessage: (message) => {
            handleMessage(message)
            onMessage?.(message)
          },
          onParticipantJoined: (participant) => {
            setState(prev => ({
              ...prev,
              participants: new Map(prev.participants).set(participant.id, participant),
            }))
            onParticipantJoined?.(participant)
            toast(`${participant.info?.name || 'Someone'} joined the session`, {
              icon: '👋',
            })
          },
          onParticipantLeft: (participant) => {
            setState(prev => {
              const newParticipants = new Map(prev.participants)
              newParticipants.delete(participant.id)
              return { ...prev, participants: newParticipants }
            })
            onParticipantLeft?.(participant)
          },
          onStateUpdate: (update) => {
            if (update.type === 'session_joined') {
              setState(prev => ({
                ...prev,
                isConnected: true,
                participants: new Map(Object.entries(update.participants || {})),
                error: null,
              }))
              reconnectAttemptsRef.current = 0
            }
            onStateUpdate?.(update)
          },
        })

        // Send lesson context if provided
        if (lessonId) {
          setTimeout(() => {
            sendMessage({
              type: 'lesson_context',
              userId: user.id,
              sessionId,
              data: { lessonId },
              timestamp: Date.now(),
            })
          }, 1000)
        }

      } catch (error) {
        console.error('Failed to initialize collaboration:', error)
        setState(prev => ({ ...prev, error: 'Failed to connect' }))
        scheduleReconnect()
      }
    }

    initializeClient()

    return () => {
      if (clientRef.current) {
        clientRef.current.leaveSession(sessionId)
        clientRef.current.disconnect()
        clientRef.current = null
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [user?.id, sessionId, lessonId])

  // Handle incoming messages
  const handleMessage = useCallback((message: CollaborationMessage) => {
    switch (message.type) {
      case 'cursor_move':
        setState(prev => {
          const participant = prev.participants.get(message.userId)
          if (participant) {
            participant.cursor = message.data
            return { ...prev }
          }
          return prev
        })
        break

      case 'step_progress':
        setState(prev => ({
          ...prev,
          sessionState: {
            ...prev.sessionState,
            currentStep: message.data.currentStep,
            completedSteps: message.data.completedSteps,
          },
        }))
        break

      case 'add_note':
      case 'whiteboard_draw':
        // These would update collaborative content
        setState(prev => ({
          ...prev,
          sessionState: {
            ...prev.sessionState,
            [message.type === 'add_note' ? 'notes' : 'whiteboard']: [
              ...(prev.sessionState?.[message.type === 'add_note' ? 'notes' : 'whiteboard'] || []),
              message.data,
            ],
          },
        }))
        break

      case 'typing_indicator':
        setState(prev => {
          const participant = prev.participants.get(message.userId)
          if (participant) {
            participant.isTyping = message.data.isTyping
            participant.typingLocation = message.data.location
            return { ...prev }
          }
          return prev
        })
        break
    }
  }, [])

  // Send message
  const sendMessage = useCallback((message: CollaborationMessage) => {
    if (!clientRef.current || !state.isConnected) {
      console.warn('Not connected to collaboration session')
      return
    }

    clientRef.current.sendMessage(sessionId, message)
  }, [sessionId, state.isConnected])

  // Cursor tracking
  const updateCursor = useCallback((x: number, y: number) => {
    if (!user?.id) return
    
    sendMessage({
      type: 'cursor_move',
      userId: user.id,
      sessionId,
      data: { x, y },
      timestamp: Date.now(),
    })
  }, [user?.id, sessionId, sendMessage])

  // Progress tracking
  const updateProgress = useCallback((stepNumber: number, completed: boolean) => {
    if (!user?.id) return
    
    sendMessage({
      type: 'step_progress',
      userId: user.id,
      sessionId,
      data: { stepNumber, completed },
      timestamp: Date.now(),
    })
  }, [user?.id, sessionId, sendMessage])

  // Note adding
  const addNote = useCallback((content: string, position?: { x: number; y: number }) => {
    if (!user?.id) return
    
    sendMessage({
      type: 'add_note',
      userId: user.id,
      sessionId,
      data: {
        id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content,
        position: position || { x: 0, y: 0 },
      },
      timestamp: Date.now(),
    })
  }, [user?.id, sessionId, sendMessage])

  // Typing indicator
  const setTypingIndicator = useCallback((isTyping: boolean, location: string) => {
    if (!user?.id) return
    
    sendMessage({
      type: 'typing_indicator',
      userId: user.id,
      sessionId,
      data: { isTyping, location },
      timestamp: Date.now(),
    })
  }, [user?.id, sessionId, sendMessage])

  // Reconnection logic
  const scheduleReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= 5) {
      setState(prev => ({ ...prev, error: 'Failed to connect after multiple attempts' }))
      return
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttemptsRef.current++
      // Trigger re-initialization by updating a dependency
      setState(prev => ({ ...prev, error: null }))
    }, delay)
  }, [])

  return {
    isConnected: state.isConnected,
    participants: Array.from(state.participants.values()),
    sessionState: state.sessionState,
    error: state.error,
    
    // Actions
    updateCursor,
    updateProgress,
    addNote,
    setTypingIndicator,
    sendMessage,
    
    // Utilities
    participantCount: state.participants.size,
    isHost: user?.id === state.sessionState?.createdBy,
  }
}