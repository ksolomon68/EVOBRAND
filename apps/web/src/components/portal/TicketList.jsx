import React from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertCircle, CheckCircle, MoreHorizontal } from 'lucide-react';

const TicketList = ({ tickets, onViewTicket }) => {
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'text-red-400 bg-red-400/10';
            case 'Urgent': return 'text-red-500 bg-red-500/10 border border-red-500/20';
            case 'Medium': return 'text-yellow-400 bg-yellow-400/10';
            default: return 'text-blue-400 bg-blue-400/10';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Open': return 'text-green-400 bg-green-400/10';
            case 'Pending': return 'text-yellow-400 bg-yellow-400/10';
            case 'Resolved': return 'text-gray-400 bg-gray-400/10';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="bg-[#1a2332] rounded-xl overflow-hidden shadow-xl border border-gray-800">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-[#0f1419] border-b border-gray-800">
                            <th className="p-4 text-gray-400 font-medium text-sm">Ticket ID</th>
                            <th className="p-4 text-gray-400 font-medium text-sm">Subject</th>
                            <th className="p-4 text-gray-400 font-medium text-sm">Service</th>
                            <th className="p-4 text-gray-400 font-medium text-sm">Priority</th>
                            <th className="p-4 text-gray-400 font-medium text-sm">Status</th>
                            <th className="p-4 text-gray-400 font-medium text-sm">Last Updated</th>
                            <th className="p-4 text-gray-400 font-medium text-sm">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {tickets.map((ticket, index) => (
                            <motion.tr
                                key={ticket.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="hover:bg-[#22c8e5]/5 transition-colors cursor-pointer group"
                                onClick={() => onViewTicket(ticket)}
                            >
                                <td className="p-4 text-[#22c8e5] font-mono text-sm font-medium">{ticket.id}</td>
                                <td className="p-4 text-white font-medium">{ticket.subject}</td>
                                <td className="p-4 text-gray-400 text-sm">{ticket.service}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                                        {ticket.priority}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center w-fit gap-1 ${getStatusColor(ticket.status)}`}>
                                        {ticket.status === 'Open' && <AlertCircle size={12} />}
                                        {ticket.status === 'Resolved' && <CheckCircle size={12} />}
                                        {ticket.status === 'Pending' && <Clock size={12} />}
                                        {ticket.status}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-400 text-sm">
                                    {new Date(ticket.lastUpdated).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-gray-500">
                                    <MoreHorizontal size={18} className="group-hover:text-white transition-colors" />
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {tickets.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                    No tickets found. Submit a new ticket to get started.
                </div>
            )}
        </div>
    );
};

export default TicketList;
