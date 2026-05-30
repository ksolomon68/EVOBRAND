'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PaymentStep from './PaymentStep';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

const CLAUSES = [
  {
    id: 'scope',
    title: 'Scope of Work',
    text: 'EvoBrand LLC ("Contractor") agrees to perform the services as described in this agreement. The scope includes all deliverables explicitly outlined herein. Any additional work beyond this scope will require a written change order and may incur additional fees.',
  },
  {
    id: 'ip',
    title: 'IP Assignment',
    text: 'Upon receipt of full payment, all intellectual property created specifically for this project will be assigned to the Client. Pre-existing IP, third-party components, and general methodologies remain the property of EvoBrand LLC.',
  },
  {
    id: 'nda',
    title: 'Non-Disclosure Agreement',
    text: 'Both parties agree to keep confidential all proprietary information shared during the engagement. This obligation survives termination of the agreement for a period of five (5) years.',
  },
  {
    id: 'payment',
    title: 'Payment Terms',
    text: 'Invoices are due within thirty (30) days of issuance. Late payments are subject to a 1.5% monthly finance charge. EvoBrand reserves the right to suspend work for accounts past due by more than fifteen (15) days.',
  },
  {
    id: 'revisions',
    title: 'Revision Policy',
    text: 'This agreement includes up to three (3) revision rounds per deliverable. Additional revisions will be billed at our standard hourly rate. Revision requests must be submitted within ten (10) business days of delivery.',
  },
  {
    id: 'warranty',
    title: 'Warranty',
    text: 'EvoBrand warrants that all deliverables will be free from material defects for ninety (90) days following delivery. This warranty covers bug fixes directly related to the contracted work but excludes issues arising from third-party dependencies or client modifications.',
  },
  {
    id: 'governing',
    title: 'Governing Law',
    text: 'This agreement shall be governed by the laws of the State of Virginia, without regard to conflict of law provisions. Any disputes shall be resolved through binding arbitration in Washington, DC.',
  },
];

const PAYMENT_SCHEDULES = [
  { id: 'full', label: 'Full Upfront', description: '100% due before work begins' },
  { id: '50-50', label: '50/50 Split', description: '50% upfront, 50% upon delivery' },
  { id: '3-installments', label: '3 Installments', description: '34% / 33% / 33% milestones' },
];

interface FormData {
  company_name: string;
  contact_name: string;
  email: string;
  address: string;
  project_description: string;
  timeline: string;
  total_value: string;
  payment_schedule: string;
  initials: string;
}

