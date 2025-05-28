function setRealVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--real-vh', `${vh}px`);
}
setRealVH();
window.addEventListener('resize', setRealVH);

// function fitText(el, compressor = 1) {
//   const resizeText = () => {
//     const parentWidth = el.parentElement.offsetWidth;
//     let newFontSize = (parentWidth / (el.textContent.length)) * compressor;
//     el.style.fontSize = newFontSize + 'px';
//   };

//   // Init
//   resizeText();

//   // Refit on resize
//   window.addEventListener('resize', resizeText);
// }

// // Použij na element s classou .text-prim a .text-sec
// document.querySelectorAll('.text-prim, .text-sec').forEach(el => fitText(el, 1.85));

