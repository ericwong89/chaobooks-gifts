/**
 * CHAOBOOKS GIFTS - 核心驱动引擎 v2.0
 * 功能：自动读取 GitHub Content 目录下的 Markdown 文件，支持搜索与分类
 */

const CONFIG = {
    repo: 'chaobooks-gifts',
    user: 'hai-wong', // 请确认这是你的 GitHub 用户名
    branch: 'main',
    contentDir: 'content'
};

let allProducts = []; // 存储所有从 MD 解析出的数据

// 1. 初始化：从 GitHub 获取文件列表
async function init() {
    try {
        // 获取 content 文件夹下的文件列表
        const response = await fetch(`https://api.github.com/repos/${CONFIG.user}/${CONFIG.repo}/contents/${CONFIG.contentDir}?ref=${CONFIG.branch}`);
        const files = await response.json();
        
        // 过滤出所有 .md 文件
        const mdFiles = files.filter(file => file.name.endsWith('.md'));
        
        // 并发读取所有 MD 文件内容
        const promises = mdFiles.map(file => fetchMdContent(file.download_url));
        allProducts = await Promise.all(promises);
        
        // 按日期排序（最新的在前）
        allProducts.sort((a, b) => new Date(b.date) - new Date(a.date));

        renderCategories(); // 渲染分类按钮
        renderProducts(allProducts); // 渲染产品列表
        setupSearch(); // 初始化搜索
        renderHeroGrid(); // 渲染顶部背景图
    } catch (err) {
        console.error("加载内容失败:", err);
    }
}

// 2. 读取并解析单个 Markdown 文件
async function fetchMdContent(url) {
    const response = await fetch(url);
    const text = await response.text();
    
    // 使用 js-yaml 提取顶部的 YAML 属性
    const parts = text.split('---');
    const yamlContent = parts[1];
    const markdownBody = parts.slice(2).join('---'); // 正文部分
    
    const data = jsyaml.load(yamlContent);
    
    return {
        ...data,
        body: markdownBody, // 存储正文供详情页使用
        tags: Array.isArray(data.tags) ? data.tags : []
    };
}

// 3. 渲染产品卡片列表
function renderProducts(products) {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    grid.innerHTML = products.map((item, index) => `
        <div class="product-card" onclick="openModal(${index})">
            <div class="product-img-wrapper">
                <img src="${item.image}" alt="${item.title}" loading="lazy">
            </div>
            <div class="product-info">
                <span class="product-cat">${item.category || '未分类'}</span>
                <h3 class="product-title">${item.title}</h3>
                <div class="product-tags">
                    ${item.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// 4. 渲染分类导航栏（自动去重提取）
function renderCategories() {
    const tabs = document.getElementById('categoryTabs');
    const categories = ['all', ...new Set(allProducts.map(p => p.category).filter(Boolean))];
    
    tabs.innerHTML = categories.map(cat => `
        <button class="tab ${cat === 'all' ? 'active' : ''}" data-cat="${cat}">
            ${cat === 'all' ? '全部' : cat}
        </button>
    `).join('');

    // 绑定分类点击事件
    tabs.querySelectorAll('.tab').forEach(btn => {
        btn.addEventListener('click', () => {
            tabs.querySelector('.tab.active').classList.remove('active');
            btn.classList.add('active');
            const cat = btn.dataset.cat;
            const filtered = cat === 'all' ? allProducts : allProducts.filter(p => p.category === cat);
            renderProducts(filtered);
        });
    });
}

// 5. 搜索功能逻辑
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allProducts.filter(p => 
            p.title.toLowerCase().includes(term) || 
            p.description?.toLowerCase().includes(term) ||
            p.tags.some(t => t.toLowerCase().includes(term)) ||
            p.brand?.toLowerCase().includes(term)
        );
        renderProducts(filtered);
    });
}

// 6. 打开详情页（弹窗）
window.openModal = function(index) {
    const item = allProducts[index];
    const modal = document.getElementById('productModal');
    const backdrop = document.getElementById('modalBackdrop');

    document.getElementById('modalTitle').innerText = item.title;
    document.getElementById('modalCat').innerText = item.category || '未分类';
    document.getElementById('modalImg').innerHTML = `<img src="${item.image}" style="width:100%">`;
    
    // 使用 marked 将正文 Markdown 转为 HTML
    document.getElementById('modalBody').innerHTML = marked.parse(item.body || '');
    
    const buyBtn = document.getElementById('modalBuyBtn');
    buyBtn.href = item.link_taobao || '#';
    buyBtn.style.display = item.link_taobao ? 'block' : 'none';

    backdrop.hidden = false;
    document.body.style.overflow = 'hidden'; // 禁止背景滚动
};

// 7. 关闭详情页
document.getElementById('modalClose').onclick = closeModal;
document.getElementById('modalBackdrop').onclick = (e) => {
    if (e.target.id === 'modalBackdrop') closeModal();
};

function closeModal() {
    document.getElementById('modalBackdrop').hidden = true;
    document.body.style.overflow = '';
}

// 8. 顶部 Hero 背景装饰图（随机选几张）
function renderHeroGrid() {
    const heroGrid = document.getElementById('heroGrid');
    if (!heroGrid || allProducts.length === 0) return;
    const images = allProducts.slice(0, 6).map(p => `<img src="${p.image}" alt="deco">`);
    heroGrid.innerHTML = images.join('');
}

// 启动！
document.addEventListener('DOMContentLoaded', init);
