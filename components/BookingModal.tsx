'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Calendar, Clock, X, CheckCircle2, AlertTriangle, MessageCircle, WifiOff } from 'lucide-react'
import { BUSINESS_HOURS } from '@/src/config/business-hours'
import { whatsappNumber} from '@/components/ContactInfo'

const BARBER_COLORS: any = {
  '16f2f51b-4ac1-4cff-8c34-6d48a653a5c6': '11',
  'be8523b4-bb60-47a6-908d-e6a92a6c486b': '10',
  'e36d2ea5-1f19-4f39-a3bd-e2fe4c1bf4b3': '5',
}

export default function BookingModal({ initialServiceId, initialBarberId, isOpen, onClose }: any) {
  const [barbers, setBarbers] = useState<any[]>([])
  const [allServices, setAllServices] = useState<any[]>([])
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [conflictError, setConflictError] = useState(false)
  const [serverError, setServerError] = useState(false)
  
  const [formData, setFormData] = useState({
    barber_id: '',
    client_name: '',
    client_phone: '',
    appointment_date: '',
    appointment_time: ''
  })

  useEffect(() => {
    async function fetchData() {
      const [bRes, sRes] = await Promise.all([
        supabase.from('barbers').select('*').eq('active', true),
        supabase.from('services').select('*').order('name')
      ])
      if (bRes.data) setBarbers(bRes.data)
      if (sRes.data) setAllServices(sRes.data)
    }
    if (isOpen) {
      fetchData()
      if (initialServiceId) setSelectedServiceIds([String(initialServiceId)])
      if (initialBarberId) setFormData(prev => ({ ...prev, barber_id: initialBarberId }))
      setConflictError(false)
      setServerError(false)
    }
  }, [isOpen, initialServiceId, initialBarberId])

  const selectedServicesData = allServices.filter(s => selectedServiceIds.includes(String(s.id)))
  const totalDuration = selectedServicesData.reduce((acc, s) => acc + (Number(s.duration) || 0), 0)
  const totalPrice = selectedServicesData.reduce((acc, s) => acc + (Number(s.price) || 0), 0)
  const servicesNames = selectedServicesData.map(s => s.name).join(', ')

  // Validação robusta: Nome > 2 letras e Telefone (apenas números) >= 10 dígitos
  const isFormValid = 
    selectedServiceIds.length > 0 && 
    formData.barber_id !== '' && 
    formData.appointment_date !== '' && 
    formData.appointment_time !== '' &&
    formData.client_name.trim().length >= 3 &&
    formData.client_phone.replace(/\D/g, '').length >= 10;

  const handleWhatsAppFallback = (reason: string) => {
    const msg = `Olá! Tentei agendar ${servicesNames} para o dia ${formData.appointment_date} às ${formData.appointment_time}, mas tive um problema (${reason}). Pode me ajudar?`
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return;

    setConflictError(false)
    setServerError(false)
    setLoading(true)

    const dateObj = new Date(formData.appointment_date + 'T00:00:00');
    const dayOfWeek = dateObj.getDay() as keyof typeof BUSINESS_HOURS;
    const config = BUSINESS_HOURS[dayOfWeek];

    if (!config || !config.open) {
      alert("Desculpe, não abrimos neste dia.");
      setLoading(false);
      return;
    }

    const time = formData.appointment_time;
    const isOutOfRange = time < config.open || time >= config.close;
    const isLunchTime = config.lunchStart && (time >= config.lunchStart && time < config.lunchEnd);

    if (isOutOfRange || isLunchTime) {
      alert(isLunchTime ? `Estamos em horário de almoço (${config.lunchStart} às ${config.lunchEnd}).` : `Neste dia atendemos das ${config.open} às ${config.close}.`);
      setLoading(false);
      return;
    }
    
    const selectedBarber = barbers.find(b => b.id === formData.barber_id);

    try {
      const response = await fetch('/api/create-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          barber_name: selectedBarber?.name || "Barbeiro",
          duration: totalDuration,
          services: servicesNames,
          price: totalPrice,
          color: BARBER_COLORS[formData.barber_id] || '1'
        }),
      });

      if (response.ok) {
        alert("Agendamento realizado com sucesso!");
        onClose();
      } else if (response.status === 409) {
        setConflictError(true);
      } else {
        setServerError(true);
      }
    } catch (error) {
      setServerError(true);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-lg shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <div>
            <h2 className="text-white font-black text-2xl uppercase tracking-tighter">Agendamento</h2>
            <div className="text-primary text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
              <CheckCircle2 size={14} className="text-primary" /> 
              <span>{selectedServiceIds.length} serviços selecionados</span>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-2">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid md:grid-cols-2 gap-8">
          
          {/* Passo 1: Serviços */}
          <div className="space-y-4">
            <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest border-b border-zinc-800 pb-2">1. Selecione os Serviços</h3>
            <div className="grid gap-2">
              {allServices.map(service => {
                const isSelected = selectedServiceIds.includes(String(service.id))
                return (
                  <button key={service.id} type="button" 
                    onClick={() => {
                      const id = String(service.id);
                      setSelectedServiceIds(prev => isSelected ? prev.filter(i => i !== id) : [...prev, id]);
                      setConflictError(false);
                    }}
                    className={`flex justify-between items-center p-4 border-2 transition-all ${isSelected ? 'border-primary bg-primary/10' : 'border-zinc-900 bg-zinc-900/30 hover:border-zinc-700'}`}>
                    <div className="text-left">
                      <p className={`font-black text-sm uppercase ${isSelected ? 'text-primary' : 'text-zinc-300'}`}>{service.name}</p>
                      <div className="text-[10px] text-zinc-500 font-bold flex items-center gap-1 mt-1">
                        <Clock size={12} /> <span>{service.duration} MIN</span>
                      </div>
                    </div>
                    <p className="text-white font-black text-sm">R$ {Number(service.price).toFixed(2)}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Passo 2: Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4 bg-zinc-900/20 p-4 border border-zinc-800/50 rounded-md">
            <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest border-b border-zinc-800 pb-2">2. Detalhes da Reserva</h3>
            
            <div className="space-y-3">
              <select required className="w-full bg-black border border-zinc-800 p-3 text-white text-xs font-bold focus:border-primary outline-none"
                value={formData.barber_id} onChange={e => setFormData({...formData, barber_id: e.target.value})}>
                <option value="">QUEM VAI TE ATENDER?</option>
                {barbers.map(b => <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>)}
              </select>

              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input type="date" required className="w-full bg-black border border-zinc-800 p-3 text-white text-xs outline-none focus:border-primary [color-scheme:dark]" 
                    value={formData.appointment_date} onChange={e => setFormData({...formData, appointment_date: e.target.value})} />
                </div>
                <div className="relative">
                  <input type="time" required className="w-full bg-black border border-zinc-800 p-3 text-white text-xs outline-none focus:border-primary [color-scheme:dark]" 
                    value={formData.appointment_time} onChange={e => setFormData({...formData, appointment_time: e.target.value})} />
                </div>
              </div>

              <input type="text" placeholder="SEU NOME" required className="w-full bg-black border border-zinc-800 p-3 text-white text-xs focus:border-primary outline-none uppercase" 
                value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})} />
              
              <input type="tel" placeholder="WHATSAPP (COM DDD)" required className="w-full bg-black border border-zinc-800 p-3 text-white text-xs focus:border-primary outline-none" 
                value={formData.client_phone} onChange={e => setFormData({...formData, client_phone: e.target.value})} />
            </div>

            {/* Mensagens de Erro */}
            {conflictError && (
              <div className="bg-red-500/10 border border-red-500 p-3 rounded space-y-2">
                <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase"><AlertTriangle size={14} /> Horário Ocupado</div>
                <button type="button" onClick={() => handleWhatsAppFallback("horário ocupado")} className="w-full bg-green-600 text-white p-2 text-[10px] font-black uppercase rounded flex items-center justify-center gap-2">
                  <MessageCircle size={14} /> Resolver pelo WhatsApp
                </button>
              </div>
            )}

            {serverError && (
              <div className="bg-orange-500/10 border border-orange-500 p-3 rounded space-y-2">
                <div className="flex items-center gap-2 text-orange-500 text-[10px] font-black uppercase"><WifiOff size={14} /> Erro de conexão</div>
                <button type="button" onClick={() => handleWhatsAppFallback("erro técnico")} className="w-full bg-green-600 text-white p-2 text-[10px] font-black uppercase rounded flex items-center justify-center gap-2">
                  <MessageCircle size={14} /> Chamar no WhatsApp
                </button>
              </div>
            )}

            {/* Resumo Financeiro */}
            <div className="mt-4 p-4 bg-black border-l-4 border-primary">
              <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-500">
                <span>Duração: {totalDuration} min</span>
                <span className="text-primary text-sm">Total: R$ {totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Botão de Ação Principal */}
            <button 
              type="submit" 
              disabled={loading || !isFormValid}
              className={`w-full p-4 font-black uppercase text-xs transition-all duration-300 rounded flex items-center justify-center min-h-[50px] ${
                isFormValid && !loading
                ? 'bg-primary text-black hover:bg-white shadow-lg active:scale-[0.98]' 
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                  <span>AGUARDE...</span>
                </div>
              ) : (
                <span>
                  {selectedServiceIds.length === 0 ? "Escolha um serviço" : 
                   formData.barber_id === "" ? "Escolha o barbeiro" : 
                   !isFormValid ? "Preencha os dados" : "Finalizar Agendamento"}
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}