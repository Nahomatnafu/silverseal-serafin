# Supabase Storage Setup for Employee Photos

## Quick Setup (5 minutes)

### Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `xtfqkoecatbequuexeau`
3. Click **Storage** in the left sidebar
4. Click **"New bucket"** button
5. Fill in:
   - **Name**: `employee-photos`
   - **Public bucket**: ✅ **Check this box** (allows public access to photos)
6. Click **"Create bucket"**

### Step 2: Set Storage Policies (Optional - for security)

If you want to restrict who can upload/delete photos:

1. Click on the `employee-photos` bucket
2. Go to **Policies** tab
3. Click **"New Policy"**
4. You can set up policies like:
   - Allow anyone to view photos (SELECT)
   - Allow only authenticated users to upload (INSERT)
   - Allow only authenticated users to delete (DELETE)

For now, since you're the only admin, you can skip this step.

### Step 3: Test the Upload

1. Run your app: `npm run dev`
2. Click **"Add Employee"**
3. Click the **"Click to upload photo from computer"** area
4. Select an image from your computer
5. Wait for upload to complete (you'll see a preview)
6. Save the employee

### Troubleshooting

**If upload fails:**
- Make sure the bucket is named exactly `employee-photos`
- Make sure "Public bucket" is checked
- Check browser console for errors
- Verify your Supabase credentials in `.env.local`

**Storage limits on free tier:**
- 1GB total storage
- Should be plenty for employee photos (each photo ~100-500KB)

### Alternative: Use SQL Editor

If you prefer SQL, run this in Supabase SQL Editor:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('employee-photos', 'employee-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'employee-photos');

-- Allow authenticated uploads
CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'employee-photos');
```

---

**That's it!** Your employee photo upload feature is ready to use.

