/**
 * Seed script for demo data
 * Run with: npx tsx scripts/seed-data.ts
 *
 * Generates:
 * - 3 clients
 * - 10 sites (distributed across clients)
 * - 10 employees
 * - 7 active shifts, 2 upcoming, 1 unassigned employee
 * - 2-4 certifications per employee (varied expiry dates)
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Missing Supabase credentials in .env.local');
  console.error('Make sure you have set:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL');
  console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Demo data
const clients = [
  { name: 'TechCorp Industries' },
  { name: 'Metropolitan Bank Group' },
  { name: 'Luxury Estates LLC' },
];

const sites = [
  { name: 'Empire State Building', address: '350 5th Ave, New York, NY 10118', lat: 40.7484, lng: -73.9857, clientIndex: 0 },
  { name: 'One World Trade Center', address: '285 Fulton St, New York, NY 10007', lat: 40.7127, lng: -74.0134, clientIndex: 0 },
  { name: 'Hudson Yards Tower', address: '30 Hudson Yards, New York, NY 10001', lat: 40.7539, lng: -74.0014, clientIndex: 0 },
  { name: 'Metro Bank - Wall Street', address: '40 Wall St, New York, NY 10005', lat: 40.7068, lng: -74.0085, clientIndex: 1 },
  { name: 'Metro Bank - Midtown', address: '745 7th Ave, New York, NY 10019', lat: 40.7616, lng: -73.9821, clientIndex: 1 },
  { name: 'Metro Bank Vault Facility', address: '70 Pine St, New York, NY 10005', lat: 40.7065, lng: -74.0075, clientIndex: 1 },
  { name: 'Luxury Estates - Upper East Side', address: '740 Park Ave, New York, NY 10021', lat: 40.7700, lng: -73.9636, clientIndex: 2 },
  { name: 'Luxury Estates - Tribeca', address: '443 Greenwich St, New York, NY 10013', lat: 40.7222, lng: -74.0091, clientIndex: 2 },
  { name: 'Luxury Estates - Central Park West', address: '15 Central Park W, New York, NY 10023', lat: 40.7697, lng: -73.9818, clientIndex: 2 },
  { name: 'Luxury Estates - SoHo Penthouse', address: '60 Crosby St, New York, NY 10012', lat: 40.7227, lng: -73.9986, clientIndex: 2 },
];

const employees = [
  { first_name: 'Dwayne',    last_name: 'Johnson',    role: 'Senior Guard', photo: 'https://randomuser.me/api/portraits/men/1.jpg',   email: 'dwayne.johnson@silverseal.com',     phone: '(212) 555-0101' },
  { first_name: 'Scarlett',  last_name: 'Johansson',  role: 'Bodyguard',    photo: 'https://randomuser.me/api/portraits/women/1.jpg', email: 'scarlett.johansson@silverseal.com', phone: '(212) 555-0102' },
  { first_name: 'Idris',     last_name: 'Elba',       role: 'Guard',        photo: 'https://randomuser.me/api/portraits/men/2.jpg',   email: 'idris.elba@silverseal.com',         phone: '(212) 555-0103' },
  { first_name: 'Gal',       last_name: 'Gadot',      role: 'Supervisor',   photo: 'https://randomuser.me/api/portraits/women/2.jpg', email: 'gal.gadot@silverseal.com',          phone: '(212) 555-0104' },
  { first_name: 'Chris',     last_name: 'Hemsworth',  role: 'Guard',        photo: 'https://randomuser.me/api/portraits/men/3.jpg',   email: 'chris.hemsworth@silverseal.com',    phone: '(212) 555-0105' },
  { first_name: 'Charlize',  last_name: 'Theron',     role: 'Bodyguard',    photo: 'https://randomuser.me/api/portraits/women/3.jpg', email: 'charlize.theron@silverseal.com',    phone: '(212) 555-0106' },
  { first_name: 'Jason',     last_name: 'Statham',    role: 'Senior Guard', photo: 'https://randomuser.me/api/portraits/men/4.jpg',   email: 'jason.statham@silverseal.com',      phone: '(212) 555-0107' },
  { first_name: 'Zoe',       last_name: 'Saldana',    role: 'Guard',        photo: 'https://randomuser.me/api/portraits/women/4.jpg', email: 'zoe.saldana@silverseal.com',        phone: '(212) 555-0108' },
  { first_name: 'Tom',       last_name: 'Cruise',     role: 'Guard',        photo: 'https://randomuser.me/api/portraits/men/5.jpg',   email: 'tom.cruise@silverseal.com',         phone: '(212) 555-0109' },
  { first_name: 'Michelle',  last_name: 'Rodriguez',  role: 'Bodyguard',    photo: 'https://randomuser.me/api/portraits/women/5.jpg', email: 'michelle.rodriguez@silverseal.com', phone: '(212) 555-0110' },
];

const certTypes = [
  'Armed Security License',
  'CPR Certification',
  'First Aid',
  'Defensive Tactics',
  'Firearms Qualification',
  'Emergency Response',
  'Executive Protection',
  'Crowd Control',
];

async function seed() {
  console.log('🌱 Starting seed process...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await supabase.from('documents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('certifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('employees').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('sites').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Insert clients
  console.log('👥 Inserting clients...');
  const { data: clientData, error: clientError } = await (supabase as any)
    .from('clients')
    .insert(clients)
    .select();

  if (clientError) throw clientError;
  console.log(`✅ Inserted ${clientData.length} clients`);

  // Insert sites
  console.log('📍 Inserting sites...');
  const sitesWithClientIds = sites.map(site => ({
    name: site.name,
    address: site.address,
    latitude: site.lat,
    longitude: site.lng,
    client_id: clientData[site.clientIndex].id,
  }));

  const { data: siteData, error: siteError } = await (supabase as any)
    .from('sites')
    .insert(sitesWithClientIds)
    .select();

  if (siteError) throw siteError;
  console.log(`✅ Inserted ${siteData.length} sites`);

  // Insert employees
  console.log('👤 Inserting employees...');
  const tours = ['Tour 1', 'Tour 2', 'Tour 3', 'Museum'];
  const employeesData = employees.map((emp, i) => ({
    first_name: emp.first_name,
    last_name: emp.last_name,
    role: emp.role,
    profile_photo_url: emp.photo,
    contact_email: emp.email,
    contact_phone: emp.phone,
    status: 'active',
    tour: tours[i % tours.length],
    current_position: emp.role,
    fireguard: i % 3 === 0,
  }));

  const { data: employeeData, error: employeeError } = await (supabase as any)
    .from('employees')
    .insert(employeesData)
    .select();

  if (employeeError) throw employeeError;
  console.log(`✅ Inserted ${employeeData.length} employees`);

  // Insert certifications (2-4 per employee with varied expiry)
  console.log('📜 Inserting certifications...');
  const certifications = [];
  const now = new Date();

  for (const employee of employeeData) {
    const numCerts = Math.floor(Math.random() * 3) + 2; // 2-4 certs
    const selectedCerts = certTypes.sort(() => 0.5 - Math.random()).slice(0, numCerts);

    for (let i = 0; i < selectedCerts.length; i++) {
      const issuedDaysAgo = Math.floor(Math.random() * 365) + 180; // 180-545 days ago
      const issuedDate = new Date(now);
      issuedDate.setDate(issuedDate.getDate() - issuedDaysAgo);

      let expiryDate = new Date(issuedDate);

      // Vary expiry dates: some expired, some expiring soon, some valid
      const expiryType = Math.random();
      if (expiryType < 0.2) {
        // 20% expired (already past)
        expiryDate.setDate(expiryDate.getDate() + 365 - Math.floor(Math.random() * 60));
      } else if (expiryType < 0.4) {
        // 20% expiring soon (within 30 days)
        expiryDate.setDate(now.getDate() + Math.floor(Math.random() * 30) + 1);
      } else {
        // 60% valid (31+ days in future)
        expiryDate.setDate(now.getDate() + Math.floor(Math.random() * 335) + 31);
      }

      certifications.push({
        employee_id: employee.id,
        cert_type: selectedCerts[i],
        issued_date: issuedDate.toISOString().split('T')[0],
        expiry_date: expiryDate.toISOString().split('T')[0],
      });
    }
  }

  const { error: certError } = await (supabase as any)
    .from('certifications')
    .insert(certifications);

  if (certError) throw certError;
  console.log(`✅ Inserted ${certifications.length} certifications`);

  // Insert assignments (7 active, 2 upcoming, 1 unassigned)
  console.log('📅 Inserting assignments...');
  const assignments = [];

  // 7 active shifts (currently ongoing)
  for (let i = 0; i < 7; i++) {
    const startTime = new Date(now);
    startTime.setHours(now.getHours() - Math.floor(Math.random() * 4) - 1); // Started 1-5 hours ago

    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 8); // 8-hour shift

    assignments.push({
      employee_id: employeeData[i].id,
      site_id: siteData[i].id,
      shift_label: ['Morning Shift', 'Day Shift', 'Evening Shift'][Math.floor(Math.random() * 3)],
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
    });
  }

  // 2 upcoming shifts (starting in next 24 hours)
  for (let i = 7; i < 9; i++) {
    const startTime = new Date(now);
    startTime.setHours(now.getHours() + Math.floor(Math.random() * 12) + 2); // Starts 2-14 hours from now

    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 8);

    assignments.push({
      employee_id: employeeData[i].id,
      site_id: siteData[i].id,
      shift_label: ['Night Shift', 'Overnight Watch', 'Late Shift'][Math.floor(Math.random() * 3)],
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
    });
  }

  // Employee at index 9 is unassigned (no assignment created)

  const { error: assignmentError } = await (supabase as any)
    .from('assignments')
    .insert(assignments);

  if (assignmentError) throw assignmentError;
  console.log(`✅ Inserted ${assignments.length} assignments (1 employee unassigned)`);

  // Insert sample documents
  console.log('📄 Inserting documents...');
  const documents = [];

  // Add 1-2 documents per employee
  for (const employee of employeeData.slice(0, 5)) {
    documents.push({
      name: `${employee.last_name}_Contract_2024.pdf`,
      file_url: `https://example.com/docs/contracts/${employee.id}.pdf`,
      document_type: 'contract',
      employee_id: employee.id,
      site_id: null,
    });

    if (Math.random() > 0.5) {
      documents.push({
        name: `${employee.last_name}_License.pdf`,
        file_url: `https://example.com/docs/licenses/${employee.id}.pdf`,
        document_type: 'license',
        employee_id: employee.id,
        site_id: null,
      });
    }
  }

  const { error: docError } = await (supabase as any)
    .from('documents')
    .insert(documents);

  if (docError) throw docError;
  console.log(`✅ Inserted ${documents.length} documents`);

  console.log('🎉 Seed completed successfully!');
  console.log('\nSummary:');
  console.log(`  - ${clientData.length} clients`);
  console.log(`  - ${siteData.length} sites`);
  console.log(`  - ${employeeData.length} employees`);
  console.log(`  - ${certifications.length} certifications`);
  console.log(`  - ${assignments.length} assignments (7 active, 2 upcoming, 1 unassigned)`);
  console.log(`  - ${documents.length} documents`);
}

seed().catch(console.error);

