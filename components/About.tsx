export default function About() {
  return (
    <section id="sobre" className="py-20 bg-backgroung-color">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
        
        {/* Imagem com borda estilizada */}
        <div className="w-full md:w-1/2 relative h-[400px]">
          {/* A Borda - Alterado: border-primary */}
          <div className="absolute -top-4 -left-4 w-full h-full border-2 border-primary rounded-lg"></div>
          
          {/* A Imagem */}
          <img 
            src="https://rrwxenfxczyiqdjhhxem.supabase.co/storage/v1/object/public/Barbeiros/home.jpg" 
            alt="Barbearia por dentro" 
            className="w-full h-full object-cover rounded-lg relative z-10 grayscale hover:grayscale-0 transition-all duration-700"
          />
        </div>

        {/* Texto Informativo */}
        <div className="w-full md:w-1/2">
          <h2 className="text-4xl font-bold mb-6 text-white">Marra & Estilo</h2>
          <p className="text-zinc-400 leading-relaxed mb-6">
            Desde 20XX, trazendo os cortes que mais refletem a sua personalidade. 
            Ambiente climatizado e os melhores profissionais da região 
            prontos para transformar seu visual.
          </p>
          
          <ul className="space-y-3">
            <li className="flex items-center text-zinc-300">
              {/* Check - Alterado: text-primary */}
              <span className="text-primary mr-2">✓</span> Especialistas em cortes masculinos
            </li>
            <li className="flex items-center text-zinc-300">
              {/* Check - Alterado: text-primary */}
              <span className="text-primary mr-2">✓</span> Localização privilegiada perto do centro
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
