const router  = require('express').Router();
const supabase = require('../supabase');
const auth    = require('../middleware/authMiddleware');
const { stuurBoekingsMails } = require('../email');

// POST /api/bookings  — publiek: klant dient boeking in
router.post('/', async (req, res) => {
  const { naam_baasje, telefoon, email, naam_huisdier, soort_dier, dienst, datum, opmerkingen } = req.body;

  if (!naam_baasje || !naam_huisdier || !dienst || !datum) {
    return res.status(400).json({ error: 'Vul alle verplichte velden in' });
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert([{ naam_baasje, telefoon, email, naam_huisdier, soort_dier, dienst, datum, opmerkingen, status: 'nieuw' }])
    .select()
    .single();

  if (error) {
    console.error('Supabase fout:', error);
    return res.status(500).json({ error: 'Kon boeking niet opslaan' });
  }

  // Stuur e-mails
  const mailResult = await stuurBoekingsMails(data);

  // Sla klant op in clients tabel als niet bekend
  if (email || telefoon) {
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('naam', naam_baasje)
      .maybeSingle();

    if (!existing) {
      await supabase.from('clients').insert([{
        naam: naam_baasje, email, telefoon,
        huisdier_naam: naam_huisdier, huisdier_soort: soort_dier
      }]);
    }
  }

  res.json({ success: true, boeking: data, mails: mailResult });
});

// GET /api/bookings  — admin only
router.get('/', auth, async (req, res) => {
  const { status, datum } = req.query;
  let query = supabase.from('bookings').select('*').order('datum', { ascending: true });

  if (status) query = query.eq('status', status);
  if (datum)  query = query.eq('datum', datum);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/bookings/:id  — admin only
router.get('/:id', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('bookings').select('*').eq('id', req.params.id).single();
  if (error) return res.status(404).json({ error: 'Niet gevonden' });
  res.json(data);
});

// PATCH /api/bookings/:id  — admin only: update status
router.patch('/:id', auth, async (req, res) => {
  const { status, notitie } = req.body;
  const { data, error } = await supabase
    .from('bookings')
    .update({ status, notitie })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE /api/bookings/:id  — admin only
router.delete('/:id', auth, async (req, res) => {
  const { error } = await supabase.from('bookings').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
