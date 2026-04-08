const CONFIG = {
    repo: 'chaobooks-gifts',
    user: 'ericwong89',
    branch: 'main',
    contentDir: 'content'
};

// 这里的 init 函数需要微调一下，因为 GitHub API 有时会因为路径问题找不到文件
async function init() {
    try {
        // 修改这里的 URL，确保它能精准定位
        const url = `https://api.github.com/repos/${CONFIG.user}/${CONFIG.repo}/contents/${CONFIG.contentDir}?ref=${CONFIG.branch}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`GitHub API 返回错误: ${response.status}`);
        }

        const files = await response.json();
        const mdFiles = files.filter(file => file.name.endsWith('.md'));
        
        // 如果文件列表为空，在这里打印调试信息
        if (mdFiles.length === 0) {
            console.log("未在 content 文件夹下找到 .md 文件");
            return;
        }

        const promises = mdFiles.map(file => fetchMdContent(file.download_url));
        allProducts = await Promise.all(promises);
        
        allProducts.sort((a, b) => new Date(b.date) - new Date(a.date));

        renderCategories();
        renderProducts(allProducts);
        setupSearch();
        renderHeroGrid();
    } catch (err) {
        console.error("加载内容失败:", err);
        // 如果报错，在页面上显示提示，方便我们排查
        document.getElementById('productGrid').innerHTML = `<p style="text-align:center; padding:50px;">内容加载中或配置有误，请检查 GitHub 仓库 content 文件夹...</p>`;
    }
}
