'use client';

import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Camera, FileText, Upload, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Employee {
  id?: string;
  name: string;
  role: string;
  profile_photo_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: string;
  notes: string | null;
  rdo_monday?: boolean;
  rdo_tuesday?: boolean;
  rdo_wednesday?: boolean;
  rdo_thursday?: boolean;
  rdo_friday?: boolean;
  rdo_saturday?: boolean;
  rdo_sunday?: boolean;
}

interface EmployeeFormModalProps {
  employee: Employee | null; // null = add new, object = edit existing
  onClose: () => void;
  onSave: (employee: Employee) => Promise<void>;
}

export default function EmployeeFormModal({ employee, onClose, onSave }: EmployeeFormModalProps) {
  const [activeTab, setActiveTab] = useState<'main' | 'certs' | 'counseling'>('main');
  const [formData, setFormData] = useState<Employee>({
    name: '',
    role: 'Guard',
    profile_photo_url: null,
    contact_email: null,
    contact_phone: null,
    status: 'active',
    notes: null,
    rdo_monday: false,
    rdo_tuesday: false,
    rdo_wednesday: false,
    rdo_thursday: false,
    rdo_friday: false,
    rdo_saturday: false,
    rdo_sunday: false,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (employee) {
      setFormData(employee);
    }
  }, [employee]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `employee-photos/${fileName}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('employee-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('employee-photos')
        .getPublicUrl(filePath);

      // Update form data with the uploaded image URL
      setFormData({ ...formData, profile_photo_url: publicUrl });
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save employee');
    } finally {
      setSaving(false);
    }
  };

  const roles = ['Guard', 'Senior Guard', 'Bodyguard', 'Supervisor', 'Manager'];
  const statuses = ['active', 'inactive', 'on_leave'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
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
                <div className="space-y-4 sm:space-y-6">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="John Doe"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role *
            </label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={formData.contact_email || ''}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value || null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone
              </label>
              <input
                type="tel"
                value={formData.contact_phone || ''}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value || null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="(415) 555-0100"
              />
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Camera className="w-4 h-4 inline mr-1" />
              Profile Photo
            </label>

            {/* Upload Button */}
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
                className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors ${
                  uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">
                  {uploading ? 'Uploading...' : 'Click to upload photo from computer'}
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Supports JPG, PNG, GIF (max 5MB)
              </p>
            </div>

            {/* Photo Preview */}
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

            {/* Optional: URL Input */}
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-600 hover:text-gray-900 mb-2">
                Or paste image URL
              </summary>
              <input
                type="url"
                value={formData.profile_photo_url || ''}
                onChange={(e) => setFormData({ ...formData, profile_photo_url: e.target.value || null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/photo.jpg"
              />
            </details>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Notes
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes about this employee..."
            />
          </div>

                </div>
              )}

              {activeTab === 'certs' && (
                <div className="py-8 text-center text-gray-500">
                  <p>Certificates and Training management coming soon.</p>
                  <p className="text-sm mt-2">Manage certifications from the Roster View drawer.</p>
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
          <div className="w-full md:w-64 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-200 p-4 sm:p-6 shrink-0 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Regular Days Off
            </h3>
            <p className="text-xs text-gray-500 mb-4">Select the days this employee is normally off duty.</p>
            <div className="space-y-3">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                <label key={day} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData[`rdo_${day}` as keyof Employee] as boolean || false}
                    onChange={(e) => setFormData({ ...formData, [`rdo_${day}`]: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 transition-colors"
                  />
                  <span className="text-sm font-medium text-gray-700 capitalize group-hover:text-blue-600 transition-colors">
                    {day}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex gap-3 p-4 sm:p-6 border-t bg-white shrink-0 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
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

