'use client';

import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Camera, FileText, Upload, Calendar, Home, Briefcase, Flame, PlusCircle, Trash2, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Employee {
  id?: string;
  first_name: string;
  last_name: string;
  role: string;
  profile_photo_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: string;
  notes: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  tour?: string | null;
  current_position?: string | null;
  fireguard?: boolean;
  training_start_date?: string | null;
  official_start_date?: string | null;
  date_inactive?: string | null;
  date_reactivated?: string | null;
  notice_file_url?: string | null;
  rdo_monday?: boolean;
  rdo_tuesday?: boolean;
  rdo_wednesday?: boolean;
  rdo_thursday?: boolean;
  rdo_friday?: boolean;
  rdo_saturday?: boolean;
  rdo_sunday?: boolean;
}

export interface CertEntry {
  id?: string;           // present when loaded from DB
  name: string;          // cert_type
  date_obtained: string; // issued_date ('' = not yet filled)
  expiration_date: string; // expiry_date ('' = not applicable)
}

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

interface EmployeeFormModalProps {
  employee: Employee | null; // null = add new, object = edit existing
  existingCertifications?: any[]; // raw rows from certifications table
  onClose: () => void;
  onSave: (employee: Employee, certEntries: CertEntry[]) => Promise<void>;
}

const DEFAULT_FORM: Employee = {
  first_name: '',
  last_name: '',
  role: 'Guard',
  profile_photo_url: null,
  contact_email: null,
  contact_phone: null,
  status: 'active',
  notes: null,
  address_line1: null,
  address_line2: null,
  city: null,
  state: null,
  postal_code: null,
  country: null,
  tour: null,
  current_position: null,
  fireguard: false,
  training_start_date: null,
  official_start_date: null,
  date_inactive: null,
  date_reactivated: null,
  notice_file_url: null,
  rdo_monday: false,
  rdo_tuesday: false,
  rdo_wednesday: false,
  rdo_thursday: false,
  rdo_friday: false,
  rdo_saturday: false,
  rdo_sunday: false,
};

