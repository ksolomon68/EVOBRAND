import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import SEO from '@/components/SEO.jsx';
import AuditResults from '@/components/auditor/AuditResults';
import { downloadAuditPDF } from '@/components/auditor/AuditPDF';

const AuditorResultsPage = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const { data, error: sbErr } = await supabase
          .from('brand_audits')
          .select('*')
          .eq('id', id)
          .single();

        if (sbErr) throw sbErr;
        if (!data) throw new Error('Audit not found');

        setReport({ ...data.full_report, id: data.id, businessName: data.business_name });
      } catch (err) {
        setError(err.message || 'Could not load this audit report.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAudit();
  }, [id]);

  const handleDownloadPDF = () => {
    if (report) {
      downloadAuditPDF(report, report.businessName || 'Your Brand');
    }
  };

  if (loading) return <AuditResults isLoading={true} report={null} />;

  if (error) {
    return (
      <div className="min-h-screen bg-[#04080f] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">⚠ {error}</p>
          <Link to="/auditor" className="text-[#22C8E5] font-semibold hover:underline">
            Start a new audit →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Audit Results"
        description="View your personalized AI-powered brand audit report from EVOBRAND."
      />
      <AuditResults
        report={report}
        isLoading={false}
        onDownloadPDF={handleDownloadPDF}
      />
    </>
  );
};

export default AuditorResultsPage;
