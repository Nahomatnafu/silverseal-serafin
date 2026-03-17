'use client';

import { useState, useEffect } from 'react';
import { X, Award, Calendar } from 'lucide-react';

interface Certification {
  id?: string;
  employee_id?: string;
  cert_type: string;
  issued_date: string;
  expiry_date: string;
}

interface CertificationFormModalProps {
  certification: Certification | null;
  employeeId: string;
  onClose: () => void;
  onSave: (certification: Certification) => Promise<void>;
}

export default function CertificationFormModal({ 
  certification, 
  employeeId,
  onClose, 
  onSave 
}: CertificationFormModalProps) {
  const [formData, setFormData] = useState<Certification>({
    employee_id: employeeId,
    cert_type: 'CPR Certification',
    issued_date: new Date().toISOString().split('T')[0],
    expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (certification) {
      setFormData({
        ...certification,
        issued_date: certification.issued_date.split('T')[0],
        expiry_date: certification.expiry_date.split('T')[0],
      });
    }
  }, [certification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save certification');
    } finally {
      setSaving(false);
    }
  };

  // Common certification types as suggestions
  const commonCertTypes = [
    'CPR Certification',
    'First Aid',
    'Armed Security License',
    'Unarmed Security License',
    'Guard Card',
    'Firearms Permit',
    'Defensive Tactics',
    'Emergency Response',
    'Fire Safety',
    'AED Certification',
    'Baton Training',
    'Pepper Spray Certification',
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6" />
              <h2 className="text-2xl font-bold">
                {certification ? 'Edit Certification' : 'Add Certification'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Certification Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certification Type *
            </label>
            <input
              type="text"
              required
              list="cert-types"
              value={formData.cert_type}
              onChange={(e) => setFormData({ ...formData, cert_type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Type certification name (e.g., CPR Certification)"
            />
            <datalist id="cert-types">
              {commonCertTypes.map(type => (
                <option key={type} value={type} />
              ))}
            </datalist>
            <p className="text-xs text-gray-500 mt-1">
              Type any certification name. Common types will appear as suggestions.
            </p>
          </div>

          {/* Issued Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Issued Date *
            </label>
            <input
              type="date"
              required
              value={formData.issued_date}
              onChange={(e) => setFormData({ ...formData, issued_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Expiry Date *
            </label>
            <input
              type="date"
              required
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              disabled={saving}
            >
              {saving ? 'Saving...' : certification ? 'Update Certification' : 'Add Certification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

