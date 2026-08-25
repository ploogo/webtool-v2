import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasValidCredentials = () => Boolean(supabaseUrl && supabaseAnonKey);

if (!hasValidCredentials()) {
  // Throwing here took the whole app down at import time, before any feature
  // that actually needs Supabase had a chance to run. Callers should check
  // hasValidCredentials() instead.
  console.warn(
    'Supabase environment variables are missing; features that need them will fail.'
  );
}

export const supabase = createClient<Database>(
  supabaseUrl || 'http://localhost',
  supabaseAnonKey || 'missing-anon-key'
);