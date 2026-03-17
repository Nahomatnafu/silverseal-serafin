'use client';

import { useState, useEffect } from 'react';
import { Map, List, Shield, UserPlus } from 'lucide-react';
import MapView from '@/components/MapView';
import SitePanel from '@/components/SitePanel';
import EmployeeDrawer from '@/components/EmployeeDrawer';
import EmployeeFormModal from '@/components/EmployeeFormModal';
import CertificationFormModal from '@/components/CertificationFormModal';
import RosterView from '@/components/RosterView';
import { supabase } from '@/lib/supabase';
import { isShiftActive, isShiftUpcoming, getCertificationStatus } from '@/lib/utils';

type ViewMode = 'map' | 'roster';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [employeeFormOpen, setEmployeeFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
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

  async function handleSaveEmployee(employee: any) {
    try {
      if (employee.id) {
        // Update existing employee
        const { error } = await (supabase as any)
          .from('employees')
          .update({
            name: employee.name,
            role: employee.role,
            profile_photo_url: employee.profile_photo_url,
            contact_email: employee.contact_email,
            contact_phone: employee.contact_phone,
            status: employee.status,
            notes: employee.notes,
          })
          .eq('id', employee.id);

        if (error) throw error;
      } else {
        // Insert new employee
        const { error } = await (supabase as any)
          .from('employees')
          .insert({
            name: employee.name,
            role: employee.role,
            profile_photo_url: employee.profile_photo_url,
            contact_email: employee.contact_email,
            contact_phone: employee.contact_phone,
            status: employee.status,
            notes: employee.notes,
          });

        if (error) throw error;
      }

      // Reload data
      await loadData();
      setEmployeeFormOpen(false);
      setEditingEmployee(null);
    } catch (error: any) {
      console.error('Error saving employee:', error);
      throw new Error(error.message || 'Failed to save employee');
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
    setEditingEmployee(employee);
    setEmployeeFormOpen(true);
  }

  function handleAddEmployee() {
    setEditingEmployee(null);
    setEmployeeFormOpen(true);
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
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading Silverseal Guard Management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Silverseal Guard Management</h1>
                <p className="text-blue-100 text-sm">Secure Force Operations</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddEmployee}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                Add Employee
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'map'
                    ? 'bg-white text-blue-600 font-semibold'
                    : 'bg-blue-500 text-white hover:bg-blue-400'
                }`}
              >
                <Map className="w-5 h-5" />
                Map View
              </button>
              <button
                onClick={() => setViewMode('roster')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'roster'
                    ? 'bg-white text-blue-600 font-semibold'
                    : 'bg-blue-500 text-white hover:bg-blue-400'
                }`}
              >
                <List className="w-5 h-5" />
                Roster View
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        {viewMode === 'map' ? (
          <>
            <MapView
              sites={sites}
              siteStats={siteStats}
              clients={clients}
              onSiteClick={setSelectedSiteId}
            />
            <SitePanel
              site={selectedSite || null}
              assignments={siteAssignments}
              onClose={() => setSelectedSiteId(null)}
              onEmployeeClick={setSelectedEmployeeId}
            />
          </>
        ) : (
          <RosterView
            employees={employees}
            assignments={assignments}
            certifications={certifications}
            sites={sites}
            clients={clients}
            onEmployeeClick={setSelectedEmployeeId}
          />
        )}
      </main>

      {/* Employee Drawer (overlays both views) */}
      <EmployeeDrawer
        employee={selectedEmployee || null}
        certifications={employeeCertifications}
        documents={employeeDocuments}
        currentAssignment={currentAssignment || null}
        onClose={() => setSelectedEmployeeId(null)}
        onEdit={handleEditEmployee}
        onDelete={handleDeleteEmployee}
        onAddCertification={handleAddCertification}
        onEditCertification={handleEditCertification}
        onDeleteCertification={handleDeleteCertification}
      />

      {/* Employee Form Modal */}
      {employeeFormOpen && (
        <EmployeeFormModal
          employee={editingEmployee}
          onClose={() => {
            setEmployeeFormOpen(false);
            setEditingEmployee(null);
          }}
          onSave={handleSaveEmployee}
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
