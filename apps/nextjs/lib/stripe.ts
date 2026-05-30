import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder', {
  apiVersion: '2026-05-27.dahlia',
});

export const PRICING_PLANS = {
  starter: {
    name: 'Starter',
    monthlyPrice: 2500,
    annualPrice: 2000,
    stripePriceIdMonthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID ?? 'price_starter_monthly',
    stripePriceIdAnnual: process.env.STRIPE_STARTER_ANNUAL_PRICE_ID ?? 'price_starter_annual',
  },
  professional: {
    name: 'Professional',
    monthlyPrice: 7500,
    annualPrice: 6000,
    stripePriceIdMonthly: process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID ?? 'price_professional_monthly',
    stripePriceIdAnnual: process.env.STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID ?? 'price_professional_annual',
  },
};

export const BOOKING_PRICES = {
  discovery: {
    name: 'Discovery Call',
    price: 0,
    description: 'Free 30-minute introductory call',
  },
  technical: {
    name: 'Technical Consultation',
    price: 500,
    stripePriceId: process.env.STRIPE_TECHNICAL_CONSULTATION_PRICE_ID ?? 'price_technical_consultation',
  },
  strategy: {
    name: 'Full Strategy Session',
    price: 2500,
    stripePriceId: process.env.STRIPE_STRATEGY_SESSION_PRICE_ID ?? 'price_strategy_session',
  },
};
