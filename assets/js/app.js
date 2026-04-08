/**
 * CHAOBOOKS GIFTS - 核心驱动引擎 v2.5
 * 优化重点：标题分行显示，增强视觉层次感
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
    grid.innerHTML = `<p style="text-align:center; padding:50px; color:#6B7F5E; grid-column: 1 / -1;">正在连接潮圣地内容库...</p>`;

    try {
        const apiUrl = `https://api.github.com/repos/${CONFIG.user}/${CONFIG.repo}/contents/${CONFIG.contentDir}?ref=${CONFIG.branch}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`无法获取文件列表`);

        const files = await response.json();
        const mdFiles = files.filter(file => file.name.toLowerCase().endsWith('.md'));

        if (mdFiles.length === 0) {
            grid.innerHTML = `<p style="text-align:center; padding:50px; grid-column: 1 / -1;">内容库中暂无赠品信息</p>`;
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
        grid.innerHTML = `<p style="text-align:center; padding:50px; color:red; grid-column: 1 / -1;">加载失败，请手动刷新页面</p>`;
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
        return { ...data, body: markdownBody, tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []) };
    } catch (e) { return null; }
}

function renderProducts(products) {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    if (products.length === 0) {
        grid.innerHTML = `<p style="text-align:center; padding:50px; grid-column: 1 / -1;">没有找到匹配的赠品...</p>`;
        return;
    }

    grid.innerHTML = products.map((item, index) => {
        // --- 核心逻辑：处理标题分行 ---
        let titleHtml = '';
        if (item.title.includes('|')) {
            const titleParts = item.title.split('|');
            // 第一部分是大标题，第二部分是小字副标题
            titleHtml = `
                <div style="font-weight: 700; font-size: 17px; margin-bottom: 4px; color: #2A2A28;">${titleParts[0].trim()}</div>
                <div style="font-size: 13px; color: #888; font-weight: 400;">${titleParts[1].trim()}</div>
            `;
        } else {
            titleHtml = `<div style="font-weight: 700; font-size: 16px; color: #2A2A28;">${item.title}</div>`;
        }

        const tagsHtml = item.tags.map(tag => `
            <span style="background: #F4F6F4; color: #6B7F5E; padding: 2px 10px; border-radius: 12px; font-size: 11px; margin-right: 6px; display: inline-block; margin-bottom: 5px;">
                ${tag}
            </span>
        `).join('');

        return `
            <div class="product-card" onclick="openModal(${index})" style="cursor:pointer; background:#fff; border-radius:8px; overflow:hidden; transition: transform 0.2s; box-shadow: 0 2px 10px rgba(0,0,0,0.04); margin-bottom: 10px;">
                <div class="product-img-wrapper" style="aspect-ratio: 1/1.2; overflow:hidden; background:#f5f5f5;">
                    <img src="${item.image}" alt="${item.title}" loading="lazy" style="width:100%; height:100%; object-fit:cover; display:block;">
                </div>
                <div class="product-info" style="padding: 16px;">
                    <h3 style="font-family:'Noto Serif SC', serif; margin: 0 0 12px 0; line-height: 1.4;">
                        ${titleHtml}
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
    tabs.innerHTML = categories.map(cat => `<button class="tab ${cat === 'all' ? 'active' : ''}" data-cat="${cat}">${cat === 'all' ? '全部' : cat}</button>`).join('');
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
        const filtered = allProducts.filter(p => p.title.toLowerCase().includes(val) || p.tags.some(t => t.toLowerCase().includes(val)));
        renderProducts(filtered);
    };
}

window.openModal = function(index) {
    const item = allProducts[index];
    document.getElementById('modalTitle').innerText = item.title;
    document.getElementById('modalCat').innerText = item.category || '';
    document.getElementById('modalImg').innerHTML = `<img src="${item.image}" style="width:100%; border-radius:4px;">`;
    if (document.getElementById('modalBody')) document.getElementById('modalBody').innerHTML = marked.parse(item.body || '');
    const buyBtn = document.getElementById('modalBuyBtn');
    if (buyBtn) { buyBtn.href = item.link_taobao || '#'; buyBtn.style.display = item.link_taobao ? 'block' : 'none'; }
    document.getElementById('modalBackdrop').hidden = false;
    document.body.style.overflow = 'hidden';
};

const closeBtn = document.getElementById('modalClose');
if (closeBtn) closeBtn.onclick = () => { document.getElementById('modalBackdrop').hidden = true; document.body.style.overflow = ''; };

function renderHeroGrid() {
    const heroGrid = document.getElementById('heroGrid');
    if (!heroGrid || allProducts.length === 0) return;
    heroGrid.innerHTML = allProducts.slice(0, 6).map(p => `<img src="${p.image}" alt="deco">`).join('');
}

document.addEventListener('DOMContentLoaded', init);
