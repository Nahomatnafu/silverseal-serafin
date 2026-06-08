'use client';

import { useState } from 'react';
import { X, Building2 } from 'lucide-react';

interface ClientFormModalProps {
  onClose: () => void;
  onSave: (client: { name: string }) => Promise<void>;
}

export default function ClientFormModal({ onClose, onSave }: ClientFormModalProps) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave({ name: name.trim() });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save client');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Add New Client</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Create a client to assign sites to</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Client / Company Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="e.g. Rockefeller Group"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium text-sm"
            >
              {saving && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {saving ? 'Saving...' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
