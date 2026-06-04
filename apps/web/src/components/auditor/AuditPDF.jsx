/**
 * AuditPDF — Generates a downloadable/printable PDF of the brand audit.
 * Uses a styled print window instead of @react-pdf/renderer to avoid
 * React multiple-instance bundling conflicts with Vite.
 */

const BRAND_CYAN = '#22C8E5';
const BRAND_BLUE = '#003258';
const BRAND_BLACK = '#04080f';

const IMPACT_COLORS = {
  High: { bg: '#fee2e2', color: '#dc2626' },
  Medium: { bg: '#fef9c3', color: '#ca8a04' },
  Low: { bg: '#dcfce7', color: '#16a34a' },
};

function buildPrintHTML(report, businessName, date) {
  const categories = report.categories ? Object.values(report.categories) : [];
  const recs = report.recommendations || [];

  const categoryRows = categories.map((cat) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 13px;">${cat.label}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb;">
        <div style="height: 6px; background: #e5e7eb; border-radius: 4px; overflow: hidden; width: 180px;">
          <div style="height: 6px; background: ${BRAND_CYAN}; border-radius: 4px; width: ${cat.score}%;"></div>
        </div>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: 700; color: ${BRAND_BLUE}; text-align: right;">${cat.score}/100</td>
    </tr>
    <tr><td colspan="3" style="padding: 4px 0 12px; font-size: 12px; color: #6b7280;">${cat.insight}</td></tr>
  `).join('');

  const strengthsList = (report.strengths || []).map((s) => `
    <li style="margin-bottom: 8px; font-size: 13px; color: #374151; line-height: 1.6;">
      <span style="color: #16a34a; margin-right: 6px;">✓</span>${s}
    </li>
  `).join('');

  const gapsList = (report.gaps || []).map((g) => `
    <li style="margin-bottom: 8px; font-size: 13px; color: #374151; line-height: 1.6;">
      <span style="color: ${BRAND_CYAN}; margin-right: 6px;">→</span>${g}
    </li>
  `).join('');

  const recCards = recs.map((rec) => {
    const ic = IMPACT_COLORS[rec.impact] || IMPACT_COLORS.Medium;
    return `
      <div style="background: #f9fafb; border-radius: 10px; padding: 18px; margin-bottom: 14px; border-left: 4px solid ${BRAND_CYAN}; break-inside: avoid;">
        <div style="font-size: 28px; font-weight: 900; color: #d1d5db; line-height: 1; margin-bottom: 6px;">${String(rec.priority).padStart(2, '0')}</div>
        <div style="font-size: 15px; font-weight: 700; color: ${BRAND_BLUE}; margin-bottom: 6px;">${rec.title}</div>
        <div style="font-size: 12px; color: #374151; line-height: 1.6; margin-bottom: 10px;">${rec.detail}</div>
        <span style="font-size: 10px; font-weight: 700; background: ${ic.bg}; color: ${ic.color}; padding: 3px 8px; border-radius: 4px; margin-right: 6px;">${rec.impact} Impact</span>
        <span style="font-size: 10px; font-weight: 700; background: #f3f4f6; color: #6b7280; padding: 3px 8px; border-radius: 4px;">${rec.effort} Effort</span>
      </div>
    `;
  }).join('');

  const gradeColor = report.grade === 'A' ? BRAND_CYAN
    : report.grade === 'B' ? '#4ade80'
    : report.grade === 'C' ? '#facc15'
    : report.grade === 'D' ? '#fb923c'
    : '#f87171';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>EVOBRAND Brand Audit — ${businessName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Source+Sans+3:wght@400;600&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Source Sans 3', Arial, sans-serif; color: #111; background: white; }
    
    /* Cover page */
    .cover { background: ${BRAND_BLACK}; color: white; padding: 60px 50px; min-height: 100vh; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; }
    .cover-logo-img { height: 48px; margin-bottom: 40px; display: block; }
    .cover-sub { font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px; }
    .cover-business { font-family: 'Rajdhani', sans-serif; font-size: 40px; color: white; font-weight: 700; line-height: 1.1; }
    .cover-date { font-size: 13px; color: rgba(255,255,255,0.4); margin-top: 8px; }
    .score-box { background: ${BRAND_BLUE}; border-radius: 16px; padding: 32px; display: flex; align-items: center; justify-content: space-between; margin-top: 40px; }
    .big-score { font-family: 'Rajdhani', sans-serif; font-size: 80px; color: ${BRAND_CYAN}; font-weight: 700; line-height: 1; }
    .grade-circle { width: 64px; height: 64px; border-radius: 50%; border: 2px solid ${gradeColor}; display: flex; align-items: center; justify-content: center; }
    .grade-letter { font-family: 'Rajdhani', sans-serif; font-size: 32px; color: ${gradeColor}; font-weight: 700; }
    .cover-headline { font-size: 16px; color: rgba(255,255,255,0.75); margin-top: 24px; line-height: 1.6; }
    .cover-footer { font-size: 11px; color: rgba(255,255,255,0.25); }

    /* Report pages */
    .page { padding: 50px; page-break-before: always; }
    .section-title { font-family: 'Rajdhani', sans-serif; font-size: 22px; font-weight: 700; color: ${BRAND_BLUE}; border-bottom: 3px solid ${BRAND_CYAN}; padding-bottom: 10px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
    ul { list-style: none; }
    
    /* CTA page */
    .cta-page { background: ${BRAND_BLUE}; color: white; padding: 60px; text-align: center; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-before: always; }
    .cta-title { font-family: 'Rajdhani', sans-serif; font-size: 32px; color: ${BRAND_CYAN}; margin-bottom: 20px; }
    .cta-text { font-size: 16px; color: rgba(255,255,255,0.8); line-height: 1.7; max-width: 500px; margin-bottom: 28px; }
    .cta-url { font-family: 'Rajdhani', sans-serif; font-size: 22px; color: ${BRAND_CYAN}; }
    .cta-contact { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 24px; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="cover">
    <div>
      <img class="cover-logo-img" src="${window.location.origin}/logo.png" alt="EVOBRAND" />
      <div class="cover-sub">Brand Audit Report</div>
      <div class="cover-business">${businessName}</div>
      <div class="cover-date">Generated ${date}</div>
      <div class="score-box">
        <div>
          <div style="font-size:11px; color:rgba(255,255,255,0.4); letter-spacing:2px; text-transform:uppercase; margin-bottom:8px;">OVERALL BRAND SCORE</div>
          <div class="big-score">${report.overall_score}</div>
        </div>
        <div style="text-align:center;">
          <div class="grade-circle"><span class="grade-letter">${report.grade}</span></div>
          <div style="font-size:10px; color:rgba(255,255,255,0.35); margin-top:6px;">Grade</div>
        </div>
      </div>
      <div class="cover-headline">${report.headline}</div>
    </div>
    <div class="cover-footer">Confidential · EVOBRAND Concepts · evobrand.net · Dallas, TX</div>
  </div>

  <!-- Category Scores -->
  <div class="page">
    <div class="section-title">Category Breakdown</div>
    <table>${categoryRows}</table>
  </div>

  <!-- Strengths & Gaps -->
  <div class="page">
    <div class="two-col">
      <div>
        <div class="section-title">What's Working</div>
        <ul>${strengthsList}</ul>
      </div>
      <div>
        <div class="section-title">Growth Opportunities</div>
        <ul>${gapsList}</ul>
      </div>
    </div>
  </div>

  <!-- Recommendations -->
  <div class="page">
    <div class="section-title">Your Action Plan</div>
    ${recCards}
  </div>

  <!-- CTA -->
  <div class="cta-page">
    <div class="cta-title">Ready to Elevate Your Brand?</div>
    <div class="cta-text">${report.cta}</div>
    <div class="cta-url">evobrand.net</div>
    <div class="cta-contact">Keisha Solomon · CEO, EVOBRAND Concepts · info@evobrand.net · Dallas, TX</div>
  </div>
</body>
</html>`;
}

export const downloadAuditPDF = (report, businessName) => {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const html = buildPrintHTML(report, businessName, date);
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    alert('Please allow popups to download the PDF report.');
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  // Trigger print dialog after styles load
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };
};

export default null;
