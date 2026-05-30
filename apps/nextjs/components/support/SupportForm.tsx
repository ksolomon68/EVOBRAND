'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().min(1),
  plan: z.string().min(1),
  subject: z.string().min(5),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  message: z.string().min(20, 'Please provide at least 20 characters'),
});

type FormData = z.infer<typeof schema>;

export default function SupportForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, type: 'support_ticket' }),
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-10">
        <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
          <Check size={24} className="text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Ticket Submitted</h3>
        <p className="text-gray-400">
          We&apos;ll respond within your plan&apos;s SLA window. Check your email for a confirmation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input label="Full Name" required placeholder="Jane Smith" error={errors.name?.message} {...register('name')} />
        <Input label="Work Email" type="email" required placeholder="jane@company.com" error={errors.email?.message} {...register('email')} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input label="Company" required placeholder="Acme Corp" error={errors.company?.message} {...register('company')} />
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">
            Support Plan <span className="text-blue-400">*</span>
          </label>
          <select
            {...register('plan')}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" className="bg-[#0d0d14]">Select plan...</option>
            <option value="starter" className="bg-[#0d0d14]">Starter</option>
            <option value="professional" className="bg-[#0d0d14]">Professional</option>
            <option value="enterprise" className="bg-[#0d0d14]">Enterprise</option>
          </select>
          {errors.plan && <p className="text-xs text-red-400">{errors.plan.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input label="Subject" required placeholder="Brief description of the issue" error={errors.subject?.message} {...register('subject')} />
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">
            Priority <span className="text-blue-400">*</span>
          </label>
          <select
            {...register('priority')}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low" className="bg-[#0d0d14]">Low</option>
            <option value="medium" className="bg-[#0d0d14]">Medium</option>
            <option value="high" className="bg-[#0d0d14]">High</option>
            <option value="critical" className="bg-[#0d0d14]">Critical</option>
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-300">
          Message <span className="text-blue-400">*</span>
        </label>
        <textarea
          {...register('message')}
          rows={5}
          placeholder="Describe the issue in detail, including steps to reproduce, expected behavior, and any error messages..."
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        {errors.message && <p className="text-xs text-red-400">{errors.message.message}</p>}
      </div>
      <Button type="submit" loading={loading}>Submit Support Ticket</Button>
    </form>
  );
}
