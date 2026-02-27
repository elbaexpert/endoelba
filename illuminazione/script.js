function getParam(name){
  return new URLSearchParams(window.location.search).get(name);
}

function formatComune(slug){
  return slug
    .split("-")
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function initComune(){
  const comuneSlug = getParam("comune");
  const bar = document.getElementById("comuneBar");
  const txt = document.getElementById("comuneText");
  if(!bar || !txt) return;

  if(comuneSlug){
    txt.textContent = `Grazie al Comune di ${formatComune(comuneSlug)}`;
    bar.hidden = false;
  } else {
    txt.textContent = "Grazie al Comune che ha aderito a questa iniziativa";
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
  const text = "Facciamo luce sull’endometriosi – EndoElba";

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
        if(toast){ toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 1600); }
      }catch{
        const tmp = document.createElement('input');
        tmp.value = url;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand('copy');
        tmp.remove();
        if(toast){ toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 1600); }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initComune();
  initShare();
});
