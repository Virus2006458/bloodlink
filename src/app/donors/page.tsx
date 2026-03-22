import { createClient } from '@/lib/server-supabase'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Heart, Search, MapPin, Droplets, ArrowLeft, Filter, User, ShieldCheck, Mail, Phone, Calendar, HeartPulse } from 'lucide-react'
import Link from 'next/link'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default async function FindDonorsPage({ searchParams }: { searchParams: { city?: string, blood_group?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { city, blood_group } = await searchParams

  let query = supabase
    .from('users')
    .select('*')
    .eq('role', 'donor')
    .eq('availability_status', true)

  if (city) query = query.ilike('city', `%${city}%`)
  if (blood_group) query = query.eq('blood_group', blood_group)

  const { data: donors, error } = await query.order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-stone-50/50">
      {/* Search Header */}
      <div className="bg-red-600 pt-12 pb-24 px-4 sm:px-6 lg:px-12 text-white relative overflow-hidden">
         <div className="absolute right-0 bottom-0 opacity-10">
            <HeartPulse className="h-96 w-96 -mr-24 -mb-24" />
         </div>
         <div className="container mx-auto max-w-6xl relative z-10">
            <Link href="/dashboard" className="flex items-center text-red-100 hover:text-white transition-colors mb-8 font-black uppercase tracking-widest text-xs gap-2">
               <ArrowLeft className="h-4 w-4" />
               DASHBOARD
            </Link>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
               <div>
                  <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">Find Lifesaving Donors</h1>
                  <p className="text-lg text-red-100 font-bold opacity-80 max-w-xl">Search our network of verified volunteers and connect with matches instantly.</p>
               </div>
               <div className="flex gap-4">
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20">
                     <div className="text-3xl font-black">{donors?.length || 0}</div>
                     <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Verified Donors</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20">
                     <div className="text-3xl font-black">24h</div>
                     <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Avg Response</div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <main className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-12 -mt-12 relative z-20 pb-20">
         {/* Filter Card */}
         <Card className="rounded-3xl border-none shadow-2xl p-4 sm:p-8 bg-white mb-12 overflow-visible">
            <form method="GET" className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
               <div className="md:col-span-5 space-y-3">
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1" htmlFor="city_search">Location / City</label>
                  <div className="relative group">
                     <MapPin className="absolute left-4 top-4 h-6 w-6 text-stone-300 group-focus-within:text-red-500 transition-colors" />
                     <Input id="city_search" name="city" defaultValue={city} placeholder="Search city..." className="h-14 pl-14 rounded-2xl border-2 border-stone-100 bg-stone-50 font-bold text-lg focus:bg-white focus:border-red-600 focus:ring-4 focus:ring-red-50" />
                  </div>
               </div>
               
               <div className="md:col-span-4 space-y-3">
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1" htmlFor="bg_search">Blood Group</label>
                  <div className="relative group">
                     <Droplets className="absolute left-4 top-4 h-6 w-6 text-red-400 group-focus-within:text-red-600 transition-colors" />
                     <select 
                        id="bg_search" 
                        name="blood_group" 
                        defaultValue={blood_group}
                        className="flex h-14 w-full rounded-2xl border-2 border-stone-100 bg-stone-50 px-4 py-2 text-lg pl-14 font-black focus:bg-white focus:ring-4 focus:ring-red-50 focus:border-red-600 transition-all cursor-pointer appearance-none outline-none"
                     >
                        <option value="">Any Group</option>
                        {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                     </select>
                  </div>
               </div>

               <div className="md:col-span-3">
                  <Button type="submit" className="w-full h-14 rounded-2xl shadow-xl shadow-red-200 text-lg font-black gap-2">
                     <Search className="h-6 w-6" />
                     APPLY FILTERS
                  </Button>
               </div>
            </form>
         </Card>

         {/* Results */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {donors && donors.length > 0 ? (
               donors.map((donor) => (
                  <Card key={donor.id} className="rounded-3xl border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-white overflow-hidden p-0 group">
                     <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                           <div className="h-16 w-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 ring-4 ring-white group-hover:scale-110 transition-transform">
                              <User className="h-8 w-8" />
                           </div>
                           <div className="h-14 w-14 bg-red-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-red-100">
                             <span className="text-xl font-black">{donor.blood_group}</span>
                           </div>
                        </div>

                        <div className="space-y-1">
                           <div className="flex items-center gap-2">
                              <h3 className="text-xl font-extrabold text-stone-900 group-hover:text-red-600 transition-colors">{donor.name}</h3>
                              <ShieldCheck className="h-4 w-4 text-blue-500 fill-blue-50" />
                           </div>
                           <p className="text-stone-500 font-bold flex items-center gap-1.5"><MapPin className="h-4 w-4 text-red-500" />{donor.city}</p>
                        </div>
                        
                        <div className="mt-8 pt-6 border-t border-stone-100 grid grid-cols-2 gap-4">
                           <div className="bg-stone-50 rounded-2xl p-3 text-center border border-stone-100 group-hover:bg-red-50/50 transition-colors">
                              <div className="text-[10px] font-black uppercase text-stone-400 mb-0.5 tracking-tighter">Availability</div>
                              <div className="text-xs font-black text-green-600 uppercase">Available Now</div>
                           </div>
                           <div className="bg-stone-50 rounded-2xl p-3 text-center border border-stone-100 group-hover:bg-red-50/50 transition-colors">
                              <div className="text-[10px] font-black uppercase text-stone-400 mb-0.5 tracking-tighter">Verified Donor</div>
                              <div className="text-xs font-black text-blue-600 uppercase">Identity VIP</div>
                           </div>
                        </div>
                     </div>
                      <CardFooter className="bg-stone-50 p-4 border-t border-stone-100 gap-2">
                         <Link href={`/donors?id=${donor.id}`} className="flex-1">
                            <Button variant="outline" className="w-full rounded-xl h-11 border-stone-200 font-bold hover:bg-white text-xs uppercase tracking-widest">VIEW PROFILE</Button>
                         </Link>
                         <Link href="/dashboard" className="flex-1">
                            <Button className="w-full rounded-xl h-11 font-black text-xs shadow-md shadow-red-100 uppercase tracking-widest bg-red-600 hover:bg-red-700 text-white">CONTACT</Button>
                         </Link>
                      </CardFooter>
                  </Card>
               ))
            ) : (
               <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                  <div className="bg-white p-8 rounded-[40px] shadow-xl border border-stone-100 mb-6">
                     <Search className="h-16 w-16 text-stone-200" />
                  </div>
                  <h3 className="text-2xl font-black text-stone-900 mb-2">No Matching Donors Found</h3>
                  <p className="text-stone-500 font-medium max-w-sm leading-relaxed">Try adjusting your filters or search in a nearby city to find available volunteers.</p>
                  <Link href="/donors" className="mt-6 text-red-600 font-black border-b-2 border-red-600 pb-0.5 hover:text-red-700 hover:border-red-700 transition-all uppercase tracking-widest text-xs">Clear all filters</Link>
               </div>
            )}
         </div>
      </main>
    </div>
  )
}
