'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, AlertCircle } from 'lucide-react';
import { formatDateTime, isShiftActive, isShiftUpcoming, getCertificationStatus } from '@/lib/utils';

interface Employee {
  id: string;
  name: string;
  role: string;
  profile_photo_url: string | null;
  status: string;
}

interface Assignment {
  id: string;
  employee_id: string;
  shift_label: string;
  start_time: string;
  end_time: string;
  site?: {
    name: string;
    client?: {
      name: string;
    };
  };
}

interface Certification {
  id: string;
  employee_id: string;
  cert_type: string;
  expiry_date: string;
}

interface RosterViewProps {
  employees: Employee[];
  assignments: Assignment[];
  certifications: Certification[];
  sites: Array<{ id: string; name: string }>;
  clients: Array<{ id: string; name: string }>;
  onEmployeeClick: (employeeId: string) => void;
}

export default function RosterView({
  employees,
  assignments,
  certifications,
  sites,
  clients,
  onEmployeeClick,
}: RosterViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [shiftFilter, setShiftFilter] = useState<'all' | 'on_shift' | 'upcoming' | 'unassigned'>('all');
  const [siteFilter, setSiteFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [certFilter, setCertFilter] = useState<'all' | 'valid' | 'expiring_soon' | 'expired'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'shift_start' | 'cert_expiry'>('name');

  const roles = useMemo(() => {
    return Array.from(new Set(employees.map(e => e.role)));
  }, [employees]);

  const filteredAndSortedEmployees = useMemo(() => {
    let filtered = employees.filter(employee => {
      // Search filter
      if (searchQuery && !employee.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Role filter
      if (roleFilter !== 'all' && employee.role !== roleFilter) {
        return false;
      }

      // Get employee's current assignment
      const currentAssignment = assignments.find(
        a => a.employee_id === employee.id && isShiftActive(a.start_time, a.end_time)
      );
      const upcomingAssignment = assignments.find(
        a => a.employee_id === employee.id && isShiftUpcoming(a.start_time)
      );

      // Shift filter
      if (shiftFilter === 'on_shift' && !currentAssignment) return false;
      if (shiftFilter === 'upcoming' && !upcomingAssignment) return false;
      if (shiftFilter === 'unassigned' && (currentAssignment || upcomingAssignment)) return false;

      // Site filter
      if (siteFilter !== 'all') {
        const assignment = currentAssignment || upcomingAssignment;
        if (!assignment || assignment.site?.name !== siteFilter) return false;
      }

      // Client filter
      if (clientFilter !== 'all') {
        const assignment = currentAssignment || upcomingAssignment;
        if (!assignment || assignment.site?.client?.name !== clientFilter) return false;
      }

      // Certification filter
      if (certFilter !== 'all') {
        const employeeCerts = certifications.filter(c => c.employee_id === employee.id);
        const hasMatchingCert = employeeCerts.some(c => getCertificationStatus(c.expiry_date) === certFilter);
        if (!hasMatchingCert) return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'shift_start') {
        const aAssignment = assignments.find(
          ass => ass.employee_id === a.id && (isShiftActive(ass.start_time, ass.end_time) || isShiftUpcoming(ass.start_time))
        );
        const bAssignment = assignments.find(
          ass => ass.employee_id === b.id && (isShiftActive(ass.start_time, ass.end_time) || isShiftUpcoming(ass.start_time))
        );
        if (!aAssignment) return 1;
        if (!bAssignment) return -1;
        return new Date(aAssignment.start_time).getTime() - new Date(bAssignment.start_time).getTime();
      } else if (sortBy === 'cert_expiry') {
        const aCerts = certifications.filter(c => c.employee_id === a.id);
        const bCerts = certifications.filter(c => c.employee_id === b.id);
        const aEarliest = aCerts.reduce((earliest, cert) => {
          const date = new Date(cert.expiry_date);
          return !earliest || date < earliest ? date : earliest;
        }, null as Date | null);
        const bEarliest = bCerts.reduce((earliest, cert) => {
          const date = new Date(cert.expiry_date);
          return !earliest || date < earliest ? date : earliest;
        }, null as Date | null);
        if (!aEarliest) return 1;
        if (!bEarliest) return -1;
        return aEarliest.getTime() - bEarliest.getTime();
      }
      return 0;
    });

    return filtered;
  }, [employees, assignments, certifications, searchQuery, shiftFilter, siteFilter, clientFilter, certFilter, roleFilter, sortBy]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Filters Bar */}
      <div className="bg-white border-b border-gray-200 p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Shifts</option>
            <option value="on_shift">On Shift Now</option>
            <option value="upcoming">Upcoming</option>
            <option value="unassigned">Unassigned</option>
          </select>

          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Sites</option>
            {sites.map(site => (
              <option key={site.id} value={site.name}>{site.name}</option>
            ))}
          </select>

          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Clients</option>
            {clients.map(client => (
              <option key={client.id} value={client.name}>{client.name}</option>
            ))}
          </select>

          <select
            value={certFilter}
            onChange={(e) => setCertFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Certifications</option>
            <option value="valid">Valid</option>
            <option value="expiring_soon">Expiring Soon</option>
            <option value="expired">Expired</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Sort by Name</option>
            <option value="shift_start">Sort by Shift Start</option>
            <option value="cert_expiry">Sort by Cert Expiry</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <p className="text-sm text-gray-600">
          Showing {filteredAndSortedEmployees.length} of {employees.length} employees
        </p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Employee</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Current Assignment</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Shift Time</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Cert Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedEmployees.map(employee => {
              const currentAssignment = assignments.find(
                a => a.employee_id === employee.id && isShiftActive(a.start_time, a.end_time)
              );
              const upcomingAssignment = assignments.find(
                a => a.employee_id === employee.id && isShiftUpcoming(a.start_time)
              );
              const assignment = currentAssignment || upcomingAssignment;
              const employeeCerts = certifications.filter(c => c.employee_id === employee.id);
              const expiredCount = employeeCerts.filter(c => getCertificationStatus(c.expiry_date) === 'expired').length;
              const expiringSoonCount = employeeCerts.filter(c => getCertificationStatus(c.expiry_date) === 'expiring_soon').length;

              return (
                <tr
                  key={employee.id}
                  onClick={() => onEmployeeClick(employee.id)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={employee.profile_photo_url || 'https://i.pravatar.cc/150?img=1'}
                        alt={employee.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="font-medium text-gray-900">{employee.name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{employee.role}</td>
                  <td className="px-4 py-3">
                    {assignment ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">{assignment.site?.name}</div>
                        <div className="text-xs text-gray-500">{assignment.site?.client?.name}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {assignment ? (
                      <div>
                        <div className="text-sm text-gray-900">{assignment.shift_label}</div>
                        <div className="text-xs text-gray-500">
                          {formatDateTime(assignment.start_time).split(', ')[1]} - {formatDateTime(assignment.end_time).split(', ')[1]}
                        </div>
                        {currentAssignment && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                            Active
                          </span>
                        )}
                        {upcomingAssignment && !currentAssignment && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                            Upcoming
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {expiredCount > 0 && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {expiredCount} expired
                        </span>
                      )}
                      {expiringSoonCount > 0 && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {expiringSoonCount} expiring
                        </span>
                      )}
                      {expiredCount === 0 && expiringSoonCount === 0 && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                          All valid
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden flex-1 overflow-auto p-3 space-y-3">
        {filteredAndSortedEmployees.map(employee => {
          const currentAssignment = assignments.find(
            a => a.employee_id === employee.id && isShiftActive(a.start_time, a.end_time)
          );
          const upcomingAssignment = assignments.find(
            a => a.employee_id === employee.id && isShiftUpcoming(a.start_time)
          );
          const assignment = currentAssignment || upcomingAssignment;
          const employeeCerts = certifications.filter(c => c.employee_id === employee.id);
          const expiredCount = employeeCerts.filter(c => getCertificationStatus(c.expiry_date) === 'expired').length;
          const expiringSoonCount = employeeCerts.filter(c => getCertificationStatus(c.expiry_date) === 'expiring_soon').length;

          return (
            <div
              key={employee.id}
              onClick={() => onEmployeeClick(employee.id)}
              className="bg-white rounded-lg border border-gray-200 p-3 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <img
                  src={employee.profile_photo_url || 'https://i.pravatar.cc/150?img=1'}
                  alt={employee.name}
                  className="w-12 h-12 rounded-full object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{employee.name}</div>
                  <div className="text-sm text-gray-600">{employee.role}</div>

                  {assignment && (
                    <div className="mt-2 space-y-1">
                      <div className="text-sm font-medium text-gray-900 truncate">{assignment.site?.name}</div>
                      <div className="text-xs text-gray-500 truncate">{assignment.site?.client?.name}</div>
                      <div className="text-xs text-gray-600">
                        {assignment.shift_label} • {formatDateTime(assignment.start_time).split(', ')[1]} - {formatDateTime(assignment.end_time).split(', ')[1]}
                      </div>
                      {currentAssignment && (
                        <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                          Active Now
                        </span>
                      )}
                      {upcomingAssignment && !currentAssignment && (
                        <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                          Upcoming
                        </span>
                      )}
                    </div>
                  )}

                  {!assignment && (
                    <div className="mt-2 text-sm text-gray-400 italic">Unassigned</div>
                  )}

                  <div className="mt-2 flex flex-wrap gap-1">
                    {expiredCount > 0 && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {expiredCount} expired
                      </span>
                    )}
                    {expiringSoonCount > 0 && (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {expiringSoonCount} expiring
                      </span>
                    )}
                    {expiredCount === 0 && expiringSoonCount === 0 && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                        All valid
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

