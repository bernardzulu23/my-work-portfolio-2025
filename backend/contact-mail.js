function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function firstEmail(...candidates) {
  for (const candidate of candidates) {
    const email = String(candidate || '').trim();
    if (email && email.includes('@')) return email;
  }
  return '';
}

async function defaultSendEmail(payload, idempotencyKey) {
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  return resend.emails.send(payload, { idempotencyKey });
}

async function notifyContact(message, deps = {}) {
  try {
    const from = String(process.env.CONTACT_FROM_EMAIL || '').trim();
    const apiKey = String(process.env.RESEND_API_KEY || '').trim();
    if (!from || !apiKey) {
      return { skipped: true };
    }

    let to = firstEmail(process.env.CONTACT_TO_EMAIL);
    if (!to && typeof deps.getAboutEmail === 'function') {
      try {
        to = firstEmail(await deps.getAboutEmail());
      } catch {
        to = '';
      }
    }
    if (!to) {
      to = firstEmail(process.env.ADMIN_EMAIL);
    }
    if (!to) {
      return { skipped: true };
    }

    const sendEmail = deps.sendEmail || defaultSendEmail;
    const { name, email, subject, message: body, id } = message;
    const safeSubject = String(subject || 'New contact message').slice(0, 200);

    const { error } = await sendEmail(
      {
        from,
        to: [to],
        replyTo: email,
        subject: `Portfolio contact: ${safeSubject}`,
        html: `
          <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
          <p><strong>Subject:</strong> ${escapeHtml(safeSubject)}</p>
          <p>${escapeHtml(body).replace(/\n/g, '<br>')}</p>
        `
      },
      `contact/${id}`
    );

    if (error) {
      console.error('Contact notify failed');
      return { ok: false };
    }

    return { ok: true };
  } catch (_err) {
    console.error('Contact notify failed');
    return { ok: false };
  }
}

module.exports = {
  escapeHtml,
  firstEmail,
  notifyContact
};
