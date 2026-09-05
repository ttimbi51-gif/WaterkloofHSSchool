let cursorTimer;

const fallbackSlides = [
  {
    image: 'billbord/384C8D94-D038-4706-B8DD-D9ACB061DA5C.jpeg',
    title: 'Welcome to Waterkloof Hills Secondary School',
    text: 'Developing future leaders with purpose and pride.'
  },
  {
    image: 'billbord/3B4FC51B-1E8C-4D9E-86C9-1A8792D11EA7.jpeg',
    title: 'Learning in a Caring Environment',
    text: 'Academic excellence, discipline and student growth.'
  },
  {
    image: 'billbord/6C9C8F01-DA64-4458-8E3A-EE5890B7189E.jpeg',
    title: 'Celebrating Achievement',
    text: 'Success is built through commitment and teamwork.'
  }
];

let slides = [...fallbackSlides];
let refreshTimer = null;
let activeBoardImage = '';

async function loadBillboardSlides() {
  try {
    const response = await fetch(`/api/shared-slides?ts=${Date.now()}`);
    if (!response.ok) throw new Error('Network response was not ok');
    const sharedSlides = await response.json();
    if (Array.isArray(sharedSlides) && sharedSlides.length > 0) {
      slides = sharedSlides.map((slide) => ({
        image: slide.image,
        title: slide.title || 'Waterkloof Hills Secondary School',
        text: slide.text || 'Developing future leaders with purpose and pride.'
      }));
    }
  } catch (error) {
    console.warn('Could not load shared slides from the API, using fallback slides.', error);
    slides = [...fallbackSlides];
  }
}

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

let slideIndex = 0;
const slideImage = document.getElementById('slide-image');
const slideTitle = document.getElementById('slide-title');
const slideText = document.getElementById('slide-text');

function showSlide(index) {
  if (!slideImage || !slideTitle || !slideText) return;

  const slide = slides[index];
  if (!slide) return;
  activeBoardImage = slide.image;
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
  timeEl.textContent = now.toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  dateEl.textContent = now.toLocaleDateString('en-ZA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function mapWeatherCode(code) {
  const weatherMap = {
    0: { text: 'Clear sky', icon: '☀️' },
    1: { text: 'Mainly clear', icon: '🌤️' },
    2: { text: 'Partly cloudy', icon: '⛅' },
    3: { text: 'Overcast', icon: '☁️' },
    45: { text: 'Foggy', icon: '🌫️' },
    48: { text: 'Fog with rime', icon: '🌫️' },
    51: { text: 'Light drizzle', icon: '🌦️' },
    53: { text: 'Moderate drizzle', icon: '🌦️' },
    55: { text: 'Heavy drizzle', icon: '🌧️' },
    56: { text: 'Freezing drizzle', icon: '🌧️' },
    57: { text: 'Heavy freezing drizzle', icon: '🌧️' },
    61: { text: 'Light rain', icon: '🌧️' },
    63: { text: 'Moderate rain', icon: '🌧️' },
    65: { text: 'Heavy rain', icon: '🌧️' },
    66: { text: 'Freezing rain', icon: '🌨️' },
    67: { text: 'Heavy freezing rain', icon: '🌨️' },
    71: { text: 'Light snow', icon: '🌨️' },
    73: { text: 'Moderate snow', icon: '🌨️' },
    75: { text: 'Heavy snow', icon: '❄️' },
    77: { text: 'Snow grains', icon: '🌨️' },
    80: { text: 'Light rain showers', icon: '🌧️' },
    81: { text: 'Moderate rain showers', icon: '🌧️' },
    82: { text: 'Violent rain showers', icon: '⛈️' },
    85: { text: 'Light snow showers', icon: '🌨️' },
    86: { text: 'Heavy snow showers', icon: '❄️' },
    95: { text: 'Thunderstorm', icon: '⛈️' },
    96: { text: 'Thunderstorm with hail', icon: '⛈️' },
    99: { text: 'Thunderstorm with heavy hail', icon: '⛈️' }
  };

  return weatherMap[code] || { text: 'Weather unavailable', icon: 'ℹ️' };
}

async function fetchWeather() {
  const weatherTemp = document.getElementById('weather-temp');
  const weatherText = document.getElementById('weather-text');
  const weatherIcon = document.getElementById('weather-icon');
  const weatherSummary = document.getElementById('weather-summary');
  if (!weatherTemp || !weatherText || !weatherIcon || !weatherSummary) return;

  try {
    const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-25.754&longitude=28.231&current_weather=true&timezone=Africa%2FJohannesburg');
    if (!response.ok) throw new Error('Weather request failed');
    const data = await response.json();

    if (data.current_weather) {
      const weather = mapWeatherCode(data.current_weather.weathercode);
      weatherTemp.textContent = `${Math.round(data.current_weather.temperature)}°C`;
      weatherText.textContent = weather.text;
      weatherIcon.textContent = weather.icon;
      weatherSummary.textContent = `Feels like ${Math.round(data.current_weather.temperature)}°C with ${weather.text.toLowerCase()}.`;
    }
  } catch (error) {
    console.warn('Unable to load weather data:', error);
    weatherSummary.textContent = 'Weather data is not available right now.';
  }
}

function updateCountdown() {
  const countdownEl = document.getElementById('countdown');
  if (!countdownEl) return;

  const examDate = new Date('2026-11-16T08:00:00');
  const now = new Date();
  const diff = examDate - now;

  if (diff <= 0) {
    countdownEl.textContent = 'Exams are underway';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  countdownEl.textContent = `${days}d ${hours}h ${minutes}m remaining`;
}

function rotateSlides() {
  if (!slides.length) return;
  slideIndex = (slideIndex + 1) % slides.length;
  showSlide(slideIndex);
}

function startAutoRefresh() {
  if (refreshTimer) return;
  refreshTimer = setInterval(async () => {
    await loadBillboardSlides();
    if (!slides.length) return;
    if (slideIndex >= slides.length) {
      slideIndex = 0;
    }
    showSlide(slideIndex);
    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage({ type: 'billboard-current-image', image: activeBoardImage }, '*');
      } catch (error) {}
    }
  }, 4000);
}

window.addEventListener('load', async () => {
  await loadBillboardSlides();
  enterDisplayMode();
  resetCursorTimer();
  setTimeout(enterDisplayMode, 700);
  showSlide(slideIndex);
  updateClock();
  fetchWeather();
  updateCountdown();
  startAutoRefresh();
  setInterval(rotateSlides, 6000);
  setInterval(updateClock, 1000);
  setInterval(fetchWeather, 600000);
  setInterval(updateCountdown, 60000);
});
