let cursorTimer;

function enterDisplayMode() {
  if (document.fullscreenElement) return;

  const target = document.documentElement;
  if (target.requestFullscreen) {
    target.requestFullscreen().catch(() => {});
  }
}

function toggleDisplayMode() {
  if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}

function resetCursorTimer() {
  document.body.style.cursor = 'default';
  clearTimeout(cursorTimer);
  cursorTimer = setTimeout(() => {
    document.body.style.cursor = 'none';
  }, 2500);
}

window.addEventListener('load', () => {
  enterDisplayMode();
  resetCursorTimer();
  setTimeout(enterDisplayMode, 700);
});

window.addEventListener('pointerdown', () => {
  enterDisplayMode();
  resetCursorTimer();
});

window.addEventListener('mousemove', resetCursorTimer);
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    document.body.style.cursor = 'default';
  }
  resetCursorTimer();
});
document.addEventListener('dblclick', toggleDisplayMode);

const slides = [
  { image: '../images/schoolpictures (1)/IMG_9030.jpeg', title: 'Welcome to Waterkloof Hills Secondary School', text: 'Developing future leaders with purpose and pride.' },
  { image: '../images/schoolpictures (1)/IMG_9031.jpeg', title: 'Learning in a Caring Environment', text: 'Academic excellence, discipline and student growth.' },
  { image: '../images/schoolpictures (1)/IMG_9032.jpeg', title: 'Celebrating Achievement', text: 'Success is built through commitment and teamwork.' }
];

let slideIndex = 0;
const slideImage = document.getElementById('slide-image');
const slideTitle = document.getElementById('slide-title');
const slideText = document.getElementById('slide-text');

function showSlide(index) {
  if (!slideImage || !slideTitle || !slideText) return;
  const slide = slides[index];
  slideImage.src = slide.image;
  slideImage.alt = slide.title;
  slideTitle.textContent = slide.title;
  slideText.textContent = slide.text;
}

function updateClock() {
  const timeEl = document.getElementById('time');
  const dateEl = document.getElementById('date');
  if (!timeEl || !dateEl) return;
  const now = new Date();
  timeEl.textContent = now.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  dateEl.textContent = now.toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function updateCountdown() {
  const countdownEl = document.getElementById('countdown');
  if (!countdownEl) return;
  const examDate = new Date('2026-11-16T08:00:00');
  const now = new Date();
  const diff = examDate - now;
  if (diff <= 0) { countdownEl.textContent = 'Exams are underway'; return; }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  countdownEl.textContent = `${days}d ${hours}h ${minutes}m remaining`;
}

function rotateSlides() {
  slideIndex = (slideIndex + 1) % slides.length;
  showSlide(slideIndex);
}

showSlide(slideIndex);
updateClock();
updateCountdown();
setInterval(rotateSlides, 6000);
setInterval(updateClock, 1000);
setInterval(updateCountdown, 60000);
