import nodemailer from 'nodemailer';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { EMAIL_USER, EMAIL_PASS } from '$env/static/private';

export const POST: RequestHandler = async ({ request }) => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    return json({ success: false, error: 'Missing server email credentials. Check .env.' }, { status: 500 });
  }

  const { fromEmail, subject, text, html } = await request.json();
  
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
  } catch (error: any) {
    console.error('Error sending email:', error);
    return json({ success: false, error: error.message }, { status: 500 });
  }
};