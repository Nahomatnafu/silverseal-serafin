'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventContentArg } from '@fullcalendar/core';
import { fullName } from '@/lib/utils';

/* ── Tour colour palette ─────────────────────────────────────── */
const TOUR_COLORS: Record<string, { bg: string; border: string }> = {
  'Tour 1': { bg: '#2563eb', border: '#1d4ed8' },
  'Tour 2': { bg: '#059669', border: '#047857' },
  'Tour 3': { bg: '#7c3aed', border: '#6d28d9' },
  'Museum':  { bg: '#d97706', border: '#b45309' },
};
const DEFAULT_COLOR = { bg: '#4b5563', border: '#374151' };

function tourColor(tour?: string | null) {
  return tour ? (TOUR_COLORS[tour] ?? DEFAULT_COLOR) : DEFAULT_COLOR;
}

/* ── Legend pill ─────────────────────────────────────────────── */
function Legend() {
  const items = [
    ...Object.entries(TOUR_COLORS).map(([label, c]) => ({ label, color: c.bg })),
    { label: 'Other', color: DEFAULT_COLOR.bg },
  ];
  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-2 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tour</span>
      {items.map(({ label, color }) => (
        <span key={label} className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-200">
          <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: color }} />
          {label}
        </span>
      ))}
    </div>
  );
}

/* ── Custom event renderer ───────────────────────────────────── */
function EventContent({ arg }: { arg: EventContentArg }) {
  const { site, tour } = arg.event.extendedProps;
  const isList = arg.view.type === 'listWeek' || arg.view.type === 'listMonth';

  if (isList) {
    return (
      <div className="flex items-center gap-3 py-0.5">
        <span className="font-medium text-sm">{arg.event.title}</span>
        {site && <span className="text-xs text-gray-500 dark:text-gray-400">{site.name}</span>}
        {tour && (
          <span
            className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
            style={{ background: tourColor(tour).bg, color: '#fff' }}
          >
            {tour}
          </span>
        )}
      </div>
    );
  }

  /* Month / week day-grid: simple name pill, no hours */
  return (
    <div className="px-1.5 py-0.5 truncate text-[11px] font-medium leading-snug w-full">
      {arg.event.title}
    </div>
  );
}

/* ── Props ───────────────────────────────────────────────────── */
interface CalendarViewProps {
  assignments: any[];
  employees:   any[];
  sites:       any[];
  onEmployeeClick?: (employeeId: string) => void;
}

/* ── Component ───────────────────────────────────────────────── */
export default function CalendarView({ assignments, employees, sites, onEmployeeClick }: CalendarViewProps) {
  const events = assignments.map(a => {
    const employee = employees.find(e => e.id === a.employee_id);
    const site     = sites.find(s => s.id === a.site_id);
    const colors   = tourColor(employee?.tour);

    return {
      id:              a.id,
      title:           fullName(employee) || 'Unassigned',
      start:           a.start_time,
      end:             a.end_time,
      backgroundColor: colors.bg,
      borderColor:     colors.border,
      textColor:       '#ffffff',
      extendedProps: {
        employee,
        site,
        shiftLabel:  a.shift_label,
        tour:        employee?.tour,
        employeeId:  a.employee_id,
      },
    };
  });

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      <Legend />

      <div className="flex-1 overflow-auto p-4 fc-wrapper">
        <FullCalendar
          plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height="100%"
          headerToolbar={{
            left:   'prev,next today',
            center: 'title',
            right:  'dayGridMonth,dayGridWeek,listWeek',
          }}
          buttonText={{ today: 'Today', month: 'Month', week: 'Week', list: 'List' }}
          displayEventTime={false}
          eventDisplay="block"
          dayMaxEvents={8}
          events={events}
          eventContent={(arg) => <EventContent arg={arg} />}
          eventClick={(info) => {
            const id = info.event.extendedProps.employeeId;
            if (id && onEmployeeClick) onEmployeeClick(id);
          }}
          noEventsContent={
            <div className="text-center py-16 text-gray-400 dark:text-gray-500">
              <p className="text-base font-medium">No shifts scheduled</p>
              <p className="text-sm mt-1">Assignments will appear here once created.</p>
            </div>
          }
        />
      </div>
    </div>
  );
}
