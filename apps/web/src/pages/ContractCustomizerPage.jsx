import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Download, FileText } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import SEO from '@/components/SEO.jsx';

const availableServices = [
  { id: 'ai-app', label: 'Custom AI App', icon: '⚡' },
  { id: 'visual', label: 'AI Visual Content', icon: '🎨' },
  { id: 'docs', label: 'Intelligent Docs', icon: '📄' },
  { id: 'video', label: 'AI Video Production', icon: '🎥' },
  { id: 'web', label: 'Web Development', icon: '💻' },
  { id: 'wcag', label: 'WCAG Accessibility', icon: '🛡️' }
];

const clauseMapping = {
  nda: ['ai-app', 'visual', 'docs', 'video', 'web', 'wcag'],
  ip: ['ai-app', 'visual', 'video', 'web'],
  sla: ['ai-app', 'web'],
  wcag_clause: ['wcag'],
  ai_ethics: ['ai-app', 'visual', 'video', 'docs'],
  // New clauses applicable to all services
  liability: ['ai-app', 'visual', 'docs', 'video', 'web', 'wcag'],
  indemnification: ['ai-app', 'visual', 'docs', 'video', 'web', 'wcag'],
  termination: ['ai-app', 'visual', 'docs', 'video', 'web', 'wcag'],
  force_majeure: ['ai-app', 'visual', 'docs', 'video', 'web', 'wcag'],
  late_payment: ['ai-app', 'visual', 'docs', 'video', 'web', 'wcag']
};

