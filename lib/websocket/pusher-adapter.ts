/**
 * Pusher Adapter for WebSocket functionality on Vercel
 * Provides real-time collaboration features using Pusher Channels
 */

import Pusher from 'pusher'
import PusherClient from 'pusher-js'

export interface PusherConfig {
  appId: string
  key: string
  secret: string
  cluster: string
}

export interface CollaborationMessage {
  type: 'cursor_move' | 'step_progress' | 'add_note' | 'whiteboard_draw' | 
        'voice_state' | 'lesson_context' | 'typing_indicator' | 'participant_joined' | 
        'participant_left' | 'session_state'
  userId: string
  sessionId: string
  data: any
  timestamp: number
}

export class PusherWebSocketAdapter {
  private pusher: Pusher
  private config: PusherConfig

  constructor(config: PusherConfig) {
    this.config = config
    this.pusher = new Pusher({
      appId: config.appId,
      key: config.key,
      secret: config.secret,
      cluster: config.cluster,
      useTLS: true,
    })
  }

  /**
   * Authenticate a user for private/presence channels
   */
  async authenticateUser(socketId: string, channelName: string, userId: string) {
    const auth = this.pusher.authorizeChannel(socketId, channelName, {
      user_id: userId,
      user_info: {
        id: userId,
      },
    })
    return auth
  }

  /**
   * Trigger an event to a channel
   */
  async sendToChannel(channelName: string, eventName: string, data: any) {
    try {
      await this.pusher.trigger(channelName, eventName, data)
      return { success: true }
    } catch (error) {
      console.error('Pusher trigger error:', error)
      return { success: false, error }
    }
  }

  /**
   * Send to a specific session
   */
  async sendToSession(sessionId: string, message: CollaborationMessage) {
    const channelName = `private-session-${sessionId}`
    return this.sendToChannel(channelName, message.type, message)
  }

  /**
   * Broadcast to all participants except sender
   */
  async broadcastToSession(
    sessionId: string, 
    message: CollaborationMessage, 
    excludeSocketId?: string
  ) {
    const channelName = `private-session-${sessionId}`
    
    try {
      await this.pusher.trigger(channelName, message.type, message, {
        socket_id: excludeSocketId,
      })
      return { success: true }
    } catch (error) {
      console.error('Pusher broadcast error:', error)
      return { success: false, error }
    }
  }

  /**
   * Get channel information
   */
  async getChannelInfo(channelName: string) {
    try {
      const response = await this.pusher.get({
        path: `/channels/${channelName}`,
        params: { info: 'user_count,subscription_count' },
      })
      return response
    } catch (error) {
      console.error('Pusher channel info error:', error)
      return null
    }
  }

  /**
   * Get presence channel members
   */
  async getSessionParticipants(sessionId: string) {
    const channelName = `presence-session-${sessionId}`
    
    try {
      const response = await this.pusher.get({
        path: `/channels/${channelName}/users`,
      })
      return (response as any).users || []
    } catch (error) {
      console.error('Pusher presence error:', error)
      return []
    }
  }

  /**
   * Terminate a user's connection
   */
  async disconnectUser(userId: string, sessionId: string) {
    const channelName = `private-session-${sessionId}`
    
    try {
      await this.pusher.trigger(channelName, 'force-disconnect', {
        userId,
        reason: 'User disconnected',
      })
      return { success: true }
    } catch (error) {
      console.error('Pusher disconnect error:', error)
      return { success: false, error }
    }
  }
}

/**
 * Client-side Pusher connection
 */
export class PusherWebSocketClient {
  private client: PusherClient
  private channels: Map<string, any> = new Map()

  constructor(key: string, cluster: string, authEndpoint: string) {
    this.client = new PusherClient(key, {
      cluster,
      authEndpoint,
      auth: {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    })

    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    this.client.connection.bind('connected', () => {
      console.warn('Connected to Pusher')
    })

    this.client.connection.bind('error', (error: any) => {
      console.error('Pusher connection error:', error)
    })
  }

  /**
   * Join a collaboration session
   */
  joinSession(sessionId: string, userId: string, handlers: {
    onMessage: (message: CollaborationMessage) => void
    onParticipantJoined?: (data: any) => void
    onParticipantLeft?: (data: any) => void
    onStateUpdate?: (data: any) => void
  }) {
    const channelName = `presence-session-${sessionId}`
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)
    }

    const channel = this.client.subscribe(channelName)
    
    // Bind event handlers
    channel.bind('cursor_move', (data: any) => handlers.onMessage(data))
    channel.bind('step_progress', (data: any) => handlers.onMessage(data))
    channel.bind('add_note', (data: any) => handlers.onMessage(data))
    channel.bind('whiteboard_draw', (data: any) => handlers.onMessage(data))
    channel.bind('voice_state', (data: any) => handlers.onMessage(data))
    channel.bind('typing_indicator', (data: any) => handlers.onMessage(data))
    
    // Presence events
    channel.bind('pusher:subscription_succeeded', (members: any) => {
      handlers.onStateUpdate?.({
        type: 'session_joined',
        participants: members.members,
      })
    })
    
    channel.bind('pusher:member_added', (member: any) => {
      handlers.onParticipantJoined?.(member)
    })
    
    channel.bind('pusher:member_removed', (member: any) => {
      handlers.onParticipantLeft?.(member)
    })

    this.channels.set(channelName, channel)
    return channel
  }

  /**
   * Leave a session
   */
  leaveSession(sessionId: string) {
    const channelName = `presence-session-${sessionId}`
    const channel = this.channels.get(channelName)
    
    if (channel) {
      this.client.unsubscribe(channelName)
      this.channels.delete(channelName)
    }
  }

  /**
   * Send a message to the session
   */
  sendMessage(sessionId: string, message: CollaborationMessage) {
    const channelName = `presence-session-${sessionId}`
    const channel = this.channels.get(channelName)
    
    if (channel) {
      channel.trigger(`client-${message.type}`, message)
    }
  }

  /**
   * Disconnect from Pusher
   */
  disconnect() {
    this.channels.forEach((_, channelName) => {
      this.client.unsubscribe(channelName)
    })
    this.channels.clear()
    this.client.disconnect()
  }
}

// Export singleton instances
export const pusherServer = process.env.PUSHER_APP_ID 
  ? new PusherWebSocketAdapter({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })
  : null

export const createPusherClient = () => {
  if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
    console.warn('Pusher not configured')
    return null
  }
  
  return new PusherWebSocketClient(
    process.env.NEXT_PUBLIC_PUSHER_KEY,
    process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    '/api/pusher/auth'
  )
}