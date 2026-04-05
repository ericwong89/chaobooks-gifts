/**
 * i18n.js — Bilingual (zh-cn / zh-tw) string dictionary
 * Auto-detects language from URL path: /zh-cn/ or /zh-tw/
 * Falls back to zh-cn by default.
 */

const I18N = {
  'zh-cn': {
    brand: '赠品集',
    nav_home: '首页',
    nav_category: '分类',
    hot_label: '热门赠品',
    all: '全部',
    buy_btn: '淘宝购买',
    back: '← 返回列表',
    latest: '最新赠品',
    page_product: '商品详情',
    loading: '加载中…',
    no_items: '暂无赠品'
  },
  'zh-tw': {
    brand: '贈品集',
    nav_home: '首頁',
    nav_category: '分類',
    hot_label: '熱門贈品',
    all: '全部',
    buy_btn: '淘寶購買',
    back: '← 返回列表',
    latest: '最新贈品',
    page_product: '商品詳情',
    loading: '載入中…',
    no_items: '暫無贈品'
  }
};

/**
 * Detect language from URL path.
 * /zh-tw/... → 'zh-tw'
 * /zh-cn/... or anything else → 'zh-cn'
 */
function detectLang() {
  const path = window.location.pathname;
  if (path.includes('/zh-tw/')) return 'zh-tw';
  // Check localStorage override (for toggling on static index.html)
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

/** Stamp all [data-i18n="key"] elements */
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });

  // Update lang buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });

  // Update <html lang>
  document.documentElement.lang = currentLang === 'zh-tw' ? 'zh-TW' : 'zh-CN';
}

// Wire up lang buttons
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });
  applyI18n();
});
