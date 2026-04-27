import { supabase } from '../lib/supabase';

export const subscribeToNewsletter = async (email) => {
    try {
        const { data, error } = await supabase.functions.invoke('mailchimp-subscribe', {
            body: { email }
        });

        if (error) {
            console.error('Mailchimp function error:', error);
            return {
                success: false,
                message: error.message || 'Failed to subscribe. Please try again.'
            };
        }

        return {
            success: true,
            message: data.message || 'Successfully subscribed!'
        };
    } catch (error) {
        console.error('Unexpected error during subscription:', error);
        return {
            success: false,
            message: 'Something went wrong. Please try again later.'
        };
    }
};
