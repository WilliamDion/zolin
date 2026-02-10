'use client' // Necessário para usar useState
import { useState } from 'react'
import About from '@/components/About'
import Services from '@/components/Services'
import Barbers from '@/components/Barbers'
import ContactInfo from '@/components/ContactInfo'
import BookingModal from '@/components/BookingModal'

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [initialBarberId, setInitialBarberId] = useState<string | null>(null)
  const [initialServiceId, setInitialServiceId] = useState<string | null>(null)

  const openBooking = (barberId: string | null = null, serviceId: string | null = null) => {
    setInitialBarberId(barberId)
    setInitialServiceId(serviceId)
    setIsModalOpen(true)
  }

  return (
    <main className="min-h-screen bg-background-color">
      {/* HERO SECTION PREMIUM */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="relative z-10 text-center px-4 flex flex-col items-center">
          <div className="mb-6 animate-fade-in">
            <img 
              src="https://wwuclhmpvfjrtbfwoaub.supabase.co/storage/v1/object/public/Servicos/logo%20dvargas.png" 
              alt="Logo" 
              className="w-40 h-40 md:w-52 md:h-52 object-contain"
            />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tighter mb-6">
            BAHRBEARIA<span className="text-primary inline-block hover:scale-110 transition-transform"></span>
          </h1>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button 
              onClick={() => openBooking()}
              className="bg-primary text-black font-bold px-8 py-4 rounded-sm hover:bg-white transition-all uppercase text-sm tracking-widest text-center">
                Agendar Horário
            </button>
            <a href="#servicos" className="border border-zinc-700 hover:border-transparent text-white font-bold px-8 py-4 rounded-sm hover:bg-mid transition-all uppercase text-sm tracking-widest text-center">
              Ver Serviços
            </a>
          </div>
        </div>
      </section>

      <About />
      <Services onBook={openBooking} />
      <Barbers onBook={openBooking} />
      <ContactInfo/>

      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialBarberId={initialBarberId}
        initialServiceId={initialServiceId}
      />
    </main>
  )
}