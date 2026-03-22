'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Heart, Mail, Lock, User, MapPin, Droplets, ArrowLeft } from 'lucide-react'
import { signUp, signInWithGoogle } from '@/actions/auth'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function SignupPage() {
  const searchParams = useSearchParams()
  const initialRole = searchParams.get('role') as 'donor' | 'receiver' || 'donor'
  
  const [role, setRole] = useState<'donor' | 'receiver'>(initialRole)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await signUp(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50/50 p-4 sm:p-6 lg:p-8">
      <Link href="/" className="absolute top-4 left-4 sm:top-8 sm:left-8 flex items-center text-stone-500 hover:text-red-600 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Link>
      
      <Card className="w-full max-w-lg shadow-2xl border-stone-100 rounded-3xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-red-600 py-6 px-10 flex flex-col items-center justify-center">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm mb-3">
               <Heart className="h-8 w-8 text-white fill-white" />
            </div>
            <h1 className="text-2xl font-bold font-sans text-white">Join BloodLink</h1>
            <p className="text-red-100 text-sm opacity-80">Saving lives, one drop at a time</p>
        </div>
        
        <CardContent className="pt-8 px-8 pb-10">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(new FormData(e.currentTarget));
            }} 
            className="space-y-6"
          >
            <div className="flex bg-stone-100 p-1 rounded-xl gap-1">
              <button 
                type="button"
                onClick={() => setRole('donor')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${role === 'donor' ? 'bg-white text-red-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                Become Donor
              </button>
              <button 
                type="button"
                onClick={() => setRole('receiver')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${role === 'receiver' ? 'bg-white text-red-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                Find Donor
              </button>
              <input type="hidden" name="role" value={role} />
            </div>

            {error && <div className="p-3 text-sm bg-red-50 text-red-600 border border-red-100 rounded-lg">{error}</div>}

            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-stone-700 ml-1" htmlFor="name">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-3 h-4 w-4 text-stone-400 group-focus-within:text-red-500 transition-colors" />
                  <Input id="name" name="name" placeholder="John Doe" required className="pl-10" />
                </div>
              </div>

              <div className="grid gap-2">
                 <label className="text-sm font-semibold text-stone-700 ml-1" htmlFor="email">Email</label>
                 <div className="relative group">
                   <Mail className="absolute left-3 top-3 h-4 w-4 text-stone-400 group-focus-within:text-red-500 transition-colors" />
                   <Input id="email" name="email" type="email" placeholder="john@example.com" required className="pl-10" />
                 </div>
              </div>

              <div className="grid gap-2">
                 <label className="text-sm font-semibold text-stone-700 ml-1" htmlFor="password">Password</label>
                 <div className="relative group">
                   <Lock className="absolute left-3 top-3 h-4 w-4 text-stone-400 group-focus-within:text-red-500 transition-colors" />
                   <Input id="password" name="password" type="password" placeholder="••••••••" required className="pl-10" />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <label className="text-sm font-semibold text-stone-700 ml-1" htmlFor="blood_group">Blood Group</label>
                    <div className="relative group">
                      <Droplets className="absolute left-3 top-3 h-4 w-4 text-red-400 group-focus-within:text-red-600 transition-colors" />
                      <select id="blood_group" name="blood_group" required className="flex h-10 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm pl-10 focus-visible:outline-none focus:ring-2 focus:ring-red-500 transition-all cursor-pointer appearance-none">
                        <option value="">Select</option>
                        {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                      </select>
                    </div>
                </div>
                <div className="grid gap-2">
                    <label className="text-sm font-semibold text-stone-700 ml-1" htmlFor="city">City</label>
                    <div className="relative group">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-stone-400 group-focus-within:text-red-500 transition-colors" />
                      <Input id="city" name="city" placeholder="Ex: New York" required className="pl-10" />
                    </div>
                </div>
              </div>
            </div>

            <Button disabled={loading} className="w-full text-lg font-bold py-6 rounded-2xl mt-4" type="submit">
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="relative mt-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-stone-400 font-medium">Or continue with</span>
            </div>
          </div>

          <form action={signInWithGoogle} className="mt-6">
            <Button variant="outline" className="w-full h-12 gap-3 font-semibold rounded-2xl hover:bg-stone-50" type="submit">
               <svg className="h-5 w-5" viewBox="0 0 24 24">
                 <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                 <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                 <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                 <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
               </svg>
               Sign up with Google
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center bg-stone-50/80 p-6 border-t border-stone-100">
           <p className="text-sm text-stone-500">
             Already have an account?{' '}
             <Link href="/login" className="text-red-600 font-bold hover:underline">
               Log in
             </Link>
           </p>
        </CardFooter>
      </Card>
    </div>
  )
}
