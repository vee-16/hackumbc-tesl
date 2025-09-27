import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'


const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)


export async function POST(req: Request) {
  const body = await req.json()
  const { title, message, user_id, attachments } = body
  const { data, error } = await supabase.from('ticket').insert({ title, message, user_id, attachments })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}