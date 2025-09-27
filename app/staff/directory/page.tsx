'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'


export default function StaffDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [tickets, setTickets] = useState<any[]>([])


  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('staff').select('*').eq('supabase_id', user.id).single()
    setProfile(data)
  }


  const loadTickets = async () => {
    const { data } = await supabase.from('ticket').select('*').eq('staff_id', profile?.id).order('created_at', { ascending: false })
    if (data) setTickets(data)
  }


  useEffect(() => { if (profile) loadTickets() }, [profile])
  useEffect(() => { loadProfile() }, [])


  const updateStatus = async (id: number, status: string) => {
    await supabase.from('ticket').update({ status, updated_at: new Date() }).eq('id', id)
    loadTickets()
  }


  if (!profile) return <p>Loading...</p>


  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Assigned Tickets</h2>
      {tickets.map(t => (
        <div key={t.id} className="p-3 bg-white rounded shadow flex justify-between items-center">
          <div>
            <h3 className="font-semibold">{t.title}</h3>
            <p className="text-sm text-gray-600">{t.message}</p>
          </div>
          <div className="flex gap-2 items-center">
            <select value={t.status} onChange={e => updateStatus(t.id, e.target.value)} className="p-2 border rounded">
              <option value="to_do">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="complete">Complete</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  )
}