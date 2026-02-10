'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { MessageCircle } from 'lucide-react' // Importando o ícone

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface BarbersProps {
  onBook: (barberId: string | null) => void
}

export default function Barbers({ onBook }: BarbersProps) {
  const [barbers, setBarbers] = useState<any[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    async function fetchBarbers() {
      const { data } = await supabase
        .from('barbers')
        .select('*')
        .eq('active', true)
      
      if (data) setBarbers(data)
    }
    fetchBarbers()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.2 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section 
      id="barbeiros" 
      ref={sectionRef}
      className={`py-24 bg-background-color transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white uppercase tracking-tighter">A Equipe</h2>
        </div>

        {barbers.length > 0 ? (
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1.2}
            centeredSlides={true}
            loop={true}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 2, centeredSlides: false },
              1024: { slidesPerView: 4, centeredSlides: false },
            }}
            className="pb-16 !px-2"
          >
            {barbers.map((barber, index) => (
              <SwiperSlide key={barber.id}>
                <div className="group relative overflow-hidden bg-mid rounded-lg border border-zinc-800">
                  <div className="relative h-[500px] w-full overflow-hidden">
                    <img 
                      src={barber.photo_url || 'https://via.placeholder.com/400x600'} 
                      alt={barber.name}
                      className={`w-full h-full object-cover transition-all duration-700
                        ${activeIndex === index ? 'grayscale-0' : 'grayscale'} 
                        md:grayscale md:group-hover:grayscale-0 md:group-hover:scale-110`}
                    />
                    
                    <div className="absolute bottom-0 left-0 p-6 w-full transform transition-transform duration-500 group-hover:-translate-y-2">
                      <h3 className="text-2xl font-bold text-white leading-none mb-4">
                        {barber.name}
                      </h3>
                      
                      <div className={`flex gap-2 transition-all duration-500 ${activeIndex === index ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        {/* BOTÃO DE AGENDAMENTO (CHAMA O MODAL) - Alterado para bg-primary */}
                        <button 
                          onClick={() => onBook(barber.id)}
                          className="flex-1 bg-primary text-black px-4 py-3 text-sm font-bold uppercase hover:bg-white transition-all text-center"
                        >
                          Agendar Horário
                        </button>

                        {/* BOTÃO WHATSAPP (ÍCONE) */}
                        <a 
                          href={`https://wa.me/${barber.whatsapp_number}?text=${encodeURIComponent(`Fala ${barber.name}! Vim do site e gostaria de marcar um horário.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-600 text-white p-3 hover:bg-green-500 transition-colors flex items-center justify-center"
                          title="Conversar no WhatsApp"
                        >
                          <MessageCircle size={20} fill="currentColor" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="h-96 flex items-center justify-center">
             {/* Alterado para border-primary */}
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
          </div>
        )}
      </div>

      <style jsx global>{`
        /* Alterado para var(--primary) */
        .swiper-button-next, .swiper-button-prev { color: var(--primary) !important; transform: scale(0.7); }
        .swiper-pagination-bullet { background: #52525b !important; }
        .swiper-pagination-bullet-active { background: var(--primary) !important; }
      `}</style>
    </section>
  )
}