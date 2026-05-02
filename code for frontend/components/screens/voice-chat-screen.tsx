"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Phone, Mic, Play, Pause, Square } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface VoiceChatScreenProps {
  orderId: string
  cookName: string
  cookAvatar?: string
  onBack: () => void
  onCall: () => void
}

interface VoiceMessage {
  id: string
  type: "sent" | "received"
  duration: number
  timestamp: string
  isPlaying?: boolean
}

const mockMessages: VoiceMessage[] = [
  { id: "1", type: "received", duration: 12, timestamp: "12:15 PM" },
  { id: "2", type: "sent", duration: 8, timestamp: "12:16 PM" },
  { id: "3", type: "received", duration: 15, timestamp: "12:18 PM" },
]

export function VoiceChatScreen({ cookName, cookAvatar, onBack, onCall }: VoiceChatScreenProps) {
  const [messages, setMessages] = useState(mockMessages)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [playingId, setPlayingId] = useState<string | null>(null)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= 60) {
            setIsRecording(false)
            return 0
          }
          return prev + 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isRecording])

  const handleStartRecording = () => {
    setIsRecording(true)
    setRecordingDuration(0)
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    if (recordingDuration > 0) {
      const newMessage: VoiceMessage = {
        id: Date.now().toString(),
        type: "sent",
        duration: recordingDuration,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages([...messages, newMessage])
    }
    setRecordingDuration(0)
  }

  const togglePlay = (id: string) => {
    setPlayingId(playingId === id ? null : id)
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border/50">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={cookAvatar} alt={cookName} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {cookName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-foreground">{cookName}</h1>
            <p className="text-xs text-muted-foreground">Order #1234</p>
          </div>
        </div>
        <Button 
          size="icon" 
          variant="outline"
          onClick={onCall}
        >
          <Phone className="h-5 w-5" />
        </Button>
      </div>

      {/* Notice */}
      <div className="px-4 py-2 bg-muted/50 text-center">
        <p className="text-xs text-muted-foreground">
          Communication closes after pickup
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.type === "sent" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-2xl max-w-[80%]",
                  message.type === "sent"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border"
                )}
              >
                <button onClick={() => togglePlay(message.id)}>
                  {playingId === message.id ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </button>
                
                {/* Waveform visualization */}
                <div className="flex items-center gap-0.5 h-8 w-24">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className={cn(
                        "w-1 rounded-full",
                        message.type === "sent" 
                          ? "bg-primary-foreground/70" 
                          : "bg-muted-foreground"
                      )}
                      animate={{
                        height: playingId === message.id
                          ? [8, 16 + Math.random() * 16, 8]
                          : 8 + Math.sin(i * 0.5) * 8,
                      }}
                      transition={{
                        duration: 0.3,
                        repeat: playingId === message.id ? Infinity : 0,
                        delay: i * 0.05,
                      }}
                    />
                  ))}
                </div>

                <span className={cn(
                  "text-sm",
                  message.type === "sent" 
                    ? "text-primary-foreground/70" 
                    : "text-muted-foreground"
                )}>
                  {message.duration}s
                </span>
              </div>
            </div>
          ))}

          {/* Timestamp */}
          {messages.length > 0 && (
            <p className={cn(
              "text-xs text-muted-foreground text-center mt-2"
            )}>
              {messages[messages.length - 1].timestamp}
            </p>
          )}
        </div>
      </div>

      {/* Recording Controls */}
      <div className="p-4 bg-card border-t border-border">
        {isRecording ? (
          <div className="flex flex-col items-center">
            {/* Recording indicator */}
            <div className="flex items-center gap-2 mb-4">
              <motion.div
                className="w-3 h-3 bg-destructive rounded-full"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-foreground font-medium">
                Recording {recordingDuration}s / 60s
              </span>
            </div>
            
            <Button
              size="lg"
              variant="destructive"
              className="h-16 w-16 rounded-full"
              onClick={handleStopRecording}
            >
              <Square className="h-6 w-6" />
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Tap to stop
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Button
              size="lg"
              className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90"
              onClick={handleStartRecording}
            >
              <Mic className="h-6 w-6" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
