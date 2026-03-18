'use client';

import { X, MapPin, Building2, Clock, AlertCircle } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

interface Employee {
  id: string;
  name: string;
  role: string;
  profile_photo_url: string | null;
}

interface Assignment {
  id: string;
  employee_id: string;
  shift_label: string;
  start_time: string;
  end_time: string;
  employee?: Employee;
}

interface Site {
  id: string;
  name: string;
  address: string;
  client?: { name: string };
}

interface SitePanelProps {
  site: Site | null;
  assignments: Assignment[];
  onClose: () => void;
  onEmployeeClick: (employeeId: string) => void;
}

export default function SitePanel({ site, assignments, onClose, onEmployeeClick }: SitePanelProps) {
  if (!site) return null;

  const now = new Date();
  const activeAssignments = assignments.filter(a => {
    const start = new Date(a.start_time);
    const end = new Date(a.end_time);
    return now >= start && now <= end;
  });

  const upcomingAssignments = assignments.filter(a => {
    const start = new Date(a.start_time);
    return start > now;
  });

  return (
    <div className="absolute top-0 right-0 w-full sm:w-96 h-full bg-white shadow-2xl border-l border-gray-200 overflow-y-auto z-10">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-3 sm:p-4 z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{site.name}</h2>
            <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-gray-600">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">{site.address}</span>
            </div>
            {site.client && (
              <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-gray-600">
                <Building2 className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">{site.client.name}</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors shrink-0 ml-2"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Active Shifts */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            On Shift Now ({activeAssignments.length})
          </h3>
          {activeAssignments.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No active shifts</p>
          ) : (
            <div className="space-y-2">
              {activeAssignments.map(assignment => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onEmployeeClick={onEmployeeClick}
                  isActive
                />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Shifts */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            Upcoming Shifts ({upcomingAssignments.length})
          </h3>
          {upcomingAssignments.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No upcoming shifts</p>
          ) : (
            <div className="space-y-2">
              {upcomingAssignments.map(assignment => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onEmployeeClick={onEmployeeClick}
                  isActive={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AssignmentCard({ 
  assignment, 
  onEmployeeClick, 
  isActive 
}: { 
  assignment: Assignment; 
  onEmployeeClick: (id: string) => void; 
  isActive: boolean;
}) {
  return (
    <div
      onClick={() => onEmployeeClick(assignment.employee_id)}
      className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <img
          src={assignment.employee?.profile_photo_url || 'https://i.pravatar.cc/150?img=1'}
          alt={assignment.employee?.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-gray-900">{assignment.employee?.name}</div>
          <div className="text-xs text-gray-500">{assignment.employee?.role}</div>
        </div>
      </div>
      <div className="mt-2 space-y-1">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Clock className="w-3 h-3" />
          <span>{assignment.shift_label}</span>
        </div>
        <div className="text-xs text-gray-500">
          {formatDateTime(assignment.start_time)} - {formatDateTime(assignment.end_time).split(', ')[1]}
        </div>
      </div>
    </div>
  );
}

