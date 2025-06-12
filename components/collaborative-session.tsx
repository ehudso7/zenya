'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Users, Share, Mic, MicOff, Video, VideoOff, MessageSquare, PenTool, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/lib/store'
import toast from 'react-hot-toast'

interface Participant {
  userId: string
  profile: {
    id: string
    email: string
    name: string
    avatar?: string
  }
  joinedAt: number
  lastActivity: number
  cursor?: {
    x: number
    y: number
    timestamp: number
  }
  currentStep?: number
  isActive: boolean
  voiceState?: {
    isMuted: boolean
    isTalking: boolean
  }
}

interface CollaborativeNote {
  id: string
  content: string
  author: string
  timestamp: number
  position: { x: number; y: number }
}

interface SessionState {
  currentStep: number
  completedSteps: number[]
  notes: CollaborativeNote[]
  whiteboard: Array<{
    id: string
    type: 'line' | 'circle' | 'rect' | 'text'
    data: any
    author: string
    timestamp: number
  }>
}

interface CollaborativeSessionProps {
  sessionId: string
  lessonId?: string
  lessonTitle?: string
  onStateChange?: (state: SessionState) => void
  className?: string
}

// WebSocket hook for real-time collaboration
function useCollaborativeWebSocket(sessionId: string, userId: string) {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [sessionState, setSessionState] = useState<SessionState>({
    currentStep: 0,
    completedSteps: [],
    notes: [],
    whiteboard: []
  })
  
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connect = useCallback(async () => {
    try {
      // Get auth token for WebSocket connection
      const token = localStorage.getItem('supabase.auth.token') // Simplified
      if (!token) throw new Error('No auth token')

      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/ws/collaborate?token=${token}&sessionId=${sessionId}`
      
      const websocket = new WebSocket(wsUrl)
      
      websocket.onopen = () => {
        console.log('🔗 Connected to collaborative session')
        setIsConnected(true)
        reconnectAttempts.current = 0
        
        // Connected successfully
        
        console.log('🔌 WebSocket connected to session:', sessionId)
      }

      websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          handleWebSocketMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      websocket.onclose = (event) => {
        console.log('🔌 WebSocket connection closed:', event.code, event.reason)
        setIsConnected(false)
        
        // Attempt to reconnect unless explicitly closed
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++
            connect()
          }, delay)
        }
      }

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error)
        console.error('WebSocket connection error')
      }

      setWs(websocket)
      
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error)
      toast.error('Failed to join collaborative session')
    }
  }, [sessionId, userId])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    if (ws) {
      ws.close(1000, 'User disconnected')
      setWs(null)
    }
    
    setIsConnected(false)
  }, [ws])

  const sendMessage = useCallback((message: any) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    }
  }, [ws])

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'session_joined':
        setParticipants(message.currentState.participants)
        setSessionState(message.currentState.sharedState)
        toast.success('Joined collaborative session!')
        break

      case 'participant_joined':
        setParticipants(prev => [...prev, message.participant])
        toast.success(`${message.participant.profile.name} joined the session`)
        break

      case 'participant_disconnected':
        setParticipants(prev => prev.filter(p => p.userId !== message.userId))
        break

      case 'cursor_updated':
        setParticipants(prev => prev.map(p => 
          p.userId === message.userId 
            ? { ...p, cursor: message.cursor }
            : p
        ))
        break

      case 'progress_updated':
        setSessionState(prev => ({
          ...prev,
          currentStep: message.currentStep,
          completedSteps: message.completedSteps
        }))
        break

      case 'note_added':
        setSessionState(prev => ({
          ...prev,
          notes: [...prev.notes, message.note]
        }))
        break

      case 'whiteboard_updated':
        setSessionState(prev => ({
          ...prev,
          whiteboard: [...prev.whiteboard, message.drawing]
        }))
        break

      case 'voice_state_changed':
        setParticipants(prev => prev.map(p => 
          p.userId === message.userId 
            ? { ...p, voiceState: message.state }
            : p
        ))
        break

      case 'lesson_context_updated':
        toast.info(`Lesson changed: ${message.lessonTitle}`)
        break

      case 'typing_indicator':
        // Handle typing indicators for real-time collaboration
        setParticipants(prev => prev.map(p => 
          p.userId === message.userId 
            ? { ...p, isTyping: message.isTyping, typingLocation: message.location }
            : p
        ))
        break

      default:
        console.log('Unknown WebSocket message type:', message.type)
    }
  }

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return {
    isConnected,
    participants,
    sessionState,
    sendMessage,
    connect,
    disconnect
  }
}

export function CollaborativeSession({ 
  sessionId, 
  lessonId, 
  lessonTitle,
  onStateChange,
  className 
}: CollaborativeSessionProps) {
  const { user } = useStore()
  const [showCursors, setShowCursors] = useState(true)
  const [showParticipants, setShowParticipants] = useState(true)
  const [isVoiceMuted, setIsVoiceMuted] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [notePosition, setNotePosition] = useState({ x: 0, y: 0 })
  
  const containerRef = useRef<HTMLDivElement>(null)
  const cursorTrackingRef = useRef<boolean>(false)

  const {
    isConnected,
    participants,
    sessionState,
    sendMessage
  } = useCollaborativeWebSocket(sessionId, user?.id || '')

  // Send lesson context when component mounts
  useEffect(() => {
    if (isConnected && lessonId) {
      sendMessage({
        type: 'lesson_context',
        lessonId,
        lessonTitle
      })
    }
  }, [isConnected, lessonId, lessonTitle, sendMessage])

  // Notify parent component of state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange(sessionState)
    }
  }, [sessionState, onStateChange])

  // Handle cursor tracking
  useEffect(() => {
    if (!showCursors || !isConnected) return

    const handleMouseMove = (event: MouseEvent) => {
      if (!cursorTrackingRef.current) return
      
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) {
        const x = ((event.clientX - rect.left) / rect.width) * 100
        const y = ((event.clientY - rect.top) / rect.height) * 100
        
        sendMessage({
          type: 'cursor_move',
          x,
          y
        })
      }
    }

    const handleMouseEnter = () => {
      cursorTrackingRef.current = true
    }

    const handleMouseLeave = () => {
      cursorTrackingRef.current = false
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      container.addEventListener('mouseenter', handleMouseEnter)
      container.addEventListener('mouseleave', handleMouseLeave)
      
      return () => {
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('mouseenter', handleMouseEnter)
        container.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [showCursors, isConnected, sendMessage])

  const handleStepProgress = (stepNumber: number, completed: boolean) => {
    sendMessage({
      type: 'step_progress',
      stepNumber,
      completed
    })
  }

  const handleAddNote = () => {
    if (!newNote.trim()) return

    sendMessage({
      type: 'add_note',
      content: newNote,
      position: notePosition
    })

    setNewNote('')
  }

  const handleVoiceToggle = () => {
    const newMutedState = !isVoiceMuted
    setIsVoiceMuted(newMutedState)
    
    sendMessage({
      type: 'voice_state',
      state: {
        isMuted: newMutedState,
        isTalking: false
      }
    })
  }

  const handleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        // Request screen sharing permission
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        })
        
        setIsScreenSharing(true)
        toast.success('Screen sharing started')
        
        // Handle stream end
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false)
          toast.info('Screen sharing stopped')
        }
      } else {
        setIsScreenSharing(false)
      }
    } catch (error) {
      toast.error('Failed to start screen sharing')
    }
  }

  return (
    <div className={`space-y-4 ${className}`} ref={containerRef}>
      {/* Connection Status & Controls */}
      <Card className="glass">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Collaborative Session
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCursors(!showCursors)}
              >
                {showCursors ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Cursors
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowParticipants(!showParticipants)}
              >
                <Users className="w-4 h-4" />
                {participants.length}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center gap-2">
            <Button
              variant={isVoiceMuted ? 'outline' : 'default'}
              size="sm"
              onClick={handleVoiceToggle}
            >
              {isVoiceMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            
            <Button
              variant={isVideoEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
            >
              {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </Button>
            
            <Button
              variant={isScreenSharing ? 'default' : 'outline'}
              size="sm"
              onClick={handleScreenShare}
            >
              <Share className="w-4 h-4" />
              {isScreenSharing ? 'Stop Share' : 'Share Screen'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Participants Panel */}
      {showParticipants && (
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">
              Participants ({participants.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {participants.map(participant => (
                <div 
                  key={participant.userId}
                  className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                      {participant.profile.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{participant.profile.name}</div>
                      <div className="text-xs text-gray-500">
                        {participant.isActive ? 'Active' : 'Away'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {participant.voiceState?.isTalking && (
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    )}
                    {participant.voiceState?.isMuted && (
                      <MicOff className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Progress */}
      <Card className="glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Session Progress</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Current Step:</span>
              <span className="font-medium">{sessionState.currentStep}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Completed:</span>
              <span className="font-medium">{sessionState.completedSteps.length}</span>
            </div>
            
            {/* Step Progress Controls */}
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => handleStepProgress(sessionState.currentStep + 1, true)}
                disabled={!isConnected}
              >
                Mark Step Complete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collaborative Notes */}
      <Card className="glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Shared Notes ({sessionState.notes.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Add Note */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a collaborative note..."
                className="flex-1 px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800"
                onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
              />
              <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
                Add
              </Button>
            </div>
            
            {/* Notes List */}
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {sessionState.notes.map(note => {
                const author = participants.find(p => p.userId === note.author)
                return (
                  <div key={note.id} className="p-2 rounded bg-gray-50 dark:bg-gray-800">
                    <div className="text-sm">{note.content}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {author?.profile.name || 'Unknown'} • {new Date(note.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participant Cursors */}
      {showCursors && participants.map(participant => 
        participant.cursor && participant.userId !== user?.id && (
          <div
            key={`cursor-${participant.userId}`}
            className="absolute pointer-events-none z-50"
            style={{
              left: `${participant.cursor.x}%`,
              top: `${participant.cursor.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
              <div className="px-2 py-1 bg-blue-500 text-white text-xs rounded shadow-lg">
                {participant.profile.name}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  )
}