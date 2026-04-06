const I18N = {
  'zh-cn': {
    brand: 'CHAOBOOKS GIFTS',
    nav_home: '首页', nav_category: '分类', nav_about: '关于',
    hero_label: '日本杂志赠品专门店',
    hero_title: '每期杂志精选赠品',
    hero_desc: '收录日本各大杂志随刊附赠品，简繁双语介绍，直通淘宝购买。',
    hero_cta: '浏览赠品', hero_cta2: '了解更多',
    category_label: '分类', all: '全部',
    latest: '最新赠品', view_all: '查看全部',
    buy_btn: '淘宝购买', back: '← 返回列表',
    hot_label: '热门赠品', no_items: '暂无赠品',
    about_title: '关于 CHAOBOOKS',
    about_desc: '专注收录日本杂志随刊赠品资讯，提供简繁双语介绍与正品购买渠道。每期更新，帮你找到心仪的杂志赠品。',
    email_title: '订阅最新赠品资讯',
    email_desc: '每周发送最新日系杂志赠品情报，第一时间获取限量资讯。',
    email_btn: '订阅', email_placeholder: 'your@email.com',
    email_thanks: '感谢订阅！我们会尽快与你联系。',
    footer_tagline: '日本杂志赠品专门店',
    footer_contact: '联系方式', footer_privacy: '隐私政策',
    loading: '加载中…', page_product: '商品详情'
  },
  'zh-tw': {
    brand: 'CHAOBOOKS GIFTS',
    nav_home: '首頁', nav_category: '分類', nav_about: '關於',
    hero_label: '日本雜誌贈品專門店',
    hero_title: '每期雜誌精選贈品',
    hero_desc: '收錄日本各大雜誌隨刊附贈品，簡繁雙語介紹，直通淘寶購買。',
    hero_cta: '瀏覽贈品', hero_cta2: '了解更多',
    category_label: '分類', all: '全部',
    latest: '最新贈品', view_all: '查看全部',
    buy_btn: '淘寶購買', back: '← 返回列表',
    hot_label: '熱門贈品', no_items: '暫無贈品',
    about_title: '關於 CHAOBOOKS',
    about_desc: '專注收錄日本雜誌隨刊贈品資訊，提供簡繁雙語介紹與正品購買渠道。每期更新，幫你找到心儀的雜誌贈品。',
    email_title: '訂閱最新贈品資訊',
    email_desc: '每週發送最新日系雜誌贈品情報，第一時間獲取限量資訊。',
    email_btn: '訂閱', email_placeholder: 'your@email.com',
    email_thanks: '感謝訂閱！我們會盡快與你聯繫。',
    footer_tagline: '日本雜誌贈品專門店',
    footer_contact: '聯繫方式', footer_privacy: '隱私政策',
    loading: '載入中…', page_product: '商品詳情'
  }
};

function detectLang() {
  const path = window.location.pathname;
  if (path.includes('/zh-tw/')) return 'zh-tw';
  const stored = localStorage.getItem('lang');
  if (stored && I18N[stored]) return stored;
  return 'zh-cn';
}

let currentLang = detectLang();

function t(key) {
  return (I18N[currentLang] && I18N[currentLang][key]) || key;
}

function setLang(lang) {
  if (!I18N[lang]) return;
  currentLang = lang;
  localStorage.setItem('lang', lang);
  applyI18n();
  if (typeof onLangChange === 'function') onLangChange(lang);
}

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
  document.documentElement.lang = currentLang === 'zh-tw' ? 'zh-TW' : 'zh-CN';
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });
  applyI18n();
});
