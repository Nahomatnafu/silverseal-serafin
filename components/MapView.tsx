'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Filter, Search, X } from 'lucide-react';
import { useTheme } from 'next-themes';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface Site {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  client_id: string | null;
}

interface SiteStats {
  onShift: number;
  upcoming: number;
  certAlerts: number;
}

interface Client {
  id: string;
  name: string;
}

interface EmployeeLite {
  id: string;
  role?: string | null;
  tour?: string | null;
}

interface AssignmentLite {
  employee_id: string;
  site_id: string;
  start_time: string;
}

interface MapViewProps {
  sites: Site[];
  siteStats: Record<string, SiteStats>;
  clients: Client[];
  employees?: EmployeeLite[];
  assignments?: AssignmentLite[];
  onSiteClick: (siteId: string) => void;
}

const TOURS = ['Tour 1', 'Tour 2', 'Tour 3', 'Museum'];

const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

export default function MapView({
  sites,
  siteStats,
  clients,
  employees = [],
  assignments = [],
  onSiteClick,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { resolvedTheme } = useTheme();

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [shiftFilter, setShiftFilter] = useState<'all' | 'on_shift' | 'upcoming' | 'alerts'>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [tourFilter, setTourFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all'); // 'YYYY-MM' or 'all'

  const employeeById = useMemo(() => {
    const m = new Map<string, EmployeeLite>();
    employees.forEach(e => m.set(e.id, e));
    return m;
  }, [employees]);

  const availableRoles = useMemo(() => {
    return Array.from(new Set(employees.map(e => e.role).filter(Boolean))) as string[];
  }, [employees]);

  // Build a set of months that actually have assignments, for the month dropdown
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    assignments.forEach(a => {
      if (!a.start_time) return;
      const d = new Date(a.start_time);
      if (Number.isNaN(d.getTime())) return;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      set.add(`${yyyy}-${mm}`);
    });
    return Array.from(set).sort();
  }, [assignments]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const style =
      resolvedTheme === 'dark'
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/streets-v12';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style,
      center: [-73.9857, 40.7484], // Manhattan (Midtown)
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-left');

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      markers.current.forEach(marker => marker.remove());
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React to theme changes by swapping map style
  useEffect(() => {
    if (!map.current) return;
    const nextStyle =
      resolvedTheme === 'dark'
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/streets-v12';
    map.current.setStyle(nextStyle);
  }, [resolvedTheme]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Filter sites based on selected filters
    const filteredSites = sites.filter(site => {
      const stats = siteStats[site.id] || { onShift: 0, upcoming: 0, certAlerts: 0 };

      // Search filter
      if (searchQuery && !site.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Client filter
      if (clientFilter !== 'all' && site.client_id !== clientFilter) {
        return false;
      }

      // Shift filter
      if (shiftFilter === 'on_shift' && stats.onShift === 0) return false;
      if (shiftFilter === 'upcoming' && stats.upcoming === 0) return false;
      if (shiftFilter === 'alerts' && stats.certAlerts === 0) return false;

      // Assignment-based filters (tour, role, month)
      if (tourFilter !== 'all' || roleFilter !== 'all' || monthFilter !== 'all') {
        const siteAssignments = assignments.filter(a => a.site_id === site.id);
        const hasMatch = siteAssignments.some(a => {
          const emp = employeeById.get(a.employee_id);
          if (tourFilter !== 'all' && emp?.tour !== tourFilter) return false;
          if (roleFilter !== 'all' && emp?.role !== roleFilter) return false;
          if (monthFilter !== 'all') {
            const d = new Date(a.start_time);
            if (Number.isNaN(d.getTime())) return false;
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (key !== monthFilter) return false;
          }
          return true;
        });
        if (!hasMatch) return false;
      }

      return true;
    });

    // Add markers for each filtered site
    filteredSites.forEach(site => {
      const stats = siteStats[site.id] || { onShift: 0, upcoming: 0, certAlerts: 0 };
      
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.innerHTML = `
        <div class="group relative cursor-pointer flex flex-col items-center z-10 transition-transform hover:scale-105 hover:z-50">
          <div class="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-lg border border-gray-200 dark:border-slate-700 flex items-center gap-2 transition-all">
            <span class="font-semibold text-xs text-gray-800 dark:text-gray-100 max-w-[120px] truncate">${site.name}</span>
            <div class="flex items-center gap-2 ml-1 border-l border-gray-200 dark:border-slate-600 pl-2">
              <span class="flex items-center text-[11px] font-medium text-gray-600 dark:text-gray-300" title="On Shift"><div class="w-2 h-2 rounded-full bg-green-500 mr-1"></div>${stats.onShift}</span>
              <span class="flex items-center text-[11px] font-medium text-gray-600 dark:text-gray-300" title="Upcoming"><div class="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>${stats.upcoming}</span>
              ${stats.certAlerts > 0 ? `<span class="flex items-center text-[11px] font-medium text-red-600 dark:text-red-400" title="Certification Alerts"><div class="w-2 h-2 rounded-full bg-red-500 mr-1 animate-pulse"></div>${stats.certAlerts}</span>` : ''}
            </div>
          </div>
          <div class="w-3 h-3 bg-white dark:bg-slate-800 border-b border-r border-gray-200 dark:border-slate-700 rotate-45 -mt-1.5 shadow-sm"></div>
        </div>
      `;

      el.addEventListener('click', () => {
        onSiteClick(site.id);
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([site.longitude, site.latitude])
        .addTo(map.current!);

      markers.current.push(marker);
    });
  }, [
    sites,
    siteStats,
    mapLoaded,
    onSiteClick,
    searchQuery,
    shiftFilter,
    clientFilter,
    tourFilter,
    roleFilter,
    monthFilter,
    assignments,
    employeeById,
  ]);

  const activeFilterCount =
    (shiftFilter !== 'all' ? 1 : 0) +
    (clientFilter !== 'all' ? 1 : 0) +
    (tourFilter !== 'all' ? 1 : 0) +
    (roleFilter !== 'all' ? 1 : 0) +
    (monthFilter !== 'all' ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const clearAll = () => {
    setSearchQuery('');
    setShiftFilter('all');
    setClientFilter('all');
    setTourFilter('all');
    setRoleFilter('all');
    setMonthFilter('all');
  };

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
  const labelClass = 'block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1';

  // Build the month options: any 'YYYY-MM' from data, plus all twelve months of the current year.
  const monthOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const set = new Set<string>(availableMonths);
    MONTHS.forEach(m => set.add(`${currentYear}-${m.value}`));
    return Array.from(set).sort().map(key => {
      const [y, m] = key.split('-');
      const label = MONTHS.find(mm => mm.value === m)?.label ?? m;
      return { value: key, label: `${label} ${y}` };
    });
  }, [availableMonths]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Filter Toolbar */}
      <div className="absolute top-3 left-3 right-3 sm:top-6 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto z-10 flex items-center gap-2">
        <div className="flex-1 sm:flex-none sm:w-80 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sites..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-slate-700 shadow-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-lg px-3 py-2 sm:px-4 border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-shadow flex items-center gap-2 shrink-0"
        >
          <Filter className="w-4 h-4 text-gray-700 dark:text-gray-200" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="absolute top-16 right-3 sm:top-20 sm:right-6 bg-white dark:bg-slate-900 rounded-lg shadow-xl p-4 border border-gray-200 dark:border-slate-700 w-[calc(100vw-1.5rem)] max-w-xs sm:w-80 z-20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Filter Sites</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className={labelClass}>Month</label>
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className={inputClass}
              >
                <option value="all">Any month</option>
                {monthOptions.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Tour</label>
              <select
                value={tourFilter}
                onChange={(e) => setTourFilter(e.target.value)}
                className={inputClass}
              >
                <option value="all">All tours</option>
                {TOURS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className={inputClass}
              >
                <option value="all">All roles</option>
                {availableRoles.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Shift Status</label>
              <select
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value as any)}
                className={inputClass}
              >
                <option value="all">All sites</option>
                <option value="on_shift">Active shifts</option>
                <option value="upcoming">Upcoming shifts</option>
                <option value="alerts">Cert alerts</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Client</label>
              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className={inputClass}
              >
                <option value="all">All clients</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={clearAll}
                className="w-full px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium border-t border-gray-200 dark:border-slate-700 pt-3"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-6 left-6 bg-white dark:bg-slate-900 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-slate-700">
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Legend</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-700 dark:text-gray-200">On Shift</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-700 dark:text-gray-200">Upcoming</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-700 dark:text-gray-200">Cert Alerts</span>
          </div>
        </div>
      </div>
    </div>
  );
}

