
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// In a production environment, these would be environment variables
const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For development, we can use mock data when Supabase is not configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://your-supabase-url.supabase.co' && 
         supabaseAnonKey !== 'your-supabase-anon-key';
};
