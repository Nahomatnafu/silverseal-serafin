'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Map, UserPlus, Users, Calendar as CalendarIcon, Clock, Building2, MapPin, AlertTriangle } from 'lucide-react';
import MapView from '@/components/MapView';
import SitePanel from '@/components/SitePanel';
import EmployeeDrawer from '@/components/EmployeeDrawer';
import ClientFormModal from '@/components/ClientFormModal';
import SiteFormModal from '@/components/SiteFormModal';
import CertificationFormModal from '@/components/CertificationFormModal';
import RosterView from '@/components/RosterView';
import CalendarView from '@/components/CalendarView';
import RdoView from '@/components/RdoView';
import CounselingView from '@/components/CounselingView';
import { ThemeToggle } from '@/components/ThemeToggle';
import { supabase } from '@/lib/supabase';
import { isShiftActive, isShiftUpcoming, getCertificationStatus } from '@/lib/utils';

type ViewMode = 'map' | 'roster' | 'calendar' | 'rdo' | 'counseling';

export default function Home() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [clientFormOpen, setClientFormOpen] = useState(false);
  const [siteFormOpen, setSiteFormOpen] = useState(false);
  const [certificationFormOpen, setCertificationFormOpen] = useState(false);
  const [editingCertification, setEditingCertification] = useState<any | null>(null);
  const [certificationEmployeeId, setCertificationEmployeeId] = useState<string>('');

  const [employees, setEmployees] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [
        { data: employeesData },
        { data: sitesData },
        { data: clientsData },
        { data: assignmentsData },
        { data: certificationsData },
        { data: documentsData },
      ] = await Promise.all([
        supabase.from('employees').select('*'),
        supabase.from('sites').select('*, client:clients(*)'),
        supabase.from('clients').select('*'),
        supabase.from('assignments').select('*, site:sites(*, client:clients(*)), employee:employees(*)'),
        supabase.from('certifications').select('*'),
        supabase.from('documents').select('*'),
      ]);

      setEmployees(employeesData || []);
      setSites(sitesData || []);
      setClients(clientsData || []);
      setAssignments(assignmentsData || []);
      setCertifications(certificationsData || []);
      setDocuments(documentsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }


  async function handleDeleteEmployee(employeeId: string) {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId);

      if (error) throw error;

      // Reload data and close drawer
      await loadData();
      setSelectedEmployeeId(null);
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee: ' + error.message);
    }
  }

  function handleEditEmployee(employee: any) {
    router.push(`/employees/${employee.id}/edit`);
  }

  function handleAddEmployee() {
    router.push('/employees/new');
  }

  async function handleSaveClient(client: { name: string }) {
    const { error } = await (supabase as any).from('clients').insert({ name: client.name });
    if (error) throw new Error(error.message);
    await loadData();
  }

  async function handleSaveSite(site: { name: string; address: string; latitude: number; longitude: number; client_id: string }) {
    const { error } = await (supabase as any).from('sites').insert(site);
    if (error) throw new Error(error.message);
    await loadData();
  }

  async function handleSaveCertification(certification: any) {
    try {
      if (certification.id) {
        // Update existing certification
        const { error } = await (supabase as any)
          .from('certifications')
          .update({
            cert_type: certification.cert_type,
            issued_date: certification.issued_date,
            expiry_date: certification.expiry_date,
          })
          .eq('id', certification.id);

        if (error) throw error;
      } else {
        // Insert new certification
        const { error } = await (supabase as any)
          .from('certifications')
          .insert({
            employee_id: certification.employee_id,
            cert_type: certification.cert_type,
            issued_date: certification.issued_date,
            expiry_date: certification.expiry_date,
          });

        if (error) throw error;
      }

      // Reload data
      await loadData();
      setCertificationFormOpen(false);
      setEditingCertification(null);
    } catch (error: any) {
      console.error('Error saving certification:', error);
      throw new Error(error.message || 'Failed to save certification');
    }
  }

  async function handleDeleteCertification(certificationId: string) {
    try {
      const { error } = await supabase
        .from('certifications')
        .delete()
        .eq('id', certificationId);

      if (error) throw error;

      // Reload data
      await loadData();
    } catch (error: any) {
      console.error('Error deleting certification:', error);
      alert('Failed to delete certification: ' + error.message);
    }
  }

  function handleAddCertification(employeeId: string) {
    setCertificationEmployeeId(employeeId);
    setEditingCertification(null);
    setCertificationFormOpen(true);
  }

  function handleEditCertification(certification: any) {
    setCertificationEmployeeId(certification.employee_id);
    setEditingCertification(certification);
    setCertificationFormOpen(true);
  }

  // Calculate site stats for map pins
  const siteStats = sites.reduce((acc, site) => {
    const siteAssignments = assignments.filter(a => a.site_id === site.id);
    const onShift = siteAssignments.filter(a => isShiftActive(a.start_time, a.end_time)).length;
    const upcoming = siteAssignments.filter(a => isShiftUpcoming(a.start_time)).length;

    // Count cert alerts for employees at this site
    const employeeIds = siteAssignments.map(a => a.employee_id);
    const certAlerts = certifications.filter(c => {
      if (!employeeIds.includes(c.employee_id)) return false;
      const status = getCertificationStatus(c.expiry_date);
      return status === 'expired' || status === 'expiring_soon';
    }).length;

    acc[site.id] = { onShift, upcoming, certAlerts };
    return acc;
  }, {} as Record<string, { onShift: number; upcoming: number; certAlerts: number }>);

  const selectedSite = sites.find(s => s.id === selectedSiteId);
  const siteAssignments = assignments.filter(a => a.site_id === selectedSiteId);

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);
  const employeeCertifications = certifications.filter(c => c.employee_id === selectedEmployeeId);
  const employeeDocuments = documents.filter(d => d.employee_id === selectedEmployeeId);
  const currentAssignment = assignments.find(
    a => a.employee_id === selectedEmployeeId && isShiftActive(a.start_time, a.end_time)
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <img src="/assets/Silverseal_Logo.png" alt="Silverseal" className="h-16 w-auto mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-300">Loading Silverseal Guard Management…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-slate-950 transition-colors">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-blue-700 to-blue-900 dark:from-slate-800 dark:to-slate-900 text-white shadow-xl flex-col transition-colors z-20 hidden md:flex shrink-0">
        <div className="p-6 flex items-center justify-between border-b border-blue-600 dark:border-slate-700">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/assets/Silverseal_Logo.png" alt="Silverseal" className="h-10 w-auto shrink-0" />
            <p className="text-blue-200 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold truncate">Dashboard</p>
          </div>
          <ThemeToggle />
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <button
            onClick={() => setViewMode('map')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              viewMode === 'map'
                ? 'bg-white/10 text-white font-medium shadow-sm backdrop-blur-sm'
                : 'text-blue-100 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Map className="w-5 h-5 shrink-0" />
            <span>Map View</span>
          </button>

          <button
            onClick={() => setViewMode('roster')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              viewMode === 'roster'
                ? 'bg-white/10 text-white font-medium shadow-sm backdrop-blur-sm'
                : 'text-blue-100 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5 shrink-0" />
            <span>Employees</span>
          </button>

          <button
            onClick={() => setViewMode('calendar')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              viewMode === 'calendar'
                ? 'bg-white/10 text-white font-medium shadow-sm backdrop-blur-sm'
                : 'text-blue-100 hover:bg-white/5 hover:text-white'
            }`}
          >
            <CalendarIcon className="w-5 h-5 shrink-0" />
            <span>Calendar View</span>
          </button>

          <button
            onClick={() => setViewMode('rdo')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              viewMode === 'rdo'
                ? 'bg-white/10 text-white font-medium shadow-sm backdrop-blur-sm'
                : 'text-blue-100 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Clock className="w-5 h-5 shrink-0" />
            <span>RDO View</span>
          </button>

          <button
            onClick={() => setViewMode('counseling')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              viewMode === 'counseling'
                ? 'bg-white/10 text-white font-medium shadow-sm backdrop-blur-sm'
                : 'text-blue-100 hover:bg-white/5 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Counseling</span>
          </button>
        </nav>

        <div className="p-4 border-t border-blue-600 dark:border-slate-700 space-y-2">
          {/* Secondary: Add Client + Add Site */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setClientFormOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-xs font-medium"
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span>Add Client</span>
            </button>
            <button
              onClick={() => setSiteFormOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-xs font-medium"
            >
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>Add Site</span>
            </button>
          </div>
          {/* Primary: Add Employee */}
          <button
            onClick={handleAddEmployee}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-xl transition-colors font-medium shadow-sm"
          >
            <UserPlus className="w-5 h-5 shrink-0" />
            <span>Add Employee</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-blue-700 text-white p-4 flex items-center justify-between shadow-md z-10 shrink-0">
          <div className="flex items-center gap-2">
            <img src="/assets/Silverseal_Logo.png" alt="Silverseal" className="h-7 w-auto" />
            <h1 className="font-bold tracking-tight">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setViewMode('map')} className={`p-2 rounded-lg ${viewMode === 'map' ? 'bg-white/20' : ''}`}><Map className="w-5 h-5" /></button>
            <button onClick={() => setViewMode('roster')} className={`p-2 rounded-lg ${viewMode === 'roster' ? 'bg-white/20' : ''}`}><Users className="w-5 h-5" /></button>
            <button onClick={() => setViewMode('calendar')} className={`p-2 rounded-lg ${viewMode === 'calendar' ? 'bg-white/20' : ''}`}><CalendarIcon className="w-5 h-5" /></button>
            <button onClick={() => setViewMode('rdo')} className={`p-2 rounded-lg ${viewMode === 'rdo' ? 'bg-white/20' : ''}`}><Clock className="w-5 h-5" /></button>
            <button onClick={() => setViewMode('counseling')} className={`p-2 rounded-lg ${viewMode === 'counseling' ? 'bg-white/20' : ''}`}><AlertTriangle className="w-5 h-5" /></button>
            <button onClick={handleAddEmployee} className="p-2 bg-green-500 rounded-lg ml-1"><UserPlus className="w-5 h-5" /></button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 relative overflow-hidden bg-gray-50 dark:bg-slate-950">
          {viewMode === 'map' ? (
            <>
              <MapView
                sites={sites}
                siteStats={siteStats}
                clients={clients}
                employees={employees}
                assignments={assignments}
                onSiteClick={setSelectedSiteId}
              />
              <SitePanel
                site={selectedSite || null}
                assignments={siteAssignments}
                onClose={() => setSelectedSiteId(null)}
                onEmployeeClick={setSelectedEmployeeId}
              />
            </>
          ) : viewMode === 'roster' ? (
            <RosterView
              employees={employees}
              assignments={assignments}
              certifications={certifications}
              sites={sites}
              clients={clients}
              onEmployeeClick={setSelectedEmployeeId}
            />
          ) : viewMode === 'calendar' ? (
            <CalendarView
              assignments={assignments}
              employees={employees}
              sites={sites}
              onEmployeeClick={setSelectedEmployeeId}
            />
          ) : viewMode === 'counseling' ? (
            <CounselingView employees={employees} />
          ) : (
            <RdoView employees={employees} onEmployeeClick={setSelectedEmployeeId} />
          )}
        </main>
      </div>

      {/* Employee Drawer (overlays both views) */}
      <EmployeeDrawer
        employee={selectedEmployee || null}
        certifications={employeeCertifications}
        documents={employeeDocuments}
        currentAssignment={currentAssignment || null}
        onClose={() => setSelectedEmployeeId(null)}
        onEdit={handleEditEmployee}
        onDelete={viewMode === 'roster' ? handleDeleteEmployee : undefined}
        onAddCertification={handleAddCertification}
        onEditCertification={handleEditCertification}
        onDeleteCertification={handleDeleteCertification}
      />



      {/* Client Form Modal */}
      {clientFormOpen && (
        <ClientFormModal
          onClose={() => setClientFormOpen(false)}
          onSave={handleSaveClient}
        />
      )}

      {/* Site Form Modal */}
      {siteFormOpen && (
        <SiteFormModal
          clients={clients}
          onClose={() => setSiteFormOpen(false)}
          onSave={handleSaveSite}
        />
      )}

      {/* Certification Form Modal */}
      {certificationFormOpen && (
        <CertificationFormModal
          certification={editingCertification}
          employeeId={certificationEmployeeId}
          onClose={() => {
            setCertificationFormOpen(false);
            setEditingCertification(null);
          }}
          onSave={handleSaveCertification}
        />
      )}
    </div>
  );
}
