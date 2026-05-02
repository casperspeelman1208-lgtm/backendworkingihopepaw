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

  // Read form values by id (reliable)
  const naam      = document.getElementById('bk-naam')?.value || '';
  const telefoon  = document.getElementById('bk-tel')?.value  || '';
  const email     = document.getElementById('bk-email')?.value || '';
  const huisdier  = document.getElementById('bk-huisdier')?.value || '';
  const soort     = document.getElementById('bk-soort')?.value || '';
  const dienst    = document.getElementById('bk-dienst')?.value || '';
  const datum     = document.getElementById('bk-datum')?.value || '';
  const opmerking = document.getElementById('bk-opmerking')?.value || '';

  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        naam_baasje:   naam,
        telefoon:      telefoon,
        email:         email,
        naam_huisdier: huisdier,
        soort_dier:    soort,
        dienst:        dienst,
        datum:         datum,
        opmerkingen:   opmerking,
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Er ging iets mis');

    // Show success with email address filled in
    document.getElementById('bkForm').style.display = 'none';
    const successEl = document.getElementById('successMsg');
    successEl.style.display = 'block';
    const emailSpan = document.getElementById('successEmail');
    if (emailSpan && email) emailSpan.textContent = 'Bevestiging verstuurd naar: ' + email;

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

/* REVIEWS — navigeer naar home en scroll naar reviews sectie */
function goToReviews() {
  // Als subpage actief is: eerst terug naar home
  var overlay = document.getElementById('subpage-overlay');
  if (overlay && overlay.style.display === 'block') {
    navigateTo('home');
    setTimeout(function() {
      var el = document.getElementById('reviews');
      if (el) el.scrollIntoView({behavior: 'smooth'});
    }, 350);
  } else {
    var el = document.getElementById('reviews');
    if (el) el.scrollIntoView({behavior: 'smooth'});
  }
}

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
  var grid = document.getElementById('blogGrid');
  if (!grid) return;

  grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#7C4D3A"><div style="font-size:2rem;margin-bottom:.5rem">loading...</div></div>';

  try {
    var res   = await fetch('/api/blog');
    var posts = await res.json();

    if (!Array.isArray(posts) || posts.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#7C4D3A"><div style="font-size:3rem">📝</div><p style="margin-top:1rem">Nog geen blogposts gepubliceerd.</p></div>';
      return;
    }

    var cards = '';
    for (var i = 0; i < posts.length; i++) {
      var p = posts[i];
      var s = p.slug;
      var bg = p.cover_image
        ? 'background-image:url(' + p.cover_image + ');background-size:cover;background-position:center'
        : 'background:linear-gradient(135deg,#FFF5CC,#FFE8E8);display:flex;align-items:center;justify-content:center;font-size:3.5rem';
      var oc = "window.location.href='/blog-post.html?slug=" + s + "'";

      cards += '<div class="blog-card" style="cursor:pointer" onclick="' + oc + '">';
      cards += '<div class="blog-img" style="' + bg + '">' + (p.cover_image ? '' : '📝') + '</div>';
      cards += '<div class="blog-content">';
      cards += '<div class="blog-meta">' + (p.category || 'Algemeen') + ' · ' + formatBlogDate(p.published_at) + '</div>';
      cards += '<h3 class="blog-card-title">' + p.title + '</h3>';
      cards += '<p>' + (p.excerpt || '') + '</p>';
      cards += '<span class="blog-link" style="color:#FF6B6B;font-weight:800;font-size:.9rem">Lees meer →</span>';
      cards += '</div></div>';
    }
    grid.innerHTML = cards;

  } catch (err) {
    console.error('Blog laden mislukt:', err);
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#7C4D3A"><p>Posts konden niet worden geladen.</p></div>';
  }
}

function laadBlogDetail(slug) {
  window.location.href = '/blog-post.html?slug=' + encodeURIComponent(slug);
}

function formatBlogDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('nl-NL', {day:'numeric', month:'long', year:'numeric'});
}

// Blog wordt geladen via navigateTo() direct
