'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Calendar, Clock, User, CreditCard, ChevronRight } from 'lucide-react';
import BookingCalendar from './BookingCalendar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils';

const services = [
  {
    id: 'discovery',
    name: 'Discovery Call',
    price: 0,
    duration: '30 min',
    description: 'Free introductory call to explore your project needs',
  },
  {
    id: 'technical',
    name: 'Technical Consultation',
    price: 500,
    duration: '60 min',
    description: 'Deep-dive technical review with our senior architects',
  },
  {
    id: 'strategy',
    name: 'Full Strategy Session',
    price: 2500,
    duration: '2 hrs',
    description: 'Comprehensive strategy session with roadmap and proposal',
  },
];

const infoSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  company: z.string().min(1, 'Company is required'),
  email: z.string().email('Valid email required'),
  role: z.string().min(1, 'Role is required'),
});

type InfoFormData = z.infer<typeof infoSchema>;

type Step = 'service' | 'datetime' | 'info' | 'confirm';

export default function BookingForm() {
  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<(typeof services)[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [contactInfo, setContactInfo] = useState<InfoFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InfoFormData>({ resolver: zodResolver(infoSchema) });

  const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: 'service', label: 'Service', icon: <Calendar size={14} /> },
    { id: 'datetime', label: 'Date & Time', icon: <Clock size={14} /> },
    { id: 'info', label: 'Your Info', icon: <User size={14} /> },
    { id: 'confirm', label: 'Confirm', icon: <CreditCard size={14} /> },
  ];

  const stepIndex = steps.findIndex((s) => s.id === step);

  const handleInfoSubmit = (data: InfoFormData) => {
    setContactInfo(data);
    setStep('confirm');
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      if (selectedService && selectedService.price > 0) {
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceId: selectedService.id,
            serviceName: selectedService.name,
            price: selectedService.price,
            date: selectedDate?.toISOString(),
            time: selectedTime,
            ...contactInfo,
          }),
        });
        const data = await res.json() as { url?: string };
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      }

      // Free booking
      await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: selectedService?.name,
          service_price: selectedService?.price ?? 0,
          date: selectedDate?.toISOString(),
          time_slot: selectedTime,
          ...contactInfo,
        }),
      });
      setComplete(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (complete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
          <Check size={28} className="text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">You&apos;re Booked!</h3>
        <p className="text-gray-400 mb-6">
          {contactInfo?.name}, we&apos;ve confirmed your{' '}
          <strong className="text-white">{selectedService?.name}</strong> on{' '}
          <strong className="text-white">
            {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime}
          </strong>
          . A confirmation has been sent to {contactInfo?.email}.
        </p>
        <p className="text-gray-500 text-sm">
          Our team will send you a calendar invite and video link within 30 minutes.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Step indicator */}
      <div className="flex items-center justify-between">
        {steps.map((s, idx) => (
          <div key={s.id} className="flex items-center">
            <button
              onClick={() => idx < stepIndex && setStep(s.id)}
              disabled={idx > stepIndex}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                s.id === step
                  ? 'text-white'
                  : idx < stepIndex
                  ? 'text-blue-400 hover:text-blue-300 cursor-pointer'
                  : 'text-gray-600 cursor-default'
              }`}
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border transition-colors ${
                  s.id === step
                    ? 'bg-[#0066ff] border-[#0066ff] text-white'
                    : idx < stepIndex
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                    : 'bg-white/5 border-white/10 text-gray-600'
                }`}
              >
                {idx < stepIndex ? <Check size={12} /> : idx + 1}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {idx < steps.length - 1 && (
              <ChevronRight size={14} className="mx-2 text-gray-700" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Service */}
        {step === 'service' && (
          <motion.div
            key="service"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-white">Choose a Service</h3>
            {services.map((svc) => (
              <button
                key={svc.id}
                onClick={() => setSelectedService(svc)}
                className={`w-full p-5 rounded-xl border text-left transition-all duration-200 ${
                  selectedService?.id === svc.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white">{svc.name}</span>
                  <span className="text-sm font-bold text-blue-400">
                    {svc.price === 0 ? 'Free' : formatCurrency(svc.price)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{svc.duration}</span>
                  <span className="text-gray-400 text-sm">{svc.description}</span>
                </div>
              </button>
            ))}

            <Button
              className="w-full mt-4"
              disabled={!selectedService}
              onClick={() => setStep('datetime')}
            >
              Continue
            </Button>
          </motion.div>
        )}

        {/* Step 2: Date & Time */}
        {step === 'datetime' && (
          <motion.div
            key="datetime"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-semibold text-white">Select Date & Time</h3>
            <BookingCalendar
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateSelect={setSelectedDate}
              onTimeSelect={setSelectedTime}
            />
            <Button
              className="w-full"
              disabled={!selectedDate || !selectedTime}
              onClick={() => setStep('info')}
            >
              Continue
            </Button>
          </motion.div>
        )}

        {/* Step 3: Info */}
        {step === 'info' && (
          <motion.div
            key="info"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="text-lg font-semibold text-white mb-6">Your Information</h3>
            <form onSubmit={handleSubmit(handleInfoSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                required
                placeholder="Jane Smith"
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                label="Company"
                required
                placeholder="Acme Corporation"
                error={errors.company?.message}
                {...register('company')}
              />
              <Input
                label="Work Email"
                type="email"
                required
                placeholder="jane@acme.com"
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label="Your Role"
                required
                placeholder="CTO, Director of IT, etc."
                error={errors.role?.message}
                {...register('role')}
              />
              <Button type="submit" className="w-full">
                Continue
              </Button>
            </form>
          </motion.div>
        )}

        {/* Step 4: Confirm */}
        {step === 'confirm' && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-semibold text-white">Confirm Booking</h3>

            <div className="rounded-xl bg-white/5 border border-white/10 divide-y divide-white/10">
              {[
                { label: 'Service', value: selectedService?.name },
                {
                  label: 'Date',
                  value: selectedDate?.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  }),
                },
                { label: 'Time', value: selectedTime },
                { label: 'Name', value: contactInfo?.name },
                { label: 'Company', value: contactInfo?.company },
                { label: 'Email', value: contactInfo?.email },
                {
                  label: 'Total',
                  value: selectedService?.price === 0 ? 'Free' : formatCurrency(selectedService?.price ?? 0),
                  highlight: true,
                },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="flex items-center justify-between px-5 py-3">
                  <span className="text-gray-400 text-sm">{label}</span>
                  <span className={`text-sm font-medium ${highlight ? 'text-blue-400' : 'text-white'}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {selectedService && selectedService.price > 0 && (
              <p className="text-xs text-gray-500">
                You will be redirected to Stripe to complete payment securely.
              </p>
            )}

            <Button className="w-full" onClick={handleConfirm} loading={loading}>
              {selectedService?.price === 0 ? 'Confirm Booking' : 'Proceed to Payment'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
