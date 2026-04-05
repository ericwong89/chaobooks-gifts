/**
 * app.js — JSON-driven page renderer
 * Reads /data/products.json and renders:
 *   - Hero carousel (hot items)
 *   - Category tabs
 *   - Product grid
 *   - Product detail modal
 */

const DATA_URL = '/data/products.json';

let products = [];
let activeCategory = 'all';
let carouselIndex = 0;
let carouselTimer = null;

/* ─── Fetch data ─────────────────────────────────────── */
async function loadProducts() {
  try {
    const res = await fetch(DATA_URL);
    products = await res.json();
    initPage();
  } catch (e) {
    console.error('Failed to load products.json', e);
  }
}

/* ─── Init ───────────────────────────────────────────── */
function initPage() {
  buildCategoryTabs();
  renderCarousel();
  renderGrid();

  // Category tab clicks
  document.querySelector('.tabs-scroll').addEventListener('click', e => {
    const btn = e.target.closest('.tab');
    if (!btn) return;
    activeCategory = btn.dataset.cat;
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderGrid();
  });

  // Modal close
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalBackdrop').addEventListener('click', e => {
    if (e.target === document.getElementById('modalBackdrop')) closeModal();
  });
  document.getElementById('carPrev').addEventListener('click', () => moveCarousel(-1));
  document.getElementById('carNext').addEventListener('click', () => moveCarousel(1));

  startCarouselTimer();
}

/* ─── Category tabs ──────────────────────────────────── */
function buildCategoryTabs() {
  const cats = [...new Set(products.map(p => p.category))];
  const container = document.querySelector('.tabs-scroll');
  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'tab';
    btn.dataset.cat = cat;
    btn.textContent = cat;
    container.appendChild(btn);
  });
}

/* ─── Carousel ───────────────────────────────────────── */
function renderCarousel() {
  const hot = products.filter(p => p.hot);
  if (!hot.length) return;

  const inner = document.getElementById('carouselInner');
  const dots = document.getElementById('carouselDots');

  inner.innerHTML = hot.map((p, i) => `
    <div class="carousel-slide ${i === 0 ? 'active' : ''}" data-id="${p.id}">
      <div class="carousel-content">
        <p class="carousel-tag" data-i18n="hot_label">${t('hot_label')}</p>
        <h2 class="carousel-title">${p.title[currentLang]}</h2>
        <p class="carousel-desc">${p.desc[currentLang]}</p>
        <a class="taobao-btn small" href="${p.link_taobao}" target="_blank" rel="noopener">${t('buy_btn')}</a>
      </div>
      <div class="carousel-thumb">
        <span class="product-emoji">${p.emoji || ''}</span>
        ${p.image ? `<img src="${p.image}" alt="${p.title[currentLang]}" loading="lazy" onerror="this.style.display='none'" />` : ''}
      </div>
    </div>
  `).join('');

  dots.innerHTML = hot.map((_, i) => `
    <button class="dot ${i === 0 ? 'active' : ''}" data-idx="${i}" aria-label="Slide ${i + 1}"></button>
  `).join('');

  dots.addEventListener('click', e => {
    const btn = e.target.closest('.dot');
    if (!btn) return;
    goCarousel(parseInt(btn.dataset.idx));
  });
}

function goCarousel(idx) {
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.dot');
  if (!slides.length) return;
  carouselIndex = (idx + slides.length) % slides.length;
  slides.forEach((s, i) => s.classList.toggle('active', i === carouselIndex));
  dots.forEach((d, i) => d.classList.toggle('active', i === carouselIndex));
}

function moveCarousel(dir) {
  goCarousel(carouselIndex + dir);
  resetCarouselTimer();
}

function startCarouselTimer() {
  carouselTimer = setInterval(() => moveCarousel(1), 4000);
}

function resetCarouselTimer() {
  clearInterval(carouselTimer);
  startCarouselTimer();
}

/* ─── Product grid ───────────────────────────────────── */
function renderGrid() {
  const grid = document.getElementById('productGrid');
  const filtered = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  if (!filtered.length) {
    grid.innerHTML = `<p class="empty-msg">${t('no_items')}</p>`;
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <article class="product-card" data-id="${p.id}" tabindex="0" role="button"
      aria-label="${p.title[currentLang]}">
      <div class="card-thumb">
        <span class="product-emoji">${p.emoji || ''}</span>
        ${p.image ? `<img src="${p.image}" alt="${p.title[currentLang]}" loading="lazy" onerror="this.style.display='none'" />` : ''}
      </div>
      <div class="card-body">
        <span class="card-cat">${p.category}</span>
        <h3 class="card-title">${p.title[currentLang]}</h3>
        <p class="card-desc">${p.desc[currentLang]}</p>
        <span class="card-buy-hint">${t('buy_btn')} →</span>
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.id));
    card.addEventListener('keydown', e => { if (e.key === 'Enter') openModal(card.dataset.id); });
  });
}

/* ─── Modal ──────────────────────────────────────────── */
function openModal(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  document.getElementById('modalImg').innerHTML =
    `<span class="product-emoji large">${p.emoji || ''}</span>
     ${p.image ? `<img src="${p.image}" alt="${p.title[currentLang]}" onerror="this.style.display='none'" />` : ''}`;
  document.getElementById('modalCat').textContent = p.category;
  document.getElementById('modalTitle').textContent = p.title[currentLang];
  document.getElementById('modalDesc').textContent = p.desc[currentLang];
  document.getElementById('modalBuyBtn').href = p.link_taobao;
  document.getElementById('modalBuyBtn').textContent = t('buy_btn');
  document.getElementById('modalClose').textContent = t('back');

  const backdrop = document.getElementById('modalBackdrop');
  backdrop.hidden = false;
  backdrop.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const backdrop = document.getElementById('modalBackdrop');
  backdrop.hidden = true;
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/* ─── Re-render on language change ──────────────────── */
function onLangChange(lang) {
  renderCarousel();
  renderGrid();
}

/* ─── Boot ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', loadProducts);
