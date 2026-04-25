require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const path       = require('path');

const authRoutes     = require('./routes/auth');
const bookingRoutes  = require('./routes/bookings');
const blogRoutes     = require('./routes/blog');
const clientRoutes   = require('./routes/clients');
const emailRoutes    = require('./routes/email');

const app = express();

// ── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// ── API ROUTES ───────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/blog',     blogRoutes);
app.use('/api/clients',  clientRoutes);
app.use('/api/email',    emailRoutes);

// ── CATCH-ALL: stuur frontend mee ───────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── START SERVER ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Pawfect server draait op poort ${PORT}`);
});
