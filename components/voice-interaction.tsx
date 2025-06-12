'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, MicOff, Volume2, VolumeX, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import toast from 'react-hot-toast'
import { performanceMonitor } from '@/lib/monitoring/client-performance'

interface VoiceInteractionProps {
  onTranscript: (text: string) => void
  onSpeechStart?: () => void
  onSpeechEnd?: () => void
  aiResponse?: string
  isProcessing?: boolean
  disabled?: boolean
}

// Speech recognition hook with advanced features
function useSpeechRecognition() {
  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  const recognitionRef = useRef<any>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (SpeechRecognition) {
      setIsSupported(true)
      
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      recognition.maxAlternatives = 3

      recognition.onstart = () => {
        setIsListening(true)
        setError(null)
        performanceMonitor.trackMetric({
          name: 'voice_recognition_started',
          value: 1,
          unit: 'count',
          metadata: { timestamp: Date.now() }
        })
      }

      recognition.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''
        let maxConfidence = 0

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const transcript = result[0].transcript
          const confidence = result[0].confidence || 0

          if (result.isFinal) {
            finalTranscript += transcript
            maxConfidence = Math.max(maxConfidence, confidence)
          } else {
            interimTranscript += transcript
          }
        }

        setTranscript(finalTranscript || interimTranscript)
        setConfidence(maxConfidence || 0.8) // Default confidence for interim results

        // Reset timeout for continuous listening
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        
        timeoutRef.current = setTimeout(() => {
          if (recognitionRef.current && isListening) {
            recognition.stop()
          }
        }, 3000) // Stop after 3 seconds of silence
      }

      recognition.onerror = (event: any) => {
        setError(event.error)
        setIsListening(false)
        
        console.error('Speech recognition error:', event.error)
      }

      recognition.onend = () => {
        setIsListening(false)
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }

      recognitionRef.current = recognition
    } else {
      setIsSupported(false)
      setError('Speech recognition not supported in this browser')
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isListening])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('')
      setError(null)
      recognitionRef.current.start()
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }, [isListening])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setConfidence(0)
    setError(null)
  }, [])

  return {
    isSupported,
    isListening,
    transcript,
    confidence,
    error,
    startListening,
    stopListening,
    resetTranscript
  }
}

