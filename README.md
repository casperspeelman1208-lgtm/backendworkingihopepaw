# 🐾 Pawfect Grooming — Backend Setup

Stap-voor-stap instructies om je backend online te zetten.
**Geen technische kennis nodig** — volg de stappen van boven naar onder.

---

## 📦 Projectstructuur

```
pawfect-backend/
├── server.js               ← Hoofdserver
├── package.json            ← Afhankelijkheden
├── .env.example            ← Voorbeeld omgevingsvariabelen
├── .gitignore
├── supabase-schema.sql     ← Database setup
├── supabase.js             ← Database verbinding
├── email.js                ← E-maillogica
├── middleware/
│   └── authMiddleware.js   ← Inlogbeveiliging
├── routes/
│   ├── auth.js             ← Inloggen
│   ├── bookings.js         ← Boekingen API
│   ├── blog.js             ← Blog API
│   ├── clients.js          ← Klanten API
│   └── email.js            ← E-mail test API
└── public/
    ├── index.html          ← Jouw website (kopieer hier naartoe)
    ├── css/
    │   ├── style.css       ← Website CSS
    │   └── admin.css       ← Admin panel CSS
    ├── js/
    │   ├── main.js         ← Website JS
    │   └── admin.js        ← Admin panel JS
    ├── img/                ← Afbeeldingen
    └── admin/
        ├── login.html      ← Admin inlogpagina
        ├── dashboard.html  ← Overzicht dashboard
        ├── bookings.html   ← Boekingen beheer
        ├── agenda.html     ← Kalenderoverzicht
        ├── clients.html    ← Klantenbeheer
        └── blog.html       ← Blog schrijven & beheren
```

---

## 🚀 Stap 1 — Supabase instellen (gratis database)

