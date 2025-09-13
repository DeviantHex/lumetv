'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchBar() {
  const [q,setQ] = useState('')
  const router = useRouter()
  function onSubmit(e:any){
    e.preventDefault()
    if(!q) return
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }
  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search movies or shows..." className="bg-[#141414] px-3 py-2 rounded-md w-64 outline-none" />
      <button type="submit" className="px-3 py-2 bg-[var(--accent)] rounded-md text-sm">Search</button>
    </form>
  )
}
