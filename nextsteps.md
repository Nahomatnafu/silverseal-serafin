# Silverseal – Short-Term Next Steps (Phase 1)

## Overview
The v02 dashboard skeleton is in place (sidebar, dark/light mode, Map, Roster, Calendar, RDO views).
The priorities below combine internal bugs found during code review with manager feedback from the live site.
Fix existing bugs first, then rebuild the Add Employee form, then tackle map and filter improvements.

---

## Priority 1 – Fix Existing Bugs (breaks what's already built)

### 1a. Dark / Light mode toggle does not work
- **Reported by**: Manager (live site feedback)
- **File**: `components/ThemeToggle.tsx`, `components/ThemeProvider.tsx`, `app/layout.tsx`
- **Problem**: The toggle button appears in the sidebar but switching it has no visible effect on the page.
- **Fix**: Verify `ThemeProvider` wraps the root layout, confirm `next-themes` `attribute="class"` is set, and ensure Tailwind `darkMode: 'class'` is configured in `tailwind.config`.

### 1b. Employee `name` field used inconsistently
- **Files**: `components/CalendarView.tsx`, `components/RdoView.tsx`
- **Problem**: Code references `employee.first_name` / `employee.last_name`, but the DB and all other components use a single `name` field. Calendar events and RDO rows show "undefined undefined".
- **Fix**: Replace `employee?.first_name + ' ' + employee?.last_name` → `employee?.name` in both files.
- **Note**: The DB schema will be updated to store `first_name` and `last_name` separately (see Priority 2), so this fix is a bridge until then.

### 1c. RDO fields silently dropped on save
- **File**: `app/page.tsx` – `handleSaveEmployee()`
- **Problem**: The form collects `rdo_monday … rdo_sunday` toggles, but the save handler only writes base fields. RDO data is lost on every save.
- **Fix**: Include all `rdo_*` boolean fields in both the `update` and `insert` payloads.

---

## Priority 2 – Rebuild the "Add Employee" Form (most important feature)

The current form only captures name, role, email, phone, photo, status, and notes.
The manager requires a much richer set of fields. The form must be rebuilt before any employees are entered for real.

### 2a. Split `name` into `first_name` + `last_name` in the database
- Update the `employees` table: drop the `name` column, add `first_name TEXT NOT NULL` and `last_name TEXT NOT NULL`.
- Update all components and the seed script to use the two-part name.
- Display name throughout the UI as `first_name + ' ' + last_name`.

### 2b. New "Main Information" fields for the Add/Edit Employee form
The following fields must be added. They replace or extend the current minimal form.

**Personal & Contact**
- First Name *(required)*
- Last Name *(required)*
- Headshot Photo *(file upload, stored in Supabase Storage)*
- Address Line 1
- Address Line 2
- City / District
- State / Province
- Postal Code
- Country
- Phone
- Email
- Status — dropdown: `Active` / `Inactive`

**Assignment & Schedule**
- Tour — dropdown: `Tour 1` / `Tour 2` / `Tour 3` / `Museum`
- Current Position *(free text, required)*
- Fireguard — Yes / No toggle

**Key Dates** *(all use a date-picker)*
- Training Start Date
- Official Start Date
- Date Inactive
- Date Re-activated

**Administrative**
- NOTICE — file upload (attach a notice document)

### 2c. DB schema changes needed for 2b
The following columns need to be added to the `employees` table (in addition to the `first_name` / `last_name` split from 2a):
- `address_line1 TEXT`
- `address_line2 TEXT`
- `city TEXT`
- `state TEXT`
- `postal_code TEXT`
- `country TEXT`
- `tour TEXT` — values: 'Tour 1' | 'Tour 2' | 'Tour 3' | 'Museum'
- `current_position TEXT`
- `fireguard BOOLEAN DEFAULT false`
- `training_start_date DATE`
- `official_start_date DATE`
- `date_inactive DATE`
- `date_reactivated DATE`
- `notice_file_url TEXT`

### 2d. Certificates & Trainings tab (to be tackled in Phase 2)
The following certifications must be trackable per employee, with both a record (type, issued date, expiry date) and an uploaded image/file of the actual document:
- Unrestricted Conceal Carry Firearm License (CCW)
- H.R. 218
- Armed Guard Card
- Security Guard License
- First Aid / CPR / AED

