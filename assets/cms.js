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

  function fillListItem(item, row, index) {
    item.setAttribute('data-cms-index', String(index));

    item.querySelectorAll('[data-cms-field]').forEach((el) => {
      setText(el, get(row, el.getAttribute('data-cms-field')));
    });

    const number = item.querySelector('.number');
    if (number) number.textContent = String(index + 1).padStart(2, '0');
    const detailIcon = item.querySelector('.detail-icon');
    if (detailIcon) detailIcon.textContent = String(index + 1).padStart(2, '0');

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
  }

  function applyLists(pageData) {
    const groups = new Map();
    document.querySelectorAll('[data-cms-list]').forEach((item) => {
      const path = item.getAttribute('data-cms-list');
      const parent = item.parentElement;
      if (!path || !parent) return;
      const key = `${path}::${Array.from(document.querySelectorAll('*')).indexOf(parent)}`;
      if (!groups.has(key)) groups.set(key, { path, parent, items: [] });
      groups.get(key).items.push(item);
    });

    groups.forEach(({ path, parent, items }) => {
      const rows = get(pageData, path);
      if (!Array.isArray(rows) || !items.length) return;

      const templates = items.map((item) => item.cloneNode(true));
      const current = Array.from(parent.children).filter((el) => el.getAttribute && el.getAttribute('data-cms-list') === path);

      while (current.length > rows.length) {
        const el = current.pop();
        el.remove();
      }

      while (current.length < rows.length) {
        const i = current.length;
        const clone = templates[i % templates.length].cloneNode(true);
        clone.classList.remove('open');
        parent.appendChild(clone);
        current.push(clone);
      }

      current.forEach((item, index) => fillListItem(item, rows[index] || {}, index));
    });
  }

  function applyVisibility(pageData) {
    document.querySelectorAll('[data-cms-visible]').forEach((el) => {
      const path = el.getAttribute('data-cms-visible');
      const value = get(pageData, path);
      // Backward-compatible: missing toggle means visible.
      el.hidden = value === false;
    });

    document.querySelectorAll('[data-cms-hide-if-empty]').forEach((container) => {
      const controlled = Array.from(container.querySelectorAll('[data-cms-visible]'));
      if (controlled.length) container.hidden = controlled.every((el) => el.hidden);
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
      applyVisibility(pageData);
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
