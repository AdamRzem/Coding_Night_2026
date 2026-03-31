import nodemailer from 'nodemailer';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { EMAIL_USER, EMAIL_PASS } from '$env/static/private';
import { dev } from '$app/environment';

type EmailPayload = {
  fromEmail?: string;
  subject?: string;
  text?: string;
  html?: string;
  forceErrorStatus?: number;
};

function mapMailErrorToStatus(error: unknown): { status: number; message: string } {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code ?? '')
      : '';

  if (code === 'EAUTH') {
    return { status: 502, message: 'Email provider authentication failed.' };
  }

  if (code === 'ETIMEDOUT') {
    return { status: 504, message: 'Email provider request timed out.' };
  }

  if (['ECONNECTION', 'ESOCKET', 'ENOTFOUND', 'EHOSTUNREACH', 'ECONNREFUSED'].includes(code)) {
    return { status: 503, message: 'Email service is currently unavailable.' };
  }

  return { status: 500, message: 'Failed to send email due to an internal server error.' };
}

export const POST: RequestHandler = async ({ request }) => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    return json(
      { success: false, error: 'Missing server email credentials. Check .env.' },
      { status: 500 }
    );
  }

  let payload: EmailPayload;
  try {
    payload = (await request.json()) as EmailPayload;
  } catch {
    return json({ success: false, error: 'Invalid request body.' }, { status: 400 });
  }

  const fromEmail = payload.fromEmail?.trim();
  const subject = payload.subject?.trim();
  const text = payload.text?.trim();
  const html = payload.html?.trim();
  const forceErrorStatus = payload.forceErrorStatus;

  if (dev && [500, 502, 503, 504].includes(Number(forceErrorStatus))) {
    return json(
      {
        success: false,
        error: `Forced ${forceErrorStatus} response for development testing.`
      },
      { status: Number(forceErrorStatus) }
    );
  }

  if (!fromEmail || !subject || (!text && !html)) {
    return json(
      { success: false, error: 'Missing required fields: fromEmail, subject, and body.' },
      { status: 400 }
    );
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    }
  });

  try {
    await transporter.sendMail({
      from: EMAIL_USER,
      to: EMAIL_USER,
      replyTo: fromEmail,
      subject,
      text,
      html
    });

    return json({ success: true, message: 'Email sent successfully' });
  } catch (error: unknown) {
    const mapped = mapMailErrorToStatus(error);
    console.error('Error sending email:', error);
    return json({ success: false, error: mapped.message }, { status: mapped.status });
  }
};