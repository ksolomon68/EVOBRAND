import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY ?? 're_placeholder');

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'hello@evobrand.net';

export async function sendQuoteNotification(data: {
  name: string;
  company: string;
  email: string;
  projectTypes: string[];
  budget: string;
  timeline: string;
}) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: FROM_EMAIL,
      subject: `New Quote Request from ${data.company}`,
      html: `
        <h2>New Quote Request</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Company:</strong> ${data.company}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Project Types:</strong> ${data.projectTypes.join(', ')}</p>
        <p><strong>Budget:</strong> ${data.budget}</p>
        <p><strong>Timeline:</strong> ${data.timeline}</p>
      `,
    });

    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: 'We received your quote request — EvoBrand',
      html: `
        <h2>Thank you, ${data.name}!</h2>
        <p>We have received your quote request and our team will be in touch within 24 hours.</p>
        <p>In the meantime, feel free to explore our <a href="${process.env.NEXT_PUBLIC_APP_URL}/portfolio">portfolio</a>.</p>
        <br/>
        <p>— The EvoBrand Team</p>
      `,
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

export async function sendContactNotification(data: {
  name: string;
  email: string;
  message: string;
  subject: string;
}) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: FROM_EMAIL,
      subject: `Contact Form: ${data.subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message}</p>
      `,
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
}
