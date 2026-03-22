'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Droplets, MapPin, Clock, Search, ExternalLink, User, MessageCircle, 
  CheckCircle2, XCircle, Send, Loader2, ClipboardList, Info, 
  Activity, Heart, UserPlus, ShieldCheck, ChevronRight, Check
} from 'lucide-react'
import { UserProfile, BloodRequest, Message } from '@/db/types'
import { createClient } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import { acceptRequest, fulfillRequest } from '@/actions/requests'

export default function DonorDashboard({ profile }: { profile: UserProfile }) {
  const [requests, setRequests] = useState<any[]>([])
  const [activeTasks, setActiveTasks] = useState<any[]>([])
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatRequest, setChatRequest] = useState<any>(null)
  const [chatMessages, setChatMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState('')
  const [accepting, setAccepting] = useState(false)
  const [fulfilling, setFulfilling] = useState(false)
  const [donationCount, setDonationCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const supabase = createClient()

  const fetchRequests = useCallback(async () => {
    const { data: newReqs } = await supabase
      .from('requests')
      .select('*, receiver:users(*)')
      .or(`status.eq.pending,and(status.eq.accepted,donor_id.eq.${profile.id})`)
      .eq('blood_group', profile.blood_group)
      .order('created_at', { ascending: false })
    const { data: myTasks } = await supabase.from('requests').select('*, receiver:users(*)').eq('donor_id', profile.id).eq('status', 'accepted').order('created_at', { ascending: false })
    
    // Fetch donation count
    const { count } = await supabase
      .from('requests')
      .select('*', { count: 'exact', head: true })
      .eq('donor_id', profile.id)
      .eq('status', 'fulfilled')

    if (newReqs) setRequests(newReqs)
    if (myTasks) setActiveTasks(myTasks)
    if (count !== null) setDonationCount(count)
  }, [profile.id, profile.blood_group, supabase])

  useEffect(() => {
    fetchRequests()

    const channel = supabase.channel('donor-updates').on('postgres_changes', { event: '*', table: 'requests', schema: 'public' }, (payload) => {
        console.log('Donor realtime event:', payload)
        fetchRequests()
    }).subscribe((status) => {
        console.log('Donor realtime status:', status)
    })

    return () => { supabase.removeChannel(channel) }
  }, [fetchRequests, supabase])

  // Chat Realtime
  useEffect(() => {
    if (!chatRequest) return
    const fetchMessages = async () => {
        const { data } = await supabase.from('messages').select('*').eq('request_id', chatRequest.id).order('created_at', { ascending: true })
        if (data) setChatMessages(data)
    }
    fetchMessages()

    const chatChannel = supabase.channel(`chat-${chatRequest.id}`).on('postgres_changes', { event: 'INSERT', table: 'messages', schema: 'public', filter: `request_id=eq.${chatRequest.id}` }, (payload) => {
        setChatMessages(prev => [...prev, payload.new as Message])
    }).subscribe()

    return () => { supabase.removeChannel(chatChannel) }
  }, [chatRequest])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [chatMessages])

  const handleAccept = async () => {
    if (!selectedRequest) return
    setAccepting(true)
    setError(null)
    const res = await acceptRequest(selectedRequest.id)
    console.log('Accept action result:', res)
    setAccepting(false)
    if (res.success) {
        setChatRequest(selectedRequest)
        setChatOpen(true)
        setReviewModalOpen(false)
        setSelectedRequest(null)
    } else {
        const errorMsg = res.error || 'Something went wrong while accepting the request.'
        setError(errorMsg)
        alert('FAILED TO ACCEPT MISSION: ' + errorMsg)
    }
  }

  const handleFulfill = async (requestId: string) => {
    setFulfilling(true)
    const res = await fulfillRequest(requestId)
    if (res.success) {
        // Instant local update for the "jump" effect
        setDonationCount(prev => prev + 1)
        
        // Background refresh to confirm final state
        fetchRequests().catch(console.error)
        
        setTimeout(() => {
            setFulfilling(false)
            setChatOpen(false)
            setChatRequest(null)
        }, 800)
    } else {
        setFulfilling(false)
        alert('Failed to complete mission: ' + res.error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || !chatRequest) return
    const { error } = await supabase.from('messages').insert({ request_id: chatRequest.id, sender_id: profile.id, text: messageText })
    if (!error) setMessageText('')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar: Profile & Active Tasks */}
      <div className="lg:col-span-4 space-y-6">
        <Card className="rounded-[32px] border-none shadow-xl bg-gradient-to-br from-stone-900 to-black text-white p-8 relative overflow-hidden">
           <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                 <div className="h-14 w-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/40">
                    <User className="h-6 w-6" />
                 </div>
                 <div>
                    <h3 className="text-xl font-black">{profile.name}</h3>
                    <p className="text-stone-400 font-bold text-xs uppercase tracking-widest">Verified Volunteer</p>
                 </div>
              </div>
               <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                     <p className="text-[9px] font-black text-stone-500 uppercase mb-1">Blood</p>
                     <p className="text-xl font-black text-red-500">{profile.blood_group}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                     <p className="text-[9px] font-black text-stone-500 uppercase mb-1">Donations</p>
                     <p className="text-xl font-black text-white">{donationCount}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                     <p className="text-[9px] font-black text-stone-500 uppercase mb-1">Status</p>
                     <p className="text-[10px] font-black text-green-500 flex items-center gap-1 mt-1">● ON</p>
                  </div>
               </div>
           </div>
           <Droplets className="absolute -right-12 -bottom-12 h-48 w-48 text-white/5 -rotate-12" />
        </Card>

        <section>
           <h4 className="font-black text-stone-400 uppercase tracking-[0.2em] text-[10px] mb-4 pl-2">My Active Missions</h4>
           <div className="space-y-4">
              {activeTasks.length > 0 ? activeTasks.map(task => (
                <Card key={task.id} className="rounded-3xl border-2 border-stone-100 p-4 hover:border-red-200 transition-all cursor-pointer group shadow-sm bg-white" onClick={() => {setChatRequest(task); setChatOpen(true);}}>
                   <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600 font-black text-sm">
                           {task.blood_group}
                        </div>
                         <div>
                            <p className="font-black text-stone-900 text-sm leading-none mb-1">{task.patient_name || task.receiver?.name || 'Emergency'}</p>
                            <div className="flex items-center gap-2">
                               <p className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">{task.city}</p>
                               <span className="text-[8px] font-black text-green-500 bg-green-50 px-1.5 py-0.5 rounded border border-green-100 uppercase">VALIDATED</span>
                            </div>
                         </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-red-500 transition-colors" />
                   </div>
                </Card>
              )) : (
                <div className="bg-stone-100/50 rounded-3xl p-8 text-center border-2 border-dashed border-stone-200">
                   <Heart className="h-8 w-8 text-stone-300 mx-auto mb-2" />
                   <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest leading-relaxed">No active assignments yet</p>
                </div>
              )}
           </div>
        </section>
      </div>

      {/* Main Content: New Feed & Chat */}
      <div className="lg:col-span-8 space-y-8">
        {!chatOpen ? (
          <section>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <div className="bg-red-600 p-2.5 rounded-xl text-white shadow-xl shadow-red-200">
                      <Activity className="h-6 w-6" />
                   </div>
                   <div>
                      <h2 className="text-2xl font-black text-stone-900 tracking-tight">Emergency Feed</h2>
                      <p className="text-sm text-stone-500 font-bold uppercase tracking-widest text-[10px]">Critical matches for {profile.blood_group} type</p>
                   </div>
                </div>
                <div className="bg-stone-100 px-4 py-2 rounded-full text-[10px] font-black text-stone-500 tracking-widest uppercase flex items-center gap-2">
                   <div className="h-2 w-2 bg-red-600 rounded-full animate-pulse" /> LIVE STREAMING
                </div>
            </div>

            <div className="space-y-6">
              {requests.map((request) => (
                <Card key={request.id} className="rounded-[40px] border-none shadow-xl p-8 bg-white relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                  <div className="flex flex-col sm:flex-row gap-8">
                    <div className="h-24 w-24 bg-red-600 rounded-[32px] flex flex-col items-center justify-center text-white shrink-0 shadow-2xl shadow-red-200 rotate-3 group-hover:rotate-0 transition-transform">
                      <span className="text-4xl font-black">{request.blood_group}</span>
                      <span className="text-[10px] uppercase font-black opacity-80 mt-1">Found</span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                         <span className="bg-red-50 text-red-600 text-[10px] font-black px-3 py-1 rounded-full border border-red-100">CRITICAL MATCH</span>
                         <span className="text-stone-400 text-[10px] font-bold font-mono">#{request.id.split('-')[0]}</span>
                      </div>
                      
                      <h3 className="text-2xl font-black text-stone-900 mb-2">{request.patient_name || 'Emergency Call'}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-stone-500 font-bold text-sm">
                        <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-red-600" /> {request.city}</span>
                        <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {formatDistanceToNow(new Date(request.created_at))} ago</span>
                        <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> {request.receiver?.name}</span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col justify-end gap-3 pt-4 sm:pt-0">
                      {request.status === 'accepted' ? (
                        <div className="flex items-center gap-2 bg-green-50 text-green-600 px-6 py-4 rounded-2xl border-2 border-green-100 font-black text-sm shadow-sm animate-in zoom-in-50 duration-500">
                           <CheckCircle2 className="h-5 w-5" />
                           VALIDATED
                        </div>
                      ) : (
                        <Button onClick={() => {setSelectedRequest(request); setReviewModalOpen(true);}} className="rounded-2xl h-14 px-8 gap-3 font-black bg-stone-900 hover:bg-black text-white shadow-xl shadow-stone-200 transition-all active:scale-95">
                           <ClipboardList className="h-5 w-5" /> REVIEW
                        </Button>
                      )}
                    </div>
                  </div>
                                    <div className="mt-6 pt-6 border-t border-stone-50 flex items-center justify-between">
                      <div className="flex -space-x-3">
                         <div className="h-8 w-8 rounded-full bg-red-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-red-600">V</div>
                         <div className="h-8 w-8 rounded-full bg-stone-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-stone-400">?</div>
                         <div className="h-8 w-8 rounded-full bg-stone-50 border-2 border-white flex items-center justify-center text-[10px] font-black text-stone-300">+</div>
                      </div>
                      <p className={`text-[10px] font-black uppercase tracking-widest italic ${request.status === 'accepted' ? 'text-green-600' : 'text-stone-400'}`}>
                         {request.status === 'accepted' ? '● VALIDATED BY YOU' : 'Waiting for your validation'}
                      </p>
                   </div>
                </Card>
              ))}

              {requests.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                  <div className="h-20 w-20 bg-stone-100 rounded-[32px] flex items-center justify-center text-stone-300">
                     <ShieldCheck className="h-10 w-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-stone-900 mb-1">Area is Secure</h3>
                    <p className="text-stone-400 font-bold max-w-xs mx-auto text-sm">No pending requests for {profile.blood_group} in your vicinity. Thank you for staying alert!</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="animate-in slide-in-from-right duration-500">
             <Card className="rounded-[48px] shadow-2xl border-none bg-stone-900 text-white overflow-hidden flex flex-col h-[700px]">
                <div className="bg-red-600 p-8 flex items-center justify-between shrink-0">
                   <div className="flex items-center gap-5">
                      <div className="h-16 w-16 bg-white/20 rounded-[28px] flex items-center justify-center backdrop-blur-md border border-white/10 shrink-0">
                         <User className="h-8 w-8 text-white" />
                      </div>
                      <div>
                         <h4 className="font-black text-xl leading-none mb-1">{chatRequest.patient_name || chatRequest.receiver?.name || 'Emergency Contact'}</h4>
                         <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                               <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                               <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Connection Secure</span>
                            </div>
                            {chatRequest.status === 'accepted' && (
                               <button 
                                 onClick={() => handleFulfill(chatRequest.id)}
                                 disabled={fulfilling}
                                 className={`text-[10px] font-black px-3 py-1 rounded-full transition-all uppercase flex items-center gap-1.5 shadow-lg ${fulfilling ? 'bg-green-500 text-white' : 'bg-white text-red-600 hover:bg-stone-100'}`}
                               >
                                  {fulfilling ? <Check className="h-3 w-3" /> : <Heart className="h-3 w-3 fill-red-600" />}
                                  {fulfilling ? 'Validated' : 'Mark Donated'}
                               </button>
                            )}
                         </div>
                      </div>
                   </div>
                   <button onClick={() => setChatOpen(false)} className="bg-white/10 p-4 rounded-2xl hover:bg-white/20 transition-all"><XCircle className="h-6 w-6" /></button>
                </div>
                
                <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto space-y-6 scrollbar-hide bg-stone-900/50">
                    {chatMessages.map((m, i) => (
                        <div key={i} className={`flex ${m.sender_id === profile.id ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                            <div className={`p-5 rounded-[28px] max-w-[80%] text-[13px] font-bold leading-relaxed shadow-lg ${m.sender_id === profile.id ? 'bg-red-600 text-white rounded-tr-none' : 'bg-stone-800 text-stone-200 rounded-tl-none border border-white/5'}`}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                </div>
                
                <form onSubmit={sendMessage} className="p-8 bg-stone-950/50 flex gap-4 shrink-0">
                    <input value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Type a message to the receiver..." className="flex-1 bg-stone-800 border-none rounded-[24px] px-8 py-5 text-sm font-bold focus:ring-2 ring-red-500 outline-none placeholder:text-stone-500" />
                    <Button type="submit" className="rounded-[24px] h-16 w-16 p-0 bg-red-600 shadow-xl shadow-red-950/40 hover:bg-red-700 active:scale-90 transition-all"><Send className="h-6 w-6" /></Button>
                </form>
             </Card>
          </section>
        )}
      </div>

      {/* Review Modal */}
      {reviewModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-3xl bg-black/60 animate-in fade-in duration-300">
           <Card className="w-full max-w-4xl rounded-[48px] border-none shadow-2xl bg-white overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-500">
              <div className="bg-red-600 p-8 text-white flex justify-between items-center shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center"><ClipboardList className="h-6 w-6" /></div>
                    <CardTitle className="text-2xl font-black">Validate Medical Emergency</CardTitle>
                 </div>
                 <button onClick={() => setReviewModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><XCircle className="h-6 w-6" /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                 {error && (
                    <div className="p-4 text-sm bg-red-50 text-red-600 border border-red-100 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in">
                       <XCircle className="h-5 w-5" />
                       {error}
                    </div>
                 )}
                 {/* Patient Summary */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-stone-50 p-4 rounded-3xl border border-stone-100">
                       <p className="text-[10px] font-black text-stone-400 mb-1 uppercase tracking-widest">Patient Name</p>
                       <p className="font-black text-stone-900">{selectedRequest.patient_name || 'Not Provided'}</p>
                    </div>
                    <div className="bg-stone-50 p-4 rounded-3xl border border-stone-100">
                       <p className="text-[10px] font-black text-stone-400 mb-1 uppercase tracking-widest">Age / Gender</p>
                       <p className="font-black text-stone-900">{selectedRequest.patient_age || '??'} Yrs / {selectedRequest.patient_gender || 'Not Provided'}</p>
                    </div>
                    <div className="bg-stone-50 p-4 rounded-3xl border border-stone-100">
                       <p className="text-[10px] font-black text-stone-400 mb-1 uppercase tracking-widest">Blood Type</p>
                       <p className="font-black text-red-600">{selectedRequest.blood_group}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <h4 className="font-black text-stone-900 flex items-center gap-2 uppercase tracking-widest text-xs">
                          <ExternalLink className="h-4 w-4 text-red-600" /> DOCTOR&apos;S PRESCRIPTION
                       </h4>
                       <div className="aspect-[4/5] bg-stone-100 rounded-[32px] overflow-hidden border-2 border-stone-100 relative group">
                          {selectedRequest.prescription_url ? (
                             <img src={selectedRequest.prescription_url} alt="Prescription" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                             <div className="h-full w-full flex items-center justify-center text-stone-400 font-bold">No Image Provided</div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <Button variant="outline" className="rounded-2xl border-white text-white font-black hover:bg-white hover:text-black" onClick={() => window.open(selectedRequest.prescription_url, '_blank')}>VIEW FULL SCREEN</Button>
                          </div>
                       </div>
                    </div>
                    
                    <div className="space-y-4">
                       <h4 className="font-black text-stone-900 flex items-center gap-2 uppercase tracking-widest text-xs">
                          <UserPlus className="h-4 w-4 text-red-600" /> PATIENT PHOTO
                       </h4>
                       <div className="aspect-[4/5] bg-stone-100 rounded-[32px] overflow-hidden border-2 border-stone-100 relative group">
                          {selectedRequest.patient_photo_url ? (
                             <img src={selectedRequest.patient_photo_url} alt="Patient" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                             <div className="h-full w-full flex items-center justify-center text-stone-400 font-bold">No Image Provided</div>
                          )}
                       </div>
                    </div>
                 </div>

                 <div className="bg-red-50 p-6 rounded-[32px] border-2 border-red-100">
                    <div className="flex items-center gap-3 mb-2">
                       <Info className="h-5 w-5 text-red-600 font-bold" />
                       <span className="font-black text-red-900 uppercase tracking-widest text-xs">Urgency Note</span>
                    </div>
                    <p className="text-stone-700 font-bold italic text-sm">&quot;{selectedRequest.notes || 'No additional notes provided'}&quot;</p>
                 </div>
              </div>

              <div className="p-8 bg-stone-50 border-t border-stone-100 flex gap-4 shrink-0">
                 <Button variant="outline" onClick={() => setReviewModalOpen(false)} className="flex-1 rounded-2xl h-16 border-2 border-stone-200 font-black hover:bg-white transition-all">CLOSE</Button>
                 <Button onClick={handleAccept} disabled={accepting} className="flex-[2] rounded-2xl h-16 bg-red-600 hover:bg-red-700 text-white font-black text-lg shadow-xl shadow-red-200 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                    {accepting ? <Loader2 className="h-6 w-6 animate-spin" /> : "CONFIRM & ACCEPT MISSION"}
                 </Button>
              </div>
           </Card>
        </div>
      )}
    </div>
  )
}