Each certification entry: cert type, issued date, expiry date, file upload (image or PDF).
On save, insert the employee first, then bulk-insert pending certifications. *(Deferred to Phase 2.)*

### 2e. Additional Files / Documents tab (to be tackled in Phase 2)
The following documents must be uploadable and stored per employee:
- Headshot Photo *(also collected in Main Info)*
- Resume
- Armed Guard Card
- HR218 (Front) and HR218 (Back) — two separate uploads
- CCW
- Private Investigator License
- Retired ID Card
- Driver's License
- W9

Each file: document label, file upload, stored in Supabase Storage under `employee-photos` or a new `employee-documents` bucket. *(Deferred to Phase 2.)*

### 2f. Performance Counseling tab (to be tackled in Phase 2)
- Simple text-area note for now.
- Full disciplinary / commendation records are a later phase.

---

## Priority 3 – Map View Improvements

### 3a. Map is grey and white — add color / style
- **Reported by**: Manager ("Is there any way we could add color to this?")
- The current Mapbox style is `light-v11` which is very neutral.
- Switch to a more vibrant Mapbox style (e.g., `streets-v12`, `outdoors-v12`, or a custom Mapbox Studio style).
- Confirm the map is centered on Manhattan (New York City), not San Francisco — the seed data needs to be updated or the default center changed to `[-74.0060, 40.7128]`.

### 3b. Filters — make more intuitive and add more options
- **Reported by**: Manager ("Let's improve the filters section")
- Current filter options: Shift Status, Client.
- Filters to add or improve:
  - **Month selector** — filter assignments/sites by a chosen month
  - **Tour filter** — filter by Tour 1, Tour 2, Tour 3, Museum (once Tour field is added to employees)
  - **Role filter** — filter map pins by employee role (Guard, Supervisor, etc.)
  - **Certification alert filter** — show only sites with expiring or expired certs (already partially exists, make it clearer)
  - **Search by site name** — text search in addition to dropdown
- Move filters from a floating panel to a cleaner inline toolbar or a collapsible side panel so all options are visible at once.

---

## Priority 4 – Shift Management (map accuracy depends on this)

### 4a. Shift Assignment inside the Add Employee form
- Add a "Shift" section or tab to the employee form.
- Fields: Site (dropdown), Shift Label, Start Time, End Time, Recurring toggle (days + time pattern).
- On save, insert the assignment row alongside the employee record.

### 4b. Edit / Reassign shift from the Employee Drawer
- Add an "Edit Shift" button in the Current Assignment section of the drawer.
- Opens a lightweight modal: Site selector, Shift Label, Start / End times.
- On save, upserts the `assignments` row; `loadData()` refreshes map pins automatically.

### 4c. Recurring weekly shift pattern
- Current schema stores one-off timestamps per assignment, which does not scale for 150 guards on weekly rotations.
- Add columns to `assignments`: `recurrence_type` ('none' | 'weekly'), `recurrence_days` (JSON array of day abbreviations), `shift_start_hour`, `shift_end_hour`.
- Update `isShiftActive()` in `lib/utils.ts` to match recurring patterns against the current day and time.

---

## Priority 5 – General UX Polish

### 5a. Calendar color coding and tooltips
- Color-code calendar events by site or tour.
- Add a hover tooltip showing employee name, site, and shift times.

### 5b. RDO View — clickable rows
- Make each employee row clickable to open the Employee Drawer (same behavior as Roster View).

### 5c. Empty-state messages
- All views (Roster, Calendar, RDO) should show a clear, friendly message when no data is found — not a blank screen.

### 5d. Replace browser confirm() dialogs
- Replace `window.confirm()` delete prompts in `EmployeeDrawer` with a styled in-app confirmation modal.

---

## What Is NOT in Scope for Phase 1
- Authentication and Row-Level Security (deferred to production hardening)
- Reporting or data export
- Client and Site CRUD (manager does not need to add/edit sites yet)
- Performance Counseling formal records (text note stub is sufficient for now)
- Notifications / email alerts for expiring certifications
