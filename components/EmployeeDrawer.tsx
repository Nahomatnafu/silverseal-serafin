'use client';

import { X, Mail, Phone, MapPin, Clock, FileText, AlertCircle, Edit, Trash2, Plus } from 'lucide-react';
import { formatDate, formatDateTime, getCertificationStatusColor, getCertificationStatus } from '@/lib/utils';

interface Certification {
  id: string;
  cert_type: string;
  issued_date: string;
  expiry_date: string;
}

interface Document {
  id: string;
  name: string;
  file_url: string;
  document_type: string;
}

interface Assignment {
  id: string;
  shift_label: string;
  start_time: string;
  end_time: string;
  site?: {
    name: string;
    address: string;
  };
}

interface Employee {
  id: string;
  name: string;
  role: string;
  profile_photo_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: string;
  notes: string | null;
}

interface EmployeeDrawerProps {
  employee: Employee | null;
  certifications: Certification[];
  documents: Document[];
  currentAssignment: Assignment | null;
  onClose: () => void;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employeeId: string) => void;
  onAddCertification?: (employeeId: string) => void;
  onEditCertification?: (certification: Certification) => void;
  onDeleteCertification?: (certificationId: string) => void;
}

export default function EmployeeDrawer({
  employee,
  certifications,
  documents,
  currentAssignment,
  onClose,
  onEdit,
  onDelete,
  onAddCertification,
  onEditCertification,
  onDeleteCertification,
}: EmployeeDrawerProps) {
  if (!employee) return null;

  const expiredCerts = certifications.filter(c => getCertificationStatus(c.expiry_date) === 'expired').length;
  const expiringSoonCerts = certifications.filter(c => getCertificationStatus(c.expiry_date) === 'expiring_soon').length;

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${employee.name}? This action cannot be undone.`)) {
      onDelete?.(employee.id);
    }
  };

  const handleDeleteCertification = (certId: string, certType: string) => {
    if (window.confirm(`Are you sure you want to delete the ${certType} certification?`)) {
      onDeleteCertification?.(certId);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-white shadow-2xl border-l border-gray-200 overflow-y-auto z-50 animate-slide-in">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6 z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <img
              src={employee.profile_photo_url || 'https://i.pravatar.cc/150?img=1'}
              alt={employee.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white shadow-lg shrink-0"
            />
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold truncate">{employee.name}</h2>
              <p className="text-blue-100 mt-1 text-sm sm:text-base truncate">{employee.role}</p>
              <div className="mt-2">
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                  employee.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                }`}>
                  {employee.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-800 rounded-lg transition-colors shrink-0 ml-2"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Action Buttons */}
        {(onEdit || onDelete) && (
          <section className="flex gap-2 sm:gap-3">
            {onEdit && (
              <button
                onClick={() => onEdit(employee)}
                className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit Profile</span>
                <span className="sm:hidden">Edit</span>
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete Employee</span>
                <span className="sm:hidden">Delete</span>
              </button>
            )}
          </section>
        )}

        {/* Contact Information */}
        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h3>
          <div className="space-y-2">
            {employee.contact_email && (
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Mail className="w-4 h-4 text-gray-400" />
                <a href={`mailto:${employee.contact_email}`} className="hover:text-blue-600">
                  {employee.contact_email}
                </a>
              </div>
            )}
            {employee.contact_phone && (
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Phone className="w-4 h-4 text-gray-400" />
                <a href={`tel:${employee.contact_phone}`} className="hover:text-blue-600">
                  {employee.contact_phone}
                </a>
              </div>
            )}
          </div>
        </section>

        {/* Current Assignment */}
        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Current Assignment</h3>
          {currentAssignment ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{currentAssignment.site?.name}</div>
                  <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    {currentAssignment.site?.address}
                  </div>
                  <div className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {currentAssignment.shift_label}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDateTime(currentAssignment.start_time)} - {formatDateTime(currentAssignment.end_time).split(', ')[1]}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No active assignment</p>
          )}
        </section>

        {/* Certifications */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Certifications</h3>
            <div className="flex items-center gap-2">
              {(expiredCerts > 0 || expiringSoonCerts > 0) && (
                <div className="flex items-center gap-2 text-xs">
                  {expiredCerts > 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded">
                      {expiredCerts} expired
                    </span>
                  )}
                  {expiringSoonCerts > 0 && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                      {expiringSoonCerts} expiring soon
                    </span>
                  )}
                </div>
              )}
              {onAddCertification && (
                <button
                  onClick={() => onAddCertification(employee.id)}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              )}
            </div>
          </div>
          <div className="space-y-2">
            {certifications.map(cert => {
              const status = getCertificationStatus(cert.expiry_date);
              return (
                <div
                  key={cert.id}
                  className={`p-3 border rounded-lg ${
                    status === 'expired' ? 'border-red-200 bg-red-50' :
                    status === 'expiring_soon' ? 'border-yellow-200 bg-yellow-50' :
                    'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">{cert.cert_type}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Issued: {formatDate(cert.issued_date)}
                      </div>
                      <div className="text-xs text-gray-600">
                        Expires: {formatDate(cert.expiry_date)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getCertificationStatusColor(status)}`}>
                        {status.replace('_', ' ').toUpperCase()}
                      </span>
                      {(onEditCertification || onDeleteCertification) && (
                        <div className="flex gap-1">
                          {onEditCertification && (
                            <button
                              onClick={() => onEditCertification(cert)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                              title="Edit certification"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                          )}
                          {onDeleteCertification && (
                            <button
                              onClick={() => handleDeleteCertification(cert.id, cert.cert_type)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                              title="Delete certification"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Documents */}
        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Documents</h3>
          {documents.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No documents</p>
          ) : (
            <div className="space-y-2">
              {documents.map(doc => (
                <a
                  key={doc.id}
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <FileText className="w-4 h-4 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{doc.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{doc.document_type}</div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Notes */}
        {employee.notes && (
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Notes</h3>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
              {employee.notes}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

