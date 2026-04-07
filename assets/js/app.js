// 自动识别环境：如果是本地预览或特定的子目录则保留，如果是 Netlify 根目录则自动修正
const DATA_URL = window.location.hostname.includes('netlify.app') 
    ? '/data/products.json' 
    : '/chaobooks-gifts/data/products.json';

let products = [];
let activeCategory = 'all';

async function loadProducts() {
  console.log('正在尝试从以下地址加载数据:', DATA_URL);
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`服务器返回错误: ${res.status}`);
    
    const data = await res.json();
    console.log('原始获取到的数据:', data);
    
    // 适配 {"products": [...]} 格式
    products = data.products || data;
    console.log('解析后的产品列表:', products);
    
    initPage();
  } catch (e) {
    console.error('加载 products.json 失败:', e);
    const grid = document.getElementById('productGrid');
    if (grid) grid.innerHTML = `<p style="text-align:center;padding:50px;">数据加载失败，请刷新页面重试。<br><small>${e.message}</small></p>`;
  }
}

// 获取实时语言的辅助函数
function getCurrentLang() {
  return typeof getLang === 'function' ? getLang() : 'zh-cn';
}

function initPage() {
  renderHeroGrid();
  buildCategoryTabs();
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
    backdrop.addEventListener('click', e => {
      if (e.target === backdrop) closeModal();
    });
  }
}

function renderHeroGrid() {
  const grid = document.getElementById('heroGrid');
  if (!grid || !products.length) return;
  const lang = getCurrentLang();
  const items = products.slice(0, 4);
  grid.innerHTML = items.map(p => `
    <div class="hero-thumb" onclick="openModal('${p.id}')" style="cursor:pointer;">
      ${p.image ? `<img src="${p.image}" alt="${p.title[lang] || ''}" loading="lazy" />` : ''}
      <span style="font-size:32px;position:relative;z-index:1;">${p.emoji || ''}</span>
    </div>
  `).join('');
}

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

  if (!filtered.length) {
    grid.innerHTML = `<p class="empty-msg">暂无此类赠品</p>`;
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <article class="product-card" data-id="${p.id}" tabindex="0" role="button">
      <div class="card-thumb">
        ${p.image ? `<img src="${p.image}" alt="${p.title[lang] || ''}" loading="lazy" />` : ''}
        <span style="font-size:48px;position:relative;z-index:1;">${p.emoji || ''}</span>
      </div>
      <div class="card-body">
        <span class="card-cat">${p.category || ''}</span>
        <h3 class="card-title">${p.title[lang] || ''}</h3>
        <p class="card-desc">${p.desc[lang] || ''}</p>
        <span class="card-buy">查看详情 →</span>
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.id));
  });
}

function openModal(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const lang = getCurrentLang();
  document.getElementById('modalImg').innerHTML = `
    ${p.image ? `<img src="${p.image}" alt="${p.title[lang]}" />` : ''}
    <span style="font-size:72px;position:relative;z-index:1;">${p.emoji || ''}</span>
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
