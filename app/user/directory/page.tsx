'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import TicketForm from '../../../components/TicketForm'
import TicketList from '../../../components/TicketList'


export default function UserDashboard() {
  const [profile, setProfile] = useState<any>(null)


  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
// Lookup profile in user table
    const { data } = await supabase.from('user').select('*').eq('supabase_id', user.id).single()
    setProfile(data)
  }


  useEffect(() => { loadProfile() }, [])


  if (!profile) return <p>Loading...</p>


  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Your Tickets</h2>
      <TicketForm userProfile={profile} onSaved={loadProfile} />
      <TicketList filter={{ user_id: profile.id }} />
    </div>
  )
}