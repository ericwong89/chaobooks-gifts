/**
 * CHAOBOOKS GIFTS - 核心驱动引擎 v2.1 (增强排错版)
 */

const CONFIG = {
    repo: 'chaobooks-gifts',
    user: 'ericwong89', // 确认是这个用户名
    branch: 'main',
    contentDir: 'content'
};

let allProducts = [];

async function init() {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = `<p style="text-align:center; padding:50px;">正在连接内容库，请稍候...</p>`;

    try {
        // 关键：构建 GitHub API 地址
        const apiUrl = `https://api.github.com/repos/${CONFIG.user}/${CONFIG.repo}/contents/${CONFIG.contentDir}?ref=${CONFIG.branch}`;
        console.log("正在尝试访问内容库:", apiUrl);

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`GitHub 访问失败，状态码: ${response.status}`);
        }

        const files = await response.json();
        console.log("获取到的文件列表:", files);

        const mdFiles = files.filter(file => file.name.toLowerCase().endsWith('.md'));
        console.log("筛选出的 MD 文件:", mdFiles);

        if (mdFiles.length === 0) {
            grid.innerHTML = `<p style="text-align:center; padding:50px;">内容库中暂无 .md 文件，请检查 content 文件夹</p>`;
            return;
        }

        const promises = mdFiles.map(file => fetchMdContent(file.download_url));
        allProducts = await Promise.all(promises);
        
        // 过滤掉解析失败的数据
        allProducts = allProducts.filter(p => p && p.title);
        allProducts.sort((a, b) => new Date(b.date) - new Date(a.date));

        renderCategories();
        renderProducts(allProducts);
        setupSearch();
        renderHeroGrid();
    } catch (err) {
        console.error("【重大错误】:", err);
        grid.innerHTML = `<p style="text-align:center; padding:50px; color:red;">加载失败: ${err.message}</p>`;
    }
}

async function fetchMdContent(url) {
    try {
        const response = await fetch(url);
        const text = await response.text();
        
        // 解析 YAML 和 Markdown
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
        console.error("解析文件失败:", url, e);
        return null;
    }
}

function renderProducts(products) {
    const grid = document.getElementById('productGrid');
    if (products.length === 0) {
        grid.innerHTML = `<p style="text-align:center; padding:50px;">没有找到匹配的赠品...</p>`;
        return;
    }

    grid.innerHTML = products.map((item, index) => `
        <div class="product-card" onclick="openModal(${index})" style="cursor:pointer; border: none; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 20px; transition: transform 0.2s;">
            <div class="product-img-wrapper" style="overflow:hidden; border-radius: 4px;">
                <img src="${item.image}" alt="${item.title}" loading="lazy" style="width:100%; display:block; transition: scale 0.3s;">
            </div>
            <div class="product-info" style="padding: 15px 5px;">
                <h3 class="product-title" style="font-family:'Noto Serif SC', serif; font-size: 16px; margin: 0 0 10px 0; line-height: 1.4; color: #2A2A28;">
                    ${item.title}
                </h3>
                <div class="product-tags" style="display: flex; flex-wrap: wrap; gap: 6px;">
                    ${item.tags.map(tag => `
                        <span class="tag" style="background: #F4F6F4; color: #6B7F5E; padding: 2px 10px; border-radius: 12px; font-size: 11px; letter-spacing: 0.5px;">
                            ${tag}
                        </span>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// 其余分类、搜索、弹窗函数保持之前的逻辑...
function renderCategories() {
    const tabs = document.getElementById('categoryTabs');
    if(!tabs) return;
    const categories = ['all', ...new Set(allProducts.map(p => p.category).filter(Boolean))];
    tabs.innerHTML = categories.map(cat => `<button class="tab ${cat === 'all' ? 'active' : ''}" data-cat="${cat}">${cat === 'all' ? '全部' : cat}</button>`).join('');
    tabs.querySelectorAll('.tab').forEach(btn => {
        btn.onclick = () => {
            tabs.querySelector('.tab.active').classList.remove('active');
            btn.classList.add('active');
            const filtered = btn.dataset.cat === 'all' ? allProducts : allProducts.filter(p => p.category === btn.dataset.cat);
            renderProducts(filtered);
        };
    });
}

function setupSearch() {
    const input = document.getElementById('searchInput');
    if(!input) return;
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
    document.getElementById('modalImg').innerHTML = `<img src="${item.image}" style="width:100%">`;
    document.getElementById('modalBody').innerHTML = marked.parse(item.body || '');
    const buyBtn = document.getElementById('modalBuyBtn');
    buyBtn.href = item.link_taobao || '#';
    document.getElementById('modalBackdrop').hidden = false;
    document.body.style.overflow = 'hidden';
};

document.getElementById('modalClose').onclick = () => {
    document.getElementById('modalBackdrop').hidden = true;
    document.body.style.overflow = '';
};

function renderHeroGrid() {
    const heroGrid = document.getElementById('heroGrid');
    if (!heroGrid || allProducts.length === 0) return;
    heroGrid.innerHTML = allProducts.slice(0, 6).map(p => `<img src="${p.image}">`).join('');
}

document.addEventListener('DOMContentLoaded', init);
