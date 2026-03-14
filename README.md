# FarmAssist - AI Smart Farm Market Assistant

FarmAssist is an advanced mobile-first agriculture platform tailored for farmers with low digital literacy.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Rename `.env.example` to `.env.local` and fill in your API keys:
   - Supabase URL and Anon Key
   - Google Maps API Key
   - Google Places API Key
   - Google Custom Search API Key & Engine ID
   - OpenWeather API Key

3. **Database Setup**
   Run the SQL statements from `supabase/schema.sql` in your Supabase project's SQL Editor to set up the necessary tables and seed data.

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
