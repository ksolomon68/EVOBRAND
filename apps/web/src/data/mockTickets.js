export const initialTickets = [
    {
        id: 'T-1024',
        subject: 'Website Loading Speed Issue',
        priority: 'High',
        status: 'Open',
        service: 'Maintenance',
        lastUpdated: '2026-02-12T10:30:00',
        description: 'The homepage is taking over 5 seconds to load on mobile devices.',
        history: [
            {
                id: 1,
                sender: 'Client',
                message: 'The homepage is taking over 5 seconds to load on mobile devices. I have attached a screenshot.',
                timestamp: '2026-02-12T10:30:00'
            }
        ]
    },
    {
        id: 'T-1023',
        subject: 'Update Hero Image',
        priority: 'Low',
        status: 'Resolved',
        service: 'Web Design',
        lastUpdated: '2026-02-10T14:20:00',
        description: 'Please update the main hero image with the new assets provided.',
        history: [
            {
                id: 1,
                sender: 'Client',
                message: 'Please update the main hero image with the new assets provided.',
                timestamp: '2026-02-10T09:00:00'
            },
            {
                id: 2,
                sender: 'Support',
                message: 'This has been updated. Please check and confirm.',
                timestamp: '2026-02-10T14:20:00'
            }
        ]
    },
    {
        id: 'T-1022',
        subject: 'AI Agent Configuration',
        priority: 'Medium',
        status: 'Pending',
        service: 'AI Automation',
        lastUpdated: '2026-02-11T16:45:00',
        description: 'The customer service agent is not responding to specific queries about pricing.',
        history: [
            {
                id: 1,
                sender: 'Client',
                message: 'The customer service agent is not responding to specific queries about pricing.',
                timestamp: '2026-02-11T09:15:00'
            },
            {
                id: 2,
                sender: 'Support',
                message: 'We are investigating the knowledge base connection.',
                timestamp: '2026-02-11T11:30:00'
            }
        ]
    }
];
