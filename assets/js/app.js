const DATA_URL = '/chaobooks-gifts/data/products.json';

let products = [];
let activeCategory = 'all';

async function loadProducts() {
  try {
    const res = await fetch(DATA_URL);
    products = await res.json();
    initPage();
  } catch (e) {
    console.error('Failed to load products.json', e);
  }
}

function initPage() {
  renderHeroGrid();
  buildCategoryTabs();
  renderGrid();

  document.querySelector('.tabs-scroll').addEventListener('click', e => {
    const btn = e.target.closest('.tab');
    if (!btn) return;
    activeCategory = btn.dataset.cat;
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderGrid();
  });

  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalBackdrop').addEventListener('click', e => {
    if (e.target === document.getElementById('modalBackdrop')) closeModal();
  });
}

function renderHeroGrid() {
  const grid = document.getElementById('heroGrid');
  if (!grid) return;
  const items = products.slice(0, 4);
  grid.innerHTML = items.map(p => `
    <div class="hero-thumb" onclick="openModal('${p.id}')" style="cursor:pointer;">
      ${p.image ? `<img src="${p.image}" alt="${p.title[currentLang]}" loading="lazy" onerror="this.style.display='none'" />` : ''}
      <span style="font-size:32px;position:relative;z-index:1;">${p.emoji || ''}</span>
    </div>
  `).join('');
}

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

function renderGrid() {
  const grid = document.getElementById('productGrid');
  const filtered = activeCategory === 'all' ? products : products.filter(p => p.category === activeCategory);
  if (!filtered.length) {
    grid.innerHTML = `<p class="empty-msg">${t('no_items')}</p>`;
    return;
  }
  grid.innerHTML = filtered.map(p => `
    <article class="product-card" data-id="${p.id}" tabindex="0" role="button">
      <div class="card-thumb">
        ${p.image ? `<img src="${p.image}" alt="${p.title[currentLang]}" loading="lazy" onerror="this.style.display='none'" />` : ''}
        <span style="font-size:48px;position:relative;z-index:1;">${p.emoji || ''}</span>
      </div>
      <div class="card-body">
        <span class="card-cat">${p.category}</span>
        <h3 class="card-title">${p.title[currentLang]}</h3>
        <p class="card-desc">${p.desc[currentLang]}</p>
        <span class="card-buy">${t('buy_btn')} →</span>
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.id));
    card.addEventListener('keydown', e => { if (e.key === 'Enter') openModal(card.dataset.id); });
  });
}

function openModal(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  document.getElementById('modalImg').innerHTML =
    `${p.image ? `<img src="${p.image}" alt="${p.title[currentLang]}" onerror="this.style.display='none'" />` : ''}
     <span style="font-size:72px;position:relative;z-index:1;">${p.emoji || ''}</span>`;
  document.getElementById('modalCat').textContent = p.category;
  document.getElementById('modalTitle').textContent = p.title[currentLang];
  document.getElementById('modalDesc').textContent = p.desc[currentLang];
  document.getElementById('modalBuyBtn').href = p.link_taobao;
  document.getElementById('modalBuyBtn').textContent = t('buy_btn');
  document.getElementById('modalClose').textContent = t('back');
  const backdrop = document.getElementById('modalBackdrop');
  backdrop.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalBackdrop').hidden = true;
  document.body.style.overflow = '';
}

function handleEmailSubmit(e) {
  e.preventDefault();
  const note = document.getElementById('emailNote');
  note.textContent = t('email_thanks');
  document.getElementById('emailInput').value = '';
}

function onLangChange() {
  renderHeroGrid();
  renderGrid();
}

document.addEventListener('DOMContentLoaded', loadProducts);
