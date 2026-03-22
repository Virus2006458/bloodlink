'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Heart, User, MapPin, Droplets, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react'
import { completeOnboarding } from '@/actions/auth'
import { createClient } from '@/lib/supabase'

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else if (user.user_metadata?.full_name) {
        setName(user.user_metadata.full_name)
      }
    }
    checkUser()
  }, [router])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (step === 1) {
      setStep(2)
      return
    }

    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    
    // Safety check for critical fields
    if (!formData.get('name')) {
      setError("Name is missing. Please go back to Step 1.")
      setLoading(false)
      setStep(1)
      return
    }

    const result = await completeOnboarding(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50/50 p-4 sm:p-6 lg:p-8 overflow-hidden relative">
       {/* Background decorative elements */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-100/50 rounded-full blur-3xl opacity-60" />
          <div className="absolute top-1/2 -right-24 w-80 h-80 bg-stone-200/50 rounded-full blur-3xl opacity-40 shrink-0" />
       </div>

       <Card className="w-full max-w-4xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border-white/50 bg-white/80 backdrop-blur-xl rounded-[40px] overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex flex-col md:flex-row h-full min-h-[550px]">
            {/* Left side: Branding/Context */}
            <div className="bg-red-600 md:w-5/12 p-10 flex flex-col justify-between text-white relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-16 -mb-16 blur-2xl" />
                
                <div className="relative z-10 w-fit bg-white/20 p-4 rounded-3xl backdrop-blur-md mb-8">
                   <Heart className="h-8 w-8 text-white fill-white" />
                </div>

                <div className="relative z-10 mt-auto mb-10">
                   <h1 className="text-4xl font-extrabold leading-tight mb-4 tracking-tight">Finish setting up your account</h1>
                   <p className="text-red-50 font-medium opacity-90 text-lg">We just need a few more details to connect you with the right community.</p>
                </div>

                <div className="relative z-10">
                   <div className="flex gap-2">
                      {[1, 2].map((s) => (
                        <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${step === s ? 'w-8 bg-white' : 'w-2 bg-white/40'}`} />
                      ))}
                   </div>
                </div>
            </div>

            {/* Right side: Form */}
            <div className="md:w-7/12 p-8 md:p-12 bg-white/50 flex flex-col">
               {error && (
                 <div className="mb-8 p-4 text-sm bg-red-50 text-red-600 border border-red-100 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    {error}
                 </div>
               )}

               <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-center">
                  {/* Step 1 Content - Using hidden class to preserve inputs in DOM */}
                  <div className={`space-y-6 animate-in fade-in duration-500 ${step === 1 ? 'block' : 'hidden'}`}>
                    <div>
                      <h2 className="text-2xl font-bold text-stone-900 mb-1">Tell us About Yourself</h2>
                      <p className="text-stone-500 font-medium">Basic Identity (Step 1 of 2)</p>
                    </div>

                    <div className="grid gap-6">
                      <div className="grid gap-2">
                         <label className="text-sm font-bold text-stone-700 ml-1" htmlFor="name">Full Name</label>
                         <div className="relative group">
                            <User className="absolute left-4 top-3.5 h-5 w-5 text-stone-400 group-focus-within:text-red-500 transition-colors" />
                            <Input 
                              id="name" 
                              name="name" 
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="John Doe" 
                              required 
                              className="pl-12 h-14 rounded-2xl border-stone-200 bg-white/80 focus:bg-white transition-all text-lg" 
                            />
                         </div>
                      </div>

                      <div className="grid gap-2">
                         <label className="text-sm font-bold text-stone-700 ml-1">Account Role</label>
                         <div className="grid grid-cols-2 gap-4">
                            <label className="relative cursor-pointer group">
                              <input type="radio" name="role" value="donor" className="peer sr-only" defaultChecked />
                              <div className="p-4 rounded-2xl border-2 border-stone-100 bg-white peer-checked:border-red-500 peer-checked:bg-red-50/50 transition-all text-center group-hover:border-stone-200">
                                <span className="text-stone-900 font-extrabold block">Donor</span>
                                <span className="text-xs text-stone-500 font-medium">I want to give</span>
                              </div>
                            </label>
                            <label className="relative cursor-pointer group">
                              <input type="radio" name="role" value="receiver" className="peer sr-only" />
                              <div className="p-4 rounded-2xl border-2 border-stone-100 bg-white peer-checked:border-red-500 peer-checked:bg-red-50/50 transition-all text-center group-hover:border-stone-200">
                                <span className="text-stone-900 font-extrabold block">Receiver</span>
                                <span className="text-xs text-stone-500 font-medium">I need blood</span>
                              </div>
                            </label>
                         </div>
                      </div>
                    </div>

                    <Button 
                      type="button" 
                      onClick={() => setStep(2)}
                      className="w-full h-14 text-lg font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-red-100 hover:translate-y-[-2px] active:translate-y-[0px] transition-all bg-stone-900 hover:bg-stone-800 py-8 mt-4 text-white"
                    >
                      Next Step
                      <ChevronRight className="h-5 w-5 ml-2" />
                    </Button>
                  </div>

                  {/* Step 2 Content - Always in DOM */}
                  <div className={`space-y-6 animate-in fade-in duration-500 ${step === 2 ? 'block' : 'hidden'}`}>
                    <div>
                      <h2 className="text-2xl font-bold text-stone-900 mb-1">Vital Details</h2>
                      <p className="text-stone-500 font-medium">Matching Information (Step 2 of 2)</p>
                    </div>

                    <div className="grid gap-6">
                      <div className="grid gap-2">
                         <label className="text-sm font-bold text-stone-700 ml-1" htmlFor="bloodGroup">Blood Group</label>
                         <div className="relative group">
                            <Droplets className="absolute left-4 top-4 h-5 w-5 text-stone-400 group-focus-within:text-red-500 transition-colors" />
                            <select 
                              id="bloodGroup" 
                              name="bloodGroup" 
                              required 
                              className="w-full pl-12 h-14 rounded-2xl border-stone-200 bg-white/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/10 transition-all text-lg appearance-none"
                            >
                              <option value="">Select blood group</option>
                              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                                <option key={group} value={group}>{group}</option>
                              ))}
                            </select>
                         </div>
                      </div>

                      <div className="grid gap-2">
                         <label className="text-sm font-bold text-stone-700 ml-1" htmlFor="city">Current City</label>
                         <div className="relative group">
                            <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-stone-400 group-focus-within:text-red-500 transition-colors" />
                            <Input id="city" name="city" placeholder="e.g. Mumbai" required className="pl-12 h-14 rounded-2xl border-stone-200 bg-white/80 focus:bg-white transition-all text-lg" />
                         </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4 mt-4">
                      <Button 
                        type="button" 
                        variant="link" 
                        onClick={() => setStep(1)}
                        className="w-1/3 h-14 font-extrabold text-stone-400"
                      >
                        Back
                      </Button>
                      <Button 
                        disabled={loading} 
                        type="submit" 
                        className="w-2/3 h-14 text-lg font-bold rounded-2xl bg-red-600 hover:bg-red-700 py-8 text-white shadow-xl shadow-red-200"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Finalizing...
                          </>
                        ) : (
                          <>
                            Launch Dashboard
                            <CheckCircle2 className="h-5 w-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
               </form>
            </div>
          </div>
       </Card>
    </div>
  )
}
