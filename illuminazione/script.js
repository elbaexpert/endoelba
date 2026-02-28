function getParam(name){
  return new URLSearchParams(window.location.search).get(name);
}

function titleCaseWords(str){
  return str
    .split(" ")
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatComune(slug){
  if(!slug) return "";

  const s = slug.toLowerCase().trim();

  // override “puliti” per evitare errori (portoazzurro -> Porto Azzurro, ecc.)
  const map = {
    "portoferraio": "Portoferraio",
    "portoazzurro": "Porto Azzurro",
    "capoliveri": "Capoliveri",
    "marciana": "Marciana",
    "marcianamarina": "Marciana Marina",
    "camponellelba": "Campo nell’Elba",
    "riomarina": "Rio Marina" // fine comuni
  };

  if(map[s]) return map[s];

  // fallback: da slug a testo (marciana-marina -> Marciana Marina)
  const cleaned = s.replace(/[_]+/g, "-").replace(/-+/g, "-");
  const words = cleaned.split("-").map(w => w.trim()).filter(Boolean);

  // caso speciale: "nell" "del" "di" ecc (se mai usati)
  const join = words.join(" ");
  return titleCaseWords(join)
    .replace(/\bNell\b/gi, "nell’")
    .replace(/\bDel\b/gi, "del")
    .replace(/\bDella\b/gi, "della")
    .replace(/\bDi\b/gi, "di");
}

function initComune(){
  const comuneSlug = getParam("comune");
  const bar = document.getElementById("comuneBar");
  const title = document.getElementById("comuneTitle");
  const name = document.getElementById("comuneName");

  if(!bar || !title || !name) return;

  if(comuneSlug){
    const comune = formatComune(comuneSlug);
    title.textContent = "Grazie al Comune di";
    name.textContent = comune;
    bar.hidden = false;
  } else {
    // se NON c'è variabile: messaggio neutro (senza buchi)
    title.textContent = "Grazie al Comune che ha aderito a questa iniziativa";
    name.textContent = "";
    bar.hidden = false;
  }
}

function initShare(){
  const sheet = document.getElementById('shareSheet');
  const openers = [document.getElementById('shareBtnTop'), document.getElementById('shareBtnBottom')].filter(Boolean);
  const closer = document.getElementById('shareClose');
  const wa = document.getElementById('shareWhatsApp');
  const fb = document.getElementById('shareFacebook');
  const em = document.getElementById('shareEmail');
  const copy = document.getElementById('shareCopy');
  const toast = document.getElementById('shareToast');

  if(!sheet) return;

  const url = window.location.href;
  const text = "Facciamo luce sull’Endometriosi – EndoElba";

  if(wa) wa.href = `https://wa.me/?text=${encodeURIComponent(text + "\n" + url)}`;
  if(fb) fb.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  if(em) em.href = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`;

  function open(){ sheet.classList.add('open'); sheet.setAttribute('aria-hidden','false'); }
  function close(){ sheet.classList.remove('open'); sheet.setAttribute('aria-hidden','true'); }

  openers.forEach(btn => btn.addEventListener('click', open));
  if(closer) closer.addEventListener('click', close);
  sheet.addEventListener('click', (e) => { if(e.target === sheet) close(); });

  if(copy){
    copy.addEventListener('click', async () => {
      try{
        await navigator.clipboard.writeText(url);
      }catch{
        const tmp = document.createElement('input');
        tmp.value = url;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand('copy');
        tmp.remove();
      }
      if(toast){ toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 1600); }
    });
  }
}


function trackEvent(name, params){
  try{
    const comune = getParam("comune") || "";
    const payload = Object.assign({ comune }, params || {});
    if(typeof window.gtag === "function"){
      window.gtag("event", name, payload);
    }else if(Array.isArray(window.dataLayer)){
      window.dataLayer.push(Object.assign({ event: name }, payload));
    }else{
      // fallback silenzioso
      // console.log("track", name, payload);
    }
  }catch(e){}
}

function bindTracking(){
  const bindings = [
    { id:"btnSeguici", event:"click_seguici", extra:{ dest:"instagram" } },
    { id:"btnApprofondisciSito", event:"click_approfondisci_sito", extra:{ dest:"endoelba_it" } },
    { id:"btnDonazione", event:"click_donazione", extra:{ dest:"donazioni" } },
    { id:"btnTessera", event:"click_tessera", extra:{ dest:"tessera" } },
    { id:"btnWhatsAppContatti", event:"click_whatsapp_contatti", extra:{ dest:"whatsapp" } },
    { id:"btnSitoContatti", event:"click_sito_contatti", extra:{ dest:"endoelba_it" } },
    { id:"btnEmailContatti", event:"click_email", extra:{ dest:"mailto" } },
    { id:"shareBtnTop", event:"click_condividi_pagina", extra:{ pos:"top" } },
    { id:"shareBtnBottom", event:"click_condividi_pagina", extra:{ pos:"bottom" } },
    { id:"shareWhatsApp", event:"share_whatsapp", extra:{} },
    { id:"shareFacebook", event:"share_facebook", extra:{} },
    { id:"shareEmail", event:"share_email", extra:{} },
    { id:"shareCopy", event:"share_copy", extra:{} }
  ];

  bindings.forEach(b => {
    const el = document.getElementById(b.id);
    if(!el) return;
    el.addEventListener("click", () => trackEvent(b.event, b.extra));
  });
}

function initScrollDepth(){
  const marks = [25,50,75,90,100];
  const fired = new Set();
  let maxPct = 0;

  function getScrollPct(){
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop || 0;
    const height = (doc.scrollHeight - window.innerHeight);
    if(height <= 0) return 100;
    return Math.min(100, Math.max(0, Math.round((scrollTop / height) * 100)));
  }

  function onScroll(){
    const pct = getScrollPct();
    if(pct > maxPct) maxPct = pct;

    marks.forEach(m => {
      if(pct >= m && !fired.has(m)){
        fired.add(m);
        trackEvent("scroll_reach", { percent: m });
      }
    });
  }

  window.addEventListener("scroll", onScroll, { passive:true });
  // ping iniziale
  onScroll();
}


document.addEventListener('DOMContentLoaded', () => {
  initComune();
  initShare();
  bindTracking();
  initScrollDepth();
});
