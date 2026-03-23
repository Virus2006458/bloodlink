export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Heart, Mail, Lock, ArrowLeft } from 'lucide-react'
import { signIn, signInWithGoogle } from '@/actions/auth'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message?: string; error?: string }
}) {
  const message = searchParams?.message
  const error = searchParams?.error

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50/50 p-4 sm:p-6 lg:p-8">
      <Link href="/" className="absolute top-4 left-4 flex items-center text-stone-500 hover:text-red-600">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Link>

      <Card className="w-full max-w-md shadow-2xl rounded-3xl overflow-hidden">
        <div className="bg-red-600 py-10 px-8 text-center text-white">
          <Heart className="h-10 w-10 mx-auto mb-4 fill-white" />
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="mt-2 text-red-100">Login to your BloodLink account</p>
        </div>

        <CardContent className="pt-10 px-8 pb-8">

          {message && <div className="mb-4 text-green-600">{message}</div>}
          {error && <div className="mb-4 text-red-600">{error}</div>}

          <form action={signIn as any} className="space-y-6">
            <Input name="email" type="email" placeholder="Email" required />
            <Input name="password" type="password" placeholder="Password" required />

            <Button className="w-full">Sign In</Button>
          </form>

          <div className="text-center mt-6 text-sm text-gray-400">
            Or login with
          </div>

          <form action={signInWithGoogle as any} className="mt-4">
            <Button variant="outline" className="w-full">
              Google Authorization
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-center">
          <Link href="/signup" className="text-red-600 font-bold">
            Create account
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}