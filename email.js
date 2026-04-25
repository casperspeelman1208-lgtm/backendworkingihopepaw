const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
  connectionTimeout: 10000,  // 10 seconden max
  greetingTimeout:   8000,
  socketTimeout:     15000,
});

// ── BEVESTIGINGSMAIL KLANT ────────────────────────────────────────────────────
function klantBevestiging(boeking) {
  return {
    from: process.env.EMAIL_FROM,
    to: boeking.email || boeking.naam_baasje,
    subject: `✅ Boekingsverzoek ontvangen — Pawfect Grooming`,
    html: `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><style>
  body{font-family:'Helvetica Neue',Arial,sans-serif;background:#FFFBF0;margin:0;padding:0}
  .wrap{max-width:580px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:2px solid #FFD166}
  .header{background:#FF6B6B;padding:2rem;text-align:center;color:#fff}
  .header h1{font-size:1.8rem;margin:0;font-weight:900}
  .header p{margin:.5rem 0 0;opacity:.9;font-size:1rem}
  .body{padding:2rem}
  .greeting{font-size:1.1rem;color:#3D2314;font-weight:700;margin-bottom:1rem}
  .info-box{background:#FFF5CC;border-radius:12px;padding:1.4rem;margin:1.5rem 0;border:2px solid #FFD166}
  .info-row{display:flex;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid #FFE8A0}
  .info-row:last-child{border-bottom:none}
  .label{color:#7C4D3A;font-size:.9rem;font-weight:700}
  .value{color:#3D2314;font-size:.9rem;font-weight:800}
  .notice{background:#D4F5EC;border-radius:10px;padding:1rem 1.2rem;color:#034d38;font-size:.9rem;margin:1.2rem 0}
  .footer{background:#3D2314;padding:1.5rem;text-align:center;color:#c4906e;font-size:.85rem}
  .paw{font-size:2rem}
</style></head>
<body>
<div class="wrap">
  <div class="header">
    <div class="paw">🐾</div>
    <h1>Boekingsverzoek ontvangen!</h1>
    <p>Bedankt voor je verzoek bij Pawfect Grooming</p>
  </div>
  <div class="body">
    <div class="greeting">Hoi ${boeking.naam_baasje}! 👋</div>
    <p style="color:#7C4D3A;line-height:1.7">
      We hebben jouw boekingsverzoek in goede orde ontvangen. We nemen zo snel mogelijk contact met je op om de afspraak te bevestigen.
    </p>
    <div class="info-box">
      <div class="info-row"><span class="label">Huisdier</span><span class="value">${boeking.naam_huisdier} (${boeking.soort_dier})</span></div>
      <div class="info-row"><span class="label">Dienst</span><span class="value">${boeking.dienst}</span></div>
      <div class="info-row"><span class="label">Gewenste datum</span><span class="value">${new Date(boeking.datum).toLocaleDateString('nl-NL', {weekday:'long',year:'numeric',month:'long',day:'numeric'})}</span></div>
      ${boeking.opmerkingen ? `<div class="info-row"><span class="label">Opmerkingen</span><span class="value">${boeking.opmerkingen}</span></div>` : ''}
    </div>
    <div class="notice">
      💡 <strong>Let op:</strong> Dit is een verzoek, nog geen bevestigde afspraak. Je ontvangt een bevestiging zodra we je verzoek hebben verwerkt.
    </div>
    <p style="color:#7C4D3A;font-size:.9rem">
      Vragen? Bel ons op <strong>+31 79 123 4567</strong> of stuur een e-mail naar <strong>hallo@pawfect.nl</strong>
    </p>
  </div>
  <div class="footer">
    © Pawfect Grooming · Wagnerstraat 12, Zoetermeer · <a href="tel:+31791234567" style="color:#FFD166">+31 79 123 4567</a>
  </div>
</div>
</body></html>
    `,
  };
}

// ── NOTIFICATIEMAIL ADMIN ─────────────────────────────────────────────────────
function adminNotificatie(boeking) {
  return {
    from: process.env.EMAIL_FROM,
    to: process.env.ADMIN_EMAIL,
    subject: `🐾 Nieuwe boeking: ${boeking.naam_huisdier} — ${boeking.dienst}`,
    html: `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><style>
  body{font-family:'Helvetica Neue',Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px}
  .wrap{max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:2px solid #FFD166}
  .header{background:#3D2314;padding:1.5rem;text-align:center;color:#FFD166}
  .header h1{font-size:1.4rem;margin:0}
  .body{padding:1.8rem}
  .info-box{background:#FFF5CC;border-radius:10px;padding:1.2rem;margin:1rem 0;border:2px solid #FFD166}
  .row{display:flex;gap:1rem;margin:.5rem 0}
  .label{color:#7C4D3A;font-size:.85rem;font-weight:700;min-width:130px}
  .value{color:#3D2314;font-size:.85rem;font-weight:800}
  .btn{display:inline-block;background:#FF6B6B;color:#fff;padding:.8rem 1.8rem;border-radius:50px;text-decoration:none;font-weight:800;font-size:.9rem;margin-top:1rem}
</style></head>
<body>
<div class="wrap">
  <div class="header"><h1>🐾 Nieuwe Boekingsaanvraag</h1></div>
  <div class="body">
    <div class="info-box">
      <div class="row"><span class="label">Baasje</span><span class="value">${boeking.naam_baasje}</span></div>
      <div class="row"><span class="label">Telefoon</span><span class="value">${boeking.telefoon || '—'}</span></div>
      <div class="row"><span class="label">E-mail</span><span class="value">${boeking.email || '—'}</span></div>
      <div class="row"><span class="label">Huisdier</span><span class="value">${boeking.naam_huisdier} — ${boeking.soort_dier}</span></div>
      <div class="row"><span class="label">Dienst</span><span class="value">${boeking.dienst}</span></div>
      <div class="row"><span class="label">Gewenste datum</span><span class="value">${new Date(boeking.datum).toLocaleDateString('nl-NL', {weekday:'long',year:'numeric',month:'long',day:'numeric'})}</span></div>
      ${boeking.opmerkingen ? `<div class="row"><span class="label">Opmerkingen</span><span class="value">${boeking.opmerkingen}</span></div>` : ''}
    </div>
    <a class="btn" href="${process.env.SITE_URL}/admin/bookings.html">Bekijk in dashboard →</a>
  </div>
</div>
</body></html>
    `,
  };
}

// ── STUUR MAILS ───────────────────────────────────────────────────────────────
async function stuurBoekingsMails(boeking) {
  const results = {};

  // Admin mail (altijd)
  try {
    await transporter.sendMail(adminNotificatie(boeking));
    results.admin = 'verzonden';
  } catch (err) {
    results.admin = `fout: ${err.message}`;
    console.error('Admin mail fout:', err.message);
  }

  // Klant mail (alleen als e-mail bekend)
  if (boeking.email) {
    try {
      await transporter.sendMail(klantBevestiging(boeking));
      results.klant = 'verzonden';
    } catch (err) {
      results.klant = `fout: ${err.message}`;
      console.error('Klant mail fout:', err.message);
    }
  } else {
    results.klant = 'overgeslagen (geen e-mail)';
  }

  return results;
}

module.exports = { stuurBoekingsMails };
