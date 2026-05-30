import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const { type, serviceId, serviceName, price, amount, description, planId, billing, company } = body;

    if (type === 'contract_deposit') {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Contract Deposit — ${company as string}`,
                description: description as string,
              },
              unit_amount: Math.round((amount as number) * 100),
            },
            quantity: 1,
          },
        ],
        success_url: `${APP_URL}/contracts?success=true`,
        cancel_url: `${APP_URL}/contracts`,
      });

      return NextResponse.json({ url: session.url });
    }

    if (planId && billing) {
      // Subscription checkout
      const priceIdMap: Record<string, Record<string, string>> = {
        starter: {
          monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID ?? 'price_starter_monthly',
          annual: process.env.STRIPE_STARTER_ANNUAL_PRICE_ID ?? 'price_starter_annual',
        },
        professional: {
          monthly: process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID ?? 'price_professional_monthly',
          annual: process.env.STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID ?? 'price_professional_annual',
        },
      };

      const priceId = priceIdMap[planId as string]?.[billing as string];
      if (!priceId) {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${APP_URL}/support?success=true`,
        cancel_url: `${APP_URL}/support`,
      });

      return NextResponse.json({ url: session.url });
    }

    // One-time booking payment
    const bookingPriceMap: Record<string, number> = {
      technical: 500,
      strategy: 2500,
    };

    const unitAmount = price
      ? Math.round((price as number) * 100)
      : Math.round((bookingPriceMap[serviceId as string] ?? 0) * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: serviceName as string ?? 'EvoBrand Consultation',
              description: 'Professional consultation with the EvoBrand team',
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      success_url: `${APP_URL}/booking?success=true`,
      cancel_url: `${APP_URL}/booking`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
