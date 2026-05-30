'use client';

import { useState } from 'react';
import { CreditCard, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

interface PaymentStepProps {
  contractData: {
    company_name: string;
    total_value: string;
    payment_schedule: string;
  };
  onComplete: () => void;
}

export default function PaymentStep({ contractData, onComplete }: PaymentStepProps) {
  const [loading, setLoading] = useState(false);

  const totalValue = parseFloat(contractData.total_value) || 0;
  const depositAmount =
    contractData.payment_schedule === 'full'
      ? totalValue
      : contractData.payment_schedule === '50-50'
      ? totalValue * 0.5
      : totalValue * 0.34;

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contract_deposit',
          company: contractData.company_name,
          amount: depositAmount,
          description: `Contract Deposit — ${contractData.company_name}`,
        }),
      });
      const data = await res.json() as { url?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        // Fallback for demo
        onComplete();
      }
    } catch {
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
          <CreditCard size={24} className="text-blue-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-1">Deposit Payment</h3>
        <p className="text-gray-400 text-sm">
          Secure your project start date with a deposit
        </p>
      </div>

      <div className="rounded-xl bg-white/5 border border-white/10 divide-y divide-white/10">
        <div className="flex items-center justify-between p-4">
          <span className="text-gray-400 text-sm">Company</span>
          <span className="text-white text-sm font-medium">{contractData.company_name}</span>
        </div>
        <div className="flex items-center justify-between p-4">
          <span className="text-gray-400 text-sm">Total Project Value</span>
          <span className="text-white text-sm font-medium">{formatCurrency(totalValue)}</span>
        </div>
        <div className="flex items-center justify-between p-4">
          <span className="text-gray-400 text-sm">Payment Schedule</span>
          <span className="text-white text-sm font-medium">{contractData.payment_schedule}</span>
        </div>
        <div className="flex items-center justify-between p-4 bg-blue-500/5">
          <span className="text-gray-300 text-sm font-semibold">Deposit Due Today</span>
          <span className="text-blue-400 text-lg font-bold">{formatCurrency(depositAmount)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Lock size={12} />
        Payments processed securely via Stripe. Your card information is never stored.
      </div>

      <Button onClick={handlePayment} loading={loading} className="w-full" size="lg">
        <CreditCard size={16} />
        Pay {formatCurrency(depositAmount)} Deposit
      </Button>

      <button
        onClick={onComplete}
        className="w-full text-xs text-gray-500 hover:text-gray-400 transition-colors"
      >
        Skip for now — I will arrange payment separately
      </button>
    </div>
  );
}
