'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'


export default function TicketForm({ userProfile, onSaved }: any) {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState<FileList | null>(null)
  const [loading, setLoading] = useState(false)


  const createTicket = async () => {
    setLoading(true)
// Upload attachments to Supabase Storage (optional)
    let attachmentUrls: string[] = []
    if (attachments && attachments.length) {
      const folder = `tickets/${Date.now()}`
      for (let i = 0; i < attachments.length; i++) {
        const file = attachments[i]
        const { data, error } = await supabase.storage.from('attachments').upload(`${folder}/${file.name}`, file)
        if (error) console.error(error)
        else attachmentUrls.push(data.path)
      }
    }


// Insert ticket
    const { error } = await supabase.from('ticket').insert({
      title,
      message,
      attachments: attachmentUrls,
      user_id: userProfile?.id
    })


    setLoading(false)
    if (!error) {
      setTitle(''); setMessage(''); setAttachments(null)
      onSaved && onSaved()
    } else console.error(error)
  }


  return (
    <div className="space-y-3 p-4 bg-white rounded shadow">
      <input className="w-full p-2 border rounded" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
      <textarea className="w-full p-2 border rounded" placeholder="Message" value={message} onChange={e => setMessage(e.target.value)} />
      <input type="file" multiple onChange={e => setAttachments(e.target.files)} />
      <div className="flex gap-2">
        <button onClick={createTicket} className="px-4 py-2 bg-green-600 text-white rounded" disabled={loading}>Create</button>
      </div>
    </div>
  )
}