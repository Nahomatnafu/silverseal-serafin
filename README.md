# Silverseal Guard Force Management Tool

A modern, map-based security workforce management system for managing security personnel, sites, assignments, and certifications.

## Features

- **Interactive Map View**: Visualize all sites with real-time staff counts and certification alerts
- **Roster/Table View**: Powerful filtering and search capabilities for quick access
- **Employee Profiles**: Detailed view of certifications, assignments, documents, and contact info
- **Real-time Status**: Track active shifts, upcoming assignments, and unassigned personnel
- **Certification Tracking**: Monitor expiring and expired certifications with visual alerts

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- **Map**: Mapbox GL JS
- **Backend**: Supabase (PostgreSQL database + Auth)
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your credentials
3. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
4. Update `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. Set Up Database Schema

1. In your Supabase project, go to the SQL Editor
2. Copy the contents of `supabase/schema.sql`
3. Run the SQL to create all tables, indexes, and triggers

### 4. Get Mapbox Token

1. Create a free account at [mapbox.com](https://www.mapbox.com)
2. Get your access token from the Account page
3. Add it to `.env.local`:
   ```
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
   ```

### 5. Seed Demo Data

Install tsx for running TypeScript scripts:

```bash
npm install -D tsx
```

Run the seed script:

```bash
npx tsx scripts/seed-data.ts
```

This will populate your database with:
- 3 clients
- 10 sites (San Francisco Bay Area)
- 10 employees with profile photos
- 7 active shifts, 2 upcoming shifts, 1 unassigned employee
- 2-4 certifications per employee (with varied expiry dates)
- Sample documents

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Map View
- Click on site pins to view assigned staff
- Pins show counts for: on-shift staff, upcoming shifts, and certification alerts
- Click on an employee card to open their detailed profile

### Roster View
- Search employees by name
- Filter by:
  - Shift status (on shift, upcoming, unassigned)
  - Site
  - Client
  - Certification status (valid, expiring soon, expired)
  - Role
- Sort by name, shift start time, or certification expiry
- Click any row to view employee details

### Employee Profile Drawer
- View contact information
- See current assignment with site details
- Review all certifications with expiry status
- Access linked documents (contracts, licenses)
- Read employee notes

## Database Schema

- **clients**: Client organizations
- **sites**: Physical locations with lat/lng coordinates
- **employees**: Security personnel with roles and contact info
- **assignments**: Shift assignments linking employees to sites
- **certifications**: Employee certifications with auto-calculated status
- **documents**: File links for contracts, licenses, etc.

## Future Enhancements (Security Hardening)

- Role-Based Access Control (RBAC)
- SSO/MFA authentication
- Audit logging for all actions
- Data encryption at rest and in transit
- IP whitelisting
- Session management
- Compliance reporting

## License

Private - Internal Use Only
