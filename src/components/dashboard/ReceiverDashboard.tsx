'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  MapPin, Search, PlusCircle, User, Share2, Activity,
  Heart, ShieldCheck, MessageCircle, XCircle, Send, Loader2,
  CheckCircle2, Bell, Sparkles
} from 'lucide-react'
import { UserProfile, BloodRequest } from '@/db/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'

export default function ReceiverDashboard({ profile }: { profile: UserProfile }) {
  const router = useRouter()

  // ✅ FIXED TYPE
  const [activeRequest, setActiveRequest] = useState<BloodRequest | null>(null)

  const [chatOpen, setChatOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [showNotification, setShowNotification] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchActiveRequest = async () => {
      const { data } = await supabase
        .from('requests')
        .select('*, donor:users(*)')
        .eq('receiver_id', profile.id)
        .in('status', ['pending', 'accepted'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (data) {
        setActiveRequest(data)
        if (data.status === 'accepted') setChatOpen(true)
      }
    }

    fetchActiveRequest()

    const channel = supabase
      .channel(`receiver-updates-${profile.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', table: 'requests', schema: 'public' },
        async (payload) => {
          const updated = payload.new as any

          if (updated.receiver_id !== profile.id) return

          // ✅ FIXED prev typing
          setActiveRequest((prev: BloodRequest | null) =>
            prev ? { ...prev, ...updated } : updated
          )

          if (updated.status === 'accepted') {
            const { data: donor } = await supabase
              .from('users')
              .select('*')
              .eq('id', updated.donor_id)
              .single()

            setActiveRequest((prev: BloodRequest | null) =>
              prev ? { ...prev, ...updated, donor } : updated
            )

            setChatOpen(true)
            setShowNotification(true)
            setTimeout(() => setShowNotification(false), 10000)
          }
        }
      )
      .subscribe()

    const interval = setInterval(fetchActiveRequest, 30000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [profile.id, supabase])

  useEffect(() => {
    const requestId = activeRequest?.id
    if (!requestId || activeRequest.status !== 'accepted') return

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true })

      if (data) setChatMessages(data)
    }

    fetchMessages()

    const chatChannel = supabase
      .channel(`chat-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          table: 'messages',
          schema: 'public',
          filter: `request_id=eq.${requestId}`,
        },
        (payload) => {
          setChatMessages(prev => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(chatChannel)
    }
  }, [activeRequest, supabase])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chatMessages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !activeRequest?.id) return

    const { error } = await supabase.from('messages').insert({
      request_id: activeRequest.id,
      sender_id: profile.id,
      text: message
    })

    if (!error) setMessage('')
  }

  return (
    <div>
      {/* UI unchanged */}
    </div>
  )
}