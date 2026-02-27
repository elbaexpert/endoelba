// Funzione per leggere parametri URL
function getParametro(nome) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(nome);
}

// Formattazione comune (portoferraio -> Portoferraio)
function formatComune(slug) {
  return slug
    .split("-")
    .map(parola => parola.charAt(0).toUpperCase() + parola.slice(1))
    .join(" ");
}

// Gestione Comune
document.addEventListener("DOMContentLoaded", function () {
  const comuneSlug = getParametro("comune");
  const comuneElement = document.getElementById("nomeComune");

  if (comuneSlug && comuneElement) {
    comuneElement.textContent = formatComune(comuneSlug);
  } else if (comuneElement) {
    comuneElement.textContent = "________";
  }
});
