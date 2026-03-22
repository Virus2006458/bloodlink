'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Heart, Activity, MapPin, Droplets, ArrowLeft, ShieldAlert, BellRing, User } from 'lucide-react'
import { createRequest } from '@/actions/requests'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function CreateRequestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    try {
      const result = await createRequest(formData)
      if (result?.error) {
        setError(result.error)
        setLoading(false)
      }
    } catch (err: any) {
      console.error(err)
      setError("Network or Server error. Please try again or check your internet connection.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50/50 p-4 sm:p-6 lg:p-12 overflow-hidden flex flex-col items-center">
       <div className="w-full max-w-4xl flex items-center justify-between mb-8 animate-in fade-in slide-in-from-left-4 duration-500">
         <Link href="/dashboard" className="flex items-center text-stone-500 hover:text-red-600 transition-colors font-bold uppercase tracking-widest text-xs">
           <ArrowLeft className="h-4 w-4 mr-2" />
           Dashboard
         </Link>
         <div className="flex items-center gap-2">
           <Heart className="h-5 w-5 text-red-600" />
           <span className="font-bold text-xl text-stone-900 tracking-tight">BloodLink</span>
         </div>
       </div>

       <div className="grid lg:grid-cols-12 gap-10 w-full max-w-4xl">
         <div className="lg:col-span-7 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
            <Card className="rounded-3xl border-none shadow-2xl overflow-hidden bg-white">
               <div className="bg-red-600 p-8 text-white relative">
                  <div className="absolute right-0 top-0 p-8 opacity-10">
                     <Activity className="h-24 w-24 -mr-6 -mt-6" />
                  </div>
                  <h1 className="text-3xl font-black mb-2">Create a Rescue Request</h1>
                  <p className="text-red-100 font-medium opacity-80 leading-relaxed">Broadcast your need to verified donors in your nearby city instantly.</p>
               </div>

               <CardContent className="p-8">
                  {error && <div className="mb-6 p-4 text-sm bg-red-50 text-red-600 border border-red-100 rounded-2xl flex items-center gap-3">
                     <ShieldAlert className="h-5 w-5" />
                     {error}
                  </div>}

                  <form action={handleSubmit} className="space-y-8">
                     <div className="grid gap-6">
                        <div className="grid gap-3">
                           <label className="text-sm font-black text-stone-500 uppercase tracking-widest ml-1" htmlFor="blood_group">Blood Group Needed</label>
                           <div className="relative group">
                              <Droplets className="absolute left-4 top-4 h-6 w-6 text-red-400 group-focus-within:text-red-600 transition-colors" />
                              <select 
                                 id="blood_group" 
                                 name="blood_group" 
                                 required 
                                 className="flex h-14 w-full rounded-2xl border-2 border-stone-100 bg-stone-50 px-4 py-2 text-lg pl-14 font-black focus:bg-white focus:ring-4 focus:ring-red-50 focus:border-red-600 transition-all cursor-pointer appearance-none outline-none"
                              >
                                 <option value="">Select blood group...</option>
                                 {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                              </select>
                           </div>
                        </div>

                        <div className="grid gap-3">
                           <label className="text-sm font-black text-stone-500 uppercase tracking-widest ml-1" htmlFor="city">Target City / Location</label>
                           <div className="relative group">
                              <MapPin className="absolute left-4 top-4 h-6 w-6 text-stone-400 group-focus-within:text-red-500 transition-colors" />
                              <Input id="city" name="city" placeholder="Ex: Seattle Central District" required className="pl-14 h-14 rounded-2xl border-2 border-stone-100 bg-stone-50 text-lg font-bold focus:bg-white focus:ring-4 focus:ring-red-50 focus:border-red-600" />
                           </div>
                        </div>

                         <div className="grid sm:grid-cols-2 gap-6">
                            <div className="grid gap-3">
                               <label className="text-sm font-black text-stone-500 uppercase tracking-widest ml-1" htmlFor="patient_name">Patient Name</label>
                               <div className="relative group">
                                  <User className="absolute left-4 top-4 h-6 w-6 text-stone-400 group-focus-within:text-red-500 transition-colors" />
                                  <Input id="patient_name" name="patient_name" placeholder="Full name" required className="pl-14 h-14 rounded-2xl border-2 border-stone-100 bg-stone-50 text-lg font-bold" />
                               </div>
                            </div>
                            <div className="grid gap-3">
                               <label className="text-sm font-black text-stone-500 uppercase tracking-widest ml-1" htmlFor="patient_age">Patient Age</label>
                               <Input id="patient_age" name="patient_age" type="number" placeholder="Years" required className="h-14 rounded-2xl border-2 border-stone-100 bg-stone-50 text-lg font-bold" />
                            </div>
                         </div>

                         <div className="grid gap-3">
                            <label className="text-sm font-black text-stone-500 uppercase tracking-widest ml-1" htmlFor="patient_gender">Patient Gender</label>
                            <select id="patient_gender" name="patient_gender" required className="flex h-14 w-full rounded-2xl border-2 border-stone-100 bg-stone-50 px-4 text-lg font-black focus:outline-none focus:border-red-600 transition-all appearance-none cursor-pointer">
                               <option value="">Select gender...</option>
                               <option value="Male">Male</option>
                               <option value="Female">Female</option>
                               <option value="Other">Other</option>
                            </select>
                         </div>

                         <div className="grid sm:grid-cols-2 gap-6">
                            <div className="grid gap-3">
                               <label className="text-sm font-black text-stone-500 uppercase tracking-widest ml-1" htmlFor="prescription">Prescription Image</label>
                               <div className="relative group">
                                  <div className="absolute left-4 top-4 h-6 w-6 text-stone-400 pointer-events-none group-focus-within:text-red-500 transition-colors">
                                     <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                  </div>
                                  <input type="file" id="prescription" name="prescription" accept="image/*" required className="flex h-14 w-full rounded-2xl border-2 border-stone-100 bg-stone-50 px-4 py-3 text-xs pl-14 font-bold file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-red-50 file:text-red-700 hover:file:bg-red-100 transition-all cursor-pointer focus:bg-white focus:ring-4 focus:ring-red-50 focus:border-red-600 outline-none" />
                               </div>
                            </div>

                            <div className="grid gap-3">
                               <label className="text-sm font-black text-stone-500 uppercase tracking-widest ml-1" htmlFor="patient_photo">Patient Photo</label>
                               <div className="relative group">
                                  <div className="absolute left-4 top-4 h-6 w-6 text-stone-400 pointer-events-none group-focus-within:text-red-500 transition-colors">
                                     <User className="h-6 w-6" />
                                  </div>
                                  <input type="file" id="patient_photo" name="patient_photo" accept="image/*" required className="flex h-14 w-full rounded-2xl border-2 border-stone-100 bg-stone-50 px-4 py-3 text-xs pl-14 font-bold file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-red-50 file:text-red-700 hover:file:bg-red-100 transition-all cursor-pointer focus:bg-white focus:ring-4 focus:ring-red-50 focus:border-red-600 outline-none" />
                               </div>
                            </div>
                         </div>

                        <div className="grid gap-3">
                           <label className="text-sm font-black text-stone-500 uppercase tracking-widest ml-1" htmlFor="notes">Additional Notes (Optional)</label>
                           <textarea 
                              id="notes" 
                              name="notes" 
                              placeholder="Describe the urgency or specific hospital contact..."
                              className="flex w-full rounded-2xl border-2 border-stone-100 bg-stone-50 px-4 py-3 text-sm min-h-[100px] font-medium focus:bg-white focus:ring-4 focus:ring-red-50 focus:border-red-600 transition-all outline-none"
                           />
                        </div>
                     </div>

                     <Button disabled={loading} className="w-full text-xl font-black py-8 rounded-3xl shadow-xl shadow-red-200 mt-4 leading-none" type="submit">
                        {loading ? 'BROADCASTING...' : (
                          <span className="flex items-center gap-3">
                             <BellRing className="h-6 w-6 animate-pulse" />
                             SUBMIT REQUEST
                          </span>
                        )}
                     </Button>
                  </form>
               </CardContent>
            </Card>
         </div>

         <div className="lg:col-span-5 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 delay-150">
            <Card className="rounded-3xl border-none shadow-xl p-8 bg-stone-900 text-white flex flex-col justify-between min-h-[300px]">
               <div>
                  <div className="inline-flex p-3 bg-red-600 rounded-2xl mb-6">
                     <Heart className="h-8 w-8 text-white fill-white" />
                  </div>
                  <h3 className="text-2xl font-black mb-4">How it works?</h3>
                  <ul className="space-y-4">
                     {[
                        { title: 'Broadcast', desc: 'Your request goes live to our donor network.' },
                        { title: 'Match', desc: 'Donors nearby receive instant alerts.' },
                        { title: 'Contact', desc: 'Accept matches and coordinate donation.' }
                     ].map((step, i) => (
                        <li key={i} className="flex gap-4 items-start">
                           <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-1 text-xs font-black">{i+1}</div>
                           <div>
                              <div className="font-bold text-red-500 text-sm uppercase tracking-widest">{step.title}</div>
                              <p className="text-stone-400 text-xs font-medium leading-relaxed mt-0.5">{step.desc}</p>
                           </div>
                        </li>
                     ))}
                  </ul>
               </div>
               <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                  <div>
                     <div className="text-2xl font-black text-red-600">5.2K</div>
                     <div className="text-[10px] font-black uppercase opacity-60 tracking-widest">Active Donors</div>
                  </div>
                  <div>
                     <div className="text-2xl font-black text-white">2.1K</div>
                     <div className="text-[10px] font-black uppercase opacity-60 tracking-widest">Lives Saved</div>
                  </div>
               </div>
            </Card>

            <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4">
               <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0 mt-1" />
               <p className="text-xs text-amber-900 font-medium leading-relaxed">
                  <strong>Emergency Disclaimer:</strong> BloodLink is a volunteer connection platform. For life-threatening emergencies, please prioritize emergency hospital services and ambulance contact.
               </p>
            </div>
         </div>
       </div>
    </div>
  )
}
