import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, AlertCircle } from 'lucide-react';

const NewTicketForm = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        subject: '',
        priority: 'Medium',
        service: 'Web Design',
        description: '',
        file: null
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFormData({ ...formData, file: e.target.files[0] });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#1a2332] rounded-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-[#0f1419]">
                    <h2 className="text-xl font-bold text-white">Open New Ticket</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-white font-semibold mb-2 text-sm">Product / Service</label>
                                <select
                                    name="service"
                                    value={formData.service}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-[#0f1419] text-white border border-gray-700 rounded-lg focus:outline-none focus:border-[#22c8e5]"
                                >
                                    <option value="Web Design">Web Design</option>
                                    <option value="AI Automation">AI Automation</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="SEO & Marketing">SEO & Marketing</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-white font-semibold mb-2 text-sm">Priority</label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-[#0f1419] text-white border border-gray-700 rounded-lg focus:outline-none focus:border-[#22c8e5]"
                                >
                                    <option value="Low">Low (General Inquiry)</option>
                                    <option value="Medium">Medium (Standard Request)</option>
                                    <option value="High">High (Important Issue)</option>
                                    <option value="Urgent">Urgent (Critical Failure)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-white font-semibold mb-2 text-sm">Subject</label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="Brief summary of the issue"
                                className="w-full px-4 py-3 bg-[#0f1419] text-white border border-gray-700 rounded-lg focus:outline-none focus:border-[#22c8e5]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-white font-semibold mb-2 text-sm">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="6"
                                placeholder="Please describe the issue in detail..."
                                className="w-full px-4 py-3 bg-[#0f1419] text-white border border-gray-700 rounded-lg focus:outline-none focus:border-[#22c8e5]"
                                required
                            ></textarea>
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="block text-white font-semibold mb-2 text-sm">Attachments (Optional)</label>
                            <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-[#22c8e5] transition-colors bg-[#0f1419]/50">
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
                                    <Upload className="text-gray-400 mb-2" size={24} />
                                    <span className="text-gray-300 text-sm">{formData.file ? formData.file.name : 'Click to upload screenshot or file'}</span>
                                    <span className="text-gray-500 text-xs mt-1">PNG, JPG, PDF up to 5MB</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 space-x-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 bg-transparent border border-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-[#22c8e5] text-white rounded-lg font-semibold hover:bg-[#1ba3c0] transition-colors shadow-lg shadow-[#22c8e5]/20"
                            >
                                Submit Ticket
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default NewTicketForm;
