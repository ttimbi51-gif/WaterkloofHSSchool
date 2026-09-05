let siteContentRefreshTimer = null;

async function loadSiteContent() {
  try {
    const response = await fetch('/api/site-content');
    if (!response.ok) throw new Error('Site content request failed');
    const content = await response.json();
    applySiteContent(content);
  } catch (error) {
    console.warn('Unable to load site content. Using the default page content.', error);
  }
}

function startSiteContentRefresh() {
  if (siteContentRefreshTimer) return;
  siteContentRefreshTimer = setInterval(() => {
    loadSiteContent();
  }, 15000);
}

function applySiteContent(content) {
  const safeContent = content || {};

  applyText('[data-content="ticker"]', safeContent.ticker || '');
  applyText('[data-content="principalMessage"]', safeContent.principalMessage || '');
  applyText('[data-content="announcement"]', safeContent.announcement || '');
  applyText('[data-content="aboutHeading"]', safeContent.aboutHeading || '');
  applyText('[data-content="aboutSummary"]', safeContent.aboutSummary || '');
  applyText('[data-content="academicsIntro"]', safeContent.academicsIntro || '');
  applyText('[data-content="admissionsIntro"]', safeContent.admissionsIntro || '');
  applyText('[data-content="contactInfo"]', safeContent.contactInfo || '');
  applyText('[data-content="staffIntro"]', safeContent.staffIntro || '');
  applyText('[data-content="galleryIntro"]', safeContent.galleryIntro || '');
  applyText('[data-content="mission"]', safeContent.mission || '');
  applyText('[data-content="values"]', safeContent.values || '');

  renderList('[data-list="newsItems"]', safeContent.newsItems, 'simple');
  renderList('[data-list="calendarItems"]', safeContent.calendarItems, 'calendar');
  renderList('[data-list="subjectHighlights"]', safeContent.subjectHighlights, 'simple');
  renderList('[data-list="importantDates"]', safeContent.importantDates, 'simple');
  renderList('[data-list="galleryHighlights"]', safeContent.galleryHighlights, 'simple');
  renderList('[data-list="billboardSlides"]', safeContent.billboardSlides, 'simple');
}

function applyText(selector, value) {
  const element = document.querySelector(selector);
  if (!element) return;
  const textValue = value || element.getAttribute('data-fallback') || '';
  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
    element.value = textValue;
  } else {
    element.textContent = textValue;
  }
}

function renderList(selector, items, type) {
  const element = document.querySelector(selector);
  if (!element) return;

  const listItems = Array.isArray(items) ? items : [];

  if (!listItems.length) {
    element.innerHTML = '<li>No content available yet.</li>';
    return;
  }

  element.innerHTML = listItems.map((item) => {
    if (type === 'calendar' && typeof item === 'object') {
      return `<li><strong>${escapeHtml(item.date || '')}</strong>${item.title ? ` — ${escapeHtml(item.title)}` : ''}</li>`;
    }
    if (typeof item === 'object') {
      return `<li>${escapeHtml(item.title || item.label || item.name || '')}</li>`;
    }
    return `<li>${escapeHtml(item)}</li>`;
  }).join('');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

document.addEventListener('DOMContentLoaded', () => {
  loadSiteContent();
  startSiteContentRefresh();
});
