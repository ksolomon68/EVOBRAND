import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { LayoutDashboard, Plus, Settings, LogOut, Ticket } from 'lucide-react';
import TicketList from '../components/portal/TicketList';
import NewTicketForm from '../components/portal/NewTicketForm';
import TicketDetail from '../components/portal/TicketDetail';
import { initialTickets } from '../data/mockTickets';

const ClientPortalPage = () => {
    const [view, setView] = useState('dashboard'); // 'dashboard', 'detail'
    const [tickets, setTickets] = useState(initialTickets);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showNewTicketModal, setShowNewTicketModal] = useState(false);

    const handleCreateTicket = (formData) => {
        const newTicket = {
            id: `T-${1025 + tickets.length}`,
            subject: formData.subject,
            priority: formData.priority,
            status: 'Open',
            service: formData.service,
            lastUpdated: new Date().toISOString(),
            description: formData.description,
            history: [
                {
                    id: 1,
                    sender: 'Client',
                    message: formData.description,
                    timestamp: new Date().toISOString()
                }
            ]
        };
        setTickets([newTicket, ...tickets]);
        setShowNewTicketModal(false);
    };

    const handleClientReply = (ticketId, message) => {
        setTickets(tickets.map(ticket => {
            if (ticket.id === ticketId) {
                return {
                    ...ticket,
                    lastUpdated: new Date().toISOString(),
                    history: [
                        ...ticket.history,
                        {
                            id: ticket.history.length + 1,
                            sender: 'Client',
                            message: message,
                            timestamp: new Date().toISOString()
                        }
                    ]
                };
            }
            return ticket;
        }));

        // Update selected ticket view as well
        setSelectedTicket(prev => {
            if (prev && prev.id === ticketId) {
                return {
                    ...prev,
                    history: [
                        ...prev.history,
                        {
                            id: prev.history.length + 1,
                            sender: 'Client',
                            message: message,
                            timestamp: new Date().toISOString()
                        }
                    ]
                }
            }
            return prev;
        });
    };

    const handleTakeAction = (ticket) => {
        setSelectedTicket(ticket);
        setView('detail');
    };

    return (
        <>
            <Helmet>
                <title>Client Portal - EVOBRAND</title>
            </Helmet>

            <div className="min-h-screen bg-[#0f1419] flex">
                {/* Sidebar */}
                <aside className="w-64 bg-[#1a2332] border-r border-gray-800 hidden md:flex flex-col">
                    <div className="p-6">
                        <div className="flex items-center space-x-3 mb-8">
                            <img
                                src="https://horizons-cdn.hostinger.com/f8ddb934-4ef0-4d1d-923b-d5395cd33cb2/b98337c63b696e237f54f7a827b0e0d4.png"
                                alt="EVOBRAND Logo"
                                className="h-8 object-contain"
                            />
                            <span className="text-white font-bold tracking-wide">PORTAL</span>
                        </div>

                        <nav className="space-y-2">
                            <button
                                onClick={() => { setView('dashboard'); setSelectedTicket(null); }}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${view === 'dashboard' ? 'bg-[#22c8e5]/10 text-[#22c8e5]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <LayoutDashboard size={20} />
                                <span>Dashboard</span>
                            </button>
                            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                                <Ticket size={20} />
                                <span>My Tickets</span>
                            </button>
                            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                                <Settings size={20} />
                                <span>Settings</span>
                            </button>
                        </nav>
                    </div>

                    <div className="mt-auto p-6 border-t border-gray-800">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#22c8e5] to-blue-600 flex items-center justify-center text-white font-bold">
                                JD
                            </div>
                            <div>
                                <p className="text-white text-sm font-medium">John Doe</p>
                                <p className="text-gray-500 text-xs">ACME Corp</p>
                            </div>
                        </div>
                        <button className="w-full flex items-center justify-center space-x-2 p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                            <LogOut size={18} />
                            <span>Log Out</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col h-screen overflow-hidden">
                    {/* Mobile Header */}
                    <div className="md:hidden bg-[#1a2332] p-4 flex items-center justify-between border-b border-gray-800">
                        <img
                            src="https://horizons-cdn.hostinger.com/f8ddb934-4ef0-4d1d-923b-d5395cd33cb2/b98337c63b696e237f54f7a827b0e0d4.png"
                            alt="EVOBRAND Logo"
                            className="h-8 object-contain"
                        />
                        <button className="text-gray-400">
                            <LayoutDashboard size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-[#0f1419] p-4 md:p-8">
                        <div className="max-w-6xl mx-auto h-full">
                            {view === 'dashboard' ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                                        <div>
                                            <h1 className="text-3xl font-bold text-white mb-2">Support Dashboard</h1>
                                            <p className="text-gray-400">Manage your support requests and track their status.</p>
                                        </div>
                                        <button
                                            onClick={() => setShowNewTicketModal(true)}
                                            className="flex items-center space-x-2 px-6 py-3 bg-[#22c8e5] text-white rounded-lg hover:bg-[#1ba3c0] transition-colors shadow-lg shadow-[#22c8e5]/20"
                                        >
                                            <Plus size={20} />
                                            <span>New Ticket</span>
                                        </button>
                                    </div>

                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                        <div className="bg-[#1a2332] p-6 rounded-xl border border-gray-800">
                                            <h3 className="text-gray-400 text-sm font-medium mb-2">Open Tickets</h3>
                                            <p className="text-3xl font-bold text-white">{tickets.filter(t => t.status === 'Open').length}</p>
                                        </div>
                                        <div className="bg-[#1a2332] p-6 rounded-xl border border-gray-800">
                                            <h3 className="text-gray-400 text-sm font-medium mb-2">Pending Action</h3>
                                            <p className="text-3xl font-bold text-yellow-400">{tickets.filter(t => t.status === 'Pending').length}</p>
                                        </div>
                                        <div className="bg-[#1a2332] p-6 rounded-xl border border-gray-800">
                                            <h3 className="text-gray-400 text-sm font-medium mb-2">Resolved (This Month)</h3>
                                            <p className="text-3xl font-bold text-green-400">{tickets.filter(t => t.status === 'Resolved').length}</p>
                                        </div>
                                    </div>

                                    <h2 className="text-xl font-bold text-white mb-6">Recent Tickets</h2>
                                    <TicketList tickets={tickets} onViewTicket={handleTakeAction} />
                                </motion.div>
                            ) : (
                                <TicketDetail
                                    ticket={selectedTicket}
                                    onBack={() => setView('dashboard')}
                                    onReply={handleClientReply}
                                />
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {showNewTicketModal && (
                <NewTicketForm
                    onClose={() => setShowNewTicketModal(false)}
                    onSubmit={handleCreateTicket}
                />
            )}
        </>
    );
};

export default ClientPortalPage;
