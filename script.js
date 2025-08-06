// Tenhle skript řeší problémy s vh jednotkami. Přepočítává skutečnou výšku viewportu.
function setRealVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--real-vh', `${vh}px`);
}
setRealVH();
window.addEventListener('resize', setRealVH);

// Tenhle script řeší zalamování jednoznakovek. Přidává nedělitelnou mezeru před písmena, která by mohla zůstat na konci řádku.
function fixWidows(selector = 'p, h1, h2, h3, h4, span, li') {
  const elements = document.querySelectorAll(selector);
  const regex = /(\s)([ksvzaiouKSZVAIUO])\s/g;

  elements.forEach(el => {
    el.innerHTML = el.innerHTML.replace(regex, '$1$2&nbsp;');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  fixWidows();
});

// Tenhle skript přidává smooth scroll na odkazy s ID.
document.getElementById('scrollToProjects').addEventListener('click', function () {
  document.querySelector('#projects').scrollIntoView({ behavior: 'smooth' });
});
