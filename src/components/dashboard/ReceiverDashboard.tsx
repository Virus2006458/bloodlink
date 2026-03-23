'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Droplets, MapPin, Clock, Search, PlusCircle, User, Share2, Activity, 
  Heart, ShieldCheck, UserCheck, MessageCircle, XCircle, Send, Loader2,
  CheckCircle2, Bell, Sparkles
} from 'lucide-react'
import { UserProfile, BloodRequest } from '@/db/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'

export default function ReceiverDashboard({ profile }: { profile: UserProfile }) {
  const router = useRouter()
  const [activeRequest, setActiveRequest] = useState<any>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [showNotification, setShowNotification] = useState(false)
  const [mounted, setMounted] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Stable supabase client
  const supabase = useRef(createClient()).current

  useEffect(() => {
    setMounted(true)
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

    // Realtime for request status changes
    const channel = supabase
        .channel(`receiver-updates-${profile.id}`)
        .on(
            'postgres_changes',
            { 
              event: 'UPDATE', 
              table: 'requests', 
              schema: 'public',
              filter: `receiver_id=eq.${profile.id}` 
            },
            async (payload) => {
                const updated = payload.new as any
                setActiveRequest((prev: any) => prev ? {...prev, ...updated} : updated)
                
                if (updated.status === 'accepted') {
                   const { data: donor } = await supabase.from('users').select('*').eq('id', updated.donor_id).single()
                   setActiveRequest((prev: any) => ({...prev, ...updated, donor}))
                   setChatOpen(true)
                   setShowNotification(true)
                   setTimeout(() => setShowNotification(false), 10000)
                }
            }
        )
        .subscribe()

    return () => { 
        supabase.removeChannel(channel)
    }
  }, [profile.id, supabase])

  // Chat Realtime
  useEffect(() => {
    const currentRequestId = activeRequest?.id;
    if (!currentRequestId || activeRequest?.status !== 'accepted') return

    const fetchMessages = async () => {
        const { data } = await supabase.from('messages').select('*').eq('request_id', currentRequestId).order('created_at', { ascending: true })
        if (data) setChatMessages(data)
    }
    fetchMessages()

    const chatChannel = supabase.channel(`chat-v2-${currentRequestId}`).on('postgres_changes', { event: 'INSERT', table: 'messages', schema: 'public', filter: `request_id=eq.${currentRequestId}` }, (payload) => {
        setChatMessages(prev => [...prev, payload.new])
    }).subscribe()

    return () => { supabase.removeChannel(chatChannel) }
  }, [activeRequest?.id, activeRequest?.status, supabase])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [chatMessages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !activeRequest?.id) return
    const { error } = await supabase.from('messages').insert({ request_id: activeRequest.id, sender_id: profile.id, text: message })
    if (!error) setMessage('')
  }

  if (!mounted) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative mt-4">
      {/* Alert Notification */}
      {showNotification && (
        <div className="fixed top-8 right-8 z-[100] animate-in slide-in-from-right duration-500">
           <div className="bg-green-600 text-white p-6 rounded-[32px] shadow-2xl flex items-center gap-6 border-4 border-white/20 backdrop-blur-xl">
              <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center animate-bounce">
                 <Bell className="h-6 w-6" />
              </div>
              <div>
                 <h4 className="font-black text-lg leading-tight">Donor Accepted!</h4>
                 <p className="text-white/80 font-bold text-sm">A volunteer has joined your request. Open chat now!</p>
              </div>
              <button onClick={() => setShowNotification(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                 <XCircle className="h-6 w-6" />
              </button>
           </div>
        </div>
      )}

      {/* Left Column */}
      <div className="lg:col-span-8 space-y-8">
        <section>
          <div className="flex items-center gap-3 mb-6">
             <div className="bg-red-600 p-2.5 rounded-xl text-white shadow-xl shadow-red-200">
                <Activity className="h-6 w-6" />
             </div>
             <div>
                <h2 className="text-xl font-black text-stone-900 leading-none">Emergency Hub</h2>
                <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mt-1">Monitoring matches in real-time</p>
             </div>
          </div>

          {activeRequest ? (
            <Card className="rounded-[40px] border-none shadow-2xl p-8 bg-white overflow-hidden relative group">
               <div className="flex flex-col sm:flex-row gap-8 items-center relative">
                  <div className="h-28 w-28 bg-red-600 rounded-[32px] flex flex-col items-center justify-center text-white shadow-2xl shadow-red-200">
                     <span className="text-4xl font-black">{activeRequest.blood_group}</span>
                     <span className="text-[10px] uppercase font-black opacity-80 tracking-widest">Needed</span>
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left">
                     <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
                        <span className={`font-black text-[9px] tracking-wider uppercase px-3 py-1 rounded-full border ${activeRequest.status === 'accepted' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200 animate-pulse'}`}>
                            ● {activeRequest.status === 'accepted' ? 'Donor Matched' : 'Broadcasting...'}
                        </span>
                        
                        {activeRequest.status === 'accepted' && activeRequest.donor && (
                           <span className="font-black text-[9px] tracking-wider uppercase px-3 py-1 rounded-full border bg-stone-900 text-white border-stone-800 animate-in fade-in duration-500">
                               ● Voluntarily Accepted by: {activeRequest.donor.name}
                           </span>
                        )}

                        <span className="text-stone-300 font-semibold text-[10px] tracking-widest uppercase">ID: {activeRequest.id.split('-')[0].toUpperCase()}</span>
                     </div>
                     <h3 className="text-3xl font-black text-stone-900 mt-2">{activeRequest.patient_name || 'Emergency Call'}</h3>
                     <div className="flex items-center gap-4 mt-3 text-stone-500 justify-center sm:justify-start font-bold text-sm">
                        <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-red-500" />{activeRequest.city}</span>
                        <span className="flex items-center gap-1.5 text-stone-400">
                            {formatDistanceToNow(new Date(activeRequest.created_at))} ago
                        </span>
                     </div>
                  </div>
               </div>

               <div className="mt-8">
                  <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100">
                     <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2">Emergency Status & Notes</p>
                     <p className="font-black text-stone-600 text-sm uppercase">{activeRequest.notes || 'No critical notes added'}</p>
                  </div>
               </div>
               
               <div className="flex gap-4 mt-8">
                  {activeRequest.status === 'accepted' ? (
                      <Button onClick={() => setChatOpen(true)} className="flex-1 rounded-2xl h-14 gap-3 font-black bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-100">
                         <MessageCircle className="h-6 w-6" /> START COORDINATION CHAT
                      </Button>
                  ) : (
                      <Button disabled className="flex-1 rounded-2xl h-14 gap-3 font-black bg-stone-100 text-stone-300 border border-stone-200 uppercase tracking-widest text-[10px]">
                         <Loader2 className="h-5 w-5 animate-spin" /> LOCATING DONORS...
                      </Button>
                  )}
                  <Button variant="outline" className="rounded-2xl h-14 w-14 shrink-0 border-2 border-stone-100 hover:bg-stone-50 transition-all">
                     <Share2 className="h-5 w-5" />
                  </Button>
               </div>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[40px] border-2 border-dashed border-stone-200 text-center">
               <div className="bg-stone-50 p-8 rounded-3xl mb-6"><Activity className="h-10 w-10 text-stone-300" /></div>
               <h3 className="text-xl font-black text-stone-900">No requests active</h3>
               <p className="text-stone-400 font-bold text-sm mt-2 max-w-xs mx-auto">Click New Request to broadcast your emergency.</p>
            </div>
          )}
        </section>

        {chatOpen && activeRequest && (activeRequest.status === 'accepted') && (
            <section className="animate-in slide-in-from-bottom-8 duration-500">
                <Card className="rounded-[40px] shadow-2xl border-none bg-stone-900 text-white overflow-hidden flex flex-col h-[500px]">
                    <div className="bg-red-600 p-6 flex items-center justify-between shrink-0">
                         <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-md"><User className="h-6 w-6" /></div>
                            <div>
                                <h4 className="font-black text-lg leading-none mb-1">{activeRequest.donor?.name || 'Verified Donor'}</h4>
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Secure Connection</span>
                            </div>
                         </div>
                         <button onClick={() => setChatOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><XCircle className="h-6 w-6 text-white" /></button>
                    </div>
                    
                    <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-stone-900/50">
                        {chatMessages.map((m, i) => (
                            <div key={i} className={`flex ${m.sender_id === profile.id ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-4 rounded-2xl max-w-[80%] text-[13px] font-bold ${m.sender_id === profile.id ? 'bg-red-600 text-white rounded-tr-none' : 'bg-stone-800 text-stone-200 rounded-tl-none'}`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <form onSubmit={sendMessage} className="p-6 bg-stone-950/50 flex gap-3 shrink-0">
                        <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." className="flex-1 bg-stone-800 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 ring-red-500 outline-none" />
                        <Button type="submit" className="rounded-2xl h-14 w-14 p-0 bg-red-600"><Send className="h-6 w-6" /></Button>
                    </form>
                </Card>
            </section>
        )}
      </div>

      {/* Right Column */}
      <div className="lg:col-span-4 space-y-6">
         <Card className="rounded-[32px] border-none p-8 shadow-xl bg-black text-white relative overflow-hidden group">
            <ShieldCheck className="absolute top-0 right-0 h-32 w-32 -mr-16 -mt-10 opacity-10" />
            <h3 className="text-2xl font-black mb-2 relative z-10">Safety First</h3>
            <p className="text-sm text-stone-400 leading-relaxed font-bold relative z-10">Always verify original donor IDs at the medical center. Our platform is 100% voluntary—never pay for blood donations.</p>
         </Card>

         <Card className="rounded-[32px] border-stone-100 p-8 bg-white shadow-sm border-2">
            <h3 className="font-black text-stone-900 mb-6 uppercase tracking-widest text-[10px] flex items-center gap-2">
                <Activity className="h-4 w-4 text-red-600" /> Network Activity
            </h3>
            <div className="space-y-6">
               <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-red-50 flex items-center justify-center shrink-0 border border-red-100"><Heart className="h-5 w-5 text-red-600" /></div>
                  <div>
                     <p className="text-sm font-black text-stone-900 capitalize">{profile.blood_group} Volunteers</p>
                     <p className="text-xs text-stone-400 font-bold">Search radius: 15km</p>
                  </div>
               </div>
            </div>
            <Button variant="outline" onClick={() => router.push('/donors')} className="w-full mt-10 rounded-2xl h-12 border-2 border-stone-100 font-black text-[10px] uppercase tracking-widest hover:bg-stone-50">
                View Active Donors
            </Button>
         </Card>
      </div>
    </div>
  )
}
