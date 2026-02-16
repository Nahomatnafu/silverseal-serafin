# Quick Setup Guide

Follow these steps to get the Silverseal Guard Management Tool running:

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- A Mapbox account (free tier works)

## Step-by-Step Setup

### 1. Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials (see below for how to get them).

### 2. Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - Name: `silverseal-guard-mgmt` (or your choice)
   - Database Password: (create a strong password)
   - Region: Choose closest to you
4. Wait for project to be created (~2 minutes)
5. Go to **Project Settings** → **API**
6. Copy these values to `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Set Up Database

1. In Supabase, go to **SQL Editor**
2. Click "New Query"
3. Open `supabase/schema.sql` from this project
4. Copy the entire contents and paste into the SQL Editor
5. Click "Run" (bottom right)
6. You should see "Success. No rows returned" - this is correct!

### 4. Get Mapbox Token

1. Go to [mapbox.com](https://www.mapbox.com) and sign up
2. After signing in, you'll be on the Account page
3. Find your **Default public token** (starts with `pk.`)
4. Copy it to `.env.local` as `NEXT_PUBLIC_MAPBOX_TOKEN`

### 5. Install Dependencies

```bash
npm install
```

### 6. Seed Demo Data

```bash
npm install -D tsx
npx tsx scripts/seed-data.ts
```

You should see output like:
```
🌱 Starting seed process...
🗑️  Clearing existing data...
👥 Inserting clients...
✅ Inserted 3 clients
📍 Inserting sites...
✅ Inserted 10 sites
...
🎉 Seed completed successfully!
```

### 7. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Troubleshooting

### "Invalid API key" error
- Double-check your Supabase URL and anon key in `.env.local`
- Make sure there are no extra spaces or quotes
- Restart the dev server after changing `.env.local`

### Map not loading
- Check your Mapbox token in `.env.local`
- Make sure it starts with `pk.`
- Check browser console for specific errors

### Seed script fails
- Make sure you ran the schema.sql first
- Check that your Supabase credentials are correct
- Verify you have internet connection (seed uses external profile images)

### No data showing
- Make sure the seed script completed successfully
- Check browser console for errors
- Verify Supabase tables have data (go to Table Editor in Supabase)

## What's Included in Demo Data

- **3 Clients**: TechCorp Industries, Metropolitan Bank Group, Luxury Estates LLC
- **10 Sites**: Various locations across San Francisco Bay Area
- **10 Employees**: Mix of guards, bodyguards, and supervisors
- **9 Assignments**: 7 currently active, 2 upcoming (1 employee unassigned)
- **20-40 Certifications**: Each employee has 2-4 certs with varied expiry dates
- **Sample Documents**: Contracts and licenses for some employees

## Next Steps

1. Explore the **Map View** - click on site pins to see assigned staff
2. Switch to **Roster View** - try the filters and search
3. Click on any employee to see their detailed profile
4. Check out employees with expiring certifications (yellow badges)
5. Look for the unassigned employee in the roster

## Need Help?

- Check the main README.md for detailed documentation
- Review the database schema in `supabase/schema.sql`
- Inspect the component code in the `components/` directory

