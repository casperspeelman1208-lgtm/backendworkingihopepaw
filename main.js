/* CURSOR */
const cur=document.getElementById('cursor');
document.addEventListener('mousemove',e=>{cur.style.left=e.clientX+'px';cur.style.top=e.clientY+'px'});
document.addEventListener('mousedown',()=>cur.style.transform='translate(-50%,-50%) scale(.7)');
document.addEventListener('mouseup',()=>cur.style.transform='translate(-50%,-50%) scale(1)');

/* SCROLL PROGRESS + NAV */
const prog=document.getElementById('progress'),navEl=document.getElementById('nav');
window.addEventListener('scroll',()=>{
  const s=document.documentElement.scrollTop,h=document.documentElement.scrollHeight-window.innerHeight;
  prog.style.width=(s/h*100)+'%';
  navEl.classList.toggle('scrolled',s>60);
});

/* FLOATING PAWS */
const pawSVG=`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="#FF6B6B"><ellipse cx="12" cy="14" rx="7" ry="9"/><ellipse cx="32" cy="8" rx="7" ry="9"/><ellipse cx="52" cy="14" rx="7" ry="9"/><ellipse cx="22" cy="28" rx="6" ry="8"/><ellipse cx="42" cy="28" rx="6" ry="8"/><path d="M32 24c-14 0-20 10-18 22 2 8 8 12 18 12s16-4 18-12c2-12-4-22-18-22z"/></svg>`;
const fpc=document.getElementById('fpaws');
for(let i=0;i<14;i++){
  const d=document.createElement('div');d.classList.add('fp');
  const sz=18+Math.random()*26;
  d.style.cssText=`width:${sz}px;height:${sz}px;left:${Math.random()*100}%;bottom:${-sz}px;animation-duration:${9+Math.random()*12}s;animation-delay:${Math.random()*12}s`;
  d.innerHTML=pawSVG;fpc.appendChild(d);
}

/* INTERSECTION OBSERVER — scroll animations */
const io=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const delay=(parseInt(e.target.dataset.d||0))*85;
      setTimeout(()=>e.target.classList.add('vis'),delay);
    }
  });
},{threshold:.1});
document.querySelectorAll('.sa,.sal,.sar,.sas').forEach(el=>io.observe(el));

/* TRUST BAR */
const tio=new IntersectionObserver(e=>{
  if(e[0].isIntersecting) document.querySelectorAll('.ti').forEach((t,i)=>setTimeout(()=>t.classList.add('vis'),i*100));
},{threshold:.5});
const tb=document.querySelector('.trust-bar');if(tb)tio.observe(tb);

/* COUNTER ANIMATION */
let counted=false;
const statObs=new IntersectionObserver(entries=>{
  if(entries[0].isIntersecting&&!counted){
    counted=true;
    document.querySelectorAll('.num[data-target]').forEach(el=>{
      const target=parseFloat(el.dataset.target);
      const dec=parseInt(el.dataset.dec||0);
      const dur=1800;const start=performance.now();
      const from=parseFloat(el.textContent)||0;
      function step(now){
        const p=Math.min((now-start)/dur,1);
        const ease=1-Math.pow(1-p,4);
        const val=from+(target-from)*ease;
        el.textContent=dec?val.toFixed(dec):Math.round(val);
        if(p<1)requestAnimationFrame(step);
        else el.textContent=dec?target.toFixed(dec):target;
      }
      requestAnimationFrame(step);
    });
  }
},{threshold:.4});
const stEl=document.querySelector('.stats');if(stEl)statObs.observe(stEl);

/* FAQ */
function toggleFaq(btn){
  const item=btn.closest('.fi');
  const isOpen=item.classList.contains('open');
  document.querySelectorAll('.fi.open').forEach(i=>i.classList.remove('open'));
  if(!isOpen)item.classList.add('open');
}

/* MOBILE MENU */
function toggleMenu(){document.getElementById('mobMenu').classList.toggle('open')}

/* BOOKING FORM */
async function handleBook(e){
  e.preventDefault();
  const btn = e.target.querySelector('.btn-sub');
  const origText = btn.textContent;
  btn.textContent = 'Bezig...';
  btn.disabled = true;

  const form = e.target;
  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        naam_baasje:   form.querySelector('input[placeholder*="naam"]').value,
        telefoon:      form.querySelector('input[type="tel"]').value,
        email:         form.querySelector('input[type="email"]')?.value || '',
        naam_huisdier: form.querySelector('input[placeholder*="dier"]').value,
        soort_dier:    form.querySelectorAll('select')[0]?.value || '',
        dienst:        form.querySelectorAll('select')[1]?.value || '',
        datum:         form.querySelector('input[type="date"]').value,
        opmerkingen:   form.querySelector('textarea').value,
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Er ging iets mis');
    document.getElementById('bkForm').style.display = 'none';
    document.getElementById('successMsg').style.display = 'block';
  } catch(err) {
    btn.textContent = origText;
    btn.disabled = false;
    alert('Er ging iets mis: ' + err.message + '\nProbeer het nog een keer of bel ons op +31 79 123 4567.');
  }
}

