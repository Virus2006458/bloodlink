'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Heart, Mail, Lock, ArrowLeft } from 'lucide-react'
import { signIn, signInWithGoogle } from '@/actions/auth'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const errorParam = searchParams.get('error')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(errorParam)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await signIn(formData)
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

       <Card className="w-full max-w-md shadow-2xl border-stone-100 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-red-600 py-10 px-8 flex flex-col items-center justify-center text-center">
              <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-sm mb-4">
                 <Heart className="h-10 w-10 text-white fill-white" />
              </div>
              <h1 className="text-3xl font-extrabold font-sans text-white">Welcome Back</h1>
              <p className="text-red-100 mt-2 opacity-90">Login to your BloodLink account</p>
          </div>

          <CardContent className="pt-10 px-8 pb-8">
             {message && <div className="mb-6 p-4 text-sm bg-green-50 text-green-700 border border-green-100 rounded-2xl flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                {message}
             </div>}
             {error && <div className="mb-6 p-4 text-sm bg-red-50 text-red-600 border border-red-100 rounded-2xl flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                {error}
             </div>}

             <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(new FormData(e.currentTarget));
                }} 
                className="space-y-6"
              >
                <div className="grid gap-4">
                    <div className="grid gap-2">
                       <label className="text-sm font-bold text-stone-700 ml-1" htmlFor="email">Email</label>
                       <div className="relative group">
                          <Mail className="absolute left-4 top-3 h-5 w-5 text-stone-400 group-focus-within:text-red-500 transition-colors" />
                          <Input id="email" name="email" type="email" placeholder="john@example.com" required className="pl-12 h-12 rounded-2xl" />
                       </div>
                    </div>

                    <div className="grid gap-2">
                       <div className="flex items-center justify-between ml-1">
                          <label className="text-sm font-bold text-stone-700" htmlFor="password">Password</label>
                          <Link href="#" className="text-xs text-red-600 font-semibold hover:underline">Forgot password?</Link>
                       </div>
                       <div className="relative group">
                          <Lock className="absolute left-4 top-3 h-5 w-5 text-stone-400 group-focus-within:text-red-500 transition-colors" />
                          <Input id="password" name="password" type="password" placeholder="••••••••" required className="pl-12 h-12 rounded-2xl" />
                       </div>
                    </div>
                </div>

                <Button disabled={loading} className="w-full text-lg font-bold py-7 rounded-2xl mt-4 shadow-lg shadow-red-200" type="submit">
                   {loading ? 'Authenticating...' : 'Sign In'}
                </Button>
             </form>

             <div className="relative mt-10">
                <div className="absolute inset-0 flex items-center">
                   <span className="w-full border-t border-stone-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                   <span className="bg-white px-4 text-stone-400 font-bold tracking-widest">Or login with</span>
                </div>
             </div>

             <form action={signInWithGoogle} className="mt-8">
                <Button variant="outline" className="w-full h-14 gap-3 font-bold rounded-2xl border-2 border-stone-100 hover:bg-stone-50 hover:border-stone-200 transition-all" type="submit">
                   <svg className="h-6 w-6" viewBox="0 0 24 24">
                     <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                     <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                     <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                     <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                   </svg>
                   Google Authorization
                </Button>
             </form>
          </CardContent>

          <CardFooter className="flex justify-center bg-stone-50/80 p-8 border-t border-stone-100">
             <p className="text-sm font-medium text-stone-500">
                New to BloodLink?{' '}
                <Link href="/signup" className="text-red-600 font-extrabold hover:underline">
                   Create free account
                </Link>
             </p>
          </CardFooter>
       </Card>
    </div>
  )
}
