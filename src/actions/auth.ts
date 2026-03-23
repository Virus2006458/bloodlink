'use server'

import { createClient } from '@/lib/server-supabase'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const role = formData.get('role') as 'donor' | 'receiver'
  const bloodGroup = formData.get('blood_group') as string
  const city = formData.get('city') as string

  if (!email || !password || !name) {
    return { error: 'Missing required fields' }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
        blood_group: bloodGroup,
        city,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    console.error(error.message)
    return { error: error.message }
  }

  if (data.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        name,
        role,
        blood_group: bloodGroup,
        city,
      })

    if (profileError) {
      console.error('Profile insertion error:', profileError)
      return { error: 'Profile creation failed' }
    }
  }

  revalidatePath('/', 'layout')
  redirect('/login?message=Check your email to confirm your account.')
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error(error.message)
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signInWithGoogle(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    console.error(error.message)
    redirect('/login?error=Google login failed')
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function getUserProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const name = formData.get('name') as string
  const role = formData.get('role') as 'donor' | 'receiver'
  const bloodGroup = formData.get('bloodGroup') as string
  const city = formData.get('city') as string

  const { error } = await supabase
    .from('users')
    .upsert({
      id: user.id,
      name,
      role,
      blood_group: bloodGroup,
      city,
    })

  if (error) {
    console.error('Onboarding failed:', error)
    return { error: 'Onboarding failed' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}