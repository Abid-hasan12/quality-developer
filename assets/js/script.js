'use strict';

/**
 * element toggle function
 */

const elemToggleFunc = function (elem) { elem.classList.toggle("active"); }



/**
 * navbar toggle
 */

const navbar = document.querySelector("[data-navbar]");
const overlay = document.querySelector("[data-overlay]");
const navCloseBtn = document.querySelector("[data-nav-close-btn]");
const navOpenBtn = document.querySelector("[data-nav-open-btn]");
const navbarLinks = document.querySelectorAll("[data-nav-link]");

const navElemArr = [overlay, navCloseBtn, navOpenBtn];

/**
 * close navbar when click on any navbar link
 */

for (let i = 0; i < navbarLinks.length; i++) { navElemArr.push(navbarLinks[i]); }

/**
 * addd event on all elements for toggling navbar
 */

for (let i = 0; i < navElemArr.length; i++) {
  navElemArr[i].addEventListener("click", function () {
    elemToggleFunc(navbar);
    elemToggleFunc(overlay);
  });
}



/**
 * header active state
 */

const header = document.querySelector("[data-header]");

window.addEventListener("scroll", function () {
  window.scrollY >= 400 ? header.classList.add("active")
    : header.classList.remove("active");
}); 


/* -------------------------------------------------------------------------- */
/*  Additional interactive handlers for buttons and forms
    - Adds lightweight modal and toast utilities
    - Wires header buttons (Search, Profile, Cart, Add Listing)
    - Wires property card actions (view, favourite, save)
    - Handles any contact or listing forms without page refresh
*/

// --------------------------- Utilities ------------------------------------

const createElementFromHTML = (htmlString) => {
  const div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
};

