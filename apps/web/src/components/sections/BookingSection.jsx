import React, { useState } from 'react';
import { motion } from 'framer-motion';

const BookingSection = () => {
  const [selectedDay, setSelectedDay] = useState(15);
  const [selectedTime, setSelectedTime] = useState('4:00 PM');
  const [selectedService, setSelectedService] = useState('automation');
  const [currentMonth, setCurrentMonth] = useState('June 2026');

  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', 
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
  ];

  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  const availableServices = [
    { id: 'ai-app', label: 'Custom AI App', icon: '⚡' },
    { id: 'visual', label: 'AI Visual Content', icon: '🎨' },
    { id: 'docs', label: 'Intelligent Docs', icon: '📄' },
    { id: 'video', label: 'AI Video Production', icon: '🎥' },
    { id: 'web', label: 'Web Development', icon: '💻' },
    { id: 'wcag', label: 'WCAG Accessibility', icon: '🛡️' }
  ];

  return (
    <section id="booking" className="py-20 bg-[#0d0d18]">
      <div className="container mx-auto px-4 lg:max-w-[1200px]">
        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-[#22c8e5] text-xs font-bold tracking-[0.15em] uppercase mb-4"
          >
            Schedule a Meeting
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold mb-4 text-white"
          >
            Book a Strategy Call
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[#8892a4] text-lg max-w-[600px] mx-auto leading-relaxed"
          >
            Select a service, choose a date and time, and let's start building your competitive advantage.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[20px] overflow-hidden"
        >
          {/* Calendar */}
          <div className="p-8 lg:border-r border-[rgba(255,255,255,0.08)] border-b lg:border-b-0">
            <div className="flex items-center justify-between mb-6">
              <button className="w-8 h-8 rounded-md border border-[rgba(255,255,255,0.08)] text-white flex items-center justify-center hover:bg-[#22c8e5] hover:border-[#22c8e5] transition-all">
                &#8249;
              </button>
              <h3 className="text-white font-bold text-base">{currentMonth}</h3>
              <button className="w-8 h-8 rounded-md border border-[rgba(255,255,255,0.08)] text-white flex items-center justify-center hover:bg-[#22c8e5] hover:border-[#22c8e5] transition-all">
                &#8250;
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-6">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-[0.7rem] text-[#8892a4] font-semibold p-1 uppercase">
                  {day}
                </div>
              ))}
              
              {/* Empty padding days for June 2026 starting on Monday */}
              <div className="cal-day empty cursor-default"></div>

              {days.map(day => (
                <div 
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`text-center p-2 text-[0.85rem] rounded-md cursor-pointer transition-all border border-transparent
                    ${selectedDay === day 
                      ? 'bg-[#22c8e5] border-[#22c8e5] text-[#003258] font-bold' 
                      : 'hover:bg-[rgba(34,200,229,0.15)] hover:border-[rgba(34,200,229,0.3)] text-white'}
                  `}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="mb-4">
              <p className="text-[0.75rem] font-bold text-[#8892a4] uppercase tracking-[0.06em] mb-3">
                Available Times (EST)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map(time => (
                  <button 
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-2 rounded-md text-[0.8rem] text-center transition-all border
                      ${selectedTime === time
                        ? 'bg-[#22c8e5] border-[#22c8e5] text-[#003258] font-bold'
                        : 'bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-[#8892a4] hover:bg-[#22c8e5] hover:border-[#22c8e5] hover:text-[#003258]'
                      }
                    `}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="p-8">
            <div className="flex gap-2 mb-8">
              <div className="flex-1 h-[3px] rounded-sm bg-[#22c8e5]"></div>
              <div className="flex-1 h-[3px] rounded-sm bg-[rgba(34,200,229,0.5)]"></div>
              <div className="flex-1 h-[3px] rounded-sm bg-[rgba(255,255,255,0.08)]"></div>
            </div>

            <form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                {availableServices.map((service) => (
                  <div 
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`border rounded-lg p-3 cursor-pointer transition-all flex items-center gap-2 ${
                      selectedService === service.id 
                        ? 'bg-[rgba(34,200,229,0.15)] border-[#22c8e5]' 
                        : 'bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] hover:border-[rgba(34,200,229,0.4)]'
                    }`}
                  >
                    <span className="text-xl">{service.icon}</span>
                    <span className="text-[0.85rem] text-white font-medium">{service.label}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.8rem] font-semibold text-[#8892a4] mb-2 uppercase tracking-[0.06em]">First Name</label>
                  <input type="text" className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white p-3 rounded-lg text-[0.9rem] focus:outline-none focus:border-[#22c8e5] transition-colors mb-5" placeholder="John" />
                </div>
                <div>
                  <label className="block text-[0.8rem] font-semibold text-[#8892a4] mb-2 uppercase tracking-[0.06em]">Last Name</label>
                  <input type="text" className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white p-3 rounded-lg text-[0.9rem] focus:outline-none focus:border-[#22c8e5] transition-colors mb-5" placeholder="Doe" />
                </div>
              </div>

              <div>
                <label className="block text-[0.8rem] font-semibold text-[#8892a4] mb-2 uppercase tracking-[0.06em]">Work Email</label>
                <input type="email" className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white p-3 rounded-lg text-[0.9rem] focus:outline-none focus:border-[#22c8e5] transition-colors mb-5" placeholder="john@company.com" />
              </div>

              <div>
                <label className="block text-[0.8rem] font-semibold text-[#8892a4] mb-2 uppercase tracking-[0.06em]">Project Details</label>
                <textarea className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white p-3 rounded-lg text-[0.9rem] focus:outline-none focus:border-[#22c8e5] transition-colors mb-5 min-h-[80px]" placeholder="Briefly describe your objectives..."></textarea>
              </div>

              <button type="button" className="w-full bg-[#22c8e5] text-[#003258] p-4 rounded-full font-bold hover:shadow-lg hover:bg-opacity-90 transition-all">
                Confirm Booking
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BookingSection;
