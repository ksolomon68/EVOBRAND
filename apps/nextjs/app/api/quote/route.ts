import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceRoleClient } from '@/lib/supabase';
import { sendQuoteNotification } from '@/lib/resend';

const quoteSchema = z.object({
  project_types: z.array(z.string()).min(1),
  budget_range: z.string().min(1),
  timeline: z.string().min(1),
  name: z.string().min(1),
  title: z.string().optional(),
  company: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  how_heard: z.string().optional(),
  additional_info: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json() as unknown;
    const data = quoteSchema.parse(body);

    const supabase = getServiceRoleClient();

    const { error } = await supabase.from('quotes').insert({
      ...data,
      status: 'new',
    });

    if (error) {
      console.error('Supabase insert error:', error);
    }

    // Send email notifications
    await sendQuoteNotification({
      name: data.name,
      company: data.company,
      email: data.email,
      projectTypes: data.project_types,
      budget: data.budget_range,
      timeline: data.timeline,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Quote submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
