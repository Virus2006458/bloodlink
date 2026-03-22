import { createClient } from '@/lib/server-supabase'
import { NextResponse } from 'next/server'

// Force the route to be dynamic to explicitly declare it as a Server Side route
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Create a stable absolute URL for the redirect
      const baseUrl = requestUrl.origin
      return NextResponse.redirect(`${baseUrl}${next}`)
    }
  }

  // If there's an error or no code, redirect back to login
  const baseUrl = requestUrl.origin
  return NextResponse.redirect(`${baseUrl}/login?error=Authentication failed`)
}
