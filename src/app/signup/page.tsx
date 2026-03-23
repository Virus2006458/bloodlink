export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Heart, Mail, Lock, User, MapPin, Droplets, ArrowLeft } from 'lucide-react'
import { signUp, signInWithGoogle } from '@/actions/auth'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">

      <Link href="/" className="absolute top-4 left-4 flex items-center text-stone-500 hover:text-red-600">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Link>

      <Card className="w-full max-w-lg shadow-2xl rounded-3xl overflow-hidden">
        <div className="bg-red-600 py-6 text-center text-white">
          <Heart className="h-8 w-8 mx-auto mb-2 fill-white" />
          <h1 className="text-xl font-bold">Join BloodLink</h1>
        </div>

        <CardContent className="p-8">

          {error && <div className="mb-4 text-red-600">{error}</div>}

          <form action={signUp as any} className="space-y-4">

            <Input name="name" placeholder="Full Name" required />
            <Input name="email" type="email" placeholder="Email" required />
            <Input name="password" type="password" placeholder="Password" required />

            <select name="blood_group" required>
              <option value="">Select Blood Group</option>
              {BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}
            </select>

            <Input name="city" placeholder="City" required />

            <input type="hidden" name="role" value="donor" />

            <Button className="w-full">Create Account</Button>
          </form>

          <div className="text-center mt-4 text-sm text-gray-400">
            Or continue with
          </div>

          <form action={signInWithGoogle} className="mt-4">
            <Button variant="outline" className="w-full">
              Google Sign Up
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-center">
          <Link href="/login" className="text-red-600 font-bold">
            Log in
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}