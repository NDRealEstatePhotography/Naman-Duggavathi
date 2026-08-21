/* Naman Duggavathi — site interactions
   Vanilla JS, no dependencies. */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Back to top ---------- */
  document.querySelectorAll('a[href="#top"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      history.replaceState(null, '', '#top');
    });
  });

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile menu ---------- */
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');

  function closeMobileNav() {
    mobileNav.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('is-open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileNav);
    });
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Portfolio lightbox ---------- */
  const portfolioItems = document.querySelectorAll('.p-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxInner = document.getElementById('lightbox-inner');
  const lightboxClose = document.getElementById('lightbox-close');

  function openLightbox(item) {
    const svg = item.querySelector('.ph-svg');
    const caption = item.querySelector('figcaption');
    lightboxInner.innerHTML = '';
    if (svg) lightboxInner.appendChild(svg.cloneNode(true));
    if (caption) {
      const cap = document.createElement('p');
      cap.style.color = '#FAFAF6';
      cap.style.marginTop = '16px';
      cap.style.fontSize = '13px';
      cap.style.letterSpacing = '0.04em';
      cap.textContent = caption.textContent;
      lightboxInner.appendChild(cap);
    }
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
  }

  portfolioItems.forEach(item => {
    item.addEventListener('click', () => openLightbox(item));
  });
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  /* ---------- Before / after sliders (supports multiple on one page) ---------- */
  document.querySelectorAll('[data-ba-slider]').forEach((baSlider) => {
    const baBeforeLayer = baSlider.querySelector('[data-ba-before-layer]');
    const baHandle = baSlider.querySelector('[data-ba-handle]');
    if (!baBeforeLayer || !baHandle) return;

    let dragging = false;

    function setPosition(clientX) {
      const rect = baSlider.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      baBeforeLayer.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      baHandle.style.left = pct + '%';
      baHandle.setAttribute('aria-valuenow', Math.round(pct));
    }

    function startDrag(e) {
      dragging = true;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setPosition(x);
    }
    function duringDrag(e) {
      if (!dragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setPosition(x);
    }
    function endDrag() { dragging = false; }

    baHandle.addEventListener('mousedown', startDrag);
    baSlider.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', duringDrag);
    window.addEventListener('mouseup', endDrag);

    baHandle.addEventListener('touchstart', startDrag, { passive: true });
    baSlider.addEventListener('touchstart', startDrag, { passive: true });
    window.addEventListener('touchmove', duringDrag, { passive: true });
    window.addEventListener('touchend', endDrag);

    baHandle.addEventListener('keydown', (e) => {
      const current = parseFloat(baHandle.getAttribute('aria-valuenow')) || 50;
      if (e.key === 'ArrowLeft') {
        const rect = baSlider.getBoundingClientRect();
        setPosition(rect.left + (rect.width * (current - 5) / 100));
      }
      if (e.key === 'ArrowRight') {
        const rect = baSlider.getBoundingClientRect();
        setPosition(rect.left + (rect.width * (current + 5) / 100));
      }
    });
  });

  /* ---------- Pricing "Read more" toggle ---------- */
  document.querySelectorAll('.price-more-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      const isOpen = target.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(isOpen));
      btn.textContent = isOpen ? 'Show less' : 'Read more';
    });
  });

  /* ---------- Pricing CTA -> pre-fill contact form ---------- */
  const priceCtas = document.querySelectorAll('.price-cta');
  const packageSelect = document.getElementById('f-package');

  priceCtas.forEach(cta => {
    cta.addEventListener('click', () => {
      const pkg = cta.dataset.package;
      if (packageSelect && pkg) {
        [...packageSelect.options].forEach(opt => {
          if (opt.value === pkg) packageSelect.value = pkg;
        });
      }
    });
  });

  /* ---------- Contact form ----------
     Submissions are sent via FormSubmit (https://formsubmit.co) —
     a free form-to-email service that requires no account or
     server of your own. The very first submission triggers a
     one-time confirmation email to BUSINESS_EMAIL; click the link
     in that email to activate delivery for all future submissions. */
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const BUSINESS_EMAIL = 'naman.duggavathi@gmail.com';
  const FORMSUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${BUSINESS_EMAIL}`;

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const data = new FormData(form);
      const address = data.get('address') || '';

      // Extra fields FormSubmit uses to shape the email it sends.
      data.append('_subject', `Shoot request — ${address}`);
      data.append('_template', 'table');
      data.append('_captcha', 'false');

      const submitBtn = form.querySelector('.form-submit');
      if (submitBtn) submitBtn.disabled = true;
      if (status) status.textContent = 'Sending your request…';

      fetch(FORMSUBMIT_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      })
        .then((res) => {
          if (!res.ok) throw new Error('Request failed');
          return res.json();
        })
        .then(() => {
          if (status) status.textContent = 'Thanks! Your request has been sent — I\'ll follow up shortly.';
          form.reset();
        })
        .catch(() => {
          if (status) {
            status.textContent = `Something went wrong sending this automatically. Please email me directly at ${BUSINESS_EMAIL}.`;
          }
        })
        .finally(() => {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  /* ---------- Editing showcase — click through the edit stages ---------- */
  const editStageMain = document.getElementById('edit-stage-main');
  const editMainImage = document.getElementById('edit-main-image');
  const editStepCount = document.getElementById('edit-step-count');
  const editImageLabel = document.getElementById('edit-image-label');
  const editCaptionTitle = document.getElementById('edit-caption-title');
  const editCaptionText = document.getElementById('edit-caption-text');
  const editSteps = document.querySelectorAll('[data-edit-step]');

  const editStageData = [
    { image: 'images/edit-stage-1.jpg', label: '01 · Base capture', title: 'Start with a clean base.', text: 'A 3-5 stop high dynamic range image is kept flat for flexibility during post-processing.' },
    { image: 'images/edit-stage-2.jpg', label: '02 · Light balance', title: 'Recover the full scene.', text: 'Highlights, shadows, and exposure are balanced so the property reads clearly from edge to edge.' },
    { image: 'images/edit-stage-3.jpg', label: '03 · White balance', title: 'Make the light feel right.', text: 'Temperature and tint are refined to keep the property naturally inviting.' },
    { image: 'images/edit-stage-4.jpg', label: '04 · Color grade', title: 'Add depth without overdoing it.', text: 'Color and saturation are shaped for a polished look while keeping the property itself in focus.' },
    { image: 'images/edit-stage-5.jpg', label: '05 · Final polish', title: 'Finish for the listing.', text: 'The final touches. Add a little haze effect to accentuate the sunset and get a premium listing photograph.' }
  ];

  function setEditStage(index) {
    if (!editStageMain || !editStageData[index]) return;
    const stage = editStageData[index];
    editSteps.forEach((step, i) => {
      const active = i === index;
      step.classList.toggle('is-active', active);
      step.setAttribute('aria-selected', String(active));
    });

    editMainImage.classList.add('is-changing');
    window.setTimeout(() => {
      editStageMain.src = stage.image;
      editStageMain.alt = stage.title;
      editStepCount.textContent = `${String(index + 1).padStart(2, '0')} / 05`;
      editImageLabel.textContent = stage.label;
      editCaptionTitle.textContent = stage.title;
      editCaptionText.textContent = stage.text;
      editMainImage.classList.remove('is-changing');
    }, 140);
  }

  editSteps.forEach((step) => {
    step.addEventListener('click', () => setEditStage(Number(step.dataset.editStep)));
    step.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = (Number(step.dataset.editStep) + 1) % editStageData.length;
        setEditStage(next);
        editSteps[next].focus();
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = (Number(step.dataset.editStep) - 1 + editStageData.length) % editStageData.length;
        setEditStage(prev);
        editSteps[prev].focus();
      }
    });
  });

});
