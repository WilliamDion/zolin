// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Essas variáveis vêm do arquivo .env que criaremos a seguir
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);