/**
 * CHAOBOOKS GIFTS - 核心驱动引擎 v2.2
 * 完整覆盖版 - 修复了排版并美化了标签样式
 */

const CONFIG = {
    repo: 'chaobooks-gifts',
    user: 'ericwong89',
    branch: 'main',
    contentDir: 'content'
};

let allProducts = [];

async function init() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    grid.innerHTML = `<p style="text-align:center; padding:50px; color:#6B7F5E;">正在连接潮圣地内容库...</p>`;

    try {
        const apiUrl = `https://api.github.com/repos/${CONFIG.user}/${CONFIG.repo}/contents/${CONFIG.contentDir}?ref=${CONFIG.branch}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`无法获取文件列表`);

        const files = await response.json();
        const mdFiles = files.filter(file => file.name.toLowerCase().endsWith('.md'));

        if (mdFiles.length === 0) {
            grid.innerHTML = `<p style="text-align:center; padding:50px;">内容库中暂无赠品信息</p>`;
            return;
        }

        const promises = mdFiles.map(file => fetchMdContent(file.download_url));
        const results = await Promise.all(promises);
        
        allProducts = results.filter(p => p && p.title);
        allProducts.sort((a, b) => new Date(b.date) - new Date(a.date));

        renderCategories();
        renderProducts(allProducts);
        setupSearch();
        renderHeroGrid();
    } catch (err) {
        console.error("加载失败:", err);
        grid.innerHTML = `<p style="text-align:center; padding:50px; color:red;">内容加载失败，请刷新重试</p>`;
    }
}

async function fetchMdContent(url) {
    try {
        const response = await fetch(url);
        const text = await response.text();
        const parts = text.split('---');
        if (parts.length < 3) return null;

        const yamlContent = parts[1];
        const markdownBody = parts.slice(2).join('---');
        const data = jsyaml.load(yamlContent);
        
        return {
            ...data,
            body: markdownBody,
            tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : [])
        };
    } catch (e) {
        return null;
    }
}

function renderProducts(products) {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = `<p style="text-align:center; padding:50px;">没有找到匹配的赠品...</p>`;
        return;
    }

    grid.innerHTML = products.map((item, index) => {
        // 美化标签：去掉#，改为圆角气泡样式
        const tagsHtml = item.tags.map(tag => `
            <span style="background: #F4F6F4; color: #6B7F5E; padding: 2px 10px; border-radius: 12px; font-size: 11px; margin-right: 5px; display: inline-block; margin-bottom: 5px;">
                ${tag}
            </span>
        `).join('');

        return `
            <div class="product-card" onclick="openModal(${index})" style="cursor:pointer; margin-bottom:30px; border:none;">
                <div class="product-img-wrapper" style="border-radius:4px; overflow:hidden; background:#f9f9f9;">
                    <img src="${item.image}" alt="${item.title}" loading="lazy" style="width:100%; display:block;">
                </div>
                <div class="product-info" style="padding: 12px 0;">
                    <h3 style="font-family:'Noto Serif SC', serif; font-size: 16px; margin: 0 0 10px 0; line-height: 1.4; color: #2A2A28;">
                        ${item.title}
                    </h3>
                    <div class="product-tags">
                        ${tagsHtml}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderCategories() {
    const tabs = document.getElementById('categoryTabs');
    if (!tabs) return;
    const categories = ['all', ...new Set(allProducts.map(p => p.category).filter(Boolean))];
    
    tabs.innerHTML = categories.map(cat => `
        <button class="tab ${cat === 'all' ? 'active' : ''}" data-cat="${cat}">
            ${cat === 'all' ? '全部' : cat}
        </button>
    `).join('');

    tabs.querySelectorAll('.tab').forEach(btn => {
        btn.onclick = () => {
            const activeTab = tabs.querySelector('.tab.active');
            if (activeTab) activeTab.classList.remove('active');
            btn.classList.add('active');
            const filtered = btn.dataset.cat === 'all' ? allProducts : allProducts.filter(p => p.category === btn.dataset.cat);
            renderProducts(filtered);
        };
    });
}

function setupSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    input.oninput = (e) => {
        const val = e.target.value.toLowerCase();
        const filtered = allProducts.filter(p => 
            p.title.toLowerCase().includes(val) || 
            p.tags.some(t => t.toLowerCase().includes(val)) ||
            (p.brand && p.brand.toLowerCase().includes(val))
        );
        renderProducts(filtered);
    };
}

window.openModal = function(index) {
    const item = allProducts[index];
    const modalBody = document.getElementById('modalBody');
    
    document.getElementById('modalTitle').innerText = item.title;
    document.getElementById('modalCat').innerText = item.category || '';
    document.getElementById('modalImg').innerHTML = `<img src="${item.image}" style="width:100%; border-radius:4px;">`;
    
    // 渲染正文内容
    if (modalBody && window.marked) {
        modalBody.innerHTML = marked.parse(item.body || '');
    }
    
    const buyBtn = document.getElementById('modalBuyBtn');
    if (buyBtn) {
        buyBtn.href = item.link_taobao || '#';
        buyBtn.style.display = item.link_taobao ? 'block' : 'none';
    }

    document.getElementById('modalBackdrop').hidden = false;
    document.body.style.overflow = 'hidden';
};

const closeBtn = document.getElementById('modalClose');
if (closeBtn) {
    closeBtn.onclick = () => {
        document.getElementById('modalBackdrop').hidden = true;
        document.body.style.overflow = '';
    };
}

function renderHeroGrid() {
    const heroGrid = document.getElementById('heroGrid');
    if (!heroGrid || allProducts.length === 0) return;
    heroGrid.innerHTML = allProducts.slice(0, 6).map(p => `<img src="${p.image}" alt="deco">`).join('');
}

document.addEventListener('DOMContentLoaded', init);