const showToast = (message, type = 'info', timeout = 3000) => {
  const toast = document.createElement('div');
  toast.className = `hd-toast hd-toast--${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, timeout);
};

const openModal = (title, innerHTML) => {
  const modalHtml = `
    <div class="hd-modal">
      <div class="hd-modal__backdrop" data-hd-modal-close></div>
      <div class="hd-modal__dialog">
        <header class="hd-modal__header">
          <h3>${title}</h3>
          <button class="hd-modal__close" aria-label="Close">&times;</button>
        </header>
        <div class="hd-modal__body">${innerHTML}</div>
      </div>
    </div>`;

  const modal = createElementFromHTML(modalHtml);
  document.body.appendChild(modal);

  const remove = () => modal.remove();

  modal.querySelector('[data-hd-modal-close]').addEventListener('click', remove);
  modal.querySelector('.hd-modal__close').addEventListener('click', remove);

  return { modal, remove };
};

// Minimal styles for toasts/modals if not present
const _injectStyles = () => {
  if (document.getElementById('hd-ui-styles')) return;
  const s = document.createElement('style');
  s.id = 'hd-ui-styles';
  s.textContent = `
    .hd-toast{position:fixed;right:1rem;bottom:1rem;padding:.6rem 1rem;border-radius:6px;background:#222;color:#fff;opacity:0;transform:translateY(8px);transition:all .25s}
    .hd-toast.visible{opacity:1;transform:none}
    .hd-toast--success{background:#2b9348}
    .hd-toast--error{background:#d64545}
    .hd-modal{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:9999}
    .hd-modal__backdrop{position:absolute;inset:0;background:rgba(0,0,0,.45)}
    .hd-modal__dialog{position:relative;background:#fff;border-radius:8px;max-width:720px;width:95%;z-index:2;box-shadow:0 10px 30px rgba(0,0,0,.2)}
    .hd-modal__header{display:flex;justify-content:space-between;align-items:center;padding:1rem;border-bottom:1px solid #eee}
    .hd-modal__body{padding:1rem}
    .hd-modal__close{background:none;border:0;font-size:1.4rem;cursor:pointer}
  `;
  document.head.appendChild(s);
};

_injectStyles();

// --------------------------- Header buttons --------------------------------

// Add Listing (header-top-btn) => open a small form and append new property
const addListingBtns = document.querySelectorAll('.header-top-btn');
addListingBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const html = `
      <form id="hd-add-listing-form">
        <label>Title<br><input name="title" required></label><br>
        <label>Price<br><input name="price" required></label><br>
        <label>Location<br><input name="location"></label><br>
        <label>Image URL<br><input name="image"></label><br>
        <div style="margin-top:.5rem"><button type="submit">Add Listing</button></div>
      </form>`;

    const { modal, remove } = openModal('Add Listing', html);

    const form = modal.querySelector('#hd-add-listing-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const title = fd.get('title');
      const price = fd.get('price');
      const location = fd.get('location') || '';
      const image = fd.get('image') || './assets/images/property-1.jpg';

      // create a simple property card item and append
      const list = document.querySelector('.property-list');
      if (list) {
        const li = document.createElement('li');
        li.innerHTML = `
          <div class="property-card">
            <figure class="card-banner">
              <a href="#"><img src="${image}" alt="${title}" class="w-100"></a>
              <div class="card-badge green">New</div>
            </figure>
            <div class="card-content">
              <div class="card-price"><strong>${price}</strong>/Month</div>
              <h3 class="h3 card-title"><a href="#">${title}</a></h3>
              <p class="card-text">${location}</p>
            </div>
          </div>`;
        list.prepend(li);
        showToast('Listing added', 'success');
      } else {
        showToast('Property list not found', 'error');
      }

      remove();
    });
  });
});

// Search button -> open search modal and filter property cards
const searchBtn = document.querySelector('[aria-label="Search"]');
if (searchBtn) {
  searchBtn.addEventListener('click', () => {
    const html = `
      <form id="hd-search-form">
        <label>Search properties<br><input name="q" placeholder="Type keywords (title, location)"></label>
        <div style="margin-top:.5rem"><button type="submit">Search</button></div>
      </form>`;

    const { modal } = openModal('Search Properties', html);
    const form = modal.querySelector('#hd-search-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = (new FormData(form)).get('q') || '';
      const items = document.querySelectorAll('.property-list li');
      const query = q.trim().toLowerCase();
      if (!query) {
        items.forEach(it => it.style.display = '');
        showToast('Showing all properties', 'info');
        return;
      }
      let matches = 0;
      items.forEach(it => {
        const title = (it.querySelector('.card-title')?.textContent || '').toLowerCase();
        const txt = (it.querySelector('.card-text')?.textContent || '').toLowerCase();
        if (title.includes(query) || txt.includes(query)) { it.style.display = ''; matches++; }
        else it.style.display = 'none';
      });
      showToast(`${matches} result(s) found`, 'success');
    });
  });
}

// Profile button -> placeholder modal
const profileBtn = document.querySelector('[aria-label="Profile"]');
if (profileBtn) profileBtn.addEventListener('click', () => {
  openModal('Profile', `<p>Profile feature is coming soon.</p>`);
});

// Cart button -> simple cart modal
const cartBtn = document.querySelector('[aria-label="Cart"]');
if (cartBtn) cartBtn.addEventListener('click', () => {
  openModal('Cart', `<p>Your cart is currently empty.</p>`);
});

// -------------------------- Property card actions -------------------------

// Delegate clicks on property list for action buttons (view, favourite, save)
const propertyList = document.querySelector('.property-list');
if (propertyList) {
  propertyList.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const card = e.target.closest('.property-card');

    // favourite (heart-outline)
    if (btn.querySelector('ion-icon[name="heart-outline"]')) {
      btn.classList.toggle('is-favourite');
      showToast(btn.classList.contains('is-favourite') ? 'Added to favourites' : 'Removed from favourites', 'success');
      return;
    }

    // view / resize (resize-outline) -> open details modal
    if (btn.querySelector('ion-icon[name="resize-outline"]')) {
      if (!card) return;
      const title = card.querySelector('.card-title')?.textContent || 'Property';
      const img = card.querySelector('.card-banner img')?.src || '';
      const price = card.querySelector('.card-price')?.textContent || '';
      const txt = card.querySelector('.card-text')?.textContent || '';
      openModal(title, `<img src="${img}" style="max-width:100%;margin-bottom:8px"><p><strong>${price}</strong></p><p>${txt}</p>`);
      return;
    }

    // save (add-circle-outline)
    if (btn.querySelector('ion-icon[name="add-circle-outline"]')) {
      showToast('Saved to your list', 'success');
      return;
    }

    // banner-buttons: location, camera, film
    if (btn.classList.contains('banner-actions-btn')) {
      const icon = btn.querySelector('ion-icon')?.getAttribute('name');
      if (icon === 'location') {
        const address = btn.querySelector('address')?.textContent || card?.querySelector('address')?.textContent || 'Location';
        openModal('Location', `<p>${address}</p>`);
      } else if (icon === 'camera' || icon === 'film') {
        showToast('Open gallery (demo)', 'info');
      }
    }
  });
}

// --------------------------- Generic buttons -----------------------------

// Make An Enquiry buttons (.btn that contains 'Enquiry') -> open contact form
const enquiryBtns = Array.from(document.querySelectorAll('.btn')).filter(b => /enquir|enq/i.test(b.textContent || ''));
enquiryBtns.forEach(b => {
  b.addEventListener('click', () => {
    // Try to open contact form if exists
    const contactForm = document.querySelector('form#contact-form, form.contact-form');
    if (contactForm) {
      contactForm.scrollIntoView({behavior: 'smooth'});
      showToast('Contact form focused', 'info');
      return;
    }

    // otherwise show a quick contact modal
    const html = `
      <form id="hd-contact-short">
        <label>Name<br><input name="name" required></label><br>
        <label>Email<br><input name="email" type="email" required></label><br>
        <label>Message<br><textarea name="message" required></textarea></label><br>
        <div style="margin-top:.5rem"><button type="submit">Send Message</button></div>
      </form>`;
    const { modal, remove } = openModal('Contact Us', html);
    modal.querySelector('#hd-contact-short').addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Message sent — we will contact you soon', 'success');
      remove();
    });
  });
});

// Attach to any real contact form to prevent page refresh and show success
const actualContactForms = document.querySelectorAll('form');
actualContactForms.forEach(f => {
  // ignore forms that are part of our dynamic modals
  if (f.closest('.hd-modal')) return;
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(f);
    // minimal handling: log and show toast
    console.log('Form submit captured (prevented default):', Object.fromEntries(data.entries()));
    showToast('Form submitted successfully', 'success');
  });
});

/* End of interactive handlers */