export default function ContractBuilder() {
  const [selectedClauses, setSelectedClauses] = useState<Set<string>>(
    new Set(['scope', 'ip', 'payment'])
  );
  const [expandedClause, setExpandedClause] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [step, setStep] = useState<'build' | 'payment' | 'done'>('build');
  const [formData, setFormData] = useState<FormData>({
    company_name: '',
    contact_name: '',
    email: '',
    address: '',
    project_description: '',
    timeline: '',
    total_value: '',
    payment_schedule: '50-50',
    initials: '',
  });

  const toggleClause = (id: string) => {
    setSelectedClauses((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSign = () => {
    if (!formData.initials || !formData.company_name || !formData.contact_name) return;
    setStep('payment');
  };

  if (step === 'done') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
          <Check size={28} className="text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Contract Signed & Submitted</h3>
        <p className="text-gray-400">
          A copy has been sent to {formData.email}. Our team will be in touch within one business day.
        </p>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <PaymentStep
        contractData={formData}
        onComplete={() => setStep('done')}
      />
    );
  }

  const selectedClausesList = CLAUSES.filter((c) => selectedClauses.has(c.id));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Builder */}
        <div className="space-y-6">
          {/* Client info */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-4">
            <h3 className="text-white font-semibold">Client Information</h3>
            <Input label="Company Name" required placeholder="Acme Corporation" value={formData.company_name} onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))} />
            <Input label="Contact Name" required placeholder="Jane Smith" value={formData.contact_name} onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))} />
            <Input label="Email" type="email" required placeholder="jane@acme.com" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} />
            <Input label="Address" placeholder="123 Main St, Washington DC 20001" value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} />
          </div>

          {/* Project details */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-4">
            <h3 className="text-white font-semibold">Project Details</h3>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-300">Project Description <span className="text-blue-400">*</span></label>
              <textarea
                rows={3}
                placeholder="Describe the project scope..."
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                value={formData.project_description}
                onChange={(e) => setFormData(prev => ({ ...prev, project_description: e.target.value }))}
              />
            </div>
            <Input label="Timeline" placeholder="e.g., 6 months, Q3 2025" value={formData.timeline} onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))} />
            <Input label="Total Project Value (USD)" type="number" placeholder="500000" value={formData.total_value} onChange={(e) => setFormData(prev => ({ ...prev, total_value: e.target.value }))} />
          </div>

          {/* Clauses */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-3">
            <h3 className="text-white font-semibold mb-4">Contract Clauses</h3>
            {CLAUSES.map((clause) => (
              <div key={clause.id} className="border border-white/10 rounded-lg overflow-hidden">
                <div className="flex items-center gap-3 p-3">
                  <button
                    onClick={() => toggleClause(clause.id)}
                    className={cn(
                      'w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500',
                      selectedClauses.has(clause.id)
                        ? 'bg-[#0066ff] border-[#0066ff]'
                        : 'border-white/30 bg-white/5'
                    )}
                    aria-pressed={selectedClauses.has(clause.id)}
                    aria-label={`${selectedClauses.has(clause.id) ? 'Remove' : 'Add'} ${clause.title} clause`}
                  >
                    {selectedClauses.has(clause.id) && <Check size={11} className="text-white" />}
                  </button>
                  <span className="text-white text-sm font-medium flex-1">{clause.title}</span>
                  <button
                    onClick={() => setExpandedClause(expandedClause === clause.id ? null : clause.id)}
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label={`${expandedClause === clause.id ? 'Collapse' : 'Expand'} ${clause.title}`}
                  >
                    {expandedClause === clause.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
                <AnimatePresence>
                  {expandedClause === clause.id && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-3 text-gray-400 text-xs leading-relaxed border-t border-white/5 pt-3">
                        {clause.text}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Payment schedule */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-3">
            <h3 className="text-white font-semibold">Payment Schedule</h3>
            {PAYMENT_SCHEDULES.map((schedule) => (
              <button
                key={schedule.id}
                onClick={() => setFormData(prev => ({ ...prev, payment_schedule: schedule.id }))}
                className={cn(
                  'w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all',
                  formData.payment_schedule === schedule.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                )}
              >
                <div>
                  <p className="text-white text-sm font-medium">{schedule.label}</p>
                  <p className="text-gray-400 text-xs">{schedule.description}</p>
                </div>
                {formData.payment_schedule === schedule.id && (
                  <div className="w-5 h-5 rounded-full bg-[#0066ff] flex items-center justify-center">
                    <Check size={11} className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Signature */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-4">
            <h3 className="text-white font-semibold">E-Signature</h3>
            <p className="text-gray-400 text-sm">
              By entering your initials, you agree to the terms of this contract.
            </p>
            <Input
              label="Initials"
              required
              placeholder="e.g., JS"
              maxLength={4}
              value={formData.initials}
              onChange={(e) => setFormData(prev => ({ ...prev, initials: e.target.value.toUpperCase() }))}
              className="uppercase text-center text-2xl font-bold tracking-widest h-16"
            />
            <p className="text-xs text-gray-500">
              Signed on: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <Button
              onClick={handleSign}
              disabled={!formData.initials || !formData.company_name || !formData.contact_name}
              className="w-full"
            >
              Sign & Continue to Payment
            </Button>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="lg:sticky lg:top-24">
          <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-white font-semibold text-sm">Contract Preview</h3>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
              >
                {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                {showPreview ? 'Collapse' : 'Expand'}
              </button>
            </div>
            <div className={cn('overflow-auto transition-all', showPreview ? 'max-h-none' : 'max-h-96')}>
              <div className="p-6 font-mono text-xs text-gray-400 leading-relaxed space-y-4">
                <div className="text-center border-b border-white/10 pb-4">
                  <p className="text-white font-bold text-sm">SERVICE AGREEMENT</p>
                  <p className="text-gray-500 mt-1">EvoBrand LLC</p>
                </div>

                {formData.company_name && (
                  <p>
                    <strong className="text-gray-300">PARTIES:</strong> This agreement is between{' '}
                    <strong className="text-white">EvoBrand LLC</strong> ("Contractor") and{' '}
                    <strong className="text-white">{formData.company_name}</strong> ("Client").
                  </p>
                )}

                {formData.project_description && (
                  <p>
                    <strong className="text-gray-300">PROJECT:</strong> {formData.project_description}
                  </p>
                )}

                {formData.total_value && (
                  <p>
                    <strong className="text-gray-300">VALUE:</strong>{' '}
                    {formatCurrency(parseFloat(formData.total_value))} — Payment:{' '}
                    {PAYMENT_SCHEDULES.find(s => s.id === formData.payment_schedule)?.label}
                  </p>
                )}

                {selectedClausesList.map((clause) => (
                  <div key={clause.id}>
                    <p className="text-gray-300 font-bold uppercase">{clause.title}</p>
                    <p className="mt-1">{clause.text}</p>
                  </div>
                ))}

                {formData.initials && (
                  <div className="border-t border-white/10 pt-4">
                    <p>
                      <strong className="text-gray-300">SIGNATURE:</strong>{' '}
                      <span className="text-white font-bold text-lg">{formData.initials}</span>
                      {' '}({formData.contact_name || 'Client Representative'})
                    </p>
                    <p className="text-gray-500 mt-1">Date: {new Date().toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
