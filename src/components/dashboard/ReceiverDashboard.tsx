'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Droplets, MapPin, Clock, Search, PlusCircle, User, Share2, Activity, 
  Heart, ShieldCheck, UserCheck, MessageCircle, XCircle, Send, Loader2,
  CheckCircle2, Bell, Sparkles, Radar, CheckCircle
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

    // Realtime for request status updates
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

    const interval = setInterval(fetchActiveRequest, 30000)

    return () => { 
        supabase.removeChannel(channel)
        clearInterval(interval)
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

  // Define steps for the Match Status Timeline
  const steps = [
    { label: 'Request Posted', status: 'completed', icon: CheckCircle },
    { label: 'Broadcasting', status: activeRequest?.status === 'pending' ? 'current' : 'completed', icon: Radar },
    { label: 'Donor Match', status: activeRequest?.status === 'accepted' ? 'current' : (activeRequest?.status === 'pending' ? 'upcoming' : 'completed'), icon: UserCheck },
    { label: 'Donation Done', status: 'upcoming', icon: Heart }
  ]

  if (!mounted) return null // Prevent hydration flash

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative pb-20">
      {/* Accept Alert Notification */}
      {showNotification && (
        <div className="fixed top-8 right-8 z-[100] animate-in slide-in-from-right duration-500">
           <div className="bg-green-600 text-white p-6 rounded-[32px] shadow-2xl flex items-center gap-6 border-4 border-white/20 backdrop-blur-xl shrink-0">
              <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center animate-bounce">
                 <Bell className="h-6 w-6" />
              </div>
              <div>
                 <h4 className="font-black text-lg leading-tight">Donor Accepted!</h4>
                 <p className="text-white/80 font-bold text-sm">A volunteer has joined your request. Open chat now!</p>
              </div>
              <button onClick={() => setShowNotification(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                 <XCircle className="h-4 w-4" />
              </button>
           </div>
        </div>
      )}

      {/* Left Column: Emergency Hub Content */}
      <div className="lg:col-span-8 space-y-8">
        <section>
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-4">
                <div className="bg-red-600 p-3 rounded-2xl text-white shadow-xl shadow-red-200">
                   <Activity className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-stone-900 tracking-tight">Emergency Hub</h2>
                  <p className="text-xs font-black text-stone-400 uppercase tracking-widest leading-none mt-1">Real-time match monitoring</p>
                </div>
             </div>
             
             {activeRequest && activeRequest.status === 'pending' && (
                <div className="hidden sm:flex items-center gap-3 bg-red-50 px-4 py-2 rounded-2xl border border-red-100">
                   <Radar className="h-4 w-4 text-red-600 animate-pulse" />
                   <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Searching matches...</span>
                </div>
             )}
          </div>

          {activeRequest ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Card className="rounded-[40px] border-none shadow-2xl p-0 bg-white overflow-hidden relative group">
                <div className="p-8 sm:p-10">
                  <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start text-center sm:text-left border-b border-stone-100 pb-10">
                      <div className="h-32 w-32 bg-red-600 rounded-[40px] flex flex-col items-center justify-center text-white shrink-0 shadow-2xl shadow-red-200 group-hover:scale-105 transition-transform duration-500">
                        <span className="text-5xl font-black tracking-tighter">{activeRequest.blood_group}</span>
                        <span className="text-[10px] uppercase font-black opacity-80 tracking-widest mt-1">Needed</span>
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3 justify-center sm:justify-start">
                           <span className={`font-black text-[10px] tracking-[0.1em] uppercase px-4 py-1.5 rounded-full border-2 ${activeRequest.status === 'accepted' ? 'bg-green-100/50 text-green-700 border-green-200' : 'bg-amber-100/50 text-amber-700 border-amber-200 animate-pulse'}`}>
                               {activeRequest.status === 'accepted' ? '● DONOR MATCHED' : '● BROADCASTING...'}
                           </span>
                           <span className="text-stone-300 font-mono text-xs uppercase tracking-widest">ID: {activeRequest.id.split('-')[0]}</span>
                        </div>
                        
                        <h3 className="text-4xl font-black text-stone-900 tracking-tight">{activeRequest.patient_name || 'Emergency Call'}</h3>
                        
                        <div className="flex flex-wrap items-center gap-6 justify-center sm:justify-start text-stone-500 font-bold overflow-hidden">
                           <span className="flex items-center gap-2 shrink-0"><MapPin className="h-5 w-5 text-red-500" />{activeRequest.city}</span>
                           <span className="flex items-center gap-2 text-stone-400 shrink-0">
                               <Clock className="h-5 w-5" />
                               {activeRequest.created_at ? formatDistanceToNow(new Date(activeRequest.created_at)) + ' ago' : 'Just now'}
                           </span>
                        </div>
                      </div>

                      {activeRequest.status === 'accepted' && activeRequest.donor && (
                        <div className="bg-stone-900 p-6 rounded-[32px] text-white flex flex-col items-center justify-center text-center shadow-xl ring-8 ring-stone-900/5 transition-all">
                           <div className="h-10 w-10 bg-red-600 rounded-2xl flex items-center justify-center mb-2 shadow-lg"><UserCheck className="h-5 w-5" /></div>
                           <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">Donor Found</p>
                           <p className="font-black text-md leading-tight">{activeRequest.donor.name}</p>
                        </div>
                      )}
                  </div>

                  {/* BROADCASTING STATUS BOX (Pipeline Tracker) */}
                  <div className="mt-10 p-8 bg-stone-50 rounded-[40px] border-2 border-stone-100 flex flex-col md:flex-row items-center gap-8">
                     <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                        {steps.map((step, i) => (
                           <div key={i} className="flex flex-col items-center text-center space-y-2">
                              <div className={`h-10 w-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${step.status === 'completed' ? 'bg-green-600 text-white' : step.status === 'current' ? 'bg-red-600 text-white animate-bounce' : 'bg-stone-200 text-stone-400'}`}>
                                 <step.icon className="h-5 w-5" />
                              </div>
                              <p className={`text-[9px] font-black uppercase tracking-tighter ${step.status === 'upcoming' ? 'text-stone-300' : 'text-stone-900'}`}>{step.label}</p>
                           </div>
                        ))}
                     </div>
                     <div className="shrink-0 w-full md:w-auto">
                        <Button variant="outline" className="w-full rounded-[24px] h-14 px-8 border-2 border-stone-200 font-black hover:bg-white text-xs gap-3">
                           <Share2 className="h-5 w-5" /> SHARE CASE
                        </Button>
                     </div>
                  </div>

                  {/* Additional Status Notes Bubble */}
                  <div className="mt-8 bg-amber-50/50 p-6 rounded-3xl border border-amber-100">
                     <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Emergency Status & Notes</p>
                     <p className="font-bold text-amber-900 text-sm italic leading-relaxed capitalize">{activeRequest.notes || 'Broadcasting request to nearby volunteers...'}</p>
                  </div>
                </div>

                <div className="px-10 py-6 bg-stone-50/50 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                   <div className="flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 text-green-600" />
                      <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Verified Medical ID</span>
                   </div>
                   {activeRequest.status === 'accepted' ? (
                      <Button onClick={() => setChatOpen(true)} className="rounded-2xl h-12 px-8 gap-2 font-black bg-red-600 hover:bg-red-700 text-white shadow-lg transition-transform active:scale-95">
                         <MessageCircle className="h-5 w-5" /> START COORDINATION CHAT
                      </Button>
                   ) : (
                      <div className="flex items-center gap-4">
                        <Loader2 className="h-4 w-4 animate-spin text-stone-400" />
                        <span className="text-[10px] font-black text-stone-400 uppercase italic tracking-widest">Broadcast in progress...</span>
                      </div>
                   )}
                </div>
              </Card>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-24 bg-white rounded-[60px] border-3 border-dashed border-stone-100 text-center shadow-inner group">
               <div className="bg-stone-50 p-10 rounded-[40px] mb-8 group-hover:scale-110 transition-transform"><PlusCircle className="h-16 w-16 text-stone-200" /></div>
               <h3 className="text-3xl font-black text-stone-900 mb-3">No Active Emergency</h3>
               <p className="text-stone-400 font-bold max-w-sm mx-auto leading-relaxed mb-10 text-sm italic">Post a request to find verified donors nearby.</p>
               <Link href="/requests/new">
                 <Button className="rounded-[28px] h-20 px-12 gap-4 font-black shadow-2xl shadow-red-100 bg-red-600 hover:bg-red-700 text-white text-xl active:scale-95 transition-all">
                    <PlusCircle className="h-8 w-8" /> CREATE REQUEST
                 </Button>
               </Link>
            </div>
          )}
        </section>

        {chatOpen && activeRequest && (activeRequest.status === 'accepted') && (
            <section className="animate-in slide-in-from-bottom-12 duration-700">
                <Card className="rounded-[48px] shadow-2xl border-none bg-stone-900 text-white overflow-hidden flex flex-col h-[600px]">
                    <div className="bg-stone-800 p-8 flex items-center justify-between shrink-0 border-b border-white/5">
                         <div className="flex items-center gap-5">
                            <div className="h-16 w-16 bg-red-600 rounded-[28px] flex items-center justify-center shadow-lg"><User className="h-8 w-8 text-white" /></div>
                            <div>
                                <h4 className="font-black text-xl leading-none mb-1">{activeRequest.donor?.name || 'Verified Donor'}</h4>
                                <div className="flex items-center gap-2">
                                   <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                                   <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Secure Connection Established</span>
                                </div>
                            </div>
                         </div>
                         <button onClick={() => setChatOpen(false)} className="p-4 hover:bg-white/10 rounded-2xl transition-all"><XCircle className="h-6 w-6 text-white/50" /></button>
                    </div>
                    
                    <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto space-y-6 scrollbar-hide bg-stone-900/50">
                        {chatMessages.map((m, i) => (
                            <div key={i} className={`flex ${m.sender_id === profile.id ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-${m.sender_id === profile.id ? 'right' : 'left'}-4`}>
                                <div className={`p-6 rounded-[32px] max-w-[80%] text-[14px] font-bold leading-relaxed shadow-2xl ${m.sender_id === profile.id ? 'bg-red-600 text-white rounded-tr-none' : 'bg-stone-800 text-stone-100 rounded-tl-none border border-white/5'}`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <form onSubmit={sendMessage} className="p-8 bg-stone-950/50 flex gap-4 shrink-0 border-t border-white/5">
                        <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your message..." className="flex-1 bg-stone-800 border-none rounded-[28px] px-8 py-5 text-sm font-bold focus:ring-2 ring-red-500 outline-none placeholder:text-stone-500" />
                        <Button type="submit" className="rounded-[28px] h-16 w-16 p-0 bg-red-600 shadow-xl shadow-red-950/40 hover:bg-red-700 active:scale-90 transition-all"><Send className="h-7 w-7" /></Button>
                    </form>
                </Card>
            </section>
        )}
      </div>

      {/* Right Column: Information & Activity */}
      <div className="lg:col-span-4 space-y-6">
         <div className="flex gap-4">
            <Link href="/requests/new" className="flex-1">
               <Button className="w-full h-20 rounded-[32px] bg-red-600 hover:bg-red-700 shadow-xl shadow-red-100 font-black text-lg gap-3">
                  <PlusCircle className="h-6 w-6" /> New
               </Button>
            </Link>
            <Link href="/donors" className="flex-1">
               <Button variant="outline" className="w-full h-20 rounded-[32px] border-2 border-stone-100 font-black text-lg hover:bg-white gap-3">
                  <Search className="h-6 w-6" /> Search
               </Button>
            </Link>
         </div>

         <Card className="rounded-[40px] border-none p-10 shadow-xl bg-black text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-12 transition-transform duration-700"><ShieldCheck className="h-32 w-32 -mr-16 -mt-10" /></div>
            <h3 className="text-3xl font-black mb-4 relative z-10 tracking-tight leading-none">Safety Protocols</h3>
            <p className="text-sm text-stone-400 leading-relaxed font-bold relative z-10 mb-8">Verification of volunteer ID is required at the medical facility. All donations are 100% voluntary.</p>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4 relative z-10">
               <div className="h-3 w-3 bg-red-600 rounded-full animate-ping" />
               <span className="text-[9px] font-black uppercase tracking-widest text-stone-200">Security Check Active</span>
            </div>
         </Card>

         <Card className="rounded-[40px] border-stone-100 p-10 bg-white shadow-sm border-2 overflow-hidden">
            <h3 className="font-black text-stone-400 mb-8 uppercase tracking-[0.2em] text-[10px] flex items-center gap-3">
                <Activity className="h-4 w-4 text-red-600" /> LIVE STATS
            </h3>
            <div className="space-y-8">
               <div className="flex gap-5 items-center">
                  <div className="h-14 w-14 rounded-[20px] bg-red-50 flex items-center justify-center shrink-0 border border-red-100 shadow-sm"><Heart className="h-6 w-6 text-red-600" /></div>
                  <div>
                     <p className="text-sm font-black text-stone-900 capitalize">{profile.blood_group} Availability</p>
                     <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest leading-none mt-1">Found 12 donors</p>
                  </div>
               </div>
               <div className="h-1.5 w-full bg-stone-50 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-3/4 rounded-full" />
               </div>
            </div>
            <Button variant="outline" onClick={() => router.push('/donors')} className="w-full mt-12 rounded-[24px] h-14 border-2 border-stone-100 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-stone-50 transition-all">
                VIEW GLOBAL NETWORK
            </Button>
         </Card>
      </div>
    </div>
  )
}
