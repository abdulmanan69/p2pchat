// Supabase configuration - Replace with your own Supabase project URL and anon key
const SUPABASE_URL = 'https://uyecrpxaaectkndyhjjb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5ZWNycHhhYWVjdGtuZHloampiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjczMjEsImV4cCI6MjA3NDgwMzMyMX0.tTjho3pAtZHCov2p2cXKBa0dtJ-18SsqkOdo7ph5oa0';

// Export configuration
window.SUPABASE_CONFIG = {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY
};