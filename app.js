const signupForm = document.querySelector('#signup-form');
const signupStatus = document.querySelector('#signup-status');
const signupButton = signupForm.querySelector('button[type="submit"]');

signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  signupStatus.textContent = '';
  const email = document.querySelector('#email').value.trim();
  const consent = document.querySelector('#consent').checked;
  const honeypot = signupForm.querySelector('[name="website"]').value;
  if (!email || !document.querySelector('#email').checkValidity()) {
    signupStatus.textContent = 'Please enter a valid email address.';
    return;
  }
  if (!consent) {
    signupStatus.textContent = 'Please tick the box to agree to launch updates.';
    return;
  }
  signupButton.disabled = true;
  signupButton.querySelector('span').textContent = 'SENDING';
  try {
    const response = await fetch('/api/signup', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({email, consent, website: honeypot})
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Something went wrong. Please try again.');
    signupStatus.textContent = 'You’re on the list. Keep an eye on your inbox.';
    signupForm.reset();
  } catch (error) {
    signupStatus.textContent = error.message === 'Failed to fetch'
      ? 'Sign-ups are not connected yet. Please try again once the site is live.'
      : error.message;
  } finally {
    signupButton.disabled = false;
    signupButton.querySelector('span').textContent = 'JOIN THE LIST';
  }
});

const toggle = document.querySelector('#password-toggle');
const panel = document.querySelector('#password-panel');
toggle.addEventListener('click', () => {
  const opening = panel.hidden;
  panel.hidden = !opening;
  toggle.setAttribute('aria-expanded', String(opening));
  toggle.querySelector('.toggle-mark').textContent = opening ? '−' : '+';
  if (opening) document.querySelector('#password').focus();
});

document.querySelector('#access-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const status = document.querySelector('#access-status');
  const button = event.currentTarget.querySelector('button');
  const password = document.querySelector('#password').value;
  status.textContent = '';
  button.disabled = true;
  try {
    const response = await fetch('/api/access', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({password})
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'That password did not work.');
    status.textContent = 'Access confirmed. Your early-access area is ready to be connected.';
  } catch (error) {
    status.textContent = error.message === 'Failed to fetch'
      ? 'Password access will work once the site is deployed.'
      : error.message;
  } finally {
    button.disabled = false;
  }
});
