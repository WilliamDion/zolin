import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { BUSINESS_HOURS } from '@/src/config/business-hours';

// 1. Inicialização do Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 2. Configurações do Google
const auth = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

const calendar = google.calendar({ version: 'v3', auth });
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      barber_id, barber_name, client_name, client_phone, 
      appointment_date, appointment_time, 
      duration, services, price, color 
    } = body;

    // --- VALIDAÇÃO DE HORÁRIO DE FUNCIONAMENTO ---
    const dateObj = new Date(`${appointment_date}T00:00:00`);
    const dayOfWeek = dateObj.getDay();
    const config = BUSINESS_HOURS[dayOfWeek as keyof typeof BUSINESS_HOURS];

    // Verifica se abre no dia
    if (!config || !config.open) {
      return NextResponse.json({ error: 'Barbearia fechada neste dia' }, { status: 400 });
    }

    // Valida abertura/fechamento e almoço
    const isOutOfRange = appointment_time < config.open || appointment_time >= config.close;
    const isLunchTime = config.lunchStart && (appointment_time >= config.lunchStart && appointment_time < config.lunchEnd);

    if (isOutOfRange || isLunchTime) {
      return NextResponse.json({ 
        error: isLunchTime ? 'Horário de almoço' : 'Fora do horário de expediente' 
      }, { status: 400 });
    }

    // --- PREPARAÇÃO DAS DATAS ---
    const startDateTime = new Date(`${appointment_date}T${appointment_time}:00-03:00`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

    // 3. Consultar a agenda do Google
    const checkCalendar = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: startDateTime.toISOString(),
      timeMax: endDateTime.toISOString(),
      singleEvents: true,
      timeZone: 'America/Sao_Paulo',
    });

    const events = checkCalendar.data.items || [];
    
    // 4. Lógica de Conflito: Filtra pelo ID do Barbeiro na descrição
    const hasConflict = events.some(event => {
      if (!event.description) return false;
      return event.description.includes(`Barbeiro ID: ${barber_id}`);
    });

    if (hasConflict) {
      return NextResponse.json({ error: 'Horário ocupado' }, { status: 409 });
    }

    // 5. Inserir no Google Calendar
    const googleEvent = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: {
        summary: `✂️ ${client_name} | ${services}`,
        description: `Cliente: ${client_name}\nWhatsApp: ${client_phone}\nServiços: ${services}\nBarbeiro: ${barber_name}\nBarbeiro ID: ${barber_id}`,
        start: { dateTime: startDateTime.toISOString(), timeZone: 'America/Sao_Paulo' },
        end: { dateTime: endDateTime.toISOString(), timeZone: 'America/Sao_Paulo' },
        colorId: color || '1',
      },
    });

    // 6. Salvar no Supabase
    const { error: dbError } = await supabase
      .from('appointments')
      .insert([{
        client_name,
        client_phone,
        appointment_date,
        appointment_time,
        total_duration: duration,
        total_price: price,
        services_description: services,
        barber_id,
        google_event_id: googleEvent.data.id,
        status: 'confirmado'
      }]);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, id: googleEvent.data.id });

  } catch (error: any) {
    console.error("ERRO NA API:", error);
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
}