/* SMOOTH SCROLL */
document.querySelectorAll('a[href^="#"]:not([data-page]):not([onclick])').forEach(a=>{
  a.addEventListener('click',e=>{
    const id=a.getAttribute('href').slice(1);
    if(!id) return;
    const el=document.getElementById(id);
    if(el){e.preventDefault();el.scrollIntoView({behavior:'smooth'})}
  });
});

/* ── SUBPAGE ROUTER ── */
const PAGES_MAP = {
  'bad-borstel':'sp-bad-borstel','knipbeurt-styling':'sp-knipbeurt-styling',
  'nagels-poten':'sp-nagels-poten','spa-deluxe':'sp-spa-deluxe',
  'prijslijst':'sp-prijslijst','over-ons':'sp-over-ons','ons-team':'sp-ons-team',
  'blog':'sp-blog','blog-detail':'sp-blog-detail','vacatures':'sp-vacatures',
  'contact':'sp-contact','faq-page':'sp-faq-page','privacybeleid':'sp-privacybeleid',
  'algemene-voorwaarden':'sp-algemene-voorwaarden','cadeaubon':'sp-cadeaubon',
  'abonnement':'sp-abonnement'
};

function navigateTo(page){
  if(page==='home'){
    document.getElementById('subpage-overlay').style.display='none';
    document.getElementById('main-page').style.display='block';
    document.querySelectorAll('.sp').forEach(s=>s.classList.remove('active'));
    window.scrollTo({top:0,behavior:'smooth'});
    history.pushState({},'','#');
    return;
  }
  const spId=PAGES_MAP[page];
  if(!spId) return;
  document.getElementById('main-page').style.display='none';
  const overlay=document.getElementById('subpage-overlay');
  overlay.style.display='block';
  document.querySelectorAll('.sp').forEach(s=>s.classList.remove('active'));
  const target=document.getElementById(spId);
  if(target) target.classList.add('active');
  window.scrollTo({top:0,behavior:'instant'});
  history.pushState({page},'','#'+page);
  // Inject team images on team page
  if(page==='ons-team') injectTeamImgs();
  if(page==='blog') laadBlogPosts();
}

function injectTeamImgs(){
  const teamImgs=document.querySelectorAll('.team-grid .t-ava img, #team .t-ava img');
  const spSlots=['sp-team-lisa','sp-team-daan','sp-team-sophie','sp-team-tom'];
  const mainAvas=document.querySelectorAll('#team .t-ava');
  spSlots.forEach((id,i)=>{
    const slot=document.getElementById(id);
    if(!slot||slot.style.backgroundImage) return;
    const src=mainAvas[i]?.querySelector('img')?.src;
    if(src) slot.style.backgroundImage='url('+src+')';
  });
}

// Wire up all footer links
document.querySelectorAll('footer a[data-page]').forEach(a=>{
  a.addEventListener('click',e=>{
    e.preventDefault();
    navigateTo(a.dataset.page);
    window.scrollTo({top:0,behavior:'instant'});
  });
});

// Wire nav logo to home
document.getElementById('logo-link')?.addEventListener('click',e=>{
  e.preventDefault();
  navigateTo('home');
});

// Back button support
window.addEventListener('popstate',e=>{
  if(e.state?.page) navigateTo(e.state.page);
  else navigateTo('home');
});


/* DROPDOWN: JS-controlled open/close to prevent gap-closing bug */
document.querySelectorAll('.has-drop').forEach(item=>{
  let timer;
  const openDrop  = ()=>{ clearTimeout(timer); item.classList.add('open'); };
  const closeDrop = ()=>{ timer=setTimeout(()=>item.classList.remove('open'), 100); };
  item.addEventListener('mouseenter', openDrop);
  item.addEventListener('mouseleave', closeDrop);
  const dd = item.querySelector('.dropdown');
  if(dd){
    dd.addEventListener('mouseenter', openDrop);
    dd.addEventListener('mouseleave', closeDrop);
  }
  item.querySelectorAll('.dropdown a').forEach(a=>{
    a.addEventListener('click', ()=>item.classList.remove('open'));
  });
});
document.addEventListener('click', e=>{
  if(!e.target.closest('.has-drop'))
    document.querySelectorAll('.has-drop').forEach(d=>d.classList.remove('open'));
});