// Text-to-speech hook with voice selection
function useTextToSpeech() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [rate, setRate] = useState(1.0)
  const [pitch, setPitch] = useState(1.0)
  const [volume, setVolume] = useState(0.8)

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setIsSupported(true)

      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices()
        setVoices(availableVoices)
        
        // Try to select a good default voice
        const englishVoices = availableVoices.filter(voice => voice.lang.includes('en'))
        const femaleVoice = englishVoices.find(voice => 
          voice.name.toLowerCase().includes('female') || 
          voice.name.toLowerCase().includes('karen') ||
          voice.name.toLowerCase().includes('samantha')
        )
        const defaultVoice = femaleVoice || englishVoices[0] || availableVoices[0]
        
        if (defaultVoice) {
          setSelectedVoice(defaultVoice)
        }
      }

      // Load voices immediately and on voiceschanged event
      loadVoices()
      speechSynthesis.onvoiceschanged = loadVoices
    } else {
      setIsSupported(false)
    }
  }, [])

  const speak = useCallback(async (text: string) => {
    if (!isSupported || !text.trim()) return

    return new Promise<void>((resolve, reject) => {
          // Cancel any ongoing speech
          speechSynthesis.cancel()

          const utterance = new SpeechSynthesisUtterance(text)
          utterance.voice = selectedVoice
          utterance.rate = rate
          utterance.pitch = pitch
          utterance.volume = volume

          utterance.onstart = () => {
            setIsSpeaking(true)
            // Speech started
            performanceMonitor.trackMetric({
              name: 'voice_synthesis_started',
              value: 1,
              unit: 'count',
              metadata: { 
                textLength: text.length,
                voice: selectedVoice?.name || 'default'
              }
            })
          }

          utterance.onend = () => {
            setIsSpeaking(false)
            // Speech completed
            performanceMonitor.trackMetric({
              name: 'voice_synthesis_completed',
              value: 1,
              unit: 'count'
            })
            resolve()
          }

          utterance.onerror = (event) => {
            setIsSpeaking(false)
            // Speech synthesis error
            performanceMonitor.trackError(new Error(`Speech synthesis error: ${event.error}`), 'voice_synthesis')
            reject(new Error(`Speech synthesis failed: ${event.error}`))
          }

          utteranceRef.current = utterance
          speechSynthesis.speak(utterance)
    })
  }, [isSupported, selectedVoice, rate, pitch, volume])

  const stop = useCallback(() => {
    speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  const pause = useCallback(() => {
    speechSynthesis.pause()
  }, [])

  const resume = useCallback(() => {
    speechSynthesis.resume()
  }, [])

  return {
    isSupported,
    isSpeaking,
    voices,
    selectedVoice,
    rate,
    pitch,
    volume,
    setSelectedVoice,
    setRate,
    setPitch,
    setVolume,
    speak,
    stop,
    pause,
    resume
  }
}

export function VoiceInteraction({
  onTranscript,
  onSpeechStart,
  onSpeechEnd,
  aiResponse,
  isProcessing = false,
  disabled = false
}: VoiceInteractionProps) {
  const {
    isSupported: speechSupported,
    isListening,
    transcript,
    confidence,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition()

  const {
    isSupported: ttsSupported,
    isSpeaking,
    voices,
    selectedVoice,
    rate,
    volume,
    setSelectedVoice,
    setRate,
    setVolume,
    speak,
    stop: stopSpeaking
  } = useTextToSpeech()

  const [autoSpeak, setAutoSpeak] = useState(false)
  const [visualMode] = useState<'waveform' | 'circular'>('circular')

  // Handle speech recognition results
  useEffect(() => {
    if (transcript && !isListening && transcript.trim().length > 0) {
      onTranscript(transcript)
      
      // Track successful voice interaction
      performanceMonitor.trackMetric({
        name: 'voice_interaction_completed',
        value: 1,
        unit: 'count',
        metadata: {
          transcriptLength: transcript.length,
          confidence: confidence,
          timestamp: Date.now()
        }
      })
    }
  }, [transcript, isListening, onTranscript, confidence])

  // Auto-speak AI responses
  useEffect(() => {
    if (aiResponse && autoSpeak && !isSpeaking && !isProcessing) {
      speak(aiResponse).catch(error => {
        toast.error('Failed to speak response')
        console.error('TTS error:', error)
      })
    }
  }, [aiResponse, autoSpeak, isSpeaking, isProcessing, speak])

  // Handle speech start/end events
  useEffect(() => {
    if (isListening && onSpeechStart) {
      onSpeechStart()
    } else if (!isListening && onSpeechEnd) {
      onSpeechEnd()
    }
  }, [isListening, onSpeechStart, onSpeechEnd])

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening()
    } else {
      resetTranscript()
      startListening()
    }
  }

  const handleSpeakResponse = () => {
    if (aiResponse) {
      if (isSpeaking) {
        stopSpeaking()
      } else {
        speak(aiResponse).catch(_error => {
          toast.error('Failed to speak response')
        })
      }
    }
  }

  if (!speechSupported && !ttsSupported) {
    return (
      <Card className="glass">
        <CardContent className="p-4 text-center">
          <div className="text-gray-500 dark:text-gray-400">
            Voice features not supported in this browser
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass">
      <CardContent className="p-4 space-y-4">
        {/* Voice Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {speechSupported && (
              <Button
                onClick={handleVoiceToggle}
                disabled={disabled || isProcessing}
                variant={isListening ? 'danger' : 'primary'}
                size="sm"
                className="relative"
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4 mr-2" />
                    Stop Listening
                    {visualMode === 'circular' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Start Listening
                  </>
                )}
              </Button>
            )}

            {ttsSupported && aiResponse && (
              <Button
                onClick={handleSpeakResponse}
                disabled={disabled}
                variant={isSpeaking ? 'danger' : 'secondary'}
                size="sm"
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 mr-2" />
                    Speak
                  </>
                )}
              </Button>
            )}

            <Button
              onClick={resetTranscript}
              disabled={disabled || !transcript}
              variant="ghost"
              size="sm"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {ttsSupported && (
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={autoSpeak}
                onChange={(e) => setAutoSpeak(e.target.checked)}
                className="rounded"
              />
              <span>Auto-speak responses</span>
            </label>
          )}
        </div>

        {/* Voice Visualization */}
        {(isListening || isSpeaking) && (
          <div className="flex items-center justify-center py-4">
            {visualMode === 'circular' ? (
              <div className="relative">
                <div className={`w-16 h-16 rounded-full border-4 ${
                  isListening ? 'border-blue-500 animate-pulse' : 'border-green-500'
                } flex items-center justify-center`}>
                  {isListening ? (
                    <Mic className="w-6 h-6 text-blue-500" />
                  ) : (
                    <Volume2 className="w-6 h-6 text-green-500" />
                  )}
                </div>
                {(isListening || isSpeaking) && (
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-current animate-spin" />
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 bg-blue-500 rounded-full animate-pulse`}
                    style={{
                      height: `${Math.random() * 20 + 10}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Transcript Display */}
        {transcript && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Transcript:
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
              {transcript}
            </div>
            {confidence > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Confidence</span>
                  <span>{Math.round(confidence * 100)}%</span>
                </div>
                <Progress value={confidence * 100} className="h-1" />
              </div>
            )}
          </div>
        )}

        {/* TTS Controls */}
        {ttsSupported && voices.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Voice Settings
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Voice</label>
                <select
                  value={selectedVoice?.name || ''}
                  onChange={(e) => {
                    const voice = voices.find(v => v.name === e.target.value)
                    setSelectedVoice(voice || null)
                  }}
                  className="w-full text-xs p-1 border rounded bg-white dark:bg-gray-800"
                >
                  {voices.map(voice => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500">
                  Speed: {rate.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500">
                  Volume: {Math.round(volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {speechError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="text-sm text-red-600 dark:text-red-400">
              Voice Recognition Error: {speechError}
            </div>
          </div>
        )}

        {/* Status Indicators */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span className={`flex items-center ${speechSupported ? 'text-green-600' : 'text-red-600'}`}>
              <div className={`w-2 h-2 rounded-full mr-1 ${speechSupported ? 'bg-green-500' : 'bg-red-500'}`} />
              Speech Recognition
            </span>
            <span className={`flex items-center ${ttsSupported ? 'text-green-600' : 'text-red-600'}`}>
              <div className={`w-2 h-2 rounded-full mr-1 ${ttsSupported ? 'bg-green-500' : 'bg-red-500'}`} />
              Text-to-Speech
            </span>
          </div>
          
          {(isListening || isSpeaking) && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>{isListening ? 'Listening...' : 'Speaking...'}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}