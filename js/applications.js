document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('applicationForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const statusBox = document.getElementById('submissionStatus');
    if (submitBtn) submitBtn.disabled = true;

    const fd = new FormData(form);

    try {
      const res = await fetch('/api/create-application', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Unable to submit application');
      }

      if (statusBox) {
        statusBox.innerHTML = `<div class="submission-status success">Application submitted successfully. Reference number: <strong>${data.reference || 'pending'}</strong>. No payment is required. We will contact you shortly.</div>`;
      } else {
        alert(`Application submitted successfully. Reference number: ${data.reference || 'pending'}. No payment is required.`);
      }

      form.reset();
    } catch (err) {
      console.error(err);
      if (statusBox) {
        statusBox.innerHTML = `<div class="submission-status error">${err.message || 'Network error while submitting application.'}</div>`;
      } else {
        alert(err.message || 'Network error while submitting application.');
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
});
