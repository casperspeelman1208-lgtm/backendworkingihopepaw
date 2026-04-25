const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ error: 'Geen toegang — niet ingelogd' });

  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token ontbreekt' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Sessie verlopen — log opnieuw in' });
  }
};
