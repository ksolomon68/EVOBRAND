
import React from 'react';
import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Lock, Mail, AlertCircle } from 'lucide-react';

const ClientPortalLoginPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    priority: 'Medium',
    description: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate submission
    setSubmitted(true);
    setError('');
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', priority: 'Medium', description: '' });
    }, 3000);
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
        <title>Support Portal - EVOBRAND</title>
        <meta name="description" content="Submit a support ticket to EVOBRAND. Track your requests and get expert assistance." />
      </Helmet>

      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.img
              src="https://horizons-cdn.hostinger.com/f8ddb934-4ef0-4d1d-923b-d5395cd33cb2/b98337c63b696e237f54f7a827b0e0d4.png"
              alt="EVOBRAND"
              className="h-16 mx-auto object-contain drop-shadow-md"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
            <p className="text-gray-400 mt-2">Support Portal</p>
          </div>

          {/* Ticket Form */}
          <div className="bg-[#1a2332] p-8 rounded-xl shadow-2xl">
            {submitted ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#22c8e5]/20 text-[#22c8e5] mb-6">
                  <Mail size={32} />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Ticket Submitted!</h2>
                <p className="text-gray-400">
                  Thank you for reaching out. Our support team will review your ticket and get back to you shortly.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white mb-6">Submit a Support Ticket</h2>

                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start space-x-3">
                    <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
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
                      <label className="block text-white font-semibold mb-2">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-[#0f1419] text-white border border-gray-700 rounded-lg focus:outline-none focus:border-[#22c8e5]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#0f1419] text-white border border-gray-700 rounded-lg focus:outline-none focus:border-[#22c8e5]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Priority</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#0f1419] text-white border border-gray-700 rounded-lg focus:outline-none focus:border-[#22c8e5]"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
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
                    Submit Ticket
                  </button>
                </form>
              </>
            )}
          </div>

          <div className="mt-6 text-center">
            <a href="/contact" className="text-gray-400 hover:text-[#22c8e5] text-sm transition-colors">
              Need immediate assistance? Contact us directly.
            </a>
          </div>

        </motion.div>
      </div>
    </>
  );
};

export default ClientPortalLoginPage;
