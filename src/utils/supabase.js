import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export const supabaseConfigurationError = !supabaseUrl || !supabaseAnonKey
  ? 'Konfigurasi Supabase belum lengkap. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env.'
  : ''

export const supabase = supabaseConfigurationError
  ? null
  : createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
