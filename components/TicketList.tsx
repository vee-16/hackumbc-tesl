'use client'
import { supabase } from '../lib/supabaseClient'
import { useEffect, useState } from 'react'


export default function TicketList({ filter }: any) {
  const [tickets, setTickets] = useState<any[]>([])


  const load = async () => {
    let query = supabase.from('ticket').select('*')
    if (filter?.user_id) query = query.eq('user_id', filter.user_id)
    if (filter?.staff_id) query = query.eq('staff_id', filter.staff_id)
    const { data, error } = await query.order('created_at', { ascending: false })
    if (data) setTickets(data as any[])
    if (error) console.error(error)
  }


  useEffect(() => { load() }, [filter])


  const deleteTicket = async (id: number) => {
    const { error } = await supabase.from('ticket').delete().eq('id', id)
    if (!error) setTickets(t => t.filter(x => x.id !== id))
  }


  return (
    <div className="space-y-3">
      {tickets.map(t => (
        <div key={t.id} className="p-3 bg-white rounded shadow">
          <div className="flex justify-between">
            <div>
              <h3 className="font-semibold">{t.title}</h3>
              <p className="text-sm text-gray-600">{t.message}</p>
            </div>
            <div className="text-right">
              <p className="text-sm">Status: {t.status}</p>
              <div className="mt-2 flex gap-2">
                <button className="px-2 py-1 border rounded" onClick={() => { /* TODO: open edit modal */ }}>Edit</button>
                <button className="px-2 py-1 border rounded" onClick={() => deleteTicket(t.id)}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}