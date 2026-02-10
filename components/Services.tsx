'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

// Importando Swiper
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

// Interface para receber a prop do pai
interface ServicesProps {
  onBook: (barberId: string | null, serviceId: string | null) => void
}

export default function Services({ onBook }: ServicesProps) {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    async function fetchServices() {
      const { data, error } = await supabase
        .from('services')
        .select('*')
      
      if (!error) setServices(data)
      setLoading(false)
    }
    fetchServices()
  }, [])

  if (loading) return (
    <div className="flex justify-center items-center py-24 bg-background-color">
      {/* Alterado: border-t-primary */}
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
    </div>
  )

  return (
    <section id="servicos" className="py-24 bg-background-color overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6">
            {/* Alterado: text-primary */}
            Nossos <span className="text-primary">Serviços</span>
          </h2>
        </div>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1.2}
          centeredSlides={true}
          loop={true}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          breakpoints={{
            768: { slidesPerView: 2, centeredSlides: false },
            1024: { slidesPerView: 3, centeredSlides: false },
          }}
          className="pb-16 !px-2"
        >
          {services.map((service, index) => (
            <SwiperSlide key={service.id}>
              {/* Alterado: hover:border-primary/50 */}
              <div className="glass-card group rounded-none overflow-hidden border border-zinc-900 hover:border-primary/50 transition-all duration-500 bg-zinc-950">
                {/* Imagem do Serviço */}
                <div className="relative h-64 overflow-hidden">
                  <div className={`absolute inset-0 z-10 transition-colors duration-700 ${
                    activeIndex === index ? 'bg-black/10' : 'bg-black/60 md:group-hover:bg-black/10'
                  }`}></div>
                  <img 
                    src={service.image_url} 
                    alt={service.name}
                    className={`w-full h-full object-cover transition-all duration-700
                      ${activeIndex === index ? 'grayscale-0 scale-105' : 'grayscale-[0.8] md:group-hover:grayscale-0 md:group-hover:scale-110'}`}
                  />
                </div>

                {/* Info do Serviço */}
                <div className="p-8 relative z-20">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold tracking-tight text-white">{service.name}</h3>
                    {/* Alterado: text-primary */}
                    <p className="text-primary font-mono text-xl font-bold">R$ {Number(service.price).toFixed(2)}</p>
                  </div>
                  <p className="text-zinc-500 text-sm leading-relaxed mb-8 h-12 line-clamp-2">
                    {service.description}
                  </p>
                  
                  {/* Alterado: group-hover:bg-primary e group-hover:border-primary */}
                  <button 
                    onClick={() => onBook(null, service.id)}
                    className="w-full py-4 border border-zinc-800 bg-transparent text-white group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all uppercase text-xs tracking-[0.2em] font-black"
                  >
                    Agendar Agora
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        /* Alterado: color: var(--primary) */
        .swiper-button-next, .swiper-button-prev { 
          color: var(--primary) !important; 
          transform: scale(0.6);
        }
        .swiper-pagination-bullet { background: #52525b !important; }
        /* Alterado: background: var(--primary) */
        .swiper-pagination-bullet-active { background: var(--primary) !important; }
        @media (max-width: 768px) {
          .swiper-button-next, .swiper-button-prev { display: none !important; }
        }
      `}</style>
    </section>
  )
}