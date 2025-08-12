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

// Lightbox pro více projektů (lokální pro každý .projects-grid, sdílený modal)
(() => {
  const modal = document.getElementById('projectLightbox');
  if (!modal) return;

  const imgEl     = modal.querySelector('.plb__img');
  const stage     = modal.querySelector('.plb__stage');
  const dotsWrap  = modal.querySelector('.plb__dots');
  const counterEl = modal.querySelector('.plb__counter');
  const btnClose  = modal.querySelector('.plb__close');
  const btnPrev   = modal.querySelector('.plb__arrow--left');
  const btnNext   = modal.querySelector('.plb__arrow--right');

  // Stav pro AKTUÁLNĚ otevřenou galerii
  let items = [];              // [{el, src, alt}, ...] pro konkrétní .projects-grid
  let dots  = [];              // NodeList teček pro aktuální galerii
  let index = 0;

  // Zoom/pan/swipe stav
  let baseW = 0, baseH = 0;
  let scale = 1, tx = 0, ty = 0;
  let gesture = null;          // 'swipe' | 'pan'
  let startX = 0, startY = 0, curX = 0, curY = 0;
  let panStartX = 0, panStartY = 0;

  // double-tap detekce
  let lastTapTime = 0, lastTapX = 0, lastTapY = 0;

  // --- Pomocné funkce ---
  function setupDots() {
    dotsWrap.innerHTML = items.map((_, i) => `<span class="plb__dot" data-i="${i}"></span>`).join('');
    dots = Array.from(dotsWrap.querySelectorAll('.plb__dot'));
  }

  function applyTransform() {
    imgEl.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    imgEl.classList.toggle('is-zoomed', scale > 1);
  }

  function measureBase() {
    const r = imgEl.getBoundingClientRect();
    baseW = r.width; baseH = r.height;
  }

  function clampPan() {
    const sr = stage.getBoundingClientRect();
    const w = baseW * scale;
    const h = baseH * scale;
    const maxX = Math.max(0, (w - sr.width) / 2);
    const maxY = Math.max(0, (h - sr.height) / 2);
    tx = Math.max(-maxX, Math.min(maxX, tx));
    ty = Math.max(-maxY, Math.min(maxY, ty));
  }

  function resetZoom() {
    scale = 1; tx = 0; ty = 0;
    applyTransform();
  }

  function toggleZoomAt(clientX, clientY) {
    const sr = stage.getBoundingClientRect();
    if (scale === 1) {
      const s = 2.2;
      const dx = clientX - (sr.left + sr.width / 2);
      const dy = clientY - (sr.top + sr.height / 2);
      scale = s;
      tx = -(s - 1) * dx;
      ty = -(s - 1) * dy;
      clampPan();
    } else {
      resetZoom();
    }
    applyTransform();
  }

  function updateNavState() {
    // bez loopu (i když jsou šipky skryté, logika zůstává kvůli klávesám)
    const atFirst = index === 0;
    const atLast  = index === items.length - 1;
    btnPrev?.classList.toggle('is-disabled', atFirst);
    btnNext?.classList.toggle('is-disabled', atLast);
    btnPrev?.setAttribute('aria-disabled', atFirst ? 'true' : 'false');
    btnNext?.setAttribute('aria-disabled', atLast ? 'true' : 'false');
  }

  function show(i, {fromKeyboard = false} = {}) {
    if (!items.length) return;
    index = Math.max(0, Math.min(items.length - 1, i));
    const { src, alt } = items[index];

    resetZoom();
    imgEl.src = src;
    imgEl.alt = alt;

    // aktivní tečka + čítač
    if (dots.length !== items.length) setupDots();
    dots.forEach((d, di) => d.classList.toggle('is-active', di === index));
    counterEl.textContent = `${index + 1} / ${items.length}`;

    updateNavState();

    if (fromKeyboard) {
      imgEl.animate([{opacity:.8},{opacity:1}], {duration:120});
    }
  }

  imgEl.addEventListener('load', () => {
    requestAnimationFrame(() => {
      measureBase();
      applyTransform();
    });
  });

  function openAt(i) {
    document.body.style.overflow = 'hidden';
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    show(i);
    btnClose.focus({preventScroll:true});
  }

  function close() {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

// --- Připojení na více galerií: .projects-grid i .gallery-carousel ---
function attachLocalLightbox(containerSelector, imageSelector) {
  const containers = document.querySelectorAll(containerSelector);
  containers.forEach(container => {
    const localItems = Array.from(container.querySelectorAll(imageSelector))
      .map((img, idx) => ({
        el: img,
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt') || `Image ${idx+1}`
      }))
      .filter(it => it.src && it.src.trim() !== '');

    if (!localItems.length) return;

    // otevři modal při kliku na libovolný obrázek v tomto kontejneru
    container.addEventListener('click', (e) => {
      const img = e.target.closest('img');
      if (!img) return;
      const i = localItems.findIndex(it => it.el === img);
      if (i >= 0) {
        items = localItems;   // ← přepni na lokální sadu této galerie
        setupDots();          // ← vytvoř tečky pro aktuální sadu
        openAt(i);            // ← otevři modal na daném indexu
      }
    });
  });
}

// Volání pro oba typy galerií:
attachLocalLightbox('.projects-grid', '.item img');
attachLocalLightbox('.gallery-carousel', '.gallery-item img');

  // --- Ovládání / interakce ---
  btnClose.addEventListener('click', close);
  btnPrev?.addEventListener('click', () => { if (index > 0) show(index - 1, {fromKeyboard:true}); });
  btnNext?.addEventListener('click', () => { if (index < items.length - 1) show(index + 1, {fromKeyboard:true}); });

  modal.addEventListener('click', (e) => {
    const within = e.target.closest('.plb__stage, .plb__arrow, .plb__dots, .plb__close');
    if (!within) close();
  });

  dotsWrap.addEventListener('click', (e) => {
    const dot = e.target.closest('.plb__dot');
    if (!dot) return;
    const i = parseInt(dot.dataset.i, 10);
    if (!Number.isNaN(i)) show(i, {fromKeyboard:true});
  });

  document.addEventListener('keydown', (e) => {
    if (modal.classList.contains('hidden')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight' && index < items.length - 1 && scale === 1) show(index + 1, {fromKeyboard:true});
    if (e.key === 'ArrowLeft'  && index > 0 && scale === 1) show(index - 1, {fromKeyboard:true});
    if (e.key === 'Home' && scale === 1) show(0, {fromKeyboard:true});
    if (e.key === 'End'  && scale === 1) show(items.length - 1, {fromKeyboard:true});
  });

  // Double-click (desktop)
  imgEl.addEventListener('dblclick', (e) => {
    e.preventDefault();
    toggleZoomAt(e.clientX, e.clientY);
  });

  // Pointer gesta: swipe (scale=1) / pan (scale>1) + double-tap (touch)
  function onPointerDown(e) {
    if (modal.classList.contains('hidden')) return;
    e.preventDefault();

    const now = Date.now();
    const isDoubleTap = (e.pointerType === 'touch' &&
                         (now - lastTapTime) < 300 &&
                         Math.hypot(e.clientX - lastTapX, e.clientY - lastTapY) < 20);

    lastTapTime = now; lastTapX = e.clientX; lastTapY = e.clientY;

    if (isDoubleTap) {
      toggleZoomAt(e.clientX, e.clientY);
      gesture = null;
      return;
    }

    startX = curX = e.clientX;
    startY = curY = e.clientY;

    if (scale > 1) {
      gesture = 'pan';
      panStartX = tx; panStartY = ty;
      imgEl.style.cursor = 'grabbing';
    } else {
      gesture = 'swipe';
    }
  }

  function onPointerMove(e) {
    if (!gesture) return;
    curX = e.clientX; curY = e.clientY;

    if (gesture === 'pan') {
      tx = panStartX + (curX - startX);
      ty = panStartY + (curY - startY);
      clampPan();
      applyTransform();
    } else if (gesture === 'swipe' && scale === 1) {
      const dx = curX - startX;
      imgEl.style.transform = `translate(${dx * 0.25}px, 0) scale(1)`;
      imgEl.style.opacity = String(Math.max(0.5, 1 - Math.abs(dx)/300));
    }
  }

  function onPointerUp() {
    if (!gesture) return;

    if (gesture === 'swipe' && scale === 1) {
      const dx = curX - startX;
      imgEl.style.opacity = '';
      imgEl.style.transform = '';
      if (dx > 80 && index > 0) show(index - 1);
      else if (dx < -80 && index < items.length - 1) show(index + 1);
    }

    if (gesture === 'pan') {
      imgEl.style.cursor = 'grab';
    }

    gesture = null;
  }

  modal.addEventListener('pointerdown', onPointerDown);
  modal.addEventListener('pointermove', onPointerMove);
  modal.addEventListener('pointerup', onPointerUp);
  modal.addEventListener('pointercancel', onPointerUp);

  // Re-measure při resize (jen pokud nejsi v zoomu)
  window.addEventListener('resize', () => {
    if (!modal.classList.contains('hidden') && scale === 1) {
      requestAnimationFrame(() => { measureBase(); applyTransform(); });
    }
  });
})();