const formatCurrency = (value) => {
  const num = Number(value);
  if (!value || Number.isNaN(num)) return '$0.00';
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (dateStr) => {
  if (!dateStr) return '[DATE]';
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const todayISO = () => new Date().toISOString().slice(0, 10);

const ContractCustomizerPage = () => {
  const agency = {
    name: 'EVOBRAND Concepts LLC',
    address: 'Dallas, Texas 75001',
    email: 'info@evobrand.net'
  };

  const [clientInfo, setClientInfo] = useState({
    companyName: '',
    repName: '',
    title: '',
    email: '',
    address: '',
    phone: ''
  });

  const [project, setProject] = useState({
    description: '',
    startDate: todayISO(),
    completion: '8 weeks from start',
    fee: 5000,
    payment: '50% upfront, 50% on delivery',
    revisions: '3',
    state: 'Texas',
    dispute: 'Binding Arbitration (AAA)'
  });

  const [selectedServices, setSelectedServices] = useState(['ai-app']);
  const [signature, setSignature] = useState('');
  const [clientDate, setClientDate] = useState(todayISO());

  const [clauses, setClauses] = useState({
    nda: true,
    ip: false,
    sla: true,
    wcag_clause: true,
    ai_ethics: true,
    liability: true,
    indemnification: true,
    termination: true,
    force_majeure: true,
    late_payment: true
  });

  const toggleClause = (key) => {
    setClauses(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleService = (id) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const isClauseRelevant = (clauseKey) => {
    if (selectedServices.length === 0) return false;
    return selectedServices.some(service => clauseMapping[clauseKey].includes(service));
  };

  const clientName = clientInfo.companyName || '[CLIENT COMPANY NAME]';
  const repName = clientInfo.repName || '[REPRESENTATIVE NAME]';

  // Sidebar clause definitions (toggle metadata)
  const sidebarClauses = [
    { key: 'nda', title: 'Mutual NDA (Strict)', desc: 'Bi-directional non-disclosure with strict data handling and destruction policies.' },
    { key: 'ip', title: 'Full IP Transfer', desc: 'Client retains 100% ownership of custom source code, models, and assets upon final payment.' },
    { key: 'sla', title: '99.9% Uptime SLA', desc: 'Guaranteed enterprise uptime with 24/7 dedicated support and priority incident response.' },
    { key: 'wcag_clause', title: 'WCAG Guarantee', desc: 'Legal guarantee that deliverables meet or exceed WCAG 2.1 AA accessibility standards.' },
    { key: 'ai_ethics', title: 'Responsible AI', desc: 'Generative models and agents adhere to ethical guidelines and bias mitigation.' },
    { key: 'liability', title: 'Limitation of Liability', desc: clauses.liability ? 'Damages capped at fees paid in the prior 3 months; consequential damages excluded.' : 'Standard (uncapped) liability language applies.' },
    { key: 'indemnification', title: 'Indemnification', desc: 'Mutual indemnification covering third-party intellectual property claims.' },
    { key: 'termination', title: 'Termination Rights', desc: 'For cause with 14-day cure period; for convenience with 30-day notice.' },
    { key: 'force_majeure', title: 'Force Majeure', desc: 'Excuses performance during enumerated events beyond reasonable control.' },
    { key: 'late_payment', title: 'Late Payment & Suspension', desc: 'Permits 1.5%/month late fees and suspension of services for non-payment.' }
  ];

  // Document section builders
  const num = (i) => i; // simple counter helper

  return (
    <>
      <SEO title="Contract Customizer" description="Build and customize your enterprise Master Services Agreement in real-time." />

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-contract-preview, .print-contract-preview * {
            visibility: visible;
            color: black !important;
            background: white !important;
          }
          .print-contract-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            max-height: none !important;
            overflow: visible !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-[#0d0d18] flex flex-col pt-24 no-print">

        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 lg:max-w-[1400px]">
            <div className="text-center mb-12">
              <span className="inline-block text-[#22c8e5] text-xs font-bold tracking-[0.15em] uppercase mb-4">
                Legal &amp; Compliance
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                Master Services Agreement Builder
              </h1>
              <p className="text-[#8892a4] text-lg max-w-[640px] mx-auto">
                Select your services, input your details, and instantly generate a professionally complete, legally robust Master Services Agreement.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 items-start">

              {/* Builder Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-8 h-fit max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <FileText size={20} className="text-[#22c8e5]" /> Configure Agreement
                  </h3>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-[#22c8e5] text-[#003258] px-4 py-2 rounded-2xl font-bold hover:opacity-90 transition-opacity"
                  >
                    <Download size={16} /> Download PDF
                  </button>
                </div>

                {/* Agency (read-only) */}
                <div className="mb-8">
                  <div className="text-[#22c8e5] text-[0.75rem] font-bold uppercase tracking-[0.1em] mb-4 pb-2 border-b border-[rgba(255,255,255,0.08)]">
                    Agency
                  </div>
                  <div className="bg-[rgba(0,50,88,0.35)] border border-[rgba(34,200,229,0.25)] rounded-lg p-4">
                    <p className="text-white text-sm font-bold">{agency.name}</p>
                    <p className="text-[#8892a4] text-sm">{agency.address}</p>
                    <p className="text-[#8892a4] text-sm">{agency.email}</p>
                  </div>
                </div>

                {/* Client Details */}
                <div className="mb-8">
                  <div className="text-[#22c8e5] text-[0.75rem] font-bold uppercase tracking-[0.1em] mb-4 pb-2 border-b border-[rgba(255,255,255,0.08)]">
                    Client Details
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[0.8rem] font-semibold text-[#8892a4] mb-2 uppercase">Company Name</label>
                      <input type="text" value={clientInfo.companyName} onChange={(e) => setClientInfo({ ...clientInfo, companyName: e.target.value })} className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white p-3 rounded-lg text-[0.9rem] focus:outline-none focus:border-[#22c8e5]" placeholder="Acme Corp" />
                    </div>
                    <div>
                      <label className="block text-[0.8rem] font-semibold text-[#8892a4] mb-2 uppercase">Representative</label>
                      <input type="text" value={clientInfo.repName} onChange={(e) => setClientInfo({ ...clientInfo, repName: e.target.value })} className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white p-3 rounded-lg text-[0.9rem] focus:outline-none focus:border-[#22c8e5]" placeholder="Jane Doe" />
                    </div>
                    <div>
                      <label className="block text-[0.8rem] font-semibold text-[#8892a4] mb-2 uppercase">Title / Role</label>
                      <input type="text" value={clientInfo.title} onChange={(e) => setClientInfo({ ...clientInfo, title: e.target.value })} className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white p-3 rounded-lg text-[0.9rem] focus:outline-none focus:border-[#22c8e5]" placeholder="Chief Marketing Officer" />
                    </div>
                    <div>
                      <label className="block text-[0.8rem] font-semibold text-[#8892a4] mb-2 uppercase">Email Address</label>
                      <input type="email" value={clientInfo.email} onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })} className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white p-3 rounded-lg text-[0.9rem] focus:outline-none focus:border-[#22c8e5]" placeholder="jane@acme.com" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[0.8rem] font-semibold text-[#8892a4] mb-2 uppercase">Address (street, city/state/zip)</label>
                      <input type="text" value={clientInfo.address} onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })} className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white p-3 rounded-lg text-[0.9rem] focus:outline-none focus:border-[#22c8e5]" placeholder="123 Main St, Austin, TX 78701" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[0.8rem] font-semibold text-[#8892a4] mb-2 uppercase">Phone Number (optional)</label>
                      <input type="tel" value={clientInfo.phone} onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })} className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white p-3 rounded-lg text-[0.9rem] focus:outline-none focus:border-[#22c8e5]" placeholder="(555) 123-4567" />
                    </div>
                  </div>
                </div>

                {/* Project Details */}
                <div className="mb-8">
                  <div className="text-[#22c8e5] text-[0.75rem] font-bold uppercase tracking-[0.1em] mb-4 pb-2 border-b border-[rgba(255,255,255,0.08)]">
                    Project Details
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[0.8rem] font-semibold text-[#8892a4] mb-2 uppercase">Project Description</label>
                      <textarea rows={2} value={project.description} onChange={(e) => setProject({ ...project, description: e.target.value })} className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white p-3 rounded-lg text-[0.9rem] focus:outline-none focus:border-[#22c8e5] resize-none" placeholder="Brief description of the engagement and objectives..." />
                    </div>
                    <div>
                      <label className="block text-[0.8rem] font-semibold text-[#8892a4] mb-2 uppercase">Contract Start Date</label>
                      <input type="date" value={project.startDate} onChange={(e) => setProject({ ...project, startDate: e.target.value })} className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white p-3 rounded-lg text-[0.9rem] focus:outline-none focus:border-[#22c8e5]" />
                    </div>
                    <div>
                      <label className="block text-[0.8rem] font-semibold text-[#8892a4] mb-2 uppercase">Estimated Completion</label>
                      <input type="text" value={project.completion} onChange={(e) => setProject({ ...project, completion: e.target.value })} className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white p-3 rounded-lg text-[0.9rem] focus:outline-none focus:border-[#22c8e5]" placeholder="8 weeks from start" />
                    </div>
                    <div>
                      <label className="block text-[0.8rem] font-semibold text-[#8892a4] mb-2 uppercase">Total Project Fee</label>
                      <input type="number" value={project.fee} onChange={(e) => setProject({ ...project, fee: e.target.value })} className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white p-3 rounded-lg text-[0.9rem] focus:outline-none focus:border-[#22c8e5]" placeholder="5000" />
                    </div>
                    <div>
                      <label className="block text-[0.8rem] font-semibold text-[#8892a4] mb-2 uppercase">Revisions Included</label>
                      <select value={project.revisions} onChange={(e) => setProject({ ...project, revisions: e.target.value })} className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white p-3 rounded-lg text-[0.9rem] focus:outline-none focus:border-[#22c8e5]">
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="5">5</option>
                        <option value="Unlimited">Unlimited</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[0.8rem] font-semibold text-[#8892a4] mb-2 uppercase">Payment Structure</label>
                      <select value={project.payment} onChange={(e) => setProject({ ...project, payment: e.target.value })} className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white p-3 rounded-lg text-[0.9rem] focus:outline-none focus:border-[#22c8e5]">
                        <option>50% upfront, 50% on delivery</option>
                        <option>33% upfront, 33% at midpoint, 33% on delivery</option>
                        <option>Monthly retainer</option>
                        <option>Net 30 upon delivery</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[0.8rem] font-semibold text-[#8892a4] mb-2 uppercase">Governing State</label>
                      <select value={project.state} onChange={(e) => setProject({ ...project, state: e.target.value })} className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white p-3 rounded-lg text-[0.9rem] focus:outline-none focus:border-[#22c8e5]">
                        <option>Texas</option>
                        <option>California</option>
                        <option>New York</option>
                        <option>Florida</option>
                        <option>Delaware</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[0.8rem] font-semibold text-[#8892a4] mb-2 uppercase">Dispute Resolution</label>
                      <select value={project.dispute} onChange={(e) => setProject({ ...project, dispute: e.target.value })} className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white p-3 rounded-lg text-[0.9rem] focus:outline-none focus:border-[#22c8e5]">
                        <option>Binding Arbitration (AAA)</option>
                        <option>Mediation then Litigation</option>
                        <option>Litigation only</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Scope of Services */}
                <div className="mb-8">
                  <div className="text-[#22c8e5] text-[0.75rem] font-bold uppercase tracking-[0.1em] mb-4 pb-2 border-b border-[rgba(255,255,255,0.08)]">
                    Scope of Services (SOW)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableServices.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => toggleService(service.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border ${selectedServices.includes(service.id) ? 'bg-[rgba(34,200,229,0.1)] border-[#22c8e5]' : 'border-[rgba(255,255,255,0.08)] hover:border-[rgba(34,200,229,0.4)]'}`}
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${selectedServices.includes(service.id) ? 'bg-[#22c8e5] border-[#22c8e5]' : 'border-gray-500'}`}>
                          {selectedServices.includes(service.id) && <Check size={14} className="text-[#003258] font-bold" />}
                        </div>
                        <span className="text-white text-sm font-medium">{service.icon} {service.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legal Clauses */}
                <div className="mb-6">
                  <div className="text-[#22c8e5] text-[0.75rem] font-bold uppercase tracking-[0.1em] mb-4 pb-2 border-b border-[rgba(255,255,255,0.08)] flex justify-between items-center">
                    <span>Legal Clauses</span>
                    {selectedServices.length === 0 && <span className="text-gray-500 font-normal normal-case">Select services to view relevant clauses</span>}
                  </div>

                  {sidebarClauses.map((c) => (
                    isClauseRelevant(c.key) && (
                      <div
                        key={c.key}
                        onClick={() => toggleClause(c.key)}
                        className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors border mb-3 ${clauses[c.key] ? 'bg-[rgba(34,200,229,0.1)] border-[#22c8e5]' : 'border-[rgba(255,255,255,0.08)] hover:border-[rgba(34,200,229,0.4)]'}`}
                      >
                        <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center transition-colors flex-shrink-0 ${clauses[c.key] ? 'bg-[#22c8e5] border-[#22c8e5]' : 'border-gray-500'}`}>
                          {clauses[c.key] && <Check size={14} className="text-[#003258]" />}
                        </div>
                        <div>
                          <h4 className="text-white text-[0.9rem] font-semibold mb-1">{c.title}</h4>
                          <p className="text-[#8892a4] text-[0.8rem]">{c.desc}</p>
                        </div>
                      </div>
                    )
                  ))}
                </div>

              </motion.div>

              {/* Preview Document */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-[2px] p-10 flex flex-col shadow-2xl h-fit sticky top-24 max-h-[85vh] overflow-y-auto print-contract-preview"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                <div className="text-black text-[0.9rem] leading-[1.8]">
                  <h4 className="text-xl font-bold mb-2 text-center uppercase tracking-widest border-b-2 border-black pb-4">Master Services Agreement</h4>

                  <p className="mt-6 mb-6">
                    This Master Services Agreement (the &ldquo;Agreement&rdquo;) is entered into as of <strong>{formatDate(project.startDate)}</strong> (the &ldquo;Effective Date&rdquo;), by and between:
                  </p>

                  {/* Parties block */}
                  <div className="mb-6">
                    <p className="mb-2"><strong>{agency.name}</strong> (the &ldquo;Agency&rdquo;), located at {agency.address}, email {agency.email}; and</p>
                    <p>
                      <strong>{clientName}</strong> (the &ldquo;Client&rdquo;), located at {clientInfo.address || '[CLIENT ADDRESS]'}, represented by {repName}{clientInfo.title ? `, ${clientInfo.title}` : ''}, email {clientInfo.email || '[CLIENT EMAIL]'}{clientInfo.phone ? `, phone ${clientInfo.phone}` : ''}.
                    </p>
                    <p className="mt-2">The Agency and the Client are each a &ldquo;Party&rdquo; and collectively the &ldquo;Parties.&rdquo;</p>
                  </div>

                  {/* 1. Definitions */}
                  <h5 className="font-bold mt-6 mb-2 uppercase">1. Definitions</h5>
                  <p className="mb-4">For purposes of this Agreement: &ldquo;Services&rdquo; means the work described in Section 2; &ldquo;Deliverables&rdquo; means the tangible and intangible work product furnished to the Client; &ldquo;Confidential Information&rdquo; means non-public information disclosed by either Party; and &ldquo;Fees&rdquo; means the amounts payable under Section 3. Capitalized terms not otherwise defined have the meanings given to them in context.</p>

                  {/* 2. Scope of Services */}
                  <h5 className="font-bold mt-6 mb-2 uppercase">2. Scope of Services</h5>
                  <p className="mb-2">The Agency shall provide the following Services to the Client:</p>
                  <ul className="list-disc pl-8 mb-3">
                    {selectedServices.length === 0 && <li><em>No services selected.</em></li>}
                    {selectedServices.map(id => {
                      const service = availableServices.find(s => s.id === id);
                      return <li key={id}><strong>{service.label}</strong></li>;
                    })}
                  </ul>
                  <p className="mb-4"><strong>Project Description:</strong> {project.description || '[Project description to be provided by the Client.]'}</p>

                  {/* 3. Fees & Payment Terms */}
                  <h5 className="font-bold mt-6 mb-2 uppercase">3. Fees &amp; Payment Terms</h5>
                  <p className="mb-4">The total fee for the Services is <strong>{formatCurrency(project.fee)}</strong>, payable on the following basis: <strong>{project.payment}</strong>. All invoices are due upon receipt unless otherwise stated. Any amount not paid when due shall accrue interest at the rate of one and one-half percent (1.5%) per month (or the maximum rate permitted by law, if lower), and the Agency reserves the right to suspend performance of the Services upon written notice until all past-due amounts are paid in full. The Client shall reimburse the Agency for reasonable out-of-pocket costs and any taxes applicable to the Services.</p>

                  {/* 4. Project Timeline & Deliverables */}
                  <h5 className="font-bold mt-6 mb-2 uppercase">4. Project Timeline &amp; Deliverables</h5>
                  <p className="mb-4">The engagement shall commence on <strong>{formatDate(project.startDate)}</strong>, with an estimated completion of <strong>{project.completion || '[estimated completion]'}</strong>. Timeline estimates are made in good faith and are contingent upon the Client&rsquo;s timely provision of materials, approvals, and feedback. Delays caused by the Client may extend the schedule on a day-for-day basis. The Agency shall deliver the Deliverables in accordance with the Scope of Services set forth in Section 2.</p>

                  {/* 5. Revisions & Change Orders */}
                  <h5 className="font-bold mt-6 mb-2 uppercase">5. Revisions &amp; Change Orders</h5>
                  <p className="mb-4">This Agreement includes <strong>{project.revisions === 'Unlimited' ? 'unlimited' : project.revisions}</strong> round{project.revisions === '1' ? '' : 's'} of revisions for each Deliverable. Revisions beyond the included allotment, or any material change to the agreed scope, shall be documented in a written change order signed by both Parties and may be subject to additional fees at the Agency&rsquo;s then-current rates. No change order is effective until executed by both Parties.</p>

                  {/* 6. Intellectual Property */}
                  {isClauseRelevant('ip') && (
                    <>
                      <h5 className="font-bold mt-6 mb-2 uppercase">6. Intellectual Property</h5>
                      <p className="mb-4">{clauses.ip
                        ? 'Upon the Agency’s receipt of all Fees due under this Agreement, the Agency hereby assigns to the Client all right, title, and interest in and to the final Deliverables, including source code, custom models, and assets created specifically for the Client. The Agency retains ownership of its pre-existing tools, libraries, and know-how, and grants the Client a perpetual, royalty-free license to use such pre-existing materials solely as incorporated into the Deliverables.'
                        : 'The Agency retains all right, title, and interest in and to the Deliverables and underlying frameworks. Upon receipt of all Fees due, the Agency grants the Client a perpetual, non-exclusive, royalty-free license to use the Deliverables for the Client’s internal business purposes. The Client shall not resell, sublicense, or distribute the underlying proprietary frameworks without the Agency’s prior written consent.'}</p>
                    </>
                  )}

                  {/* 7. Confidentiality & NDA */}
                  {isClauseRelevant('nda') && (
                    <>
                      <h5 className="font-bold mt-6 mb-2 uppercase">7. Confidentiality &amp; NDA</h5>
                      <p className="mb-4">{clauses.nda
                        ? 'Each Party shall hold the other Party’s Confidential Information in strict confidence, use it solely to perform this Agreement, and protect it with no less than reasonable care. Confidential Information shall not be disclosed to any third party without prior written consent, and the receiving Party shall implement SOC 2-aligned safeguards. Upon termination or written request, the receiving Party shall promptly return or securely destroy all Confidential Information. These obligations survive termination for a period of five (5) years.'
                        : 'Each Party shall maintain the confidentiality of the other Party’s trade secrets and non-public business information disclosed in connection with this Agreement, and shall not disclose such information to third parties except as required to perform the Services. These obligations survive termination of this Agreement.'}</p>
                    </>
                  )}

                  {/* 8. Warranties & Disclaimers */}
                  <h5 className="font-bold mt-6 mb-2 uppercase">8. Warranties &amp; Disclaimers</h5>
                  <p className="mb-4">The Agency warrants that the Services will be performed in a professional and workmanlike manner consistent with generally accepted industry standards. EXCEPT FOR THE EXPRESS WARRANTY SET FORTH ABOVE, THE SERVICES AND DELIVERABLES ARE PROVIDED &ldquo;AS IS,&rdquo; AND THE AGENCY DISCLAIMS ALL OTHER WARRANTIES, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. The Agency does not warrant that the Deliverables will be uninterrupted or error-free.</p>

                  {/* 9. Service Level Agreement */}
                  {isClauseRelevant('sla') && (
                    <>
                      <h5 className="font-bold mt-6 mb-2 uppercase">9. Service Level Agreement</h5>
                      <p className="mb-4">{clauses.sla
                        ? 'The Agency shall use commercially reasonable efforts to maintain 99.9% uptime for deployed infrastructure, measured on a monthly basis and excluding scheduled maintenance. The Agency shall provide 24/7 priority support with a one-hour target response time for critical incidents. Failure to meet the committed uptime entitles the Client to service credits as the sole and exclusive remedy.'
                        : 'The Agency shall provide standard support during normal business hours with a target response time of twenty-four (24) hours. No specific uptime guarantee or service credits apply under this standard support tier.'}</p>
                    </>
                  )}

                  {/* 10. WCAG Accessibility Compliance */}
                  {isClauseRelevant('wcag_clause') && (
                    <>
                      <h5 className="font-bold mt-6 mb-2 uppercase">10. WCAG Accessibility Compliance</h5>
                      <p className="mb-4">{clauses.wcag_clause
                        ? 'The Agency guarantees that all delivered digital properties will conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA at the time of delivery. The Agency shall remediate, at no additional cost, any nonconformity identified within thirty (30) days of delivery, provided the Client has not modified the Deliverables.'
                        : 'The Agency will apply accessibility best practices on a commercially reasonable, best-effort basis. The Agency does not provide a strict liability guarantee of WCAG conformance under this tier.'}</p>
                    </>
                  )}

                  {/* 11. Responsible AI & Ethics */}
                  {isClauseRelevant('ai_ethics') && (
                    <>
                      <h5 className="font-bold mt-6 mb-2 uppercase">11. Responsible AI &amp; Ethics</h5>
                      <p className="mb-4">{clauses.ai_ethics
                        ? 'The Agency shall develop and deploy all generative models and AI systems in accordance with responsible AI principles, including bias mitigation, data privacy, transparency, and explainability. The Agency shall not use the Client’s Confidential Information to train models for the benefit of third parties without written consent. The Client remains responsible for its lawful use of any AI-generated outputs.'
                        : 'The Agency may use standard, commercially available AI tooling without bespoke bias-mitigation or ethical-auditing constraints. The Client is responsible for reviewing AI-generated outputs prior to use.'}</p>
                    </>
                  )}

                  {/* 12. Limitation of Liability */}
                  {isClauseRelevant('liability') && (
                    <>
                      <h5 className="font-bold mt-6 mb-2 uppercase">12. Limitation of Liability</h5>
                      <p className="mb-4">{clauses.liability
                        ? 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE AGENCY’S TOTAL CUMULATIVE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT SHALL NOT EXCEED THE TOTAL FEES ACTUALLY PAID BY THE CLIENT TO THE AGENCY DURING THE THREE (3) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM. IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR LOST PROFITS, REVENUE, OR DATA, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. The foregoing limitations apply regardless of the form of action, whether in contract, tort, or otherwise.'
                        : 'Each Party shall be liable for direct damages arising from its own negligence or willful misconduct in connection with this Agreement, subject to applicable law. Neither Party limits liability for indemnification obligations, breach of confidentiality, or matters that cannot be limited by law.'}</p>
                    </>
                  )}

                  {/* 13. Indemnification */}
                  {isClauseRelevant('indemnification') && (
                    <>
                      <h5 className="font-bold mt-6 mb-2 uppercase">13. Indemnification</h5>
                      <p className="mb-4">Each Party (the &ldquo;Indemnifying Party&rdquo;) shall defend, indemnify, and hold harmless the other Party from and against any third-party claims, damages, liabilities, and reasonable attorneys&rsquo; fees arising out of the Indemnifying Party&rsquo;s breach of this Agreement, negligence, or willful misconduct. The Agency shall additionally indemnify the Client against third-party claims alleging that the Deliverables, as delivered by the Agency, infringe such third party&rsquo;s intellectual property rights, excluding claims arising from Client-supplied materials or Client modifications. The indemnified Party shall provide prompt notice of any claim and reasonable cooperation in the defense.</p>
                    </>
                  )}

                  {/* 14. Termination */}
                  {isClauseRelevant('termination') && (
                    <>
                      <h5 className="font-bold mt-6 mb-2 uppercase">14. Termination</h5>
                      <p className="mb-4">Either Party may terminate this Agreement for cause if the other Party materially breaches this Agreement and fails to cure such breach within fourteen (14) days after receiving written notice describing the breach. Either Party may terminate for convenience upon thirty (30) days&rsquo; prior written notice to the other Party. Upon termination, the Client shall pay the Agency for all Services performed and expenses incurred through the effective date of termination, and the Agency shall deliver all paid-for work product. Sections concerning Confidentiality, Intellectual Property, Limitation of Liability, and Indemnification survive termination.</p>
                    </>
                  )}

                  {/* 15. Force Majeure */}
                  {isClauseRelevant('force_majeure') && (
                    <>
                      <h5 className="font-bold mt-6 mb-2 uppercase">15. Force Majeure</h5>
                      <p className="mb-4">Neither Party shall be liable for any delay or failure to perform its obligations (other than payment obligations) to the extent caused by events beyond its reasonable control, including acts of God, natural disasters, fire, flood, earthquake, war, terrorism, civil unrest, governmental action, labor disputes, epidemics or pandemics, power or telecommunications failures, and failures of third-party service providers. The affected Party shall provide prompt written notice and use commercially reasonable efforts to mitigate the impact and resume performance. If a force majeure event continues for more than sixty (60) days, either Party may terminate this Agreement upon written notice.</p>
                    </>
                  )}

                  {/* 16. Dispute Resolution */}
                  <h5 className="font-bold mt-6 mb-2 uppercase">16. Dispute Resolution</h5>
                  <p className="mb-4">{project.dispute === 'Binding Arbitration (AAA)'
                    ? `Any dispute arising out of or relating to this Agreement shall be resolved by final and binding arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules. The arbitration shall be conducted in ${project.state}, and judgment on the award may be entered in any court of competent jurisdiction. Each Party waives any right to a jury trial and to participate in a class action.`
                    : project.dispute === 'Mediation then Litigation'
                    ? `The Parties shall first attempt in good faith to resolve any dispute through non-binding mediation administered by a mutually agreed mediator. If the dispute is not resolved within thirty (30) days of the mediation request, either Party may pursue litigation in the state or federal courts located in ${project.state}.`
                    : `Any dispute arising out of or relating to this Agreement shall be resolved exclusively through litigation in the state or federal courts located in ${project.state}, and each Party consents to the personal jurisdiction of such courts.`}</p>

                  {/* 17. Governing Law */}
                  <h5 className="font-bold mt-6 mb-2 uppercase">17. Governing Law</h5>
                  <p className="mb-4">This Agreement shall be governed by and construed in accordance with the laws of the State of <strong>{project.state}</strong>, without regard to its conflict-of-laws principles. The Parties consent to the exclusive jurisdiction and venue of the courts located in {project.state} for any matter not subject to arbitration.</p>

                  {/* 18. General Provisions */}
                  <h5 className="font-bold mt-6 mb-2 uppercase">18. General Provisions</h5>
                  <p className="mb-4"><strong>Entire Agreement.</strong> This Agreement constitutes the entire agreement between the Parties and supersedes all prior or contemporaneous understandings. <strong>Amendments.</strong> No amendment is effective unless made in writing and signed by both Parties. <strong>Severability.</strong> If any provision is held unenforceable, the remaining provisions shall remain in full force and effect. <strong>No Waiver.</strong> A Party&rsquo;s failure to enforce any provision shall not constitute a waiver of its right to do so later. <strong>Counterparts.</strong> This Agreement may be executed in counterparts, each of which is deemed an original. <strong>Electronic Signatures.</strong> Signatures transmitted electronically or by typed name shall have the same legal effect as original signatures.</p>

                  <p className="mb-12 mt-6">
                    IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date.
                  </p>

                  {/* Signature block */}
                  <div className="grid grid-cols-2 gap-12 mt-8">
                    <div>
                      <div className="border-b border-black mb-2 pb-1 text-xl" style={{ fontFamily: "'Brush Script MT', cursive" }}>
                        Keisha Solomon
                      </div>
                      <p className="text-sm font-bold uppercase">Agency</p>
                      <p className="text-sm">Name: Keisha Solomon</p>
                      <p className="text-sm">Title: CEO, {agency.name}</p>
                      <p className="text-sm">Date: {formatDate(project.startDate)}</p>
                    </div>
                    <div>
                      <div className="border-b border-black mb-2">
                        <input
                          type="text"
                          value={signature}
                          onChange={(e) => setSignature(e.target.value)}
                          placeholder="Type full name to sign..."
                          className="w-full text-xl outline-none bg-transparent"
                          style={{ fontFamily: signature ? "'Brush Script MT', cursive" : 'inherit' }}
                        />
                      </div>
                      <p className="text-sm font-bold uppercase">Client</p>
                      <p className="text-sm">Name: {repName}</p>
                      <p className="text-sm">Title: {clientInfo.title || '[TITLE]'}</p>
                      <p className="text-sm">Company: {clientName}</p>
                      <p className="text-sm flex items-center gap-1">Date:&nbsp;
                        <input
                          type="date"
                          value={clientDate}
                          onChange={(e) => setClientDate(e.target.value)}
                          className="text-sm outline-none bg-transparent border-b border-gray-400"
                        />
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </main>

      </div>
    </>
  );
};

export default ContractCustomizerPage;
