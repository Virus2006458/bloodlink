import { createClient } from '@/lib/server-supabase'
import { redirect } from 'next/navigation'
import DonorDashboard from '@/components/dashboard/DonorDashboard'
import ReceiverDashboard from '@/components/dashboard/ReceiverDashboard'
import { Heart, LogOut, Search, PlusCircle, Activity, User, Settings, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/actions/auth'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    // This shouldn't happen if they signed up correctly, but handle gracefully
    redirect('/onboarding') // Or logout
  }

  return (
    <div className="min-h-screen bg-stone-50/50">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 w-full border-b border-stone-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-red-600 p-1.5 rounded-lg">
                <Heart className="h-5 w-5 text-white fill-white" />
              </div>
              <span className="text-xl font-bold text-stone-900 tracking-tight">BloodLink</span>
            </Link>

            <div className="flex items-center gap-4">
              <button className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-600 rounded-full border border-white" />
              </button>
              
              <div className="h-8 w-[1px] bg-stone-200 hidden sm:block" />
              
              <form action={signOut}>
                <Button variant="ghost" size="sm" className="hidden sm:flex text-stone-600 hover:text-red-600 gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
                <Button variant="ghost" size="icon" className="sm:hidden text-stone-600">
                  <LogOut className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl">
        <header className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
          <div>
            <div className="flex items-center gap-2 mb-2 text-red-600 font-bold text-sm tracking-wider uppercase">
              <Activity className="h-4 w-4" />
              {profile.role} Dashboard
            </div>
            <h1 className="text-3xl font-extrabold text-stone-900 sm:text-4xl">
              Hello, {profile.name.split(' ')[0]} 👋
            </h1>
            <p className="text-stone-500 mt-2 font-medium">Ready to make a difference today?</p>
          </div>
          
          <div className="flex gap-3">
             {profile.role === 'receiver' && (
               <Link href="/requests/new">
                 <Button className="rounded-2xl h-12 px-6 shadow-lg shadow-red-200 gap-2 font-bold">
                   <PlusCircle className="h-5 w-5" />
                   New Request
                 </Button>
               </Link>
             )}
             <Link href="/donors">
                <Button variant="outline" className="rounded-2xl h-12 border-2 px-6 bg-white gap-2 font-bold">
                  <Search className="h-5 w-5" />
                  Search Donors
                </Button>
             </Link>
          </div>
        </header>

        {profile.role === 'donor' ? (
          <DonorDashboard profile={profile} />
        ) : (
          <ReceiverDashboard profile={profile} />
        )}
      </main>
    </div>
  )
}
