import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Send, CheckCircle2, AlertCircle, Shield, MessageSquare, Loader2, DollarSign, CreditCard, Paperclip, X } from 'lucide-react';
import PaymentModal from './PaymentModal';

function Attachment({ url, className = '' }) {
  if (!url) return null;
  const base = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : '';
  const fullUrl = url.startsWith('http') ? url : `${base}${url}`;
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  return (
    <div className={`mt-3 pt-3 border-t border-white/10 ${className}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 flex items-center gap-1">
        <Paperclip size={10} /> Attachment
      </p>
      {isImage ? (
        <a href={fullUrl} target="_blank" rel="noreferrer">
          <img src={fullUrl} alt="attachment" className="max-w-full max-h-52 rounded-xl object-cover border border-white/10 hover:opacity-80 transition-opacity cursor-pointer" />
        </a>
      ) : (
        <a href={fullUrl} target="_blank" rel="noreferrer" download
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
          style={{ background: 'rgba(34,200,229,0.15)', color: '#22c8e5' }}>
          📎 {url.split('/').pop()}
        </a>
      )}
    </div>
  );
}

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api/support'
    : (window.location.origin + '/api/support');

const TicketDetail = ({ ticket, onBack, onReply, onClose, user, onRefresh }) => {
    const draftKey = `evobrand_reply_draft_${ticket.id}`;
    const [replyText, setReplyText] = useState(() => sessionStorage.getItem(draftKey) || '');
    const [priceInput, setPriceInput] = useState(String(ticket.quoted_price > 0 ? ticket.quoted_price : ''));
    const [isPaid, setIsPaid] = useState(ticket.is_paid === 1 || ticket.is_paid === true);
    const [priceSaving, setPriceSaving] = useState(false);
    const [priceMsg, setPriceMsg] = useState('');
    const [showConfirmClose, setShowConfirmClose] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [paymentModal, setPaymentModal] = useState(false);
    const [replyFile, setReplyFile] = useState(null);
    const [sendingReply, setSendingReply] = useState(false);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const isAdmin = user?.is_admin === 1 || user?.is_admin === true;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };

    const history = ticket.history || [];

    useEffect(() => {
        scrollToBottom();
    }, [history]);

    const savePrice = async (updates) => {
        setPriceSaving(true);
        setPriceMsg('');
        try {
            const token = localStorage.getItem('evobrand_token');
            const res = await fetch(`${API_URL}/tickets/${ticket.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(updates),
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok) {
                setPriceMsg('Saved');
                setTimeout(() => setPriceMsg(''), 2000);
                if (onRefresh) onRefresh();
            } else {
                setPriceMsg(data.error || 'Save failed');
            }
        } catch {
            setPriceMsg('Network error');
        } finally {
            setPriceSaving(false);
        }
    };

    const handleReplyChange = (e) => {
        setReplyText(e.target.value);
        sessionStorage.setItem(draftKey, e.target.value);
    };

    const handleReplyFileChange = (e) => {
        if (e.target.files[0]) setReplyFile(e.target.files[0]);
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        setSendingReply(true);
        try {
            await onReply(ticket.id, replyText, replyFile);
            setReplyText('');
            setReplyFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            sessionStorage.removeItem(draftKey);
        } finally {
            setSendingReply(false);
        }
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
        <>
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
                            {isAdmin && (ticket.user_name || ticket.user_email) && (
                                <p className="text-white/40 text-xs mb-1">
                                    Submitted by <span className="text-white/70 font-semibold">{ticket.user_name || ticket.user_email}</span>
                                    {ticket.user_name && ticket.user_email && <span> · {ticket.user_email}</span>}
                                </p>
                            )}
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
                            {/* Original ticket message */}
                            {ticket.message && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-end"
                                >
                                    <div className="max-w-[85%]">
                                        <div className="flex items-center gap-3 mb-2 flex-row-reverse">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold bg-[#22c8e5] text-[#003258]">YOU</div>
                                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                                                {new Date(ticket.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="p-5 rounded-2xl text-sm leading-relaxed bg-[#22c8e5]/10 border border-[#22c8e5]/20 text-white rounded-tr-none">
                                            {ticket.message}
                                            <Attachment url={ticket.attachment_url} className="border-[#22c8e5]/20" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            {/* Replies */}
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
                                            <Attachment url={msg.attachment_url} className={!msg.sender_is_admin ? 'border-[#22c8e5]/20' : 'border-white/10'} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Reply Bar */}
                        <div className="p-6 bg-[#04080f]/50 backdrop-blur-xl border-t border-white/10">
                            {replyFile && (
                                <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-[#22c8e5]/10 border border-[#22c8e5]/20 rounded-xl text-xs text-white/70 w-fit">
                                    <Paperclip size={12} className="text-[#22c8e5]" />
                                    {replyFile.name}
                                    <button
                                        type="button"
                                        onClick={() => { setReplyFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                        className="text-white/40 hover:text-white/80 transition-colors"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            )}
                            <form onSubmit={handleReplySubmit} className="relative flex items-center gap-3">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    id="reply-file-upload"
                                    className="hidden"
                                    onChange={handleReplyFileChange}
                                    accept="image/*,.pdf,.doc,.docx,.txt,.zip"
                                />
                                <label
                                    htmlFor="reply-file-upload"
                                    title="Attach screenshot or document"
                                    className="flex-shrink-0 p-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 hover:text-[#22c8e5] rounded-2xl transition-all cursor-pointer"
                                >
                                    <Paperclip size={18} />
                                </label>
                                <div className="relative flex-1">
                                    <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                    <input
                                        value={replyText}
                                        onChange={handleReplyChange}
                                        placeholder="Enter secure transmission..."
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 text-white border border-white/10 rounded-2xl focus:outline-none focus:border-[#22c8e5] transition-all text-sm"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!replyText.trim() || sendingReply}
                                    className="p-4 bg-[#22c8e5] text-[#003258] rounded-2xl hover:bg-[#1ba3c0] disabled:opacity-30 disabled:grayscale transition-all shadow-lg shadow-[#22c8e5]/20"
                                >
                                    {sendingReply ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Info Panel */}
                    <div className="w-full lg:w-80 space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                            <h3 className="text-white font-bold text-sm uppercase tracking-[0.2em] mb-6">Ticket Info</h3>
                            <div className="space-y-6">
                                {isAdmin && (ticket.user_name || ticket.user_email) && (
                                    <div>
                                        <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mb-1">Client</p>
                                        <p className="text-white text-sm font-semibold">{ticket.user_name || '—'}</p>
                                        <p className="text-white/40 text-xs mt-0.5">{ticket.user_email || '—'}</p>
                                        <div className="mt-2">
                                            {ticket.user_support_plan ? (
                                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#22c8e5]/10 text-[#22c8e5] border border-[#22c8e5]/20">
                                                    {ticket.user_support_plan} plan
                                                </span>
                                            ) : (
                                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                    No Active Plan
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mb-1">Opened</p>
                                    <p className="text-white text-sm font-medium">{new Date(ticket.created_at).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mb-1">Service</p>
                                    <p className="text-white text-sm font-medium">{ticket.service || 'Support'}</p>
                                </div>
                                <div>
                                    <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mb-1">Assigned To</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        <p className="text-white text-sm font-medium">EVOBRAND Team</p>
                                    </div>
                                </div>
                                {isAdmin ? (
                                    <div className="pt-4 border-t border-white/10">
                                        <p className="text-[#22c8e5]/60 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                            <DollarSign size={11} /> Quoted Price
                                        </p>
                                        <div className="flex gap-2 mb-2">
                                            <div className="relative flex-1">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm font-bold">$</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={priceInput}
                                                    onChange={(e) => setPriceInput(e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full bg-white/5 border border-[rgba(34,200,229,0.3)] text-white font-bold pl-7 pr-3 py-2 rounded-2xl text-sm focus:outline-none focus:border-[#22c8e5]"
                                                />
                                            </div>
                                            <button
                                                onClick={() => savePrice({ quoted_price: parseFloat(priceInput) || 0 })}
                                                disabled={priceSaving}
                                                className="px-3 py-2 rounded-2xl text-sm font-bold disabled:opacity-50 transition-colors"
                                                style={{ background: 'rgba(34,200,229,0.15)', color: '#22c8e5' }}
                                            >
                                                {priceSaving ? '…' : 'Save'}
                                            </button>
                                        </div>
                                        {priceMsg && (
                                            <p className={`text-xs font-bold mb-2 ${priceMsg === 'Saved' ? 'text-green-400' : 'text-red-400'}`}>{priceMsg}</p>
                                        )}
                                        <label className="flex items-center gap-2 cursor-pointer mt-2">
                                            <input
                                                type="checkbox"
                                                checked={isPaid}
                                                onChange={(e) => { setIsPaid(e.target.checked); savePrice({ is_paid: e.target.checked ? 1 : 0 }); }}
                                                className="w-4 h-4 rounded accent-[#22c8e5]"
                                            />
                                            <span className="text-sm text-white/70 font-bold">Mark as Paid</span>
                                            {isPaid && <CheckCircle2 size={13} className="text-green-400 ml-auto" />}
                                        </label>
                                    </div>
                                ) : ticket.quoted_price > 0 ? (
                                    <div className="pt-4 border-t border-white/10">
                                        <p className="text-[#22c8e5]/60 text-[10px] font-bold uppercase tracking-widest mb-1">Estimated Cost</p>
                                        <p className="text-[#22c8e5] text-2xl font-bold">${Number(ticket.quoted_price).toFixed(2)}</p>
                                        {ticket.is_paid ? (
                                            <span className="inline-block mt-2 px-2 py-1 bg-green-500/20 text-green-400 text-[10px] font-bold uppercase rounded border border-green-500/30">Paid</span>
                                        ) : (
                                            <div className="mt-3 space-y-2">
                                                <span className="inline-block px-2 py-1 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase rounded border border-yellow-500/30">Unpaid Invoice</span>
                                                <button
                                                    onClick={() => setPaymentModal(true)}
                                                    id={`ticket-pay-btn-${ticket.id}`}
                                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #22c8e5, #1ba3c0)',
                                                        color: '#003258',
                                                        boxShadow: '0 4px 20px rgba(34,200,229,0.2)',
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                                >
                                                    <CreditCard size={14} />
                                                    Pay Now
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </div>

                            {ticket.status !== 'resolved' && ticket.status !== 'closed' && onClose && (
                                <div className="mt-8 pt-8 border-t border-white/5">
                                    {!showConfirmClose ? (
                                        <button 
                                            onClick={() => setShowConfirmClose(true)}
                                            className="w-full py-4 rounded-2xl bg-red-400/5 border border-red-400/20 text-red-400 text-xs font-bold uppercase tracking-widest hover:bg-red-400/10 transition-all"
                                        >
                                            Close Ticket
                                        </button>
                                    ) : (
                                        <div className="p-4 rounded-2xl bg-red-400/10 border border-red-400/30 text-center">
                                            <p className="text-white text-sm font-bold mb-4">Are you sure you want to close this ticket?</p>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => setShowConfirmClose(false)}
                                                    disabled={isClosing}
                                                    className="flex-1 py-2.5 rounded-2xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 text-xs font-bold uppercase transition-all"
                                                >
                                                    Cancel
                                                </button>
                                                <button 
                                                    onClick={async () => {
                                                        setIsClosing(true);
                                                        try {
                                                            await onClose(ticket.id);
                                                        } finally {
                                                            setIsClosing(false);
                                                            setShowConfirmClose(false);
                                                        }
                                                    }}
                                                    disabled={isClosing}
                                                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-[10px] font-bold uppercase hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    {isClosing ? <Loader2 size={14} className="animate-spin" /> : 'Confirm Close'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {(ticket.status === 'closed' || ticket.status === 'resolved') && (
                                <div className="mt-8 pt-8 border-t border-white/5">
                                    <div className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white/30 text-xs font-bold uppercase tracking-widest text-center">
                                        Ticket Closed
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {paymentModal && (
                <PaymentModal
                    type="ticket"
                    id={ticket.id}
                    amount={ticket.quoted_price}
                    description={`Support Ticket: ${ticket.subject}`}
                    onClose={() => setPaymentModal(false)}
                />
            )}
        </>
    );
};

export default TicketDetail;
