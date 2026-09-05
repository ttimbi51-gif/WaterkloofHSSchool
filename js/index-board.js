(() => {
  const slides = document.querySelectorAll('.slide');
  const slidesWrapper = document.getElementById('slides');
  const prev = document.getElementById('slide-prev');
  const next = document.getElementById('slide-next');
  const dots = document.querySelectorAll('.dot');
  let index = 0;
  let interval;

  function update() {
    slidesWrapper.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === index));
  }

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    update();
  }

  function nextSlide() { goTo(index + 1); }
  function prevSlide() { goTo(index - 1); }

  function startAuto() {
    interval = setInterval(nextSlide, 6000);
  }

  function stopAuto() {
    clearInterval(interval);
  }

  prev?.addEventListener('click', () => { prevSlide(); stopAuto(); startAuto(); });
  next?.addEventListener('click', () => { nextSlide(); stopAuto(); startAuto(); });
  dots.forEach((dot, dotIndex) => dot.addEventListener('click', () => { goTo(dotIndex); stopAuto(); startAuto(); }));
  slidesWrapper?.addEventListener('mouseenter', stopAuto);
  slidesWrapper?.addEventListener('mouseleave', startAuto);

  update();
  startAuto();
})();