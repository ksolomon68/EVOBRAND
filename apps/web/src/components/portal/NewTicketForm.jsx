import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Send, ShieldCheck, Zap } from 'lucide-react';

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
        <div className="fixed inset-0 bg-[#04080f]/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-[#04080f] border border-white/10 rounded-[2.5rem] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-[0_0_100px_-20px_rgba(34,200,229,0.2)]"
            >
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-white/5 to-transparent">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Zap size={16} className="text-[#22c8e5]" />
                            <h2 className="text-2xl font-bold text-white">Initialize New Transmission</h2>
                        </div>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Support Node Alpha // Secure Entry</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white/40 hover:text-white transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-1">Target Cluster</label>
                                <select
                                    name="service"
                                    value={formData.service}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-white/5 text-white border border-white/10 rounded-2xl focus:outline-none focus:border-[#22c8e5] transition-all font-medium appearance-none"
                                >
                                    <option value="Web Design" className="bg-[#04080f]">Web Design & Dev</option>
                                    <option value="AI Automation" className="bg-[#04080f]">AI Automation</option>
                                    <option value="Maintenance" className="bg-[#04080f]">Maintenance</option>
                                    <option value="SEO & Marketing" className="bg-[#04080f]">SEO & Marketing</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-1">Urgency Level</label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-white/5 text-white border border-white/10 rounded-2xl focus:outline-none focus:border-[#22c8e5] transition-all font-medium appearance-none"
                                >
                                    <option value="Low" className="bg-[#04080f]">Low (General Inquiry)</option>
                                    <option value="Medium" className="bg-[#04080f]">Medium (Standard Request)</option>
                                    <option value="High" className="bg-[#04080f]">High (Important Issue)</option>
                                    <option value="Urgent" className="bg-[#04080f]">Urgent (Critical Failure)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-1">Transmission Subject</label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="Brief summary of the operation..."
                                className="w-full px-5 py-4 bg-white/5 text-white border border-white/10 rounded-2xl focus:outline-none focus:border-[#22c8e5] transition-all"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-1">Detailed Intelligence</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="6"
                                placeholder="Describe the requirements or issue in detail..."
                                className="w-full px-5 py-4 bg-white/5 text-white border border-white/10 rounded-2xl focus:outline-none focus:border-[#22c8e5] transition-all resize-none"
                                required
                            ></textarea>
                        </div>

                        {/* File Upload */}
                        <div className="space-y-2">
                            <label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-1">Supplementary Evidence</label>
                            <div className="border-2 border-dashed border-white/10 rounded-3xl p-8 text-center hover:border-[#22c8e5]/50 hover:bg-[#22c8e5]/5 transition-all bg-white/2">
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
                                    <Upload className="text-[#22c8e5] mb-3" size={28} />
                                    <span className="text-white font-bold text-sm mb-1">{formData.file ? formData.file.name : 'Upload Assets'}</span>
                                    <span className="text-white/20 text-xs uppercase tracking-widest">PNG, JPG, PDF up to 5MB</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <div className="flex items-center gap-2 text-white/20">
                                <ShieldCheck size={16} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Secure Transmission Active</span>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-8 py-4 bg-white/5 border border-white/10 text-white/60 rounded-2xl hover:bg-white/10 hover:text-white transition-all font-bold text-xs uppercase tracking-widest"
                                >
                                    Abort
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-4 bg-[#22c8e5] text-[#003258] rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#1ba3c0] transition-all shadow-xl shadow-[#22c8e5]/20 flex items-center gap-2"
                                >
                                    <Send size={16} />
                                    Submit Transmission
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default NewTicketForm;
