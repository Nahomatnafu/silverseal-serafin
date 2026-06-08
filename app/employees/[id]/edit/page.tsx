'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import EmployeeFormPage from '@/components/EmployeeFormPage';

export default function EditEmployeePage() {
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<any>(null);
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [{ data: emp }, { data: certRows }] = await Promise.all([
        supabase.from('employees').select('*').eq('id', id).single(),
        supabase.from('certifications').select('*').eq('employee_id', id),
      ]);
      if (!emp) { setNotFound(true); }
      else { setEmployee(emp); setCerts(certRows ?? []); }
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <span className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading employee…</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="text-center text-gray-500">
          <p className="text-lg font-semibold">Employee not found</p>
          <a href="/" className="text-blue-600 text-sm mt-2 inline-block hover:underline">← Back to dashboard</a>
        </div>
      </div>
    );
  }

  return <EmployeeFormPage employee={employee} existingCerts={certs} />;
}
