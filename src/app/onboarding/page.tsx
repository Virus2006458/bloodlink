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

    if (!formData.get('name')) {
      setError("Name is missing. Please go back to Step 1.")
      setLoading(false)
      setStep(1)
      return
    }

    try {
      await completeOnboarding(formData)
    } catch (err) {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50/50 p-4 sm:p-6 lg:p-8 overflow-hidden relative">

      <Card className="w-full max-w-4xl rounded-[40px] overflow-hidden">
        <div className="flex flex-col md:flex-row min-h-[550px]">

          {/* LEFT */}
          <div className="bg-red-600 md:w-5/12 p-10 text-white">
            <div className="mb-8">
              <Heart className="h-8 w-8" />
            </div>

            <div className="mt-auto mb-10">
              <h1 className="text-4xl font-bold mb-4">
                Finish setting up your account
              </h1>
              <p>We just need a few more details.</p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="md:w-7/12 p-8">

            {error && (
              <div className="mb-6 text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* STEP 1 */}
              {step === 1 && (
                <>
                  <Input
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    required
                  />

                  <div>
                    <label>
                      <input type="radio" name="role" value="donor" defaultChecked />
                      Donor
                    </label>
                    <label>
                      <input type="radio" name="role" value="receiver" />
                      Receiver
                    </label>
                  </div>

                  <Button type="button" onClick={() => setStep(2)}>
                    Next
                  </Button>
                </>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <>
                  <select name="bloodGroup" required>
                    <option value="">Select</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>

                  <Input name="city" placeholder="City" required />

                  <Button disabled={loading} type="submit">
                    {loading ? 'Loading...' : 'Submit'}
                  </Button>
                </>
              )}

            </form>
          </div>
        </div>
      </Card>
    </div>
  )
}