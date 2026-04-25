const router = require('express').Router();
const auth   = require('../middleware/authMiddleware');
const nodemailer = require('nodemailer');

// POST /api/email/test  — admin: stuur een test e-mail
router.post('/test', auth, async (req, res) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: '✅ Pawfect e-mail test geslaagd!',
      html: '<h2>🐾 Pawfect Grooming</h2><p>Je e-mailconfiguratie werkt correct!</p>',
    });
    res.json({ success: true, message: 'Test e-mail verzonden naar ' + process.env.ADMIN_EMAIL });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