export default function EmployeeFormModal({ employee, existingCertifications, onClose, onSave }: EmployeeFormModalProps) {
  const [activeTab, setActiveTab] = useState<'main' | 'certs' | 'counseling'>('main');
  const [formData, setFormData] = useState<Employee>(DEFAULT_FORM);
  const [certEntries, setCertEntries] = useState<CertEntry[]>(DEFAULT_CERTS);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingNotice, setUploadingNotice] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (employee) {
      setFormData({ ...DEFAULT_FORM, ...employee });
    }
    // Load existing certs or fall back to defaults
    if (existingCertifications && existingCertifications.length > 0) {
      setCertEntries(
        existingCertifications.map(c => ({
          id: c.id,
          name: c.cert_type,
          date_obtained: c.issued_date ?? '',
          expiration_date: c.expiry_date ?? '',
        }))
      );
    } else {
      setCertEntries(DEFAULT_CERTS.map(d => ({ ...d })));
    }
  }, [employee, existingCertifications]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `employee-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('employee-photos')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('employee-photos')
        .getPublicUrl(filePath);

      setFormData({ ...formData, profile_photo_url: publicUrl });
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleNoticeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Notice file must be less than 10MB');
      return;
    }

    setUploadingNotice(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `notice-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `employee-notices/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('employee-photos')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('employee-photos')
        .getPublicUrl(filePath);

      setFormData({ ...formData, notice_file_url: publicUrl });
    } catch (err: any) {
      console.error('Notice upload error:', err);
      setError(err.message || 'Failed to upload notice');
    } finally {
      setUploadingNotice(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      // Only pass cert rows that have at least a name
      const filledCerts = certEntries.filter(c => c.name.trim() !== '');
      await onSave(formData, filledCerts);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save employee');
    } finally {
      setSaving(false);
    }
  };

  const roles = ['Guard', 'Senior Guard', 'Bodyguard', 'Supervisor', 'Manager'];
  const statuses = ['active', 'inactive'];
  const tours = ['Tour 1', 'Tour 2', 'Tour 3', 'Museum'];

  const inputClass =
    'w-full px-4 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6 rounded-t-lg shrink-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <User className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              <h2 className="text-lg sm:text-2xl font-bold truncate">
                {employee ? 'Edit Employee' : 'Add New Employee'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors shrink-0 ml-2"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Main Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* Tabs */}
            <div className="flex gap-4 sm:gap-6 border-b mb-6 overflow-x-auto pb-1 text-sm sm:text-base">
              <button
                type="button"
                onClick={() => setActiveTab('main')}
                className={`pb-2 whitespace-nowrap border-b-2 font-medium transition-colors ${activeTab === 'main' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Main Info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('certs')}
                className={`pb-2 whitespace-nowrap border-b-2 font-medium transition-colors ${activeTab === 'certs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Certificates & Training
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('counseling')}
                className={`pb-2 whitespace-nowrap border-b-2 font-medium transition-colors ${activeTab === 'counseling' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Performance Counseling
              </button>
            </div>

            <form id="employee-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {activeTab === 'main' && (
                <div className="space-y-6">

                  {/* Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>First Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className={inputClass}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className={inputClass}
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  {/* Role & Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Role *</label>
                      <select
                        required
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className={inputClass}
                      >
                        {roles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Status *</label>
                      <select
                        required
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className={inputClass}
                      >
                        {statuses.map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.contact_email || ''}
                        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value || null })}
                        className={inputClass}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        <Phone className="w-4 h-4 inline mr-1" />
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.contact_phone || ''}
                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value || null })}
                        className={inputClass}
                        placeholder="(415) 555-0100"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-slate-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 pt-4">
                      <Home className="w-4 h-4 text-blue-600" />
                      Address
                    </h3>
                    <div>
                      <label className={labelClass}>Address Line 1</label>
                      <input
                        type="text"
                        value={formData.address_line1 || ''}
                        onChange={(e) => setFormData({ ...formData, address_line1: e.target.value || null })}
                        className={inputClass}
                        placeholder="123 Main St"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Address Line 2</label>
                      <input
                        type="text"
                        value={formData.address_line2 || ''}
                        onChange={(e) => setFormData({ ...formData, address_line2: e.target.value || null })}
                        className={inputClass}
                        placeholder="Apt 4B"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>City / District</label>
                        <input
                          type="text"
                          value={formData.city || ''}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value || null })}
                          className={inputClass}
                          placeholder="Manhattan"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>State / Province</label>
                        <input
                          type="text"
                          value={formData.state || ''}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value || null })}
                          className={inputClass}
                          placeholder="NY"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Postal Code</label>
                        <input
                          type="text"
                          value={formData.postal_code || ''}
                          onChange={(e) => setFormData({ ...formData, postal_code: e.target.value || null })}
                          className={inputClass}
                          placeholder="10001"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Country</label>
                        <input
                          type="text"
                          value={formData.country || ''}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value || null })}
                          className={inputClass}
                          placeholder="USA"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Assignment Details */}
                  <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-slate-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 pt-4">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      Assignment Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Tour</label>
                        <select
                          value={formData.tour || ''}
                          onChange={(e) => setFormData({ ...formData, tour: e.target.value || null })}
                          className={inputClass}
                        >
                          <option value="">Select tour...</option>
                          {tours.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Current Position *</label>
                        <input
                          type="text"
                          required
                          value={formData.current_position || ''}
                          onChange={(e) => setFormData({ ...formData, current_position: e.target.value || null })}
                          className={inputClass}
                          placeholder="Lobby Officer"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={!!formData.fireguard}
                          onChange={(e) => setFormData({ ...formData, fireguard: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">
                          <Flame className="w-4 h-4 text-orange-500" />
                          Fireguard Certified
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Key Dates */}
                  <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-slate-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 pt-4">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      Key Dates
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Training Start Date</label>
                        <input
                          type="date"
                          value={formData.training_start_date || ''}
                          onChange={(e) => setFormData({ ...formData, training_start_date: e.target.value || null })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Official Start Date</label>
                        <input
                          type="date"
                          value={formData.official_start_date || ''}
                          onChange={(e) => setFormData({ ...formData, official_start_date: e.target.value || null })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Date Inactive</label>
                        <input
                          type="date"
                          value={formData.date_inactive || ''}
                          onChange={(e) => setFormData({ ...formData, date_inactive: e.target.value || null })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Date Re-activated</label>
                        <input
                          type="date"
                          value={formData.date_reactivated || ''}
                          onChange={(e) => setFormData({ ...formData, date_reactivated: e.target.value || null })}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
                    <label className={`${labelClass} pt-4`}>
                      <Camera className="w-4 h-4 inline mr-1" />
                      Profile Photo
                    </label>
                    <div className="mb-3">
                      <input
                        type="file"
                        id="photo-upload"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                      <label
                        htmlFor="photo-upload"
                        className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Upload className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          {uploading ? 'Uploading...' : 'Click to upload photo from computer'}
                        </span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF (max 5MB)</p>
                    </div>
                    {formData.profile_photo_url && (
                      <div className="mb-3">
                        <img
                          src={formData.profile_photo_url}
                          alt="Preview"
                          className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 mx-auto"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/150?img=1';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* NOTICE Upload */}
                  <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
                    <label className={`${labelClass} pt-4`}>
                      <FileText className="w-4 h-4 inline mr-1" />
                      NOTICE Document
                    </label>
                    <input
                      type="file"
                      id="notice-upload"
                      onChange={handleNoticeUpload}
                      className="hidden"
                      disabled={uploadingNotice}
                    />
                    <label
                      htmlFor="notice-upload"
                      className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors ${uploadingNotice ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Upload className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      <span className="text-sm text-gray-700 dark:text-gray-200">
                        {uploadingNotice ? 'Uploading...' : 'Click to upload NOTICE file'}
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOC, or image (max 10MB)</p>
                    {formData.notice_file_url && (
                      <a
                        href={formData.notice_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2"
                      >
                        <FileText className="w-4 h-4" />
                        View uploaded NOTICE
                      </a>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
                    <label className={`${labelClass} pt-4`}>
                      <FileText className="w-4 h-4 inline mr-1" />
                      Notes
                    </label>
                    <textarea
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
                      rows={3}
                      className={inputClass}
                      placeholder="Additional notes about this employee..."
                    />
                  </div>

                </div>
              )}

              {activeTab === 'certs' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-slate-700">
                    <Award className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Certifications / Training</h3>
                  </div>

                  {/* Column headers */}
                  <div className="grid grid-cols-[1fr_160px_160px_32px] gap-2 px-1">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Certification / Training</span>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date Obtained</span>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Expiration Date</span>
                    <span />
                  </div>

                  {/* Cert rows */}
                  <div className="space-y-2">
                    {certEntries.map((cert, idx) => (
                      <div key={idx} className="grid grid-cols-[1fr_160px_160px_32px] gap-2 items-center">
                        <input
                          type="text"
                          value={cert.name}
                          onChange={e => {
                            const updated = [...certEntries];
                            updated[idx] = { ...updated[idx], name: e.target.value };
                            setCertEntries(updated);
                          }}
                          className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Certification name"
                        />
                        <input
                          type="date"
                          value={cert.date_obtained}
                          onChange={e => {
                            const updated = [...certEntries];
                            updated[idx] = { ...updated[idx], date_obtained: e.target.value };
                            setCertEntries(updated);
                          }}
                          className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        <input
                          type="date"
                          value={cert.expiration_date}
                          onChange={e => {
                            const updated = [...certEntries];
                            updated[idx] = { ...updated[idx], expiration_date: e.target.value };
                            setCertEntries(updated);
                          }}
                          className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setCertEntries(certEntries.filter((_, i) => i !== idx))}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded"
                          title="Remove row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add row */}
                  <button
                    type="button"
                    onClick={() => setCertEntries([...certEntries, { name: '', date_obtained: '', expiration_date: '' }])}
                    className="mt-2 flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 dark:border-slate-600 text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 rounded-lg transition-colors w-full justify-center text-sm font-medium"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add Certification / Training
                  </button>
                </div>
              )}

              {activeTab === 'counseling' && (
                <div className="py-8 text-center text-gray-500">
                  <p>Performance Counseling history coming soon.</p>
                  <p className="text-sm mt-2">Will include disciplinary actions and commendations.</p>
                </div>
              )}
            </form>
          </div>

          {/* Days Off Sidebar */}
          <div className="w-full md:w-64 bg-gray-50 dark:bg-slate-800 border-t md:border-t-0 md:border-l border-gray-200 dark:border-slate-700 p-4 sm:p-6 shrink-0 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Regular Days Off
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Select the days this employee is normally off duty.</p>
            <div className="space-y-3">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                <label key={day} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData[`rdo_${day}` as keyof Employee] as boolean || false}
                    onChange={(e) => setFormData({ ...formData, [`rdo_${day}`]: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 transition-colors"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 capitalize group-hover:text-blue-600 transition-colors">
                    {day}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="employee-form"
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={saving}
          >
            {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
            {saving ? 'Saving...' : employee ? 'Save Changes' : 'Add Employee'}
          </button>
        </div>
      </div>
    </div>
  );
}

