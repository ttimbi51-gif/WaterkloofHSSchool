function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

function formatDateLabel(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

function validateFileUpload(inputId, noteId, maxTotalMB) {
  const input = document.getElementById(inputId);
  const note = document.getElementById(noteId);
  if (!input || !note) return;

  input.addEventListener('change', () => {
    const files = Array.from(input.files || []);
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    const totalMB = totalBytes / 1024 / 1024;
    if (totalMB > maxTotalMB) {
      note.textContent = `Total upload size is ${totalMB.toFixed(1)}MB. Please keep all files under ${maxTotalMB}MB.`;
      note.style.color = '#c53030';
      input.setCustomValidity(`Upload limit is ${maxTotalMB}MB total.`);
    } else {
      note.textContent = `Upload ready: ${files.length} file(s), ${totalMB.toFixed(1)}MB total. Maximum allowed is ${maxTotalMB}MB.`;
      note.style.color = '#555';
      input.setCustomValidity('');
    }
  });
}

function renderBillboardEvents(eventMap, todayBoardId, upcomingBoardId, maxItems) {
  const todayBoard = document.getElementById(todayBoardId);
  const upcomingBoard = document.getElementById(upcomingBoardId);
  if (!todayBoard || !upcomingBoard || !eventMap) return;

  const todayKey = new Date().toISOString().slice(0, 10);
  const events = Object.keys(eventMap).sort();

  const todayEvents = events.filter(key => key === todayKey);
  const upcomingEvents = events.filter(key => key >= todayKey).slice(0, maxItems);

  if (todayEvents.length === 0) {
    todayBoard.innerHTML = `<div class="billboard-item"><strong>No calendar events today.</strong><p>Check the upcoming events list for the next scheduled activities.</p></div>`;
  } else {
    todayBoard.innerHTML = todayEvents.map(key => {
      const event = eventMap[key];
      return `<div class="billboard-item"><div><strong>${formatDateLabel(key)}</strong></div><div>${event.label}</div></div>`;
    }).join('');
  }

  upcomingBoard.innerHTML = upcomingEvents.map(key => {
    const event = eventMap[key];
    return `<div class="billboard-item"><div class="calendar-day"><span class="day-num">${key.slice(8)}</span></div><div><strong>${formatDateLabel(key)}</strong><p>${event.label}</p></div></div>`;
  }).join('');
}

function renderStaffProfile(profileData, targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;

  const profile = profileData || {
    name: 'Profile not found',
    role: 'Staff Member',
    image: 'images/logo.jpg',
    bio: 'The staff member profile could not be found. Please select a profile from the staff tour page.',
    message: 'Please return to the Staff Tour page and select a staff member to view their details.',
    extra: 'If the profile should exist, check the profile ID in the URL query string.'
  };

  target.innerHTML = `
    <div class="profile-card">
      <img src="${profile.image}" alt="${profile.name}">
      <div class="profile-copy">
        <h1>${profile.name}</h1>
        <p class="role">${profile.role}</p>
        <p>${profile.bio}</p>
        <div class="profile-message">
          <h3>Message</h3>
          <p>${profile.message}</p>
        </div>
        <p class="profile-extra">${profile.extra || ''}</p>
        <a href="staff-tour.html" class="btn-orange">Back to Staff Tour</a>
      </div>
    </div>
  `;
}

function renderSubmissionStatusMessage(targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;

  const success = getQueryParam('success');
  const error = getQueryParam('error');

  if (success === '1') {
    target.innerHTML = '<div class="submission-status success">Thank you! Your application has been submitted. We will contact you soon.</div>';
  } else if (error === '1') {
    target.innerHTML = '<div class="submission-status error">There was a problem submitting your application. Please try again or contact us directly at admin@waterkloofhillsschool.co.za.</div>';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  renderSubmissionStatusMessage('submissionStatus');
});
