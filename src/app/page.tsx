import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Heart, Search, Users, ShieldCheck, Activity } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-stone-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <Link className="flex items-center justify-center" href="/">
          <div className="h-10 w-10 bg-red-600 rounded-lg flex items-center justify-center mr-2 shadow-sm">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-stone-900 tracking-tight">BloodLink</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:text-red-600 transition-colors" href="/login">
            Login
          </Link>
          <Link href="/signup">
            <Button size="sm">Register</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-50 to-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2 max-w-3xl">
                <div className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 mb-4 animate-bounce">
                  Live Blood Donation Community
                </div>
                <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-stone-900">
                  Every Drop Counts. <br />
                  <span className="text-red-600">Connect to Save Lives.</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-stone-500 md:text-xl/relaxed lg:text-2xl/relaxed mt-6">
                  BloodLink bridges the gap between donors and those in need. Simple, fast, and secure matching for blood emergencies in your city.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link href="/signup?role=receiver">
                  <Button size="lg" className="px-8 font-bold text-lg">
                    Find Donor
                    <Search className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/signup?role=donor">
                  <Button size="lg" variant="outline" className="px-8 font-bold text-lg border-2 hover:bg-stone-50">
                    Become Donor
                    <Heart className="ml-2 h-5 w-5 text-red-600" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
             <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
               <div className="flex flex-col items-center space-y-4 text-center p-6 rounded-2xl border border-stone-100 hover:shadow-xl transition-shadow bg-white">
                 <div className="p-3 bg-red-100 rounded-xl">
                   <Activity className="h-8 w-8 text-red-600" />
                 </div>
                 <h2 className="text-xl font-bold text-stone-900">Quick Matching</h2>
                 <p className="text-stone-500">Intelligent system that filters donors based on blood group and city proximity.</p>
               </div>
               <div className="flex flex-col items-center space-y-4 text-center p-6 rounded-2xl border border-stone-100 hover:shadow-xl transition-shadow bg-white">
                 <div className="p-3 bg-red-100 rounded-xl">
                   <ShieldCheck className="h-8 w-8 text-red-600" />
                 </div>
                 <h2 className="text-xl font-bold text-stone-900">Secure Privacy</h2>
                 <p className="text-stone-500">Your data is safe. We only share critical info when a donor accepts a request.</p>
               </div>
               <div className="flex flex-col items-center space-y-4 text-center p-6 rounded-2xl border border-stone-100 hover:shadow-xl transition-shadow bg-white sm:col-span-2 lg:col-span-1">
                 <div className="p-3 bg-red-100 rounded-xl">
                   <Users className="h-8 w-8 text-red-600" />
                 </div>
                 <h2 className="text-xl font-bold text-stone-900">Verified Network</h2>
                 <p className="text-stone-500">Join a verified community of lifesaving donors committed to helping whenever needed.</p>
               </div>
             </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-100 py-12 bg-stone-50">
        <div className="container px-4 md:px-6 mx-auto flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-600" />
            <span className="font-bold text-xl text-stone-900">BloodLink</span>
          </div>
          <p className="text-sm text-stone-500">© 2026 BloodLink. For emergencies, please call your local ambulance.</p>
          <div className="flex gap-4">
             <Link className="text-sm hover:underline" href="#">Terms</Link>
             <Link className="text-sm hover:underline" href="#">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
