'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Filter, X } from 'lucide-react';

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

interface MapViewProps {
  sites: Site[];
  siteStats: Record<string, SiteStats>;
  clients: Client[];
  onSiteClick: (siteId: string) => void;
}

export default function MapView({ sites, siteStats, clients, onSiteClick }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [shiftFilter, setShiftFilter] = useState<'all' | 'on_shift' | 'upcoming' | 'alerts'>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-122.4194, 37.7749], // San Francisco
      zoom: 11,
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      markers.current.forEach(marker => marker.remove());
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Filter sites based on selected filters
    const filteredSites = sites.filter(site => {
      const stats = siteStats[site.id] || { onShift: 0, upcoming: 0, certAlerts: 0 };

      // Client filter
      if (clientFilter !== 'all' && site.client_id !== clientFilter) {
        return false;
      }

      // Shift filter
      if (shiftFilter === 'on_shift' && stats.onShift === 0) {
        return false;
      }
      if (shiftFilter === 'upcoming' && stats.upcoming === 0) {
        return false;
      }
      if (shiftFilter === 'alerts' && stats.certAlerts === 0) {
        return false;
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
  }, [sites, siteStats, mapLoaded, onSiteClick, shiftFilter, clientFilter]);

  const activeFilterCount = (shiftFilter !== 'all' ? 1 : 0) + (clientFilter !== 'all' ? 1 : 0);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Filter Button */}
      <div className="absolute top-3 right-3 sm:top-6 sm:right-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-white rounded-lg shadow-lg px-3 py-2 sm:px-4 border border-gray-200 hover:shadow-xl transition-shadow flex items-center gap-2"
        >
          <Filter className="w-4 h-4 text-gray-700" />
          <span className="text-sm font-medium text-gray-900 hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="absolute top-14 right-3 sm:top-20 sm:right-6 bg-white rounded-lg shadow-xl p-4 border border-gray-200 w-[calc(100vw-1.5rem)] max-w-xs sm:w-72 z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Filter Sites</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Shift Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Shift Status
              </label>
              <select
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Sites</option>
                <option value="on_shift">Sites with Active Shifts</option>
                <option value="upcoming">Sites with Upcoming Shifts</option>
                <option value="alerts">Sites with Cert Alerts</option>
              </select>
            </div>

            {/* Client Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Client
              </label>
              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Clients</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setShiftFilter('all');
                  setClientFilter('all');
                }}
                className="w-full px-3 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-6 left-6 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
        <div className="text-sm font-semibold text-gray-900 mb-2">Legend</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-700">On Shift</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-700">Upcoming</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-700">Cert Alerts</span>
          </div>
        </div>
      </div>
    </div>
  );
}

