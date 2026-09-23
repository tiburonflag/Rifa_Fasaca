'use client'

import { useEffect, useMemo, useState } from 'react'
import { Dog, Heart, LockKeyhole, MessageCircle, PawPrint, Sparkles, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const dogImage = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-RjuM6UAQnC26RKpWEGf1eHQlTOaEv5.png'
const prizeImage = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/277611-JOCfPCPuRsHqbnw9WTZrBwXsslX1O2.png'

type Status = 'available' | 'reserved' | 'paid'
type Entry = { estado: Status; nombre: string; telefono: string }

export default function Page() {
  const [entries, setEntries] = useState<Record<number, Entry>>({})
  const [loading, setLoading] = useState(true)
  const [adminOpen, setAdminOpen] = useState(false)
  const [adminMode, setAdminMode] = useState(false)
  const [password, setPassword] = useState('')
  const [selected, setSelected] = useState<number | null>(null)
  const [pendingNumber, setPendingNumber] = useState<number | null>(null)
  const [formNombre, setFormNombre] = useState('')
  const [formTelefono, setFormTelefono] = useState('')
  const [notice, setNotice] = useState('')

  async function loadReservas() {
    const { data, error } = await supabase.from('reservas').select('numero, nombre, telefono, estado')
    if (error) { setNotice('No se pudieron cargar los números. Intenta de nuevo.'); return }
    const map: Record<number, Entry> = {}
    for (const row of data ?? []) map[row.numero] = { estado: row.estado as Status, nombre: row.nombre, telefono: row.telefono }
    setEntries(map)
    setLoading(false)
  }

  useEffect(() => { loadReservas() }, [])

  const counts = useMemo(() => {
    const values = Object.values(entries)
    return { available: 100 - values.length, reserved: values.filter((e) => e.estado === 'reserved').length, paid: values.filter((e) => e.estado === 'paid').length }
  }, [entries])

  function chooseNumber(number: number) {
    if (adminMode) { setSelected(number); return }
    if (entries[number]) return
    setPendingNumber(number)
  }

  async function confirmReserva() {
    if (pendingNumber === null) return
    if (!formNombre.trim() || !formTelefono.trim()) { setNotice('Escribe tu nombre y tu número de teléfono.'); return }
    const { error } = await supabase.from('reservas').insert({ numero: pendingNumber, nombre: formNombre.trim(), telefono: formTelefono.trim(), estado: 'reserved' })
    if (error) { setNotice('Ese número ya fue tomado, elige otro.'); await loadReservas(); setPendingNumber(null); setFormNombre(''); setFormTelefono(''); return }
    setEntries((current) => ({ ...current, [pendingNumber]: { estado: 'reserved', nombre: formNombre.trim(), telefono: formTelefono.trim() } }))
    setNotice(`El número ${String(pendingNumber).padStart(2, '0')} quedó separado a nombre de ${formNombre.trim()}. Escríbele a Nancy para confirmar tu pago.`)
    setPendingNumber(null)
    setFormNombre('')
    setFormTelefono('')
  }

  function login() {
    if (password === 'Nancy7508*') { setAdminMode(true); setAdminOpen(false); setPassword(''); setNotice('Modo administradora activado. Selecciona una casilla para cambiar su estado.') }
    else setNotice('La contraseña no coincide.')
  }

  async function updateSelected(status: Status | 'available') {
    if (selected === null) return
    if (status === 'available') {
      const { error } = await supabase.from('reservas').delete().eq('numero', selected)
      if (error) { setNotice('No se pudo liberar el número.'); return }
      setEntries((current) => { const next = { ...current }; delete next[selected]; return next })
    } else {
      const current = entries[selected]
      if (!current) { setNotice('Ese número no tiene datos de comprador aún.'); setSelected(null); return }
      const { error } = await supabase.from('reservas').update({ estado: status }).eq('numero', selected)
      if (error) { setNotice('No se pudo actualizar el número.'); return }
      setEntries((prev) => ({ ...prev, [selected]: { ...prev[selected], estado: status } }))
    }
    setNotice(`El número ${String(selected).padStart(2, '0')} ahora está ${status === 'paid' ? 'pagado' : status === 'reserved' ? 'separado' : 'disponible'}.`)
    setSelected(null)
  }

  const selectedEntry = selected !== null ? entries[selected] : undefined

  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfaf5] text-[#25352d]">
      <div className="relative mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -left-20 top-24 text-[#dbe9d7]/80"><PawPrint size={150} strokeWidth={1} /></div>
        <div className="pointer-events-none absolute -right-10 top-[34rem] rotate-12 text-[#dbe9d7]/70"><PawPrint size={120} strokeWidth={1} /></div>

        <header className="relative flex items-center justify-between py-5">
          <div className="flex items-center gap-2.5"><span className="grid size-10 place-items-center rounded-full bg-[#315c45] text-[#f4d77b]"><PawPrint size={22} fill="currentColor" /></span><span className="font-serif text-xl font-bold tracking-tight">Huellas con propósito</span></div>
          <button onClick={() => setAdminOpen(true)} className="flex items-center gap-2 rounded-full border border-[#d9e0d6] bg-white/70 px-4 py-2 text-sm font-semibold text-[#315c45] transition hover:bg-white"><LockKeyhole size={15} /> Administrar</button>
        </header>

        <section className="relative grid items-center gap-8 pb-10 pt-5 lg:grid-cols-[1.05fr_.95fr] lg:gap-14 lg:pt-10">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#e9f2e5] px-3.5 py-2 text-xs font-bold uppercase tracking-[.16em] text-[#557b5b]"><Heart size={14} fill="currentColor" /> Rifa solidaria</div>
            <h1 className="max-w-xl font-serif text-5xl font-bold leading-[.98] tracking-[-.04em] text-[#244335] sm:text-6xl">Una oportunidad para <span className="text-[#d28c4d]">cambiar una vida.</span></h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-[#607269]">Ayudemos a este perrito de la calle a recibir el cuidado que necesita. Cada número suma alimento, atención y esperanza.</p>
            <div className="mt-7 flex flex-wrap gap-3"><div className="rounded-2xl bg-[#315c45] px-5 py-3 text-white"><p className="text-xs uppercase tracking-wider text-[#c9e4c8]">Valor por número</p><p className="text-2xl font-bold">$4.000 <span className="text-sm font-normal">COP</span></p></div><div className="rounded-2xl border border-[#dce6d8] bg-white px-5 py-3"><p className="text-xs uppercase tracking-wider text-[#7a8a7e]">Sorteo</p><p className="text-lg font-bold text-[#315c45]">02 oct. 2026</p></div></div>
          </div>
          <div className="relative mx-auto w-full max-w-md"><div className="absolute inset-3 rotate-3 rounded-[2rem] bg-[#e6c36e]" /><div className="relative overflow-hidden rounded-[2rem] border-[7px] border-white bg-[#dbe6d8] shadow-xl"><img src={dogImage} alt="Perrito que recibirá apoyo con la rifa" className="aspect-[4/4.5] w-full object-cover" /><div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl bg-white/90 p-3 backdrop-blur"><div><p className="text-xs font-bold uppercase tracking-wider text-[#79907d]">Nuestra causa</p><p className="font-serif text-lg font-bold text-[#315c45]">Por una vida digna</p></div><span className="grid size-10 place-items-center rounded-full bg-[#f4d77b] text-[#315c45]"><Dog size={22} /></span></div></div></div>
        </section>

        <section className="relative rounded-[2rem] border border-[#e1e8dd] bg-white p-5 shadow-[0_18px_50px_rgba(48,78,57,.08)] sm:p-8">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-1 flex items-center gap-2 text-sm font-bold uppercase tracking-[.16em] text-[#d28c4d]"><Sparkles size={15} /> Elige tu número</p><h2 className="font-serif text-3xl font-bold text-[#244335]">100 oportunidades de ayudar</h2></div><div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-[#718076]"><span className="flex items-center gap-1.5"><i className="size-3 rounded-full bg-[#a8d5a2]" /> Disponible ({counts.available})</span><span className="flex items-center gap-1.5"><i className="size-3 rounded-full bg-[#f3d36f]" /> Separado ({counts.reserved})</span><span className="flex items-center gap-1.5"><i className="size-3 rounded-full bg-[#e98d81]" /> Pagado ({counts.paid})</span></div></div>
          {notice && <div className="mb-5 flex items-center justify-between rounded-xl bg-[#f0f7ed] px-4 py-3 text-sm font-medium text-[#4e7556]"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Cerrar aviso"><X size={16} /></button></div>}
          {loading ? <p className="py-10 text-center text-sm text-[#718076]">Cargando números…</p> : (
            <div className="grid grid-cols-5 gap-2.5 sm:grid-cols-10 sm:gap-3">{Array.from({ length: 100 }, (_, i) => i + 1).map((number) => { const status = entries[number]?.estado ?? 'available'; return <button key={number} onClick={() => chooseNumber(number)} aria-label={`Número ${number}, ${status}`} className={`aspect-square rounded-xl text-sm font-bold transition hover:-translate-y-0.5 hover:shadow-md sm:text-base ${status === 'available' ? 'bg-[#e7f3e3] text-[#3e7650] hover:bg-[#d8ebd3]' : status === 'reserved' ? 'bg-[#fff1bf] text-[#a77b1e]' : 'bg-[#f9d9d4] text-[#b25d53]'}`}>{String(number).padStart(2, '0')}</button> })}</div>
          )}
          <div className="mt-7 flex flex-col items-center justify-between gap-4 border-t border-[#edf0ea] pt-6 sm:flex-row"><p className="text-sm text-[#718076]">Al elegir un número quedará separado hasta confirmar el pago.</p><a href="https://wa.me/573005434894?text=Hola%20Nancy%2C%20quiero%20participar%20en%20la%20rifa%20solidaria." target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-full bg-[#4a9b62] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#398650]"><MessageCircle size={18} /> Escribir por WhatsApp</a></div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-[1.15fr_.85fr]"><div className="rounded-[1.75rem] bg-[#315c45] p-6 text-white"><p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-[#c9e4c8]">Premio de la rifa</p><h2 className="font-serif text-2xl font-bold">Kit de cuidado y fragancia Yanbal</h2><p className="mt-2 text-sm leading-6 text-[#d6e8d3]">Incluye loción de seda Rosa & Mora y fragancia corporal L'Essence.</p></div><div className="flex items-center justify-center overflow-hidden rounded-[1.75rem] bg-[#f2eee8] p-3 sm:p-4"><img src={prizeImage} alt="Premio: loción de seda y fragancia corporal Yanbal" className="h-36 w-full rounded-2xl object-cover object-center sm:h-44" /></div></section>
        <footer className="mt-10 text-center text-sm text-[#78877c]">Organiza <strong className="text-[#315c45]">Nancy Amaya</strong> · <a className="font-semibold text-[#4a9b62]" href="tel:+573005434894">+57 300 543 4894</a> · Gracias por ayudar a una huella.</footer>
      </div>

      {pendingNumber !== null && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#1e3327]/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <div className="mb-3 grid size-11 place-items-center rounded-full bg-[#e9f2e5] text-[#315c45]"><Sparkles size={21} /></div>
                <h2 className="font-serif text-2xl font-bold text-[#244335]">Número {String(pendingNumber).padStart(2, '0')}</h2>
                <p className="mt-1 text-sm text-[#718076]">Déjanos tu nombre y tu teléfono para separarlo.</p>
              </div>
              <button onClick={() => { setPendingNumber(null); setFormNombre(''); setFormTelefono('') }} aria-label="Cerrar"><X size={20} className="text-[#829087]" /></button>
            </div>
            <input autoFocus value={formNombre} onChange={(e) => setFormNombre(e.target.value)} placeholder="Nombre completo" className="mb-3 w-full rounded-xl border border-[#dce6d8] px-4 py-3 outline-none focus:border-[#4a9b62] focus:ring-2 focus:ring-[#dcebd8]" />
            <input value={formTelefono} onChange={(e) => setFormTelefono(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) confirmReserva() }} placeholder="Número de teléfono" className="mb-4 w-full rounded-xl border border-[#dce6d8] px-4 py-3 outline-none focus:border-[#4a9b62] focus:ring-2 focus:ring-[#dcebd8]" />
            <button onClick={confirmReserva} className="w-full rounded-xl bg-[#315c45] py-3 font-bold text-white transition hover:bg-[#244335]">Separar número</button>
          </div>
        </div>
      )}

      {adminOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-[#1e3327]/45 p-4 backdrop-blur-sm"><div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"><div className="mb-5 flex items-start justify-between"><div><div className="mb-3 grid size-11 place-items-center rounded-full bg-[#e9f2e5] text-[#315c45]"><LockKeyhole size={21} /></div><h2 className="font-serif text-2xl font-bold text-[#244335]">Acceso de Nancy</h2><p className="mt-1 text-sm text-[#718076]">Solo la administradora puede confirmar pagos.</p></div><button onClick={() => setAdminOpen(false)} aria-label="Cerrar"><X size={20} className="text-[#829087]" /></button></div><input autoFocus type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) login() }} placeholder="Contraseña" className="mb-3 w-full rounded-xl border border-[#dce6d8] px-4 py-3 outline-none focus:border-[#4a9b62] focus:ring-2 focus:ring-[#dcebd8]" /><button onClick={login} className="w-full rounded-xl bg-[#315c45] py-3 font-bold text-white transition hover:bg-[#244335]">Ingresar</button></div></div>}
      {adminMode && (
        <div className="fixed bottom-5 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 flex-col items-center gap-2 rounded-3xl bg-[#244335] px-4 py-3 text-sm font-semibold text-white shadow-xl">
          <div className="flex w-full items-center justify-between">
            <span>Modo admin</span>
            <button onClick={() => { setAdminMode(false); setSelected(null) }} className="rounded-full p-1 text-[#c9e4c8] hover:bg-white/10" aria-label="Salir"><X size={16} /></button>
          </div>
          {selected !== null && (
            <div className="flex w-full flex-col items-center gap-2">
              <div className="text-center text-xs font-normal text-[#c9e4c8]">
                #{String(selected).padStart(2, '0')}{selectedEntry ? ` — ${selectedEntry.nombre} · ${selectedEntry.telefono}` : ' — sin datos aún'}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateSelected('paid')} className="rounded-full bg-[#e98d81] px-3 py-1 text-xs text-[#6f2923]">Pagado</button>
                <button onClick={() => updateSelected('reserved')} className="rounded-full bg-[#f3d36f] px-3 py-1 text-xs text-[#765b0f]">Separado</button>
                <button onClick={() => updateSelected('available')} className="rounded-full bg-[#a8d5a2] px-3 py-1 text-xs text-[#285235]">Liberar</button>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
