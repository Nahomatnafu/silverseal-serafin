'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle, PlusCircle, Search, Trash2, Upload, Paperclip,
  ChevronDown, ChevronUp, User, X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

/* ── Constants ──────────────────────────────────────────────── */
const COUNSELING_TYPES = [
  'Verbal Warning', 'Written Warning', 'Final Warning',
  'Suspension', 'Termination Warning', 'Commendation', 'General Counseling',
];

const TYPE_BADGE: Record<string, string> = {
  'Verbal Warning':      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  'Written Warning':     'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  'Final Warning':       'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  'Suspension':          'bg-red-200 text-red-900 dark:bg-red-900/60 dark:text-red-200',
  'Termination Warning': 'bg-red-300 text-red-950 dark:bg-red-900/80 dark:text-red-100',
  'Commendation':        'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  'General Counseling':  'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
};

const BLANK = {
  employee_id: '', infraction_datetime: '', given_by: '',
  counseling_type: 'Verbal Warning', details: '', actions_taken: '', file_url: '',
};

/* ── Shared style tokens ────────────────────────────────────── */
const card = 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm';
const inp  = 'w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40';
const lbl  = 'block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1';

interface Props { employees: any[]; }

export default function CounselingView({ employees }: Props) {
  const [records, setRecords]         = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState({ ...BLANK });
  const [saving, setSaving]           = useState(false);
  const [uploading, setUploading]     = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [search, setSearch]           = useState('');
  const [filterType, setFilterType]   = useState('All');

  /* Fetch all records with employee info */
  const fetchRecords = async () => {
    setLoading(true);
    const { data, error: e } = await (supabase as any)
      .from('counseling_records')
      .select('*, employee:employees(id, first_name, last_name, profile_photo_url)')
      .order('infraction_datetime', { ascending: false });
    if (!e) setRecords(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchRecords(); }, []);

  /* Filtered view */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return records.filter(r => {
      const name = `${r.employee?.first_name ?? ''} ${r.employee?.last_name ?? ''}`.toLowerCase();
      const matchSearch = !q || name.includes(q) || r.given_by?.toLowerCase().includes(q) || r.details?.toLowerCase().includes(q);
      const matchType = filterType === 'All' || r.counseling_type === filterType;
      return matchSearch && matchType;
    });
  }, [records, search, filterType]);

  /* File upload */
  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError('File must be under 10 MB'); return; }
    setUploading(true); setError(null);
    try {
      const ext = file.name.split('.').pop();
      const path = `counseling-docs/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: up } = await supabase.storage.from('employee-photos').upload(path, file, { upsert: false });
      if (up) throw up;
      const { data: { publicUrl } } = supabase.storage.from('employee-photos').getPublicUrl(path);
      setForm(p => ({ ...p, file_url: publicUrl }));
    } catch (err: any) { setError(err.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  /* Save record */
  const handleSave = async () => {
    if (!form.employee_id)           { setError('Select an employee'); return; }
    if (!form.infraction_datetime)   { setError('Date & time is required'); return; }
    if (!form.given_by.trim())       { setError('Given By is required'); return; }
    setSaving(true); setError(null);
    try {
      const { error: e } = await (supabase as any).from('counseling_records').insert({
        employee_id: form.employee_id, infraction_datetime: form.infraction_datetime,
        given_by: form.given_by.trim(), counseling_type: form.counseling_type,
        details: form.details || null, actions_taken: form.actions_taken || null,
        file_url: form.file_url || null,
      });
      if (e) throw e;
      setForm({ ...BLANK }); setShowForm(false);
      await fetchRecords();
    } catch (err: any) { setError(err.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  /* Delete record */
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this counseling record? This cannot be undone.')) return;
    await (supabase as any).from('counseling_records').delete().eq('id', id);
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-slate-950 p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Performance Counseling
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {records.length} record{records.length !== 1 ? 's' : ''} across all employees
          </p>
        </div>
        <button
          onClick={() => { setShowForm(v => !v); setError(null); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Add Record
          {showForm ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
        </button>
      </div>

      {/* Add Record Form */}
      {showForm && (
        <div className={`${card} border-blue-200 dark:border-blue-800`}>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-5 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-blue-500" /> New Counseling Record
          </h3>
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>
          )}
          <div className="space-y-4">
            {/* Row 1: employee + type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Employee *</label>
                <select value={form.employee_id} onChange={e => setForm(p => ({ ...p, employee_id: e.target.value }))} className={inp}>
                  <option value="">— Select employee —</option>
                  {[...employees].sort((a, b) => `${a.last_name}${a.first_name}`.localeCompare(`${b.last_name}${b.first_name}`)).map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.last_name}, {emp.first_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lbl}>Type of Counseling *</label>
                <select value={form.counseling_type} onChange={e => setForm(p => ({ ...p, counseling_type: e.target.value }))} className={inp}>
                  {COUNSELING_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            {/* Row 2: datetime + given by */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Date &amp; Time of Infraction *</label>
                <input type="datetime-local" value={form.infraction_datetime} onChange={e => setForm(p => ({ ...p, infraction_datetime: e.target.value }))} className={inp} />
              </div>
              <div>
                <label className={lbl}>Given By *</label>
                <input type="text" value={form.given_by} onChange={e => setForm(p => ({ ...p, given_by: e.target.value }))} className={inp} placeholder="Supervisor / Manager name" />
              </div>
            </div>
            {/* Details */}
            <div>
              <label className={lbl}>Details</label>
              <textarea value={form.details} onChange={e => setForm(p => ({ ...p, details: e.target.value }))} rows={3} className={inp} placeholder="Describe the incident or commendation in detail…" />
            </div>
            {/* Actions Taken */}
            <div>
              <label className={lbl}>Actions Taken by Security</label>
              <textarea value={form.actions_taken} onChange={e => setForm(p => ({ ...p, actions_taken: e.target.value }))} rows={2} className={inp} placeholder="Steps taken by management or security team…" />
            </div>
            {/* File upload */}
            <div>
              <label className={lbl}>Supporting Document</label>
              <input id="counsel-file" type="file" onChange={uploadFile} className="hidden" disabled={uploading} />
              <label htmlFor="counsel-file" className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors text-sm text-gray-500 dark:text-gray-400 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading…' : form.file_url ? 'Replace file' : 'Click to upload a document'}
              </label>
              {form.file_url && (
                <a href={form.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2">
                  <Paperclip className="w-3.5 h-3.5" /> View uploaded file
                </a>
              )}
            </div>
            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-slate-700">
              <button type="button" onClick={() => { setShowForm(false); setForm({ ...BLANK }); setError(null); }}
                className="px-5 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors border border-gray-200 dark:border-slate-600">
                Cancel
              </button>
              <button type="button" onClick={handleSave} disabled={saving}
                className="px-6 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2">
                {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {saving ? 'Saving…' : 'Save Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by employee name, supervisor, or details…"
            className={`${inp} pl-9`}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className={`${inp} sm:w-52`}>
          <option value="All">All Types</option>
          {COUNSELING_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* Records list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className={`${card} py-16 text-center`}>
          <AlertTriangle className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-400 dark:text-gray-500">{records.length === 0 ? 'No counseling records yet.' : 'No records match your search.'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(rec => {
            const dt = new Date(rec.infraction_datetime);
            const dateStr = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            const badgeClass = TYPE_BADGE[rec.counseling_type] ?? TYPE_BADGE['General Counseling'];
            const emp = rec.employee;
            const fullName = emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown';
            const initials = emp ? `${emp.first_name?.[0] ?? ''}${emp.last_name?.[0] ?? ''}` : '?';

            return (
              <div key={rec.id} className={`${card} space-y-3`}>
                {/* Card header */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Employee avatar */}
                    <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 overflow-hidden flex items-center justify-center shrink-0">
                      {emp?.profile_photo_url
                        ? <img src={emp.profile_photo_url} alt={fullName} className="w-full h-full object-cover" />
                        : <span className="text-xs font-bold text-blue-700 dark:text-blue-300">{initials}</span>}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{fullName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{dateStr} — {timeStr} · Given by: <span className="font-medium text-gray-700 dark:text-gray-300">{rec.given_by}</span></p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>{rec.counseling_type}</span>
                  </div>
                  <button onClick={() => handleDelete(rec.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0" title="Delete record">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {rec.details && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Details</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{rec.details}</p>
                  </div>
                )}
                {rec.actions_taken && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Actions Taken</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{rec.actions_taken}</p>
                  </div>
                )}
                {rec.file_url && (
                  <a href={rec.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                    <Paperclip className="w-3.5 h-3.5" /> View attached document
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
