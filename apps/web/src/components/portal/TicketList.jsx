import React from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertCircle, CheckCircle2, ChevronRight, Hash } from 'lucide-react';

const TicketList = ({ tickets, onViewTicket }) => {
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'Urgent': return 'text-red-500 bg-red-500/20 border-red-500/30';
            case 'Medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            default: return 'text-[#22c8e5] bg-[#22c8e5]/10 border-[#22c8e5]/20';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'in_progress': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'resolved': return 'text-white/20 bg-white/5 border-white/10';
            case 'closed': return 'text-white/20 bg-white/5 border-white/10';
            default: return 'text-white/40 bg-white/5 border-white/10';
        }
    };

    return (
        <div className="space-y-4">
            {tickets.map((ticket, index) => (
                <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onViewTicket(ticket)}
                    className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-[#22c8e5]/50 transition-all cursor-pointer relative overflow-hidden"
                >
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#22c8e5]/0 via-[#22c8e5]/0 to-[#22c8e5]/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#22c8e5] group-hover:bg-[#22c8e5] group-hover:text-[#003258] transition-all">
                                <Hash size={20} />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-white font-bold group-hover:text-[#22c8e5] transition-colors">{ticket.subject}</h3>
                                    <span className="text-white/20 font-mono text-xs">#{String(ticket.id).split('-')[0]}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-white/40 text-xs font-bold uppercase tracking-widest">{ticket.service}</span>
                                    <div className="w-1 h-1 rounded-full bg-white/10" />
                                    <span className="text-white/40 text-xs">{new Date(ticket.lastUpdated).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${getPriorityColor(ticket.priority)}`}>
                                {ticket.priority}
                            </span>
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border flex items-center gap-2 ${getStatusColor(ticket.status)}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                    ticket.status === 'open' ? 'bg-green-400 animate-pulse' :
                                    ticket.status === 'in_progress' ? 'bg-yellow-400 animate-pulse' :
                                    ticket.status === 'pending' ? 'bg-yellow-400' : 'bg-white/20'
                                }`} />
                                {ticket.status}
                            </span>
                            <div className="ml-4 p-2 rounded-lg bg-white/5 text-white/20 group-hover:text-[#22c8e5] group-hover:bg-[#22c8e5]/10 transition-all">
                                <ChevronRight size={18} />
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
            
            {tickets.length === 0 && (
                <div className="py-20 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20 mx-auto mb-6">
                        <AlertCircle size={32} />
                    </div>
                    <h3 className="text-white font-bold mb-2">No Active Transmissions</h3>
                    <p className="text-white/40 text-sm">Submit a new ticket to begin your support request.</p>
                </div>
            )}
        </div>
    );
};

export default TicketList;
