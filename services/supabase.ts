
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = process.env.SUPABASE_URL || 'https://eeecznquaelhouclmxuw.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlZWN6bnF1YWVsaG91Y2xteHV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNzMwMDcsImV4cCI6MjA4NTk0OTAwN30.6rlcup6FTw7GuSM2x-7RTCa5ih74NK7lAmugdQNfqhM';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