/* ══════════════════════════════════════════════════════
   BLOG — dynamisch laden vanuit de backend
   ══════════════════════════════════════════════════════ */

async function laadBlogPosts() {
  const grid = document.getElementById('blogGrid');
  if (!grid) return;

  try {
    const res  = await fetch('/api/blog');
    const posts = await res.json();

    if (!Array.isArray(posts) || posts.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:3rem 1rem;color:var(--brown-mid)">
          <div style="font-size:3rem;margin-bottom:1rem">📝</div>
          <h3 style="font-family:'Fredoka One',cursive;font-size:1.3rem;color:var(--brown);margin-bottom:.5rem">Nog geen blogposts</h3>
          <p>De eerste posts zijn onderweg!</p>
        </div>`;
      return;
    }

    grid.innerHTML = posts.map(post => `
      <div class="blog-card blog-card-link" onclick="laadBlogDetail('${post.slug}')">
        <div class="blog-img" style="${post.cover_image
          ? `background:url('${post.cover_image}') center/cover no-repeat`
          : 'background:linear-gradient(135deg,var(--yellow-light),var(--coral-light));display:flex;align-items:center;justify-content:center;font-size:3.5rem'}">
          ${post.cover_image ? '' : '📝'}
        </div>
        <div class="blog-content">
          <div class="blog-meta">${post.category || 'Algemeen'} · ${formatBlogDate(post.published_at)}</div>
          <h3 class="blog-card-title">${post.title}</h3>
          <p>${post.excerpt || ''}</p>
          <span class="blog-link">Lees meer →</span>
        </div>
      </div>`).join('');

  } catch (err) {
    console.error('Blog laden mislukt:', err);
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--brown-mid)">
        <p>Posts konden niet worden geladen. Probeer het later opnieuw.</p>
      </div>`;
  }
}

async function laadBlogDetail(slug) {
  // Show the detail page
  document.getElementById('main-page').style.display = 'none';
  const overlay = document.getElementById('subpage-overlay');
  overlay.style.display = 'block';
  document.querySelectorAll('.sp').forEach(s => s.classList.remove('active'));
  const detailPage = document.getElementById('sp-blog-detail');
  if (detailPage) detailPage.classList.add('active');
  window.scrollTo({top: 0, behavior: 'instant'});

  const inner = document.getElementById('blogDetailInner');
  if (!inner) { console.error('blogDetailInner niet gevonden'); return; }
  inner.innerHTML = '<div style="text-align:center;padding:4rem;color:var(--brown-mid)"><div style="font-size:2rem;margin-bottom:1rem">⏳</div>Post laden...</div>';

  try {
    const res = await fetch('/api/blog/' + encodeURIComponent(slug));
    if (!res.ok) throw new Error('Post niet gevonden (status ' + res.status + ')');
    const post = await res.json();

    inner.innerHTML = `
      ${post.cover_image
        ? `<img src="${post.cover_image}" class="blog-detail-cover" alt="${post.title}" onerror="this.style.display='none'">`
        : ''}
      <div class="blog-detail-cat">${post.category || 'Algemeen'}</div>
      <h1 class="blog-detail-title">${post.title}</h1>
      <div class="blog-detail-meta">
        Gepubliceerd op ${formatBlogDate(post.published_at)}
      </div>
      <div class="blog-detail-body">${post.content}</div>
      <div style="margin-top:3rem;padding-top:2rem;border-top:2px solid var(--yellow-light);text-align:center">
        <button class="btn-p" style="border:none;cursor:pointer" onclick="navigateTo('blog')">
          ← Terug naar alle posts
        </button>
      </div>`;

  } catch (err) {
    console.error('Blog detail fout:', err);
    inner.innerHTML = `
      <div style="text-align:center;padding:4rem;color:var(--brown-mid)">
        <div style="font-size:3rem;margin-bottom:1rem">😔</div>
        <p style="margin-bottom:1rem">Post kon niet worden geladen.</p>
        <button onclick="navigateTo('blog')" style="cursor:pointer;background:var(--coral);color:#fff;border:none;border-radius:50px;padding:.7rem 1.5rem;font-family:'Nunito',sans-serif;font-weight:800;font-size:.9rem">
          Terug naar blog
        </button>
      </div>`;
  }
}

function formatBlogDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('nl-NL', {day:'numeric', month:'long', year:'numeric'});
}

// Blog wordt geladen via navigateTo() direct
