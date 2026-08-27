const BRAND_CYAN = '#22C8E5';
const BRAND_BLUE = '#003258';
const BRAND_BLACK = '#04080f';

const IMPACT_BADGE = {
  High: 'background:#fee2e2;color:#dc2626',
  Medium: 'background:#fef9c3;color:#ca8a04',
  Low: 'background:#dcfce7;color:#16a34a',
};

function buildCategoryBars(categories) {
  return categories.map((cat) => {
    const pct = Math.min(100, Math.max(0, cat.score || 0));
    const barColor = pct >= 75 ? '#22d3a0' : pct >= 50 ? BRAND_CYAN : '#f59e0b';
    return `
      <div style="margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;">
          <span style="font-size:13px;font-weight:600;color:#1e293b;">${cat.label}</span>
          <span style="font-size:18px;font-weight:800;color:${BRAND_BLUE};">${pct}</span>
        </div>
        <div style="height:8px;background:#e2e8f0;border-radius:99px;overflow:hidden;">
          <div style="height:8px;background:${barColor};border-radius:99px;width:${pct}%;"></div>
        </div>
        <p style="font-size:11px;color:#64748b;margin-top:4px;">${cat.insight || ''}</p>
      </div>
    `;
  }).join('');
}

function normalizePDFReport(report) {
  const score = Number.isFinite(Number(report.overall_score)) ? Number(report.overall_score) : 60;
  const DEFAULT_CATS = {
    visual_identity: { label: 'Visual Identity', score: Math.min(100, score + 5), insight: 'Visual consistency needs attention.' },
    digital_presence: { label: 'Digital Presence', score, insight: 'Online footprint is average.' },
    brand_clarity: { label: 'Brand Clarity', score: Math.max(0, score - 5), insight: 'Brand voice could be sharper.' },
    audience_alignment: { label: 'Audience Alignment', score: Math.max(0, score - 8), insight: 'Messaging could speak more directly to your ideal client.' },
    competitive_position: { label: 'Competitive Position', score: Math.min(100, score + 2), insight: 'Standing out from competitors needs sharper differentiation.' },
  };
  let cats = report.categories;
  if (!cats || (typeof cats === 'object' && !Array.isArray(cats) && Object.keys(cats).length === 0)) cats = DEFAULT_CATS;
  if (Array.isArray(cats) && cats.length === 0) cats = DEFAULT_CATS;

  const DEFAULT_RECS = [
    { priority: 1, impact: 'High', effort: 'Medium', title: 'Develop Brand Guidelines', detail: 'Create a unified document to ensure visual consistency across all platforms.' },
    { priority: 2, impact: 'Medium', effort: 'Low', title: 'Refresh Website Messaging', detail: 'Update your copy to target your specific audience more directly.' },
    { priority: 3, impact: 'Medium', effort: 'High', title: 'Build a Content Strategy', detail: 'Implement a cohesive content calendar for your social channels.' },
  ];

  let recs = report.recommendations;
  if (!recs || !Array.isArray(recs) || recs.length === 0) {
    recs = DEFAULT_RECS;
  } else {
    recs = recs.map((r, i) => ({
      priority: r.priority ?? (i + 1),
      impact: r.impact || 'Medium',
      effort: r.effort || 'Medium',
      title: r.title || r.name || r.recommendation || DEFAULT_RECS[i]?.title || `Recommendation ${i + 1}`,
      detail: r.detail || r.description || r.details || DEFAULT_RECS[i]?.detail || '',
      roiNote: r.roi_note || r.roiNote || '',
    }));
    if (recs.every((r) => !r.title || r.title.startsWith('Recommendation'))) recs = DEFAULT_RECS;
  }

  const roadmap = Array.isArray(report.roadmap)
    ? report.roadmap.filter((p) => p && (p.phase || p.focus)).map((p) => ({
        phase: p.phase || '',
        focus: p.focus || '',
        actions: Array.isArray(p.actions) ? p.actions.filter(Boolean) : [],
      }))
    : [];

  const competitiveComparison = (report.competitive_comparison && report.competitive_comparison.available
    && Array.isArray(report.competitive_comparison.rows) && report.competitive_comparison.rows.length > 0)
    ? report.competitive_comparison
    : null;

  return {
    ...report,
    overall_score: score,
    grade: report.grade || 'C',
    headline: report.headline || report.summary || 'Your brand audit is complete.',
    categories: cats,
    strengths: Array.isArray(report.strengths) && report.strengths.length > 0
      ? report.strengths : ['Industry experience', 'Clear understanding of your challenges'],
    gaps: Array.isArray(report.gaps) && report.gaps.length > 0
      ? report.gaps : ['Inconsistent visual identity', 'Limited digital presence', 'Undefined target audience'],
    recommendations: recs,
    roadmap,
    competitiveComparison,
    cta: report.cta || 'Ready to take your brand to the next level? Let\'s build something great together.',
  };
}

