'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User, Mail, Phone, Camera, FileText, Upload,
  Calendar, Home, Briefcase, Flame, PlusCircle, Trash2, Award,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ThemeToggle } from '@/components/ThemeToggle';

/* ── Types ──────────────────────────────────────────────────── */
interface CertEntry { id?: string; name: string; date_obtained: string; expiration_date: string; }

interface FormData {
  first_name: string; last_name: string; role: string; status: string;
  contact_email: string; contact_phone: string; profile_photo_url: string;
  address_line1: string; address_line2: string; city: string; state: string;
  postal_code: string; country: string; tour: string; current_position: string;
  fireguard: boolean; training_start_date: string; official_start_date: string;
  date_inactive: string; date_reactivated: string; notice_file_url: string; notes: string;
  rdo_monday: boolean; rdo_tuesday: boolean; rdo_wednesday: boolean; rdo_thursday: boolean;
  rdo_friday: boolean; rdo_saturday: boolean; rdo_sunday: boolean;
}

const BLANK: FormData = {
  first_name: '', last_name: '', role: 'Guard', status: 'active',
  contact_email: '', contact_phone: '', profile_photo_url: '',
  address_line1: '', address_line2: '', city: '', state: '', postal_code: '', country: '',
  tour: '', current_position: '', fireguard: false,
  training_start_date: '', official_start_date: '', date_inactive: '', date_reactivated: '',
  notice_file_url: '', notes: '',
  rdo_monday: false, rdo_tuesday: false, rdo_wednesday: false, rdo_thursday: false,
  rdo_friday: false, rdo_saturday: false, rdo_sunday: false,
};

const DEFAULT_CERTS: CertEntry[] = [
  { name: 'CPR Training',              date_obtained: '', expiration_date: '' },
  { name: 'Customer Service Training', date_obtained: '', expiration_date: '' },
  { name: 'Stair Chair Training',      date_obtained: '', expiration_date: '' },
  { name: 'Zoho Training',             date_obtained: '', expiration_date: '' },
  { name: 'Leadership Training',       date_obtained: '', expiration_date: '' },
  { name: 'AMAG/Symmetry Training',    date_obtained: '', expiration_date: '' },
  { name: 'Allegion Training',         date_obtained: '', expiration_date: '' },
  { name: 'Safe Zones Training',       date_obtained: '', expiration_date: '' },
  { name: 'FERPA Training',            date_obtained: '', expiration_date: '' },
];

interface Props {
  employee?: any;               // null/undefined = add mode
  existingCerts?: any[];        // raw DB rows from certifications
}

