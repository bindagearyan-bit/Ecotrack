# EcoTrack Setup Guide

## Environment Variables Setup

1. Copy .env.example to .env:
   cp .env.example .env

2. Get your Supabase credentials:
   - Go to supabase.com
   - Open your project
   - Settings → API Keys
   - Copy "Publishable key"
   - Settings → General
   - Copy Project ID
   - Build URL: 
     https://[PROJECT_ID].supabase.co

3. Paste values in .env file:
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_KEY=your_key

4. Restart dev server:
   npm run dev

## Important Notes

⚠️ NEVER commit .env file
⚠️ NEVER share your keys publicly
⚠️ Restart server after changing .env
✅ Always use VITE_ prefix for variables
