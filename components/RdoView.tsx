import React from 'react';
import { fullName } from '@/lib/utils';

interface RdoViewProps {
  employees: any[];
  onEmployeeClick?: (employeeId: string) => void;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function RdoView({ employees, onEmployeeClick }: RdoViewProps) {
  const totals = DAYS.reduce((acc, day) => {
    acc[day] = { off: 0, on: 0 };
    return acc;
  }, {} as Record<string, { off: number; on: number }>);

  employees.forEach(emp => {
    DAYS.forEach(day => {
      if (emp[`rdo_${day}`]) {
        totals[day].off += 1;
      } else {
        totals[day].on += 1;
      }
    });
  });

  return (
    <div className="h-full overflow-auto bg-white dark:bg-slate-900 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">RDO Tracker</h2>
        <p className="text-gray-500 dark:text-gray-400">Regular Days Off for all staff</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 uppercase">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              {DAYS.map(day => (
                <th key={day} className="px-4 py-3 font-semibold capitalize">{day.substring(0, 3)}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {employees.map(emp => (
              <tr
                key={emp.id}
                onClick={() => onEmployeeClick?.(emp.id)}
                className={`bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${onEmployeeClick ? 'cursor-pointer' : ''}`}
              >
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                  {fullName(emp)}
                </td>
                <td className="px-4 py-3 capitalize">{emp.role}</td>
                {DAYS.map(day => (
                  <td key={day} className="px-4 py-3">
                    {emp[`rdo_${day}`] ? (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">OFF</span>
                    ) : (
                      <span className="text-gray-300 dark:text-slate-600">-</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  No employees yet. Use the “Add Employee” button to add your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {DAYS.map(day => (
          <div key={`total-${day}`} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4 text-center">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">{day}</h3>
            <div className="flex justify-center items-end gap-2 mb-1">
              <span className="text-2xl font-bold text-red-600">{totals[day].off}</span>
              <span className="text-xs text-red-600 mb-1">OFF</span>
            </div>
            <div className="text-xs text-gray-500">
              {totals[day].on} working
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
