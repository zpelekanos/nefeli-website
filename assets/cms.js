(function () {
  function get(obj, path) {
    return String(path || '').split('.').reduce((acc, key) => {
      if (acc === null || acc === undefined) return undefined;
      return acc[key];
    }, obj);
  }

  function setText(el, value) {
    if (!el || value === undefined || value === null) return;
    el.textContent = String(value);
  }

  function applySimple(scope, data) {
    document.querySelectorAll(`[data-cms-${scope}]`).forEach((el) => {
      const path = el.getAttribute(`data-cms-${scope}`);
      const value = get(data, path);
      if (el.getAttribute('data-cms-type') === 'bg') {
        if (value) el.style.backgroundImage = `url("${String(value).replace(/"/g, '\\"')}")`;
        return;
      }
      setText(el, value);
    });
  }

  function applyAttributes(pageData) {
    document.querySelectorAll('[data-cms-page-attr]').forEach((el) => {
      const path = el.getAttribute('data-cms-page-attr');
      const attr = el.getAttribute('data-cms-attr-name');
      const value = get(pageData, path);
      if (attr && value !== undefined && value !== null) el.setAttribute(attr, String(value));
    });
  }

  function applyLists(pageData) {
    document.querySelectorAll('[data-cms-list][data-cms-index]').forEach((item) => {
      const listPath = item.getAttribute('data-cms-list');
      const index = Number(item.getAttribute('data-cms-index'));
      const list = get(pageData, listPath);
      if (!Array.isArray(list) || !list[index]) return;
      const row = list[index];

      item.querySelectorAll('[data-cms-field]').forEach((el) => {
        setText(el, get(row, el.getAttribute('data-cms-field')));
      });

      const bgField = item.getAttribute('data-cms-bg-field');
      if (bgField) {
        const image = get(row, bgField);
        if (image) {
          item.style.backgroundImage = `url("${String(image).replace(/"/g, '\\"')}")`;
          item.classList.add('has-image');
        } else {
          item.style.backgroundImage = '';
          item.classList.remove('has-image');
        }
      }

      const labelField = item.getAttribute('data-cms-label-field');
      if (labelField) {
        const label = get(row, labelField);
        if (label !== undefined && label !== null) item.setAttribute('data-label', String(label));
      }
    });
  }

  async function loadJson(path) {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Cannot load ${path}`);
    return response.json();
  }

  async function init() {
    const page = document.body.getAttribute('data-cms-page-file');
    if (!page) return;
    try {
      const [globalData, pageData] = await Promise.all([
        loadJson('content/global.json'),
        loadJson(`content/${page}.json`)
      ]);
      applySimple('global', globalData);
      applySimple('page', pageData);
      applyAttributes(pageData);
      applyLists(pageData);
      document.documentElement.classList.add('cms-content-loaded');
    } catch (error) {
      console.warn('CMS content fallback is being used:', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
