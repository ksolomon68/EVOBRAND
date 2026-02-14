import axios from 'axios';

const MAILCHIMP_API_KEY = import.meta.env.VITE_MAILCHIMP_API_KEY;
const MAILCHIMP_AUDIENCE_ID = import.meta.env.VITE_MAILCHIMP_AUDIENCE_ID;
const DATACENTER = 'us20'; // Hardcoded based on provided key '...-us20'

export const subscribeToNewsletter = async (email) => {
    if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID) {
        console.warn('Mailchimp API Key or Audience ID missing');
        return { success: false, message: 'Configuration missing' };
    }

    // NOTE: Calling Mailchimp API directly from client-side usually fails due to CORS.
    // Ideally, this should be proxied through a backend.
    // For this implementation, we will try the direct call, but handle the likely CORS error.

    const url = `https://${DATACENTER}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`;

    try {
        const response = await axios.post(
            url,
            {
                email_address: email,
                status: 'subscribed',
            },
            {
                headers: {
                    Authorization: `apikey ${MAILCHIMP_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return { success: true, message: 'Successfully subscribed!' };
    } catch (error) {
        console.error('Mailchimp API Error:', error);

        // Check if it's a CORS error (browser creates a specific network error) or API error
        if (error.message === 'Network Error') {
            return {
                success: false,
                message: 'CORS Error: Mailchimp API cannot be called directly from the browser. Please use a backend proxy.'
            };
        }

        return {
            success: false,
            message: error.response?.data?.title || 'Failed to subscribe. Please try again.'
        };
    }
};
