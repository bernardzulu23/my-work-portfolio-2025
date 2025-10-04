//src/environments/environment.prod.ts
export const environment = {
  production: true,
  supabase: {
    url: process.env['SUPABASE_URL'] || 'https://kckgihiaaoioqlrjywpi.supabase.co',
    anonKey: process.env['SUPABASE_ANON_KEY'] || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtja2dpaGlhYW9pb3Fscmp5d3BpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTIwNjAsImV4cCI6MjA3NDIyODA2MH0.oeJ7XV-rzYj2Y5M3wlo0itUD8FtFGEh0AldWyBZAMSY'
  }
};
