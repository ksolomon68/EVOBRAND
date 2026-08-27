import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '@/components/SEO.jsx';
import AccessibilityResults from '@/components/accessibility/AccessibilityResults';
import { downloadAccessibilityPDF } from '@/components/accessibility/AccessibilityPDF';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : window.location.origin;

const AccessibilityCheckerResultsPage = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/accessibility/check/${id}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Report not found');
        }
        const data = await res.json();
        setReport(data);
      } catch (err) {
        setError(err.message || 'Could not load this accessibility report.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchReport();
  }, [id]);

  const handleDownloadPDF = () => {
    if (report) {
      downloadAccessibilityPDF(report, report.businessName || 'Your Business');
    }
  };

  if (loading) return <AccessibilityResults isLoading={true} report={null} />;

  if (error) {
    return (
      <div className="min-h-screen bg-[#04080f] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">⚠ {error}</p>
          <Link to="/accessibility-checker" className="text-[#22C8E5] font-semibold hover:underline">
            Start a new scan →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Accessibility Report"
        description="View your personalized WCAG accessibility report from EVOBRAND."
      />
      <AccessibilityResults
        report={report}
        isLoading={false}
        onDownloadPDF={handleDownloadPDF}
      />
    </>
  );
};

export default AccessibilityCheckerResultsPage;
