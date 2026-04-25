/* Pawfect Admin — Gedeelde JS utilities */

// ── AUTH ─────────────────────────────────────────────────────────────────────
const token = () => localStorage.getItem('pawfect_token');

async function requireAuth() {
  const t = token();
  if (!t) { window.location.href = '/admin/login.html'; return false; }
  try {
    const res = await fetch('/api/auth/me', { headers: { Authorization: 'Bearer ' + t } });
    if (!res.ok) throw new Error();
    const me = await res.json();
    const el = document.getElementById('admin-email');
    if (el) el.textContent = me.email;
    return true;
  } catch {
    localStorage.clear();
    window.location.href = '/admin/login.html';
    return false;
  }
}

function logout() {
  localStorage.clear();
  window.location.href = '/admin/login.html';
}

// ── API helper ───────────────────────────────────────────────────────────────
async function api(path, options = {}) {
  const res = await fetch('/api' + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token(),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Onbekende fout');
  return data;
}

// ── UI helpers ───────────────────────────────────────────────────────────────
function showAlert(msg, type = 'success', container = 'alertBox') {
  const el = document.getElementById(container);
  if (!el) return;
  el.className = `alert alert-${type}`;
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 4000);
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function badgeHtml(status) {
  const map = { nieuw: 'badge-nieuw', bevestigd: 'badge-bevestigd', voltooid: 'badge-voltooid', geannuleerd: 'badge-geannuleerd' };
  return `<span class="badge ${map[status] || ''}">${status}</span>`;
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// ── Sidebar active link ───────────────────────────────────────────────────────
document.querySelectorAll('.sb-link').forEach(a => {
  if (a.href === window.location.href) a.classList.add('active');
});
