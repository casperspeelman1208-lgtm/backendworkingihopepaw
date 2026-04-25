const router   = require('express').Router();
const supabase  = require('../supabase');
const auth     = require('../middleware/authMiddleware');
const slugify  = require('slugify');

// GET /api/blog  — publiek: alle gepubliceerde posts
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, cover_image, published_at, category')
    .eq('published', true)
    .order('published_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/blog/all  — admin: alle posts incl. concepten
router.get('/all', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/blog/:slug  — publiek: één post
router.get('/:slug', async (req, res) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', req.params.slug)
    .eq('published', true)
    .single();

  if (error) return res.status(404).json({ error: 'Blogpost niet gevonden' });
  res.json(data);
});

// POST /api/blog  — admin: nieuwe post aanmaken
router.post('/', auth, async (req, res) => {
  const { title, content, excerpt, cover_image, category, published } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Titel en inhoud zijn verplicht' });
  }

  const slug = slugify(title, { lower: true, strict: true, locale: 'nl' });

  const { data, error } = await supabase
    .from('blog_posts')
    .insert([{
      title, slug, content, excerpt, cover_image, category,
      published: published || false,
      published_at: published ? new Date().toISOString() : null,
    }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return res.status(400).json({ error: 'Een post met deze titel bestaat al' });
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// PATCH /api/blog/:id  — admin: post bewerken
router.patch('/:id', auth, async (req, res) => {
  const { title, content, excerpt, cover_image, category, published } = req.body;
  const updates = { title, content, excerpt, cover_image, category, published };

  if (title) updates.slug = slugify(title, { lower: true, strict: true, locale: 'nl' });
  if (published) updates.published_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('blog_posts')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE /api/blog/:id  — admin
router.delete('/:id', auth, async (req, res) => {
  const { error } = await supabase.from('blog_posts').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
