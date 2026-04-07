// 自动识别路径
const DATA_URL = window.location.hostname.includes('netlify.app') 
    ? '/data/products.json' 
    : '/chaobooks-gifts/data/products.json';

let products = [];
let activeCategory = 'all';

function getCurrentLang() {
  return typeof getLang === 'function' ? getLang() : 'zh-cn';
}

// 核心：处理图片路径
function getSafeImgSrc(path) {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('//')) return path;
  if (window.location.pathname.includes('/chaobooks-gifts/')) {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `/chaobooks-gifts/${cleanPath}`;
  }
  return path;
}

async function loadProducts() {
  try {
    const res = await fetch(`${DATA_URL}?t=${Date.now()}`);
    const data = await res.json();
    products = data.products || data;
    initPage();
  } catch (e) {
    console.error('加载失败:', e);
  }
}

function initPage() {
  renderHeroGrid();
  buildCategoryTabs(); // 报错就在这里，因为没找到下面的函数定义
  renderGrid();

  const tabsContainer = document.querySelector('.tabs-scroll');
  if (tabsContainer) {
    tabsContainer.addEventListener('click', e => {
      const btn = e.target.closest('.tab');
      if (!btn) return;
      activeCategory = btn.dataset.cat;
      document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGrid();
    });
  }

  const modalClose = document.getElementById('modalClose');
  const backdrop = document.getElementById('modalBackdrop');
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (backdrop) {
    backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });
  }
}

function renderHeroGrid() {
  const grid = document.getElementById('heroGrid');
  if (!grid || !products.length) return;
  const lang = getCurrentLang();
  const items = products.slice(0, 4);
  grid.innerHTML = items.map(p => `
    <div class="hero-thumb" onclick="openModal('${p.id}')" style="cursor:pointer; overflow:hidden; background:#eee;">
      ${p.image ? `<img src="${getSafeImgSrc(p.image)}" style="width:100%;height:100%;object-fit:cover;" />` : `<span style="font-size:32px;">${p.emoji || ''}</span>`}
    </div>
  `).join('');
}

// 这是你刚才缺失的关键函数
function buildCategoryTabs() {
  const container = document.querySelector('.tabs-scroll');
  if (!container || !products.length) return;
  const cats = [...new Set(products.map(p => p.category))].filter(Boolean);
  const existingTabs = container.querySelectorAll('.tab:not([data-cat="all"])');
  existingTabs.forEach(t => t.remove());
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
  if (!grid) return;
  const lang = getCurrentLang();
  const filtered = activeCategory === 'all' ? products : products.filter(p => p.category === activeCategory);

  grid.innerHTML = filtered.map(p => `
    <article class="product-card" data-id="${p.id}" onclick="openModal('${p.id}')">
      <div class="card-thumb" style="height:200px; overflow:hidden; background:#f4f4f4; display:flex; align-items:center; justify-content:center;">
        ${p.image ? `<img src="${getSafeImgSrc(p.image)}" style="width:100%; height:100%; object-fit:cover;" />` : `<span style="font-size:48px;">${p.emoji || ''}</span>`}
      </div>
      <div class="card-body">
        <span class="card-cat">${p.category || ''}</span>
        <h3 class="card-title">${p.title[lang] || ''}</h3>
        <p class="card-desc">${p.desc[lang] || ''}</p>
        <span class="card-buy">查看详情 →</span>
      </div>
    </article>
  `).join('');
}

function openModal(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const lang = getCurrentLang();
  document.getElementById('modalImg').innerHTML = `
    ${p.image ? `<img src="${getSafeImgSrc(p.image)}" style="max-width:100%;" />` : `<span style="font-size:72px;">${p.emoji || ''}</span>`}
  `;
  document.getElementById('modalCat').textContent = p.category;
  document.getElementById('modalTitle').textContent = p.title[lang];
  document.getElementById('modalDesc').textContent = p.desc[lang];
  document.getElementById('modalBuyBtn').href = p.link_taobao || '#';
  document.getElementById('modalBackdrop').hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalBackdrop').hidden = true;
  document.body.style.overflow = '';
}

function onLangChange() { renderHeroGrid(); renderGrid(); }

document.addEventListener('DOMContentLoaded', loadProducts);
