const DATA_URL = '/chaobooks-gifts/data/products.json';

let products = [];
let activeCategory = 'all';

// 获取当前语言 (从 i18n.js 中获取，如果没有则默认为 zh-cn)
const currentLang = typeof getLang === 'function' ? getLang() : 'zh-cn';

async function loadProducts() {
  try {
    const res = await fetch(DATA_URL);
    const data = await res.json();
    
    // 核心修改：适配 {"products": [...]} 格式
    // 如果 data.products 存在则取它，否则取 data 本身（兼容旧数组格式）
    products = data.products || data;
    
    initPage();
  } catch (e) {
    console.error('Failed to load products.json', e);
  }
}

function initPage() {
  renderHeroGrid();
  buildCategoryTabs();
  renderGrid();

  // 分类切换逻辑
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

  // 弹窗关闭逻辑
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
  
  // 取前 4 个作为顶部展示
  const items = products.slice(0, 4);
  grid.innerHTML = items.map(p => `
    <div class="hero-thumb" onclick="openModal('${p.id}')" style="cursor:pointer;">
      ${p.image ? `<img src="${p.image}" alt="${p.title[currentLang] || ''}" loading="lazy" onerror="this.style.display='none'" />` : ''}
      <span style="font-size:32px;position:relative;z-index:1;">${p.emoji || ''}</span>
    </div>
  `).join('');
}

function buildCategoryTabs() {
  const container = document.querySelector('.tabs-scroll');
  if (!container || !products.length) return;

  const cats = [...new Set(products.map(p => p.category))];
  
  // 清除旧的动态分类（保留“全部”）
  const existingTabs = container.querySelectorAll('.tab:not([data-cat="all"])');
  existingTabs.forEach(t => t.remove());

  cats.forEach(cat => {
    if (!cat) return;
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

  const filtered = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  if (!filtered.length) {
    grid.innerHTML = `<p class="empty-msg">暂无此类赠品</p>`;
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <article class="product-card" data-id="${p.id}" tabindex="0" role="button">
      <div class="card-thumb">
        ${p.image ? `<img src="${p.image}" alt="${p.title[currentLang] || ''}" loading="lazy" onerror="this.style.display='none'" />` : ''}
        <span style="font-size:48px;position:relative;z-index:1;">${p.emoji || ''}</span>
      </div>
      <div class="card-body">
        <span class="card-cat">${p.category || ''}</span>
        <h3 class="card-title">${p.title[currentLang] || ''}</h3>
        <p class="card-desc">${p.desc[currentLang] || ''}</p>
        <span class="card-buy">查看详情 →</span>
      </div>
    </article>
  `).join('');

  // 绑定点击事件
  grid.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () =>
