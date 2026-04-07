const DATA_URL = window.location.hostname.includes('netlify.app') 
    ? '/data/products.json' 
    : '/chaobooks-gifts/data/products.json';

let products = [];
let activeCategory = 'all';

function getCurrentLang() {
  return typeof getLang === 'function' ? getLang() : 'zh-cn';
}

async function loadProducts() {
  try {
    // 加上时间戳防止浏览器读取旧的 products.json 缓存
    const res = await fetch(`${DATA_URL}?t=${Date.now()}`);
    const data = await res.json();
    products = data.products || data;
    initPage();
  } catch (e) {
    console.error('加载失败:', e);
  }
}

// 核心：处理图片路径的万能函数
function getSafeImgSrc(path) {
  if (!path) return '';
  // 1. 如果是完整的网络链接 (http...)，直接返回
  if (path.startsWith('http') || path.startsWith('//')) {
    return path;
  }
  // 2. 如果是本地路径且在子目录下，补全子目录
  if (window.location.pathname.includes('/chaobooks-gifts/')) {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `/chaobooks-gifts/${cleanPath}`;
  }
  return path;
}

function initPage() {
  renderHeroGrid();
  buildCategoryTabs();
  renderGrid();
  // ... 其他代码保持不变 (分类切换、弹窗逻辑)
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

function onLangChange() {
  renderHeroGrid();
  renderGrid();
}

document.addEventListener('DOMContentLoaded', loadProducts);
