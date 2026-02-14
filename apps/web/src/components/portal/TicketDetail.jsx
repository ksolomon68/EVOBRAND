import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, User, Send, CheckCircle, AlertCircle } from 'lucide-react';

const TicketDetail = ({ ticket, onBack, onReply }) => {
    const [replyText, setReplyText] = useState('');

    const handleReplySubmit = (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        onReply(ticket.id, replyText);
        setReplyText('');
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'text-red-400 bg-red-400/10';
            case 'Urgent': return 'text-red-500 bg-red-500/10 border border-red-500/20';
            case 'Medium': return 'text-yellow-400 bg-yellow-400/10';
            default: return 'text-blue-400 bg-blue-400/10';
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-6">
                <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <div className="flex items-center space-x-3">
                        <h2 className="text-2xl font-bold text-white">{ticket.subject}</h2>
                        <span className="text-gray-500 font-mono text-sm">{ticket.id}</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm">
                        <span className={`px-2 py-0.5 rounded text-xs ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span>
                        <span className="text-gray-400 flex items-center gap-1">
                            {ticket.status === 'Open' ? <AlertCircle size={12} className="text-green-400" /> : <CheckCircle size={12} />}
                            {ticket.status}
                        </span>
                        <span className="text-gray-400">{ticket.service}</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-6 h-[calc(100vh-250px)]">
                {/* Main Conversation Area */}
                <div className="flex-1 flex flex-col bg-[#1a2332] rounded-xl overflow-hidden shadow-xl border border-gray-800">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {ticket.history.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'Client' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl p-4 ${msg.sender === 'Client'
                                        ? 'bg-[#22c8e5]/10 border border-[#22c8e5]/20 rounded-tr-none'
                                        : 'bg-[#0f1419] border border-gray-800 rounded-tl-none'
                                    }`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-xs font-bold ${msg.sender === 'Client' ? 'text-[#22c8e5]' : 'text-gray-300'}`}>
                                            {msg.sender === 'Client' ? 'You' : 'EVOBRAND Support'}
                                        </span>
                                        <span className="text-xs text-gray-500 ml-4">
                                            {new Date(msg.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                        </span>
                                    </div>
                                    <p className="text-gray-300 whitespace-pre-wrap">{msg.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Reply Box */}
                    <div className="p-4 bg-[#0f1419] border-t border-gray-800">
                        <form onSubmit={handleReplySubmit} className="relative">
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Type your reply..."
                                className="w-full pl-4 pr-12 py-3 bg-[#1a2332] text-white border border-gray-700 rounded-xl focus:outline-none focus:border-[#22c8e5] resize-none"
                                rows="3"
                            />
                            <button
                                type="submit"
                                disabled={!replyText.trim()}
                                className="absolute right-3 bottom-3 p-2 bg-[#22c8e5] text-white rounded-lg hover:bg-[#1ba3c0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="w-80 hidden lg:block space-y-6">
                    <div className="bg-[#1a2332] rounded-xl p-6 border border-gray-800">
                        <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Ticket Info</h3>
                        <div className="space-y-4 text-sm">
                            <div>
                                <p className="text-gray-500 mb-1">Created</p>
                                <p className="text-white">{new Date(ticket.lastUpdated).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Product</p>
                                <p className="text-white">{ticket.service}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Attachments</p>
                                <p className="text-gray-400 italic">None</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetail;
