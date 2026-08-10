(function () {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('.faq-button');
    if (!button) return;
    const item = button.closest('.faq-item');
    if (!item) return;
    item.classList.toggle('open');
    const indicator = button.querySelector('[data-indicator]');
    if (indicator) indicator.textContent = item.classList.contains('open') ? '−' : '+';
  });

  const demoForm = document.querySelector('[data-demo-form]');
  if (demoForm) {
    demoForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const status = demoForm.querySelector('.form-status');
      if (status) {
        status.textContent = 'Η φόρμα λειτουργεί ως demo στο localhost. Για πραγματική αποστολή χρειάζεται σύνδεση με email service ή backend.';
        status.classList.add('show');
      }
    });
  }
})();
