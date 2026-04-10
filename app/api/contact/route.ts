import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RECIPIENT = 'info@teremok.live';

function createTransport() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER?.trim(),
      pass: process.env.GMAIL_APP_PASSWORD?.trim(),
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, message, subject, type } = await req.json() as {
      name?: string;
      email?: string;
      message: string;
      subject?: string;
      type?: 'contact' | 'report';
    };

    if (!message || message.trim().length < 5) {
      return NextResponse.json({ error: 'Сообщение слишком короткое' }, { status: 400 });
    }

    if (!process.env.GMAIL_APP_PASSWORD || !process.env.GMAIL_USER) {
      console.error('[contact] GMAIL_USER или GMAIL_APP_PASSWORD не настроены');
      return NextResponse.json({ error: 'Email не настроен' }, { status: 500 });
    }

    const transport = createTransport();

    const mailSubject = subject ?? (type === 'report' ? '🚨 Жалоба на объявление' : '📬 Новое сообщение с сайта Teremok');

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; color: #222;">
        <h2 style="color: #15803d; margin-bottom: 4px;">${mailSubject}</h2>
        <hr style="border: none; border-top: 1px solid #eee; margin: 12px 0;">
        ${name ? `<p><strong>Имя:</strong> ${name}</p>` : ''}
        ${email ? `<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>` : ''}
        <p><strong>Сообщение:</strong></p>
        <div style="background: #f9fafb; border-radius: 8px; padding: 16px; white-space: pre-wrap; line-height: 1.6;">
          ${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;">
        <p style="color: #999; font-size: 12px;">Отправлено с teremok.live</p>
      </div>
    `;

    await transport.sendMail({
      from: `"Teremok" <${process.env.GMAIL_USER!.trim()}>`,
      to: RECIPIENT,
      replyTo: email ?? undefined,
      subject: mailSubject,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[contact/send]', err);
    return NextResponse.json({ error: 'Не удалось отправить. Попробуйте позже.' }, { status: 500 });
  }
}