export default function EmployeeFormPage({ employee, existingCerts }: Props) {
  const router = useRouter();
  const isEdit = !!employee?.id;

  const [tab, setTab] = useState<'main' | 'certs'>('main');
  const [form, setForm] = useState<FormData>(BLANK);
  const [certs, setCerts] = useState<CertEntry[]>(DEFAULT_CERTS.map(d => ({ ...d })));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingNotice, setUploadingNotice] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Pre-fill when editing */
  useEffect(() => {
    if (employee) {
      setForm({
        first_name: employee.first_name ?? '', last_name: employee.last_name ?? '',
        role: employee.role ?? 'Guard', status: employee.status ?? 'active',
        contact_email: employee.contact_email ?? '', contact_phone: employee.contact_phone ?? '',
        profile_photo_url: employee.profile_photo_url ?? '',
        address_line1: employee.address_line1 ?? '', address_line2: employee.address_line2 ?? '',
        city: employee.city ?? '', state: employee.state ?? '',
        postal_code: employee.postal_code ?? '', country: employee.country ?? '',
        tour: employee.tour ?? '', current_position: employee.current_position ?? '',
        fireguard: !!employee.fireguard,
        training_start_date: employee.training_start_date ?? '',
        official_start_date: employee.official_start_date ?? '',
        date_inactive: employee.date_inactive ?? '', date_reactivated: employee.date_reactivated ?? '',
        notice_file_url: employee.notice_file_url ?? '', notes: employee.notes ?? '',
        rdo_monday: !!employee.rdo_monday, rdo_tuesday: !!employee.rdo_tuesday,
        rdo_wednesday: !!employee.rdo_wednesday, rdo_thursday: !!employee.rdo_thursday,
        rdo_friday: !!employee.rdo_friday, rdo_saturday: !!employee.rdo_saturday,
        rdo_sunday: !!employee.rdo_sunday,
      });
    }
    if (existingCerts && existingCerts.length > 0) {
      setCerts(existingCerts.map((c: any) => ({
        id: c.id, name: c.cert_type,
        date_obtained: c.issued_date ?? '', expiration_date: c.expiry_date ?? '',
      })));
    } else {
      setCerts(DEFAULT_CERTS.map(d => ({ ...d })));
    }
  }, [employee, existingCerts]);

  /* Helpers */
  const set = (key: keyof FormData, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024)    { setError('Image must be under 5 MB');     return; }
    setUploading(true); setError(null);
    try {
      const ext = file.name.split('.').pop();
      const path = `employee-photos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: up } = await supabase.storage.from('employee-photos').upload(path, file, { upsert: false });
      if (up) throw up;
      const { data: { publicUrl } } = supabase.storage.from('employee-photos').getPublicUrl(path);
      set('profile_photo_url', publicUrl);
    } catch (err: any) { setError(err.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const uploadNotice = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError('Notice must be under 10 MB'); return; }
    setUploadingNotice(true); setError(null);
    try {
      const ext = file.name.split('.').pop();
      const path = `employee-notices/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: up } = await supabase.storage.from('employee-photos').upload(path, file, { upsert: false });
      if (up) throw up;
      const { data: { publicUrl } } = supabase.storage.from('employee-photos').getPublicUrl(path);
      set('notice_file_url', publicUrl);
    } catch (err: any) { setError(err.message || 'Upload failed'); }
    finally { setUploadingNotice(false); }
  };

  /* Save */
  const handleSave = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError('First and last name are required'); return;
    }
    setSaving(true); setError(null);
    try {
      const payload = {
        first_name: form.first_name.trim(), last_name: form.last_name.trim(),
        role: form.role, status: form.status,
        contact_email: form.contact_email || null, contact_phone: form.contact_phone || null,
        profile_photo_url: form.profile_photo_url || null,
        address_line1: form.address_line1 || null, address_line2: form.address_line2 || null,
        city: form.city || null, state: form.state || null,
        postal_code: form.postal_code || null, country: form.country || null,
        tour: form.tour || null, current_position: form.current_position || null,
        fireguard: form.fireguard,
        training_start_date: form.training_start_date || null,
        official_start_date: form.official_start_date || null,
        date_inactive: form.date_inactive || null,
        date_reactivated: form.date_reactivated || null,
        notice_file_url: form.notice_file_url || null,
        notes: form.notes || null,
        rdo_monday: form.rdo_monday, rdo_tuesday: form.rdo_tuesday,
        rdo_wednesday: form.rdo_wednesday, rdo_thursday: form.rdo_thursday,
        rdo_friday: form.rdo_friday, rdo_saturday: form.rdo_saturday,
        rdo_sunday: form.rdo_sunday,
      };

      let employeeId = employee?.id;
      if (employeeId) {
        const { error: e } = await (supabase as any).from('employees').update(payload).eq('id', employeeId);
        if (e) throw e;
      } else {
        const { data, error: e } = await (supabase as any).from('employees').insert(payload).select('id').single();
        if (e) throw e;
        employeeId = data.id;
      }

      /* Save certs */
      if (employeeId) {
        await (supabase as any).from('certifications').delete().eq('employee_id', employeeId);
        const rows = certs
          .filter(c => c.name.trim())
          .map(c => ({
            employee_id: employeeId,
            cert_type: c.name.trim(),
            issued_date: c.date_obtained || null,
            expiry_date: c.expiration_date || null,
          }));
        if (rows.length > 0) {
          const { error: ce } = await (supabase as any).from('certifications').insert(rows);
          if (ce) throw ce;
        }
      }

      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to save employee');
    } finally {
      setSaving(false);
    }
  };

  /* Shared input classes */
  const inp  = 'w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition';
  const lbl  = 'block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5';
  const card = 'bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6';

  const ROLES    = ['Guard', 'Senior Guard', 'Bodyguard', 'Supervisor', 'Manager'];
  const TOURS    = ['Tour 1', 'Tour 2', 'Tour 3', 'Museum'];
  const DAYS     = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as const;

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col">

      {/* ── Sticky Header ──────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
          {/* Logo — click to return to dashboard */}
          <button
            onClick={() => router.push('/')}
            className="shrink-0 transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500/40 rounded-lg"
            aria-label="Back to dashboard"
            title="Back to dashboard"
          >
            <img src="/assets/Silverseal_Logo.png" alt="Silverseal" className="h-9 w-auto" />
          </button>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">
              {isEdit ? `Edit — ${employee.first_name} ${employee.last_name}` : 'Add New Employee'}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
              {isEdit ? 'Update employee profile and certifications' : 'Fill in the employee details across the tabs below'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Employee'}
            </button>
          </div>
        </div>
      </header>

      {/* ── Tab Bar ────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-6 flex gap-0">
          {(['main','certs'] as const).map((t) => {
            const labels: Record<string, string> = { main: 'Main Information', certs: 'Certifications & Training' };
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  tab === t
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300'
                }`}
              >
                {labels[t]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Page Body ──────────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-5 py-4 rounded-2xl text-sm">
            {error}
          </div>
        )}

        {/* ════════ MAIN INFO TAB ════════ */}
        {tab === 'main' && (
          <div className="space-y-6">

            {/* Identity card — photo + name + role/status/tour */}
            <div className={`${card} flex flex-col sm:flex-row gap-6`}>
              {/* Photo column */}
              <div className="flex flex-col items-center gap-3 shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-gray-100 dark:bg-slate-700 overflow-hidden flex items-center justify-center ring-2 ring-gray-200 dark:ring-slate-600">
                  {form.profile_photo_url
                    ? <img src={form.profile_photo_url} alt="Photo" className="w-full h-full object-cover" />
                    : <User className="w-10 h-10 text-gray-400" />}
                </div>
                <input id="photo-up" type="file" accept="image/*" onChange={uploadPhoto} className="hidden" disabled={uploading} />
                <label htmlFor="photo-up" className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <Camera className="w-3.5 h-3.5" />
                  {uploading ? 'Uploading…' : 'Upload Photo'}
                </label>
                <p className="text-[10px] text-gray-400 text-center">JPG, PNG · max 5 MB</p>
              </div>

              {/* Fields grid */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className={lbl}>First Name *</label>
                  <input type="text" required value={form.first_name} onChange={e => set('first_name', e.target.value)} className={inp} placeholder="John" />
                </div>
                <div>
                  <label className={lbl}>Last Name *</label>
                  <input type="text" required value={form.last_name} onChange={e => set('last_name', e.target.value)} className={inp} placeholder="Doe" />
                </div>
                <div>
                  <label className={lbl}>Role *</label>
                  <select value={form.role} onChange={e => set('role', e.target.value)} className={inp}>
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Status *</label>
                  <select value={form.status} onChange={e => set('status', e.target.value)} className={inp}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className={lbl}>Tour</label>
                  <select value={form.tour} onChange={e => set('tour', e.target.value)} className={inp}>
                    <option value="">Select tour…</option>
                    {TOURS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Current Position</label>
                  <input type="text" value={form.current_position} onChange={e => set('current_position', e.target.value)} className={inp} placeholder="Lobby Officer" />
                </div>
                {/* Fireguard toggle — spans full row */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="flex items-center gap-3 cursor-pointer group w-fit">
                    <input type="checkbox" checked={form.fireguard} onChange={e => set('fireguard', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                    <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-orange-500 transition-colors">
                      <Flame className="w-4 h-4 text-orange-500" /> Fireguard Certified
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className={card}>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
                <Mail className="w-4 h-4 text-blue-500" /> Contact Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Email</label>
                  <input type="email" value={form.contact_email} onChange={e => set('contact_email', e.target.value)} className={inp} placeholder="john@example.com" />
                </div>
                <div>
                  <label className={lbl}>Phone</label>
                  <input type="tel" value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)} className={inp} placeholder="(212) 555-0100" />
                </div>
              </div>
            </div>

            {/* Address + Days Off side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Address — 2/3 width */}
              <div className={`${card} lg:col-span-2`}>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
                  <Home className="w-4 h-4 text-blue-500" /> Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className={lbl}>Address Line 1</label>
                    <input type="text" value={form.address_line1} onChange={e => set('address_line1', e.target.value)} className={inp} placeholder="123 Main St" />
                  </div>
                  <div>
                    <label className={lbl}>Address Line 2</label>
                    <input type="text" value={form.address_line2} onChange={e => set('address_line2', e.target.value)} className={inp} placeholder="Apt 4B" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>City / District</label>
                      <input type="text" value={form.city} onChange={e => set('city', e.target.value)} className={inp} placeholder="Manhattan" />
                    </div>
                    <div>
                      <label className={lbl}>State / Province</label>
                      <input type="text" value={form.state} onChange={e => set('state', e.target.value)} className={inp} placeholder="NY" />
                    </div>
                    <div>
                      <label className={lbl}>Postal Code</label>
                      <input type="text" value={form.postal_code} onChange={e => set('postal_code', e.target.value)} className={inp} placeholder="10001" />
                    </div>
                    <div>
                      <label className={lbl}>Country</label>
                      <input type="text" value={form.country} onChange={e => set('country', e.target.value)} className={inp} placeholder="USA" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Regular Days Off — 1/3 width */}
              <div className={card}>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  <Calendar className="w-4 h-4 text-blue-500" /> Regular Days Off
                </h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Days this employee is normally off duty.</p>
                <div className="space-y-3">
                  {DAYS.map(day => (
                    <label key={day} className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox"
                        checked={form[`rdo_${day}` as keyof FormData] as boolean}
                        onChange={e => set(`rdo_${day}` as keyof FormData, e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200 capitalize group-hover:text-blue-600 transition-colors">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Key Dates */}
            <div className={card}>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
                <Briefcase className="w-4 h-4 text-blue-500" /> Key Dates
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { key: 'training_start_date',  label: 'Training Start Date' },
                  { key: 'official_start_date',  label: 'Official Start Date' },
                  { key: 'date_inactive',         label: 'Date Inactive' },
                  { key: 'date_reactivated',      label: 'Date Re-activated' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className={lbl}>{label}</label>
                    <input type="date"
                      value={form[key as keyof FormData] as string}
                      onChange={e => set(key as keyof FormData, e.target.value)}
                      className={inp}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Documents + Notes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={card}>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
                  <FileText className="w-4 h-4 text-blue-500" /> NOTICE Document
                </h2>
                <input id="notice-up" type="file" onChange={uploadNotice} className="hidden" disabled={uploadingNotice} />
                <label htmlFor="notice-up" className={`flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors ${uploadingNotice ? 'opacity-50 pointer-events-none' : ''}`}>
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{uploadingNotice ? 'Uploading…' : 'Click to upload NOTICE file'}</span>
                </label>
                <p className="text-xs text-gray-400 mt-2">PDF, DOC, or image · max 10 MB</p>
                {form.notice_file_url && (
                  <a href={form.notice_file_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-3">
                    <FileText className="w-4 h-4" /> View uploaded file
                  </a>
                )}
              </div>

              <div className={card}>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
                  <FileText className="w-4 h-4 text-blue-500" /> Notes
                </h2>
                <textarea
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                  rows={6}
                  className={inp}
                  placeholder="Additional notes about this employee…"
                />
              </div>
            </div>

          </div>
        )}

        {/* ════════ CERTS TAB ════════ */}
        {tab === 'certs' && (
          <div className={card}>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-6">
              <Award className="w-4 h-4 text-blue-500" /> Certifications / Training
            </h2>

            {/* Column headers */}
            <div className="grid grid-cols-[1fr_180px_180px_40px] gap-3 px-1 mb-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Certification / Training</span>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date Obtained</span>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Expiration Date</span>
              <span />
            </div>

            {/* Rows */}
            <div className="space-y-2.5">
              {certs.map((cert, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_180px_180px_40px] gap-3 items-center">
                  <input type="text" value={cert.name}
                    onChange={e => { const u = [...certs]; u[idx] = { ...u[idx], name: e.target.value }; setCerts(u); }}
                    className={inp} placeholder="Certification name" />
                  <input type="date" value={cert.date_obtained}
                    onChange={e => { const u = [...certs]; u[idx] = { ...u[idx], date_obtained: e.target.value }; setCerts(u); }}
                    className={inp} />
                  <input type="date" value={cert.expiration_date}
                    onChange={e => { const u = [...certs]; u[idx] = { ...u[idx], expiration_date: e.target.value }; setCerts(u); }}
                    className={inp} />
                  <button type="button" onClick={() => setCerts(certs.filter((_, i) => i !== idx))}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add row */}
            <button type="button"
              onClick={() => setCerts([...certs, { name: '', date_obtained: '', expiration_date: '' }])}
              className="mt-4 flex items-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-slate-600 text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 rounded-xl transition-colors text-sm font-medium justify-center">
              <PlusCircle className="w-4 h-4" /> Add Certification / Training
            </button>
          </div>
        )}

        {/* Bottom save bar */}
        <div className="flex justify-end gap-3 pt-2 pb-8">
          <button onClick={() => router.push('/')}
            className="px-6 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-gray-200 dark:border-slate-700">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-7 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Employee'}
          </button>
        </div>

      </main>
    </div>
  );
}
