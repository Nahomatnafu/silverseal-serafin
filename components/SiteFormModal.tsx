'use client';

import { useState } from 'react';
import { X, MapPin } from 'lucide-react';

interface Client { id: string; name: string; }

interface SiteFormModalProps {
  clients: Client[];
  onClose: () => void;
  onSave: (site: { name: string; address: string; latitude: number; longitude: number; client_id: string }) => Promise<void>;
}

export default function SiteFormModal({ clients, onClose, onSave }: SiteFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    client_id: clients[0]?.id ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    if (isNaN(lat) || lat < -90  || lat > 90)  { setError('Latitude must be between -90 and 90');   return; }
    if (isNaN(lng) || lng < -180 || lng > 180) { setError('Longitude must be between -180 and 180'); return; }
    if (!formData.client_id) { setError('Please select a client'); return; }

    setSaving(true);
    setError(null);
    try {
      await onSave({ name: formData.name.trim(), address: formData.address.trim(), latitude: lat, longitude: lng, client_id: formData.client_id });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save site');
    } finally {
      setSaving(false);
    }
  };

  const input = 'w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm';
  const label = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Add New Site</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Add a location to appear on the map</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className={label}>Client *</label>
            <select required value={formData.client_id} onChange={e => set('client_id', e.target.value)} className={input}>
              <option value="">Select a client...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className={label}>Site Name *</label>
            <input type="text" required autoFocus value={formData.name} onChange={e => set('name', e.target.value)} className={input} placeholder="e.g. Main Lobby – 30 Rock" />
          </div>

          <div>
            <label className={label}>Address *</label>
            <input type="text" required value={formData.address} onChange={e => set('address', e.target.value)} className={input} placeholder="30 Rockefeller Plaza, New York, NY 10112" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Latitude *</label>
              <input type="number" step="any" required value={formData.latitude} onChange={e => set('latitude', e.target.value)} className={input} placeholder="40.7587" />
            </div>
            <div>
              <label className={label}>Longitude *</label>
              <input type="number" step="any" required value={formData.longitude} onChange={e => set('longitude', e.target.value)} className={input} placeholder="-73.9787" />
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Tip: right-click any spot in Google Maps → copy the coordinates shown at the top.
          </p>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors font-medium text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium text-sm">
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? 'Saving...' : 'Add Site'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
