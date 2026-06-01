import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Download } from 'lucide-react';
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
  ai_ethics: ['ai-app', 'visual', 'video', 'docs']
};

const ContractCustomizerPage = () => {
  const [clientInfo, setClientInfo] = useState({
    companyName: '',
    repName: '',
    date: new Date().toLocaleDateString()
  });

  const [selectedServices, setSelectedServices] = useState(['ai-app']);
  const [signature, setSignature] = useState('');

  const [clauses, setClauses] = useState({
    nda: true,
    ip: false,
    sla: true,
    wcag_clause: true,
    ai_ethics: true
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

  // Build the dynamic clauses for the contract preview
  const activeClauses = [
    { key: 'nda', title: 'Confidentiality', text: clauses.nda ? "Both parties agree to hold in strict confidence any proprietary or confidential information disclosed during the term of this Agreement. Data processing shall be governed by strict SOC-2 compliant procedures." : "Standard mutual confidentiality applies to direct trade secrets." },
    { key: 'ip', title: 'Intellectual Property', text: clauses.ip ? "Upon final payment, Client shall retain exclusive ownership of all final deliverables, source code, and custom models produced under this Agreement." : "Agency grants Client a perpetual, non-exclusive license to use the deliverables. Agency retains ownership of the underlying proprietary frameworks and foundational code." },
    { key: 'sla', title: 'Service Level', text: clauses.sla ? "Agency guarantees 99.9% uptime for deployed infrastructure, accompanied by 24/7 priority support and a 1-hour critical response time." : "Standard business-hours support is provided with a 24-hour response target." },
    { key: 'wcag_clause', title: 'WCAG Compliance Guarantee', text: clauses.wcag_clause ? "Agency guarantees that all delivered digital properties will meet or exceed WCAG 2.1 AA accessibility standards." : "Accessibility remediation is provided on a best-effort basis without strict liability guarantees." },
    { key: 'ai_ethics', title: 'Responsible AI & Ethics', text: clauses.ai_ethics ? "All generative models and AI agents are trained and deployed strictly adhering to responsible AI guidelines, ensuring bias mitigation, privacy, and explainability." : "Standard AI tooling is used without custom bias mitigation or ethical auditing constraints." }
  ].filter(c => isClauseRelevant(c.key));

  return (
    <>
      <SEO title="Contract Customizer" description="Build and customize your enterprise contract in real-time." />
      
      <style>{`
        @media print {
          html, body {
            background-color: white !important;
            color: black !important;
          }
          body * {
            visibility: hidden;
          }
          .print-contract-preview, .print-contract-preview * {
            visibility: visible;
            color: black !important;
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

      <div className="min-h-screen bg-[#0d0d18] flex flex-col pt-24">
        
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 lg:max-w-[1400px]">
            <div className="text-center mb-12">
              <span className="inline-block text-[#22c8e5] text-xs font-bold tracking-[0.15em] uppercase mb-4">
                Legal & Compliance
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                Enterprise Contract Builder
              </h1>
              <p className="text-[#8892a4] text-lg max-w-[600px] mx-auto">
                Select your services, input your details, and instantly generate a legally-binding Master Services Agreement.
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
                    <span>⚙️</span> Configure Agreement
                  </h3>
                  <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-[#22c8e5] text-[#003258] px-4 py-2 rounded-full font-bold hover:opacity-90 transition-opacity"
                  >
                    <Download size={16} /> Download PDF
                  </button>
                </div>

                {/* Client Info */}
                <div className="mb-8">
                  <div className="text-[#22c8e5] text-[0.75rem] font-bold uppercase tracking-[0.1em] mb-4 pb-2 border-b border-[rgba(255,255,255,0.08)]">
                    Client Details
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[0.8rem] font-semibold text-[#8892a4] mb-2 uppercase">Company Name</label>
                      <input 
                        type="text" 
                        value={clientInfo.companyName}
                        onChange={(e) => setClientInfo({...clientInfo, companyName: e.target.value})}
                        className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white p-3 rounded-lg text-[0.9rem] focus:outline-none focus:border-[#22c8e5]" 
                        placeholder="Acme Corp" 
                      />
                    </div>
                    <div>
                      <label className="block text-[0.8rem] font-semibold text-[#8892a4] mb-2 uppercase">Representative</label>
                      <input 
                        type="text" 
                        value={clientInfo.repName}
                        onChange={(e) => setClientInfo({...clientInfo, repName: e.target.value})}
                        className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white p-3 rounded-lg text-[0.9rem] focus:outline-none focus:border-[#22c8e5]" 
                        placeholder="Jane Doe" 
                      />
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

                {/* Clauses */}
                <div className="mb-6">
                  <div className="text-[#22c8e5] text-[0.75rem] font-bold uppercase tracking-[0.1em] mb-4 pb-2 border-b border-[rgba(255,255,255,0.08)] flex justify-between items-center">
                    <span>Legal Clauses</span>
                    {selectedServices.length === 0 && <span className="text-gray-500 font-normal normal-case">Select services to view relevant clauses</span>}
                  </div>
                  
                  {isClauseRelevant('nda') && (
                    <div 
                      onClick={() => toggleClause('nda')}
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors border mb-3 ${clauses.nda ? 'bg-[rgba(34,200,229,0.1)] border-[#22c8e5]' : 'border-[rgba(255,255,255,0.08)] hover:border-[rgba(34,200,229,0.4)]'}`}
                    >
                      <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center transition-colors flex-shrink-0 ${clauses.nda ? 'bg-[#22c8e5] border-[#22c8e5]' : 'border-gray-500'}`}>
                        {clauses.nda && <Check size={14} className="text-[#003258]" />}
                      </div>
                      <div>
                        <h4 className="text-white text-[0.9rem] font-semibold mb-1">Mutual NDA (Strict)</h4>
                        <p className="text-[#8892a4] text-[0.8rem]">Standard bi-directional non-disclosure agreement with strict data handling and destruction policies.</p>
                      </div>
                    </div>
                  )}

                  {isClauseRelevant('ip') && (
                    <div 
                      onClick={() => toggleClause('ip')}
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors border mb-3 ${clauses.ip ? 'bg-[rgba(34,200,229,0.1)] border-[#22c8e5]' : 'border-[rgba(255,255,255,0.08)] hover:border-[rgba(34,200,229,0.4)]'}`}
                    >
                      <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center transition-colors flex-shrink-0 ${clauses.ip ? 'bg-[#22c8e5] border-[#22c8e5]' : 'border-gray-500'}`}>
                        {clauses.ip && <Check size={14} className="text-[#003258]" />}
                      </div>
                      <div>
                        <h4 className="text-white text-[0.9rem] font-semibold mb-1">Full IP Transfer</h4>
                        <p className="text-[#8892a4] text-[0.8rem]">Client retains 100% ownership of custom source code, models, and assets upon project completion.</p>
                      </div>
                    </div>
                  )}

                  {isClauseRelevant('sla') && (
                    <div 
                      onClick={() => toggleClause('sla')}
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors border mb-3 ${clauses.sla ? 'bg-[rgba(34,200,229,0.1)] border-[#22c8e5]' : 'border-[rgba(255,255,255,0.08)] hover:border-[rgba(34,200,229,0.4)]'}`}
                    >
                      <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center transition-colors flex-shrink-0 ${clauses.sla ? 'bg-[#22c8e5] border-[#22c8e5]' : 'border-gray-500'}`}>
                        {clauses.sla && <Check size={14} className="text-[#003258]" />}
                      </div>
                      <div>
                        <h4 className="text-white text-[0.9rem] font-semibold mb-1">99.9% Uptime SLA</h4>
                        <p className="text-[#8892a4] text-[0.8rem]">Guaranteed enterprise uptime with 24/7 dedicated technical support and priority incident response.</p>
                      </div>
                    </div>
                  )}

                  {isClauseRelevant('wcag_clause') && (
                    <div 
                      onClick={() => toggleClause('wcag_clause')}
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors border mb-3 ${clauses.wcag_clause ? 'bg-[rgba(34,200,229,0.1)] border-[#22c8e5]' : 'border-[rgba(255,255,255,0.08)] hover:border-[rgba(34,200,229,0.4)]'}`}
                    >
                      <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center transition-colors flex-shrink-0 ${clauses.wcag_clause ? 'bg-[#22c8e5] border-[#22c8e5]' : 'border-gray-500'}`}>
                        {clauses.wcag_clause && <Check size={14} className="text-[#003258]" />}
                      </div>
                      <div>
                        <h4 className="text-white text-[0.9rem] font-semibold mb-1">WCAG Guarantee</h4>
                        <p className="text-[#8892a4] text-[0.8rem]">Legal guarantee that delivered digital properties will meet or exceed WCAG 2.1 AA accessibility standards.</p>
                      </div>
                    </div>
                  )}

                  {isClauseRelevant('ai_ethics') && (
                    <div 
                      onClick={() => toggleClause('ai_ethics')}
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors border mb-3 ${clauses.ai_ethics ? 'bg-[rgba(34,200,229,0.1)] border-[#22c8e5]' : 'border-[rgba(255,255,255,0.08)] hover:border-[rgba(34,200,229,0.4)]'}`}
                    >
                      <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center transition-colors flex-shrink-0 ${clauses.ai_ethics ? 'bg-[#22c8e5] border-[#22c8e5]' : 'border-gray-500'}`}>
                        {clauses.ai_ethics && <Check size={14} className="text-[#003258]" />}
                      </div>
                      <div>
                        <h4 className="text-white text-[0.9rem] font-semibold mb-1">Responsible AI</h4>
                        <p className="text-[#8892a4] text-[0.8rem]">Guarantee that generative models and agents adhere to ethical guidelines and bias mitigation.</p>
                      </div>
                    </div>
                  )}
                </div>

              </motion.div>

              {/* Preview Document */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-[2px] p-10 flex flex-col shadow-2xl h-fit sticky top-24 print-contract-preview"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                <div className="text-black text-[0.9rem] leading-[1.8]">
                  <h4 className="text-xl font-bold mb-8 text-center uppercase tracking-widest border-b-2 border-black pb-4">Master Services Agreement</h4>
                  
                  <p className="mb-6">
                    This Master Services Agreement ("Agreement") is entered into as of <strong>{clientInfo.date}</strong> (the "Effective Date"), by and between <strong>EVOBRAND</strong> ("Agency") and <strong>{clientInfo.companyName || '[CLIENT COMPANY NAME]'}</strong> ("Client").
                  </p>
                  
                  <h5 className="font-bold mt-6 mb-2 uppercase">1. Scope of Services</h5>
                  <p className="mb-4">Agency shall provide the following services to the Client as mutually agreed upon:</p>
                  <ul className="list-disc pl-8 mb-6">
                    {selectedServices.length === 0 && <li><em>No services selected.</em></li>}
                    {selectedServices.map(id => {
                      const service = availableServices.find(s => s.id === id);
                      return <li key={id}><strong>{service.label}</strong></li>;
                    })}
                  </ul>

                  <h5 className="font-bold mt-6 mb-2 uppercase">2. Terms & Conditions</h5>
                  
                  <div className="pl-4">
                    {activeClauses.length === 0 && <p><em>No specific legal clauses are applied to this agreement.</em></p>}
                    {activeClauses.map((clause, index) => (
                      <p className="mb-4" key={clause.key}>
                        <strong>2.{index + 1} {clause.title}:</strong> {clause.text}
                      </p>
                    ))}
                  </div>

                  <p className="mb-12 mt-6">
                    IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.
                  </p>

                  <div className="grid grid-cols-2 gap-12 mt-8">
                    <div>
                      <div className="border-b border-black mb-2 pb-1 font-signature text-xl">
                        EVOBRAND Authorized Rep
                      </div>
                      <p className="text-sm font-bold uppercase">Agency</p>
                      <p className="text-sm">Name: Keisha Solomon</p>
                      <p className="text-sm">Title: Digital Strategist</p>
                    </div>
                    <div>
                      <div className="border-b border-black mb-2">
                        <input 
                          type="text" 
                          value={signature}
                          onChange={(e) => setSignature(e.target.value)}
                          placeholder="Type full name to sign..."
                          className="w-full font-signature text-xl outline-none bg-transparent"
                          style={{ fontFamily: signature ? "'Brush Script MT', cursive" : "inherit" }}
                        />
                      </div>
                      <p className="text-sm font-bold uppercase">Client</p>
                      <p className="text-sm">Name: {clientInfo.repName || '[REPRESENTATIVE NAME]'}</p>
                      <p className="text-sm">Company: {clientInfo.companyName || '[COMPANY NAME]'}</p>
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
