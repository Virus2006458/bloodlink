'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Heart, Mail, Lock, ArrowLeft } from 'lucide-react'
import { signIn, signInWithGoogle } from '@/actions/auth'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50/50 p-4 sm:p-6 lg:p-8">
      <Link href="/" className="absolute top-4 left-4 sm:top-8 sm:left-8 flex items-center text-stone-500 hover:text-red-600 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Link>

      <Card className="w-full max-w-md shadow-2xl border-stone-100 rounded-3xl overflow-hidden">
        <div className="bg-red-600 py-10 px-8 flex flex-col items-center text-center">
          <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-sm mb-4">
            <Heart className="h-10 w-10 text-white fill-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">Welcome Back</h1>
          <p className="text-red-100 mt-2">Login to your BloodLink account</p>
        </div>

        <CardContent className="pt-10 px-8 pb-8">

          {message && (
            <div className="mb-6 p-4 text-sm bg-green-50 text-green-700 border border-green-100 rounded-2xl">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 text-sm bg-red-50 text-red-600 border border-red-100 rounded-2xl">
              {error}
            </div>
          )}

          <form action={signIn} className="space-y-6">
            <div className="grid gap-4">

              <div className="grid gap-2">
                <label className="text-sm font-bold text-stone-700 ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3 h-5 w-5 text-stone-400" />
                  <Input name="email" type="email" required className="pl-12 h-12 rounded-2xl" />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-bold text-stone-700 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3 h-5 w-5 text-stone-400" />
                  <Input name="password" type="password" required className="pl-12 h-12 rounded-2xl" />
                </div>
              </div>

            </div>

            <Button className="w-full text-lg font-bold py-7 rounded-2xl mt-4" type="submit">
              Sign In
            </Button>
          </form>

          <div className="relative mt-10">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-stone-400 font-bold">
                Or login with
              </span>
            </div>
          </div>

          <form action={signInWithGoogle} className="mt-8">
            <Button variant="outline" className="w-full h-14 gap-3 font-bold rounded-2xl" type="submit">
              Google Authorization
            </Button>
          </form>

        </CardContent>

        <CardFooter className="flex justify-center bg-stone-50 p-8 border-t">
          <p className="text-sm text-stone-500">
            New to BloodLink?{' '}
            <Link href="/signup" className="text-red-600 font-bold">
              Create account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}