1. Ga naar **[supabase.com](https://supabase.com)** en maak een gratis account aan
2. Klik op **"New project"**, kies een naam (bijv. `pawfect`) en een wachtwoord (bewaar dit!)
3. Wacht ~2 minuten tot het project klaar is
4. Ga naar **SQL Editor** → **New query**
5. Kopieer de volledige inhoud van `supabase-schema.sql` en plak die in het scherm
6. Klik **"Run"** — de database is nu ingericht

**Je API-sleutels ophalen:**
- Ga naar **Settings → API**
- Kopieer **Project URL** (bijv. `https://xxxxx.supabase.co`)
- Kopieer **service_role key** (de lange sleutel onderaan — NIET de anon key)

---

## 📧 Stap 2 — Gmail instellen voor e-mails

Je hebt een **App Password** nodig (dit is veiliger dan je echte wachtwoord):

1. Ga naar **[myaccount.google.com](https://myaccount.google.com)**
2. Klik op **Beveiliging** → **Verificatie in twee stappen** (zet dit aan als het uit staat)
3. Ga terug naar **Beveiliging** → scroll naar beneden → **App-wachtwoorden**
4. Kies bij App: **E-mail**, bij Apparaat: **Andere** → typ "Pawfect"
5. Klik **Genereren** → kopieer de 16-cijferige code (bijv. `abcd efgh ijkl mnop`)
6. Verwijder de spaties → dit is je `EMAIL_APP_PASSWORD`

---

## ⚙️ Stap 3 — .env bestand aanmaken

1. Kopieer `.env.example` en hernoem het naar `.env`
2. Vul alle waarden in:

```env
SUPABASE_URL=https://jouwprojectid.supabase.co
SUPABASE_SERVICE_KEY=eyJ...jouw-service-role-key...
ADMIN_EMAIL=casperspeelman1208@gmail.com
ADMIN_PASSWORD=KiesEenSterkWachtwoord123!
JWT_SECRET=maak-een-lange-willekeurige-tekst-hier-123456789
EMAIL_USER=casperspeelman1208@gmail.com
EMAIL_APP_PASSWORD=abcdefghijklmnop
EMAIL_FROM=Pawfect Grooming <casperspeelman1208@gmail.com>
PORT=3000
NODE_ENV=production
SITE_URL=https://jouw-app-naam.up.railway.app
```

> ⚠️ **Deel .env nooit publiek!** Het staat in .gitignore dus het wordt niet geüpload.

---

## 🌐 Stap 4 — Website bestanden toevoegen

Kopieer alle bestanden uit je `pawfect-grooming` map (de frontend) naar de `public/` map:

```
public/index.html    ← index.html van je site
public/css/style.css ← style.css van je site
public/js/main.js    ← main.js van je site
public/img/          ← alle afbeeldingen
```

> De admin-bestanden staan er al in, die hoef je niet te vervangen.

**Boekingsformulier koppelen:**
In je `public/js/main.js`, zoek de functie `handleBook` en vervang:
```javascript
function handleBook(e){
  e.preventDefault();
  document.getElementById('bkForm').style.display='none';
  document.getElementById('successMsg').style.display='block';
}
```
Door:
```javascript
async function handleBook(e){
  e.preventDefault();
  const btn = e.target.querySelector('.btn-sub');
  btn.textContent = 'Bezig...';
  const form = e.target;
  const inputs = form.querySelectorAll('input,select,textarea');
  const data = {};
  inputs.forEach(i => { if(i.name) data[i.name] = i.value; });

  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        naam_baasje: form.querySelector('input[placeholder*="naam"]').value,
        telefoon:    form.querySelector('input[type="tel"]').value,
        email:       form.querySelector('input[type="email"]')?.value || '',
        naam_huisdier: form.querySelector('input[placeholder*="dier"]').value,
        soort_dier:  form.querySelector('select').value,
        dienst:      form.querySelectorAll('select')[1]?.value || '',
        datum:       form.querySelector('input[type="date"]').value,
        opmerkingen: form.querySelector('textarea').value,
      })
    });
    if(!res.ok) throw new Error('Er ging iets mis');
    document.getElementById('bkForm').style.display='none';
    document.getElementById('successMsg').style.display='block';
  } catch(err) {
    btn.textContent = 'Probeer opnieuw';
    alert('Er ging iets mis. Probeer het nog een keer of bel ons.');
  }
}
```

---

## 🚂 Stap 5 — Online zetten met Railway (gratis hosting)

1. Maak een account op **[railway.app](https://railway.app)** (inloggen met GitHub)
2. Klik op **"New Project"** → **"Deploy from GitHub repo"**
3. Koppel je GitHub account en kies de repository
4. Railway detecteert automatisch dat het een Node.js project is
5. Ga naar **Settings → Environment Variables**
6. Voeg **alle variabelen** uit je `.env` toe (één voor één)
7. Zet `SITE_URL` op de URL die Railway je geeft (te vinden bij Settings → Domains)
8. Klik **Deploy** → na ~2 minuten is je site live!

---

## 📁 Stap 6 — GitHub repo aanmaken

```bash
# In de pawfect-backend map:
git init
git add .
git commit -m "Pawfect Grooming backend - eerste versie"

# Op github.com: maak nieuw repository "pawfect-backend"
git remote add origin https://github.com/JOUNGEBRUIKERSNAAM/pawfect-backend.git
git push -u origin main
```

---

## 🔒 Stap 7 — Admin inloggen

Na deployment ga je naar:
```
https://jouw-app.up.railway.app/admin/login.html
```

Log in met het e-mailadres en wachtwoord die je in `.env` hebt ingesteld.

**Admin-pagina's:**
| Pagina | URL |
|--------|-----|
| Dashboard | `/admin/dashboard.html` |
| Boekingen | `/admin/bookings.html` |
| Agenda    | `/admin/agenda.html` |
| Klanten   | `/admin/clients.html` |
| Blog      | `/admin/blog.html` |

---

## 🧪 E-mail testen

Na inloggen kun je een test-e-mail sturen om te controleren of de configuratie klopt:

```bash
curl -X POST https://jouw-app.up.railway.app/api/email/test \
  -H "Authorization: Bearer JOUW_JWT_TOKEN"
```

Of gebruik de Boekingen-pagina en dien een testboeking in via je eigen website.

---

## ❓ Problemen oplossen

| Probleem | Oplossing |
|----------|-----------|
| Kan niet inloggen | Controleer ADMIN_EMAIL en ADMIN_PASSWORD in Railway env vars |
| E-mail komt niet aan | Controleer Gmail App Password, zet 2FA aan in Google account |
| Database fout | Controleer SUPABASE_URL en SUPABASE_SERVICE_KEY |
| Site laadt niet | Controleer of alle bestanden in `public/` staan |

---

## 📞 API overzicht

| Method | Endpoint | Beschrijving |
|--------|----------|--------------|
| POST | `/api/auth/login` | Inloggen |
| GET  | `/api/auth/me` | Sessie controleren |
| POST | `/api/bookings` | Boeking indienen (publiek) |
| GET  | `/api/bookings` | Alle boekingen (admin) |
| PATCH | `/api/bookings/:id` | Status wijzigen (admin) |
| DELETE | `/api/bookings/:id` | Verwijderen (admin) |
| GET  | `/api/blog` | Gepubliceerde posts (publiek) |
| GET  | `/api/blog/all` | Alle posts incl. concepten (admin) |
| POST | `/api/blog` | Nieuwe post (admin) |
| PATCH | `/api/blog/:id` | Post bewerken (admin) |
| GET  | `/api/clients` | Alle klanten (admin) |
| POST | `/api/clients` | Klant toevoegen (admin) |
| POST | `/api/email/test` | Test e-mail sturen (admin) |
