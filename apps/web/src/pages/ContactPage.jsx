
import React from 'react';
import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Facebook, Youtube, Linkedin, Instagram, Calendar } from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    service: '',
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const services = [
    'Custom AI Applications',
    'AI Visual Content Creation',
    'Intelligent Document Generation',
    'AI Video Production',
    'WordPress & Web Development',
    'General Inquiry'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ service: '', name: '', email: '', message: '' });
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <Helmet>
        <title>Contact EVOBRAND - Get Your Free AI Consultation | Dallas, TX</title>
        <meta name="description" content="Contact EVOBRAND for AI solutions. Schedule a free consultation, call +1 214-531-4427, or email info@evobrand.net. Dallas, Texas office." />
      </Helmet>

      <div className="min-h-screen bg-[#0f1419]">
        {/* Hero */}
        <section className="py-20 bg-gradient-to-br from-[#1a2332] to-[#0f1419]">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Let's <span className="text-[#22c8e5]">Connect</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Ready to transform your business with AI? Get in touch for a free consultation
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-12 bg-[#1a2332]">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-[#0f1419] p-6 rounded-xl text-center"
              >
                <Phone className="text-[#22c8e5] mx-auto mb-3" size={32} />
                <h3 className="text-white font-bold mb-2">Phone</h3>
                <a href="tel:+12145314427" className="text-gray-400 hover:text-[#22c8e5] transition-colors block">
                  +1 214-531-4427
                </a>
                <a href="tel:+14693602723" className="text-gray-400 hover:text-[#22c8e5] transition-colors block text-sm mt-1">
                  Mobile: +1 469-360-2723
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-[#0f1419] p-6 rounded-xl text-center"
              >
                <Mail className="text-[#22c8e5] mx-auto mb-3" size={32} />
                <h3 className="text-white font-bold mb-2">Email</h3>
                <a href="mailto:info@evobrand.net" className="text-gray-400 hover:text-[#22c8e5] transition-colors">
                  info@evobrand.net
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-[#0f1419] p-6 rounded-xl text-center"
              >
                <MapPin className="text-[#22c8e5] mx-auto mb-3" size={32} />
                <h3 className="text-white font-bold mb-2">Location</h3>
                <p className="text-gray-400">Dallas, Texas</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-[#0f1419] p-6 rounded-xl text-center"
              >
                <Clock className="text-[#22c8e5] mx-auto mb-3" size={32} />
                <h3 className="text-white font-bold mb-2">Office Hours</h3>
                <p className="text-gray-400 text-sm">Monday - Friday</p>
                <p className="text-gray-400 text-sm">10:00 AM - 6:00 PM CST</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact Form & Scheduler */}
        <section className="py-20 bg-[#0f1419]">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-[#1a2332] p-8 rounded-xl"
              >
                <h2 className="text-3xl font-bold text-white mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-white font-semibold mb-2">Service Interest</label>
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#0f1419] text-white border border-gray-700 rounded-lg focus:outline-none focus:border-[#22c8e5]"
                      required
                    >
                      <option value="">Select a service</option>
                      {services.map((service) => (
                        <option key={service} value={service}>{service}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#0f1419] text-white border border-gray-700 rounded-lg focus:outline-none focus:border-[#22c8e5]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#0f1419] text-white border border-gray-700 rounded-lg focus:outline-none focus:border-[#22c8e5]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="5"
                      className="w-full px-4 py-3 bg-[#0f1419] text-white border border-gray-700 rounded-lg focus:outline-none focus:border-[#22c8e5]"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-4 bg-[#22c8e5] text-white rounded-lg font-semibold hover:bg-[#1ba3c0] transition-colors"
                  >
                    {submitted ? 'Message Sent!' : 'Send Message'}
                  </button>
                </form>
              </motion.div>

              {/* Appointment Scheduler */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-[#1a2332] p-8 rounded-xl"
              >
                <h2 className="text-3xl font-bold text-white mb-6">Book a Consultation</h2>
                <p className="text-gray-400 mb-6">
                  Schedule a free 30-minute consultation to discuss your AI transformation goals
                </p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-white font-semibold mb-2">Select Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-12 pr-4 py-3 bg-[#0f1419] text-white border border-gray-700 rounded-lg focus:outline-none focus:border-[#22c8e5]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Available Time Slots</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'].map((time) => (
                        <button
                          key={time}
                          className="px-4 py-3 bg-[#0f1419] text-gray-400 border border-gray-700 rounded-lg hover:border-[#22c8e5] hover:text-[#22c8e5] transition-colors"
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button className="w-full px-6 py-4 bg-[#22c8e5] text-white rounded-lg font-semibold hover:bg-[#1ba3c0] transition-colors">
                    Confirm Appointment
                  </button>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-700">
                  <h3 className="text-white font-bold mb-4">What to Expect</h3>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#22c8e5] rounded-full mt-2 flex-shrink-0"></span>
                      <span>30-minute video call with our AI experts</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#22c8e5] rounded-full mt-2 flex-shrink-0"></span>
                      <span>Discussion of your business goals and challenges</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#22c8e5] rounded-full mt-2 flex-shrink-0"></span>
                      <span>Custom AI solution recommendations</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#22c8e5] rounded-full mt-2 flex-shrink-0"></span>
                      <span>Estimated timeline and investment</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </section>



        {/* Social Media */}
        <section className="py-12 bg-[#0f1419]">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold text-white mb-6">Follow Us</h3>
            <div className="flex justify-center space-x-6">
              <a href="http://facebook.com/evobrandconcepts" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#22c8e5] transition-colors">
                <Facebook size={32} />
              </a>
              <a href="https://www.linkedin.com/company/evobrand-concepts/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#22c8e5] transition-colors">
                <Linkedin size={32} />
              </a>
              <a href="https://www.instagram.com/evobrandconcepts" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#22c8e5] transition-colors">
                <Instagram size={32} />
              </a>
              <a href="https://www.youtube.com/channel/UC8z66n8_seQVY5PjBEDMM7w" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#22c8e5] transition-colors">
                <Youtube size={32} /> {/* Replaced Twitter with Youtube from Footer */}
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ContactPage;
