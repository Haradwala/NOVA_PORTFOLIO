import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tnituptpissolhdsuwwy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_e8v3P8wZVggQXX9jNExxtA_hcJdWGbR';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Helper: generate a unique client token for sharing
export const genToken = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

// Admin password (change this to whatever you want)
export const ADMIN_PASSWORD = 'shadab2024';
