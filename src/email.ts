/**
 * Optional email service — only sends if SMTP_HOST, SMTP_USER, and SMTP_PASS
 * are configured in the environment. Gracefully no-ops otherwise.
 *
 * Required env vars:
 *   SMTP_HOST     — e.g. smtp.gmail.com
 *   SMTP_PORT     — default 587
 *   SMTP_USER     — sender email address
 *   SMTP_PASS     — sender password / app password
 *   SMTP_FROM     — display name + address, e.g. "Choir Scheduler <noreply@example.com>"
 *   EMAIL_RECIPIENTS — comma-separated list of recipients (optional override)
 */

import database from './database';

function isConfigured(): boolean {
  if (process.env.NODE_ENV === 'test') return false;
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

async function getTransporter() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nodemailer = require('nodemailer') as typeof import('nodemailer');
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendEmailToAllUsers(
  subject: string,
  body: string,
  senderName: string,
): Promise<void> {
  if (!isConfigured()) return;

  let recipients: string[];
  if (process.env.EMAIL_RECIPIENTS) {
    recipients = process.env.EMAIL_RECIPIENTS.split(',').map((e) => e.trim());
  } else {
    const users = await database.all('SELECT email FROM users WHERE email IS NOT NULL');
    recipients = users.map((u) => u.email as string).filter(Boolean);
  }

  if (recipients.length === 0) return;

  const transporter = await getTransporter();
  const from = process.env.SMTP_FROM ?? `Choir Scheduler <${process.env.SMTP_USER}>`;

  await transporter.sendMail({
    from,
    bcc: recipients,
    subject: `[Choir] ${subject}`,
    text: `${senderName} posted a new announcement:\n\n${body}`,
    html: `<p><strong>${senderName}</strong> posted a new announcement:</p><p>${body.replace(/\n/g, '<br>')}</p><hr><p style="color:#888;font-size:12px">Choir Scheduler</p>`,
  });
}

export async function sendEventReminderEmail(
  eventTitle: string,
  eventDate: string,
  location: string | null,
  creatorName: string,
): Promise<void> {
  if (!isConfigured()) return;

  let recipients: string[];
  if (process.env.EMAIL_RECIPIENTS) {
    recipients = process.env.EMAIL_RECIPIENTS.split(',').map((e) => e.trim());
  } else {
    const users = await database.all('SELECT email FROM users WHERE email IS NOT NULL');
    recipients = users.map((u) => u.email as string).filter(Boolean);
  }

  if (recipients.length === 0) return;

  const transporter = await getTransporter();
  const from = process.env.SMTP_FROM ?? `Choir Scheduler <${process.env.SMTP_USER}>`;
  const dateStr = new Date(eventDate).toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  await transporter.sendMail({
    from,
    bcc: recipients,
    subject: `[Choir] New event: ${eventTitle}`,
    text: `${creatorName} scheduled a new event:\n\n${eventTitle}\nDate: ${dateStr}${location ? `\nLocation: ${location}` : ''}\n\nLog in to Choir Scheduler to RSVP.`,
    html: `
      <p><strong>${creatorName}</strong> scheduled a new event:</p>
      <table style="border-collapse:collapse;margin:12px 0">
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Event</td><td>${eventTitle}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Date</td><td>${dateStr}</td></tr>
        ${location ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold">Location</td><td>${location}</td></tr>` : ''}
      </table>
      <p>Log in to Choir Scheduler to RSVP.</p>
      <hr><p style="color:#888;font-size:12px">Choir Scheduler</p>
    `,
  });
}
