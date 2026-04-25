const router   = require('express').Router();
const supabase  = require('../supabase');
const auth     = require('../middleware/authMiddleware');

// GET /api/clients  — admin only
router.get('/', auth, async (req, res) => {
  const { search } = req.query;
  let query = supabase.from('clients').select(`
    *,
    bookings (id, dienst, datum, status)
  `).order('created_at', { ascending: false });

  if (search) {
    query = query.or(`naam.ilike.%${search}%,huisdier_naam.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/clients/:id  — admin only
router.get('/:id', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('clients')
    .select(`*, bookings (*)`)
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: 'Klant niet gevonden' });
  res.json(data);
});

// POST /api/clients  — admin: handmatig klant toevoegen
router.post('/', auth, async (req, res) => {
  const { naam, email, telefoon, huisdier_naam, huisdier_soort, ras, opmerkingen } = req.body;
  if (!naam) return res.status(400).json({ error: 'Naam is verplicht' });

  const { data, error } = await supabase
    .from('clients')
    .insert([{ naam, email, telefoon, huisdier_naam, huisdier_soort, ras, opmerkingen }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PATCH /api/clients/:id
router.patch('/:id', auth, async (req, res) => {
  const { naam, email, telefoon, huisdier_naam, huisdier_soort, ras, opmerkingen } = req.body;

  const { data, error } = await supabase
    .from('clients')
    .update({ naam, email, telefoon, huisdier_naam, huisdier_soort, ras, opmerkingen })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE /api/clients/:id
router.delete('/:id', auth, async (req, res) => {
  const { error } = await supabase.from('clients').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
