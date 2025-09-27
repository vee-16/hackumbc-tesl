'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'


export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')


  const handleMagicLink = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) setMessage(error.message)
    else setMessage('Check your email for the magic link.')
  }


  return (
    <div className="max-w-md mx-auto space-y-4">

    </div>
  )
}