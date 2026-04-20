import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface CalendarViewProps {
  assignments: any[];
  employees: any[];
  sites: any[];
}

export default function CalendarView({ assignments, employees, sites }: CalendarViewProps) {
  const events = assignments.map(a => {
    const employee = employees.find(e => e.id === a.employee_id);
    const site = sites.find(s => s.id === a.site_id);
    
    return {
      title: `${employee?.first_name} ${employee?.last_name} @ ${site?.name}`,
      start: new Date(a.start_time),
      end: new Date(a.end_time),
      allDay: false,
      resource: a
    };
  });

  return (
    <div className="h-full w-full p-4 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        views={['month', 'week', 'day']}
        className="dark:text-white"
      />
    </div>
  );
}
