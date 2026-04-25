const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const auth    = require('../middleware/authMiddleware');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (email !== process.env.ADMIN_EMAIL) {
    return res.status(401).json({ error: 'Onbekend e-mailadres' });
  }

  // Compare plain password from .env (hashed at first run, see below)
  const valid = password === process.env.ADMIN_PASSWORD;
  if (!valid) {
    return res.status(401).json({ error: 'Verkeerd wachtwoord' });
  }

  const token = jwt.sign(
    { email, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );

  res.json({ token, email });
});

// GET /api/auth/me  — check if still logged in
router.get('/me', auth, (req, res) => {
  res.json({ email: req.admin.email, role: req.admin.role });
});

module.exports = router;
