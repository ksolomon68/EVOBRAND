import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Send, CheckCircle2, AlertCircle, Shield, MessageSquare } from 'lucide-react';

const TicketDetail = ({ ticket, onBack, onReply, onClose }) => {
    const [replyText, setReplyText] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };

    const history = ticket.history || [];

    useEffect(() => {
        scrollToBottom();
    }, [history]);

    const handleReplySubmit = (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        onReply(ticket.id, replyText);
        setReplyText('');
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'Urgent': return 'text-red-500 bg-red-500/20 border-red-500/30';
            case 'Medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            default: return 'text-[#22c8e5] bg-[#22c8e5]/10 border-[#22c8e5]/20';
        }
    };

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBack} 
                        className="p-4 bg-white/5 hover:bg-[#22c8e5]/10 border border-white/10 text-white/40 hover:text-[#22c8e5] rounded-2xl transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-3xl font-bold text-white">{ticket.subject}</h2>
                            <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white/20 font-mono text-xs">#{String(ticket.id).split('-')[0]}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
                            <span className={`px-2 py-0.5 rounded border ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span>
                            <span className="text-white/40 flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${ticket.status === 'open' ? 'bg-green-400 animate-pulse' : ticket.status === 'in_progress' ? 'bg-yellow-400 animate-pulse' : 'bg-white/20'}`} />
                                {ticket.status}
                            </span>
                            <span className="text-white/20">{ticket.service}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-[#22c8e5]/5 border border-[#22c8e5]/10 rounded-2xl">
                    <Shield size={18} className="text-[#22c8e5]" />
                    <span className="text-white/60 text-xs font-bold uppercase tracking-widest">End-to-End Encrypted Support Channel</span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                        {history.map((msg, i) => (
                            <motion.div 
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`flex ${!msg.sender_is_admin ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] group`}>
                                    <div className={`flex items-center gap-3 mb-2 ${!msg.sender_is_admin ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                                            !msg.sender_is_admin ? 'bg-[#22c8e5] text-[#003258]' : 'bg-white/10 text-white'
                                        }`}>
                                            {!msg.sender_is_admin ? 'YOU' : 'EVOBRAND'}
                                        </div>
                                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                                            {new Date(msg.timestamp || msg.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className={`p-5 rounded-2xl text-sm leading-relaxed ${
                                        !msg.sender_is_admin
                                            ? 'bg-[#22c8e5]/10 border border-[#22c8e5]/20 text-white rounded-tr-none'
                                            : 'bg-white/5 border border-white/10 text-white/80 rounded-tl-none'
                                    }`}>
                                        {msg.message}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Reply Bar */}
                    <div className="p-6 bg-[#04080f]/50 backdrop-blur-xl border-t border-white/10">
                        <form onSubmit={handleReplySubmit} className="relative flex items-center gap-4">
                            <div className="relative flex-1">
                                <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                <input
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Enter secure transmission..."
                                    className="w-full pl-12 pr-4 py-4 bg-white/5 text-white border border-white/10 rounded-2xl focus:outline-none focus:border-[#22c8e5] transition-all text-sm"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!replyText.trim()}
                                className="p-4 bg-[#22c8e5] text-[#003258] rounded-2xl hover:bg-[#1ba3c0] disabled:opacity-30 disabled:grayscale transition-all shadow-lg shadow-[#22c8e5]/20"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Info Panel */}
                <div className="w-full lg:w-80 space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                        <h3 className="text-white font-bold text-sm uppercase tracking-[0.2em] mb-6">Security Context</h3>
                        <div className="space-y-6">
                            <div>
                                <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mb-1">Initialization</p>
                                <p className="text-white text-sm font-medium">{new Date(ticket.created_at).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mb-1">Target Cluster</p>
                                <p className="text-white text-sm font-medium">{ticket.service || 'Support'}</p>
                            </div>
                            <div>
                                <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mb-1">Assigned Unit</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <p className="text-white text-sm font-medium">Core AI Team</p>
                                </div>
                            </div>
                            {ticket.quoted_price > 0 && (
                                <div className="pt-4 border-t border-white/10">
                                    <p className="text-[#22c8e5]/60 text-[10px] font-bold uppercase tracking-widest mb-1">Estimated Cost</p>
                                    <p className="text-[#22c8e5] text-2xl font-bold">${Number(ticket.quoted_price).toFixed(2)}</p>
                                    {ticket.is_paid ? (
                                        <span className="inline-block mt-2 px-2 py-1 bg-green-500/20 text-green-400 text-[10px] font-bold uppercase rounded border border-green-500/30">Paid</span>
                                    ) : (
                                        <span className="inline-block mt-2 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase rounded border border-yellow-500/30">Unpaid Invoice</span>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-8 pt-8 border-t border-white/5">
                            {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
                                <button
                                    onClick={() => {
                                        if (window.confirm('Mark this ticket as resolved? This will close the support request.')) {
                                            onClose(ticket.id);
                                        }
                                    }}
                                    className="w-full py-4 rounded-2xl bg-red-400/5 border border-red-400/20 text-red-400 text-xs font-bold uppercase tracking-widest hover:bg-red-400/10 transition-all"
                                >
                                    Close Ticket
                                </button>
                            )}
                            {(ticket.status === 'closed' || ticket.status === 'resolved') && (
                                <div className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white/30 text-xs font-bold uppercase tracking-widest text-center">
                                    Ticket Closed
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetail;
