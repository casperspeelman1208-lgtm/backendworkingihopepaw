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


// ── DYNAMISCHE SITEMAP (inclusief blogposts) ─────────────────────────────────
app.get('/sitemap.xml', async (req, res) => {
  const supabase = require('./supabase');
  let blogUrls = '';

  try {
    const { data } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('published', true);

    if (data) {
      blogUrls = data.map(p =>
        `  <url>\n    <loc>https://backendworkingihopepaw-production.up.railway.app/blog-post.html?slug=${p.slug}</loc>\n    <lastmod>${(p.updated_at || '').split('T')[0]}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
      ).join('\n');
    }
  } catch (e) {
    console.error('Sitemap blog fout:', e.message);
  }

  const baseUrl = process.env.SITE_URL || 'https://backendworkingihopepaw-production.up.railway.app';
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>${baseUrl}/blog.html</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
${blogUrls}
</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// ── CATCH-ALL: stuur frontend mee ───────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── START SERVER ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Pawfect server draait op poort ${PORT}`);
});