function buildPrintHTML(rawReport, businessName, date) {
  const report = normalizePDFReport(rawReport);
  const categories = Array.isArray(report.categories)
    ? report.categories
    : Object.values(report.categories);
  const recs = report.recommendations || [];

  const gradeColor = report.grade === 'A' ? '#22d3a0'
    : report.grade === 'B' ? '#4ade80'
    : report.grade === 'C' ? '#facc15'
    : report.grade === 'D' ? '#fb923c'
    : '#f87171';

  const gradeLabel = { A: 'Excellent', B: 'Good', C: 'Average', D: 'Needs Work', F: 'Critical' }[report.grade] || '';

  const strengthsList = (report.strengths || []).map((s) => `
    <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;">
      <div style="flex-shrink:0;width:20px;height:20px;border-radius:50%;background:#dcfce7;display:flex;align-items:center;justify-content:center;margin-top:1px;">
        <span style="color:#16a34a;font-size:11px;font-weight:700;">✓</span>
      </div>
      <span style="font-size:13px;color:#374151;line-height:1.6;">${s}</span>
    </div>
  `).join('');

  const gapsList = (report.gaps || []).map((g) => `
    <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;">
      <div style="flex-shrink:0;width:20px;height:20px;border-radius:50%;background:#fff7ed;display:flex;align-items:center;justify-content:center;margin-top:1px;">
        <span style="color:#ea580c;font-size:11px;font-weight:700;">→</span>
      </div>
      <span style="font-size:13px;color:#374151;line-height:1.6;">${g}</span>
    </div>
  `).join('');

  const recCards = recs.map((rec, idx) => {
    const impactStyle = IMPACT_BADGE[rec.impact] || IMPACT_BADGE.Medium;
    const num = String(rec.priority || idx + 1).padStart(2, '0');
    return `
      <div style="background:white;border-radius:12px;padding:20px 24px;margin-bottom:16px;border:1px solid #e2e8f0;border-left:4px solid ${BRAND_CYAN};break-inside:avoid;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <div style="display:flex;align-items:flex-start;gap:16px;">
          <div style="font-size:36px;font-weight:900;color:#e2e8f0;line-height:1;flex-shrink:0;">${num}</div>
          <div style="flex:1;">
            <div style="font-size:15px;font-weight:700;color:${BRAND_BLUE};margin-bottom:6px;">${rec.title}</div>
            <div style="font-size:12px;color:#4b5563;line-height:1.7;margin-bottom:10px;">${rec.detail}</div>
            <div style="margin-bottom:10px;">
              <span style="font-size:10px;font-weight:700;${impactStyle};padding:3px 10px;border-radius:99px;margin-right:6px;">${rec.impact} Impact</span>
              <span style="font-size:10px;font-weight:700;background:#f1f5f9;color:#64748b;padding:3px 10px;border-radius:99px;">${rec.effort} Effort</span>
            </div>
            ${rec.roiNote ? `<div style="font-size:11px;color:${BRAND_BLUE};font-weight:600;border-top:1px solid #f1f5f9;padding-top:8px;">${rec.roiNote}</div>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  const categoryBars = buildCategoryBars(categories);

  const roadmap = report.roadmap || [];
  const roadmapCards = roadmap.map((phase) => `
    <div style="background:white;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:14px;break-inside:avoid;">
      <div style="font-size:10px;font-weight:700;color:${BRAND_CYAN};text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;">${phase.phase}</div>
      <div style="font-size:15px;font-weight:700;color:${BRAND_BLUE};margin-bottom:10px;">${phase.focus}</div>
      <ul>
        ${phase.actions.map((a) => `<li style="font-size:12px;color:#4b5563;line-height:1.9;">• ${a}</li>`).join('')}
      </ul>
    </div>
  `).join('');

  const comparison = report.competitiveComparison;
  const comparisonRows = comparison ? comparison.rows.map((row) => `
    <tr>
      <td style="padding:10px 12px;font-size:12px;color:#374151;font-weight:600;border-bottom:1px solid #f1f5f9;">${row.factor}</td>
      <td style="padding:10px 12px;font-size:12px;border-bottom:1px solid #f1f5f9;color:${row.edge === 'you' ? '#16a34a' : '#4b5563'};font-weight:${row.edge === 'you' ? '700' : '400'};">${row.you}</td>
      <td style="padding:10px 12px;font-size:12px;border-bottom:1px solid #f1f5f9;color:${row.edge === 'them' ? '#dc2626' : '#4b5563'};font-weight:${row.edge === 'them' ? '700' : '400'};">${row.them}</td>
    </tr>
  `).join('') : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>EVOBRAND Brand Audit — ${businessName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;500;600;700;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', Arial, sans-serif; color: #111827; background: white; }

    /* ── Cover ── */
    .cover {
      background: ${BRAND_BLACK};
      color: white;
      padding: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      page-break-after: always;
      position: relative;
      overflow: hidden;
    }
    .cover-accent {
      position: absolute;
      top: -120px; right: -120px;
      width: 500px; height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(34,200,229,0.12) 0%, transparent 70%);
      pointer-events: none;
    }
    .cover-accent2 {
      position: absolute;
      bottom: -80px; left: -80px;
      width: 360px; height: 360px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0,50,88,0.5) 0%, transparent 70%);
      pointer-events: none;
    }
    .cover-inner { padding: 56px 56px 40px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; position: relative; z-index: 1; }
    .cover-logo-img { height: 40px; margin-bottom: 60px; display: block; }
    .cover-eyebrow { font-size: 10px; color: ${BRAND_CYAN}; letter-spacing: 3px; text-transform: uppercase; font-weight: 600; margin-bottom: 12px; }
    .cover-business { font-family: 'Rajdhani', sans-serif; font-size: 44px; color: white; font-weight: 700; line-height: 1.05; max-width: 520px; }
    .cover-date { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 10px; }
    .cover-score-row { display: flex; align-items: stretch; gap: 16px; margin-top: 48px; }
    .score-card {
      background: ${BRAND_BLUE};
      border-radius: 16px;
      padding: 28px 32px;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .score-card-label { font-size: 9px; color: rgba(255,255,255,0.4); letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 8px; }
    .big-score { font-family: 'Rajdhani', sans-serif; font-size: 72px; color: ${BRAND_CYAN}; font-weight: 700; line-height: 1; }
    .grade-card {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 28px 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 120px;
    }
    .grade-ring {
      width: 70px; height: 70px; border-radius: 50%;
      border: 3px solid ${gradeColor};
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 8px;
    }
    .grade-letter { font-family: 'Rajdhani', sans-serif; font-size: 34px; color: ${gradeColor}; font-weight: 700; line-height: 1; }
    .grade-sub { font-size: 10px; color: rgba(255,255,255,0.35); letter-spacing: 1px; text-transform: uppercase; }
    .cover-headline { font-size: 14px; color: rgba(255,255,255,0.6); margin-top: 24px; line-height: 1.7; max-width: 540px; font-style: italic; }
    .cover-footer { font-size: 10px; color: rgba(255,255,255,0.2); border-top: 1px solid rgba(255,255,255,0.07); padding-top: 16px; }

    /* ── Page Layout ── */
    .page { padding: 52px 56px; page-break-before: always; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 36px; padding-bottom: 16px; border-bottom: 2px solid #f1f5f9; }
    .page-logo { height: 28px; opacity: 0.5; }
    .page-title { font-family: 'Rajdhani', sans-serif; font-size: 24px; font-weight: 700; color: ${BRAND_BLUE}; }
    .section-label { font-size: 9px; font-weight: 700; color: ${BRAND_CYAN}; letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 6px; }
    .section-heading { font-family: 'Rajdhani', sans-serif; font-size: 20px; font-weight: 700; color: ${BRAND_BLUE}; margin-bottom: 20px; }
    .divider { height: 1px; background: #f1f5f9; margin: 32px 0; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
    ul { list-style: none; }

    /* ── CTA Page ── */
    .cta-page {
      background: linear-gradient(135deg, ${BRAND_BLACK} 0%, ${BRAND_BLUE} 100%);
      color: white; padding: 80px 60px; text-align: center;
      min-height: 100vh; display: flex; flex-direction: column;
      justify-content: center; align-items: center;
      page-break-before: always;
    }
    .cta-eyebrow { font-size: 10px; color: ${BRAND_CYAN}; letter-spacing: 3px; text-transform: uppercase; font-weight: 600; margin-bottom: 16px; }
    .cta-title { font-family: 'Rajdhani', sans-serif; font-size: 36px; color: white; margin-bottom: 20px; line-height: 1.2; }
    .cta-text { font-size: 15px; color: rgba(255,255,255,0.7); line-height: 1.8; max-width: 480px; margin-bottom: 36px; }
    .cta-pill { display: inline-block; background: ${BRAND_CYAN}; color: ${BRAND_BLUE}; font-family: 'Rajdhani', sans-serif; font-size: 18px; font-weight: 700; padding: 12px 32px; border-radius: 99px; margin-bottom: 36px; }
    .cta-contact { font-size: 11px; color: rgba(255,255,255,0.3); line-height: 1.8; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { page-break-before: always; }
    }
  </style>
</head>
<body>

  <!-- ── Cover ── -->
  <div class="cover">
    <div class="cover-accent"></div>
    <div class="cover-accent2"></div>
    <div class="cover-inner">
      <div>
        <img class="cover-logo-img" src="${window.location.origin}/logo.png" alt="EVOBRAND" onerror="this.style.display='none'" />
        <div class="cover-eyebrow">Brand Audit Report · Confidential</div>
        <div class="cover-business">${businessName}</div>
        <div class="cover-date">Generated ${date}</div>
        <div class="cover-score-row">
          <div class="score-card">
            <div class="score-card-label">Overall Brand Score</div>
            <div class="big-score">${report.overall_score}<span style="font-size:28px;color:rgba(34,200,229,0.5)">/100</span></div>
          </div>
          <div class="grade-card">
            <div class="grade-ring"><span class="grade-letter">${report.grade}</span></div>
            <div class="grade-sub">${gradeLabel}</div>
          </div>
        </div>
        <div class="cover-headline">"${report.headline}"</div>
      </div>
      <div class="cover-footer">Confidential · EVOBRAND Concepts · evobrand.net</div>
    </div>
  </div>

  <!-- ── Category Scores ── -->
  <div class="page">
    <div class="page-header">
      <div class="page-title">Brand Performance Breakdown</div>
      <img class="page-logo" src="${window.location.origin}/logo.png" alt="EVOBRAND" onerror="this.style.display='none'" />
    </div>
    <div class="section-label">Score by Category</div>
    <div style="margin-top:8px;">${categoryBars}</div>
  </div>

  <!-- ── Strengths & Gaps ── -->
  <div class="page">
    <div class="page-header">
      <div class="page-title">Brand Analysis</div>
      <img class="page-logo" src="${window.location.origin}/logo.png" alt="EVOBRAND" onerror="this.style.display='none'" />
    </div>
    <div class="two-col">
      <div>
        <div class="section-label">What's Working</div>
        <div class="section-heading">Your Strengths</div>
        ${strengthsList}
      </div>
      <div>
        <div class="section-label">Where to Grow</div>
        <div class="section-heading">Growth Opportunities</div>
        ${gapsList}
      </div>
    </div>
  </div>

  ${comparison ? `
  <!-- ── Competitive Comparison ── -->
  <div class="page">
    <div class="page-header">
      <div class="page-title">Competitive Position</div>
      <img class="page-logo" src="${window.location.origin}/logo.png" alt="EVOBRAND" onerror="this.style.display='none'" />
    </div>
    <div class="section-label">Head-to-Head</div>
    <div class="section-heading">You vs. ${comparison.competitor_name || 'Your Competitor'}</div>
    ${comparison.summary ? `<p style="font-size:13px;color:#4b5563;line-height:1.7;margin-bottom:20px;">${comparison.summary}</p>` : ''}
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="border-bottom:2px solid #e2e8f0;">
          <th style="text-align:left;padding:8px 12px;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Factor</th>
          <th style="text-align:left;padding:8px 12px;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">${businessName}</th>
          <th style="text-align:left;padding:8px 12px;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">${comparison.competitor_name || 'Them'}</th>
        </tr>
      </thead>
      <tbody>${comparisonRows}</tbody>
    </table>
  </div>` : ''}

  <!-- ── Action Plan ── -->
  <div class="page">
    <div class="page-header">
      <div class="page-title">Your Action Plan</div>
      <img class="page-logo" src="${window.location.origin}/logo.png" alt="EVOBRAND" onerror="this.style.display='none'" />
    </div>
    <div class="section-label">Prioritized Recommendations</div>
    <div style="margin-top:16px;">${recCards}</div>
  </div>

  ${roadmap.length > 0 ? `
  <!-- ── 90-Day Roadmap ── -->
  <div class="page">
    <div class="page-header">
      <div class="page-title">90-Day Roadmap</div>
      <img class="page-logo" src="${window.location.origin}/logo.png" alt="EVOBRAND" onerror="this.style.display='none'" />
    </div>
    <div class="section-label">Your Path Forward</div>
    <div style="margin-top:16px;">${roadmapCards}</div>
  </div>` : ''}

  <!-- ── CTA ── -->
  <div class="cta-page">
    <div class="cta-eyebrow">Next Steps</div>
    <div class="cta-title">Ready to Elevate<br/>Your Brand?</div>
    <div class="cta-text">${report.cta}</div>
    <div class="cta-pill">evobrand.net</div>
    <div class="cta-contact">
      Keisha Solomon · CEO, EVOBRAND Concepts<br/>
      info@evobrand.net
    </div>
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
