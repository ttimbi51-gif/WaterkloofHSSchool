function initBillboard() {
  const clockElement = document.getElementById('clock');
  const slidesContainer = document.querySelector('.billboard-slider');
  const dotsContainer = document.querySelector('.slider-dots');
  const prevBtn = document.querySelector('.slider-btn.prev');
  const nextBtn = document.querySelector('.slider-btn.next');
  let slideElements = [];
  let slideIndex = 0;
  let slideInterval;
  let sharedSlides = [];

  function renderSlides(slides) {
    sharedSlides = Array.isArray(slides) && slides.length ? slides : [{
      image: 'images/School Pics 3/IMG_9013.jpeg',
      title: 'Waterkloof Hills Secondary School',
      text: 'Empowering learners through innovation, discipline and excellence.'
    }];

    if (!slidesContainer) return;

    slidesContainer.innerHTML = '';
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
    }

    sharedSlides.forEach((slide, index) => {
      const article = document.createElement('article');
      article.className = `slide${index === 0 ? ' active' : ''}`;
      article.innerHTML = `
        <img src="${slide.image || ''}" alt="${(slide.title || 'School slide').replace(/"/g, '&quot;')}" />
        <div class="slide-overlay">
          <span>${slide.title ? 'WELCOME TO' : 'WELCOME TO'}</span>
          <h1>${slide.title || 'Waterkloof Hills Secondary School'}</h1>
          <p>${slide.text || 'Empowering learners through innovation, discipline and excellence.'}</p>
          <a class="hero-btn" href="school-info.html">Explore School</a>
        </div>
      `;
      slidesContainer.appendChild(article);

      if (dotsContainer) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = `slider-dot${index === 0 ? ' active' : ''}`;
        dot.setAttribute('aria-label', `Slide ${index + 1}`);
        dot.addEventListener('click', () => {
          showSlide(index);
          startSlideShow();
        });
        dotsContainer.appendChild(dot);
      }
    });

    slideElements = Array.from(slidesContainer.querySelectorAll('.slide'));
    showSlide(0);
  }

  function showSlide(index) {
    if (!slideElements.length) return;
    slideIndex = (index + slideElements.length) % slideElements.length;
    slideElements.forEach((slide, i) => {
      slide.classList.toggle('active', i === slideIndex);
    });
    const dots = dotsContainer ? Array.from(dotsContainer.querySelectorAll('.slider-dot')) : [];
    dots.forEach((dot, i) => dot.classList.toggle('active', i === slideIndex));
  }

  function nextSlide() {
    showSlide(slideIndex + 1);
  }

  function prevSlide() {
    showSlide(slideIndex - 1);
  }

  function startSlideShow() {
    stopSlideShow();
    slideInterval = setInterval(nextSlide, 6000);
  }

  function stopSlideShow() {
    if (slideInterval) {
      clearInterval(slideInterval);
    }
  }

  function updateClock() {
    if (!clockElement) return;
    const now = new Date();
    const formatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    clockElement.textContent = formatted;
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); startSlideShow(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); startSlideShow(); });

  async function loadSharedSlides() {
    try {
      const response = await fetch(`/api/shared-slides?ts=${Date.now()}`);
      if (!response.ok) throw new Error('Shared slides request failed');
      const data = await response.json();
      renderSlides(data);
    } catch (error) {
      console.warn('Unable to load shared slides for the homepage.', error);
      renderSlides([]);
    }
  }

  loadSharedSlides();
  startSlideShow();
  updateClock();
  setInterval(updateClock, 1000);
  setInterval(() => {
    loadSharedSlides();
  }, 5000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBillboard);
} else {
  initBillboard();
}
