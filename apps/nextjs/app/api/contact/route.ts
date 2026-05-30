import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceRoleClient } from '@/lib/supabase';
import { sendContactNotification } from '@/lib/resend';

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1),
  type: z.string().optional(),
  company: z.string().optional(),
  plan: z.string().optional(),
  priority: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json() as unknown;
    const data = contactSchema.parse(body);

    const supabase = getServiceRoleClient();

    const { error } = await supabase.from('contact_submissions').insert({
      ...data,
      status: 'open',
    });

    if (error) {
      console.error('Supabase insert error:', error);
    }

    await sendContactNotification({
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Contact submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
