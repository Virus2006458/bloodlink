'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { 
  Heart, User, MapPin, Droplets, ChevronRight, Loader2, 
  CheckCircle2, ArrowLeft, Activity, XCircle
} from 'lucide-react'
import { completeOnboarding } from '@/actions/auth'
import { createClient } from '@/lib/supabase'

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [role, setRole] = useState<'donor' | 'receiver'>('donor')
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else if (user.user_metadata?.full_name && !name) {
        setName(user.user_metadata.full_name)
      }
    }
    checkUser()
  }, [router, name])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (step === 1) {
      if (!name.trim()) {
         setError("Please enter your name.")
         return
      }
      setStep(2)
      return
    }

    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    // Ensure name and role are in the formData manually if they were hidden or state-based
    if (!formData.get('name')) formData.append('name', name)
    if (!formData.get('role')) formData.append('role', role)

    try {
      const result = await completeOnboarding(formData)
      if (result?.error) {
        setError(result.error)
        setLoading(false)
      } else {
         router.push('/dashboard')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50/50 p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-4xl rounded-[40px] overflow-hidden shadow-2xl border-none">
        <div className="flex flex-col md:flex-row min-h-[550px]">
          
          {/* LEFT PANEL */}
          <div className="bg-red-600 md:w-5/12 p-10 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10"><Heart className="h-64 w-64 -mr-20 -mt-20" /></div>
            <div className="relative z-10">
              <div className="bg-white/20 h-12 w-12 rounded-2xl flex items-center justify-center mb-10"><Heart className="h-6 w-6" /></div>
              <h1 className="text-4xl font-black leading-tight tracking-tight mb-4">Finish setting up your account</h1>
              <p className="text-white/80 font-bold">We just need a few more details to get you started.</p>
            </div>
            
            <div className="flex gap-2 relative z-10 pb-4">
               <div className={`h-2 w-10 rounded-full transition-all ${step === 1 ? 'bg-white' : 'bg-white/30'}`} />
               <div className={`h-2 w-10 rounded-full transition-all ${step === 2 ? 'bg-white' : 'bg-white/30'}`} />
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="md:w-7/12 p-10 sm:p-14 bg-white flex flex-col justify-center">
            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <XCircle className="h-5 w-5" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Current Name</label>
                    <Input 
                       name="name"
                       value={name}
                       onChange={(e) => setName(e.target.value)}
                       placeholder="Full Name"
                       className="h-14 rounded-2xl border-2 border-stone-100 focus:ring-red-500 font-bold px-6"
                       required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">I am a...</label>
                    <div className="grid grid-cols-2 gap-4">
                       <button type="button" onClick={() => setRole('donor')} className={`h-20 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${role === 'donor' ? 'border-red-600 bg-red-50 text-red-600 shadow-lg shadow-red-100' : 'border-stone-100 text-stone-400 hover:bg-stone-50'}`}>
                          <Heart className={`h-5 w-5 ${role === 'donor' ? 'fill-red-600' : ''}`} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Donor</span>
                       </button>
                       <button type="button" onClick={() => setRole('receiver')} className={`h-20 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${role === 'receiver' ? 'border-red-600 bg-red-50 text-red-600 shadow-lg shadow-red-100' : 'border-stone-100 text-stone-400 hover:bg-stone-50'}`}>
                          <Activity className={`h-5 w-5 ${role === 'receiver' ? 'text-red-600' : ''}`} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Receiver</span>
                       </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-16 rounded-[24px] bg-red-600 hover:bg-red-700 text-white font-black text-lg gap-3 shadow-xl shadow-red-100 group transition-all">
                    Next Step <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Blood Group</label>
                     <select 
                        name="bloodGroup" 
                        required 
                        className="w-full h-14 bg-white border-2 border-stone-100 rounded-2xl px-6 font-bold focus:ring-2 ring-red-500 outline-none appearance-none cursor-pointer"
                     >
                        <option value="">Select your group</option>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                     </select>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Your City</label>
                     <div className="relative">
                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                        <Input name="city" placeholder="e.g. Goa" className="h-14 rounded-2xl border-2 border-stone-100 focus:ring-red-500 font-bold pl-14 pr-6" required />
                     </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                     <Button type="button" variant="outline" onClick={() => setStep(1)} className="h-16 w-16 p-0 rounded-2xl border-2 border-stone-100 hover:bg-stone-50 transition-all">
                        <ArrowLeft className="h-6 w-6" />
                     </Button>
                     <Button disabled={loading} type="submit" className="flex-1 h-16 rounded-[24px] bg-red-600 hover:bg-red-700 text-white font-black text-lg gap-3 shadow-xl shadow-red-100 transition-all">
                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Complete Setup'}
                     </Button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </Card>
    </div>
  )
}