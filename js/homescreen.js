(function(){
  const slidesEl = document.getElementById('slides');
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const slides = slidesEl ? slidesEl.children : [];
  let idx = 0;
  let timer;

  function show(i){
    if (!slidesEl) return;
    idx = (i + slides.length) % slides.length;
    slidesEl.style.transform = `translateX(${ -idx * 100 }%)`;
  }

  function nextSlide(){ show(idx+1); }
  function prevSlide(){ show(idx-1); }

  function start(){ timer = setInterval(nextSlide,6000); }
  function stop(){ clearInterval(timer); }

  if (next) next.addEventListener('click', ()=>{ stop(); nextSlide(); start(); });
  if (prev) prev.addEventListener('click', ()=>{ stop(); prevSlide(); start(); });
  if (slidesEl){ slidesEl.addEventListener('pointerenter', stop); slidesEl.addEventListener('pointerleave', start); }

  show(0); start();

  // make big 'Watch Board' open in new tab on touch devices
  const openBoard = document.getElementById('open-board');
  if (openBoard){ openBoard.addEventListener('click', (e)=>{
    // ensure it opens in a focused window
    // default anchor works; no special action needed here
  }); }
})();