
function track(eventName, params = {}){
  // GA4 via gtag
  if (typeof window.gtag === "function"){
    window.gtag("event", eventName, params);
    return;
  }
  // GA4 via dataLayer
  if (Array.isArray(window.dataLayer)){
    window.dataLayer.push({ event: eventName, ...params });
  }
}

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


function initAnalytics(){
  const qs = (sel) => document.querySelector(sel);

  const clickMap = [
    ["#shareBtnTop", "share_open", {position:"top"}],
    ["#shareBtnBottom", "share_open", {position:"bottom"}],
    [".btn-wa-top", "click_whatsapp", {position:"topbar"}],
    [".topFollow", "click_instagram", {position:"topbar"}],
    [".ctaRow .btn.primary", "click_approfondisci", {position:"content"}],
    ["#sostieni .btn.glowPulse", "click_tessera", {position:"sostieni"}],
    ["#sostieni .btn.primary", "click_dona", {position:"sostieni"}],
    ["#contatti .btn-wa", "click_whatsapp", {position:"contatti"}],
    ["#contatti .btn-site", "click_sito", {position:"contatti"}],
    ["#contatti .btn-email", "click_email", {position:"contatti"}],
    ["#shareWhatsApp", "share_channel", {channel:"whatsapp"}],
    ["#shareFacebook", "share_channel", {channel:"facebook"}],
    ["#shareEmail", "share_channel", {channel:"email"}],
    ["#shareCopy", "share_channel", {channel:"copy_link"}],
  ];

  clickMap.forEach(([sel, ev, params]) => {
    const el = qs(sel);
    if(!el) return;
    el.addEventListener("click", () => track(ev, params));
  });

  // Scroll depth
  const fired = {};
  const thresholds = [25, 50, 75, 90, 100];
  function onScroll(){
    const doc = document.documentElement;
    const scroll = (window.scrollY || doc.scrollTop) + window.innerHeight;
    const height = Math.max(doc.scrollHeight, document.body.scrollHeight);
    const percent = Math.round((scroll / height) * 100);

    thresholds.forEach(t => {
      if(percent >= t && !fired[t]){
        fired[t] = true;
        track("scroll_reach", {percent: t});
      }
    });
  }
  window.addEventListener("scroll", onScroll, {passive:true});
  onScroll();
}


document.addEventListener('DOMContentLoaded', () => {
  initComune();
  initShare();
  initAnalytics();
});
