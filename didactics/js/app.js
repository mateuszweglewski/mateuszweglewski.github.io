// ==============================================
// Didactics — app logic
// Depends on window.SUBJECTS from data.js
// Supports arbitrarily nested categories: a node either has
// `children` (an object of sub-nodes to drill into) or `items`
// (a leaf library of materials). Each node is its own page with
// its own real URL (e.g. /webapps, /webapps/grade4): picking an
// option navigates to that page, which then shows only the next
// level's choices.
// ==============================================

const SUBJECTS = window.SUBJECTS;
const ROOT = { key: null, name: 'Didactics', icon: '📚', accent: null, childLabel: 'Subject', children: SUBJECTS };

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const state = { path: [], q: '', tag: null, sort: 'recent' };

const sorters = {
  recent: (a, b) => (b.year ?? 0) - (a.year ?? 0) || a.title.localeCompare(b.title),
  az: (a, b) => a.title.localeCompare(b.title, 'pl', { sensitivity: 'base' }),
  za: (a, b) => b.title.localeCompare(a.title, 'pl', { sensitivity: 'base' })
};

function nodeAt(path) {
  let node = ROOT;
  for (const key of path) {
    if (!node || !node.children) return null;
    node = node.children[key];
  }
  return node || null;
}
function currentNode() {
  return nodeAt(state.path);
}
function isLeaf(node) {
  return !!node && !node.children;
}

function countItems(node) {
  if (!node) return 0;
  if (node.children) return Object.values(node.children).reduce((sum, child) => sum + countItems(child), 0);
  return (node.items || []).length;
}

function statusText(count) {
  return count ? `${count} resource${count === 1 ? '' : 's'}` : 'Coming soon';
}

function uniqueTags(items) {
  return [...new Set(items.flatMap(b => b.tags || []))].sort((a, b) => a.localeCompare(b, 'pl', { sensitivity: 'base' }));
}

function matches(item) {
  const q = state.q.trim().toLowerCase();
  const hitQ = !q || [item.title, item.author, (item.tags || []).join(' ')].join(' ').toLowerCase().includes(q);
  const hitT = !state.tag || (item.tags || []).includes(state.tag);
  return hitQ && hitT;
}

// ====== icons (emoji or logo image) ======
function setIconContent(el, node) {
  el.innerHTML = '';
  el.classList.toggle('ic--logo', !!node.logoUrl);
  if (node.logoUrl) {
    const img = document.createElement('img');
    img.src = node.logoUrl;
    img.alt = node.name;
    img.className = 'ic-logo';
    el.appendChild(img);
  } else {
    el.textContent = node.icon;
  }
}

// ====== PICKER (one page per level: subject, then class, then category…) ======
function buildOptionCard(child) {
  const tpl = $('#tpl-option');
  const el = tpl.content.firstElementChild.cloneNode(true);
  el.style.setProperty('--sc', child.accent || 'var(--primary)');
  el.href = pathToUrl([...state.path, child.key]);

  setIconContent($('.option-icon', el), child);
  $('.option-name', el).textContent = child.name;

  const count = countItems(child);
  const status = $('.option-status', el);
  status.textContent = statusText(count);
  status.classList.toggle('ready', count > 0);

  // Real href so middle-click / cmd-click / "copy link" behave like a normal
  // page link; plain left-clicks are intercepted for instant SPA navigation.
  el.addEventListener('click', (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    goInto(child.key);
  });
  return el;
}

function renderHero(node, isRoot) {
  const heading = $('#pickerHeading');
  const lede = $('#pickerLede');
  if (isRoot) {
    heading.textContent = 'Find your materials';
    lede.textContent = 'Pick a subject to get started.';
  } else {
    heading.textContent = node.name;
    lede.textContent = node.tagline || `Choose a ${(node.childLabel || 'category').toLowerCase()} to continue.`;
  }
}

function renderPicker(node) {
  const box = $('#steps');
  box.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'step';

  const title = document.createElement('h3');
  title.className = 'step-title';
  title.textContent = node.childLabel || 'Choose';
  wrap.appendChild(title);

  const grid = document.createElement('div');
  grid.className = 'option-grid';
  Object.values(node.children).forEach(child => grid.appendChild(buildOptionCard(child)));
  wrap.appendChild(grid);

  box.appendChild(wrap);
}

function goInto(key) {
  const node = currentNode();
  if (!node || !node.children || !node.children[key]) return;
  state.path.push(key);
  resetFilters();
  render(true);
}

// ====== LIBRARY ======
function renderTags(items) {
  const box = $('#tags');
  box.innerHTML = '';
  const allTags = uniqueTags(items);
  if (!allTags.length) return;

  const make = (label, value) => {
    const el = document.createElement('button');
    el.className = 'tag' + (state.tag === value ? ' active' : '');
    el.textContent = label;
    el.onclick = () => { state.tag = state.tag === value ? null : value; renderLibrary(currentNode()); syncUrl(); };
    return el;
  };
  box.appendChild(make('All', null));
  allTags.forEach(t => box.appendChild(make(t, t)));
}

function cardFrom(item, node) {
  const tpl = $('#tpl-card');
  const el = tpl.content.firstElementChild.cloneNode(true);
  el.dataset.id = item.id;
  el.style.setProperty('--sc', node.accent);

  const cover = $('.cover', el);
  const badge = $('.format-badge', cover);
  // No per-item cover photo? Fall back to the category's own logo (e.g. the
  // "Tworzenie Aplikacji Webowych" / "Aplikacje Webowe" marks) instead of a
  // generic emoji, so lab/lecture cards read as branded, not placeholder-y.
  const imgSrc = item.coverUrl || node.logoUrl;
  cover.classList.toggle('cover-logo', !item.coverUrl && !!node.logoUrl);
  if (imgSrc) {
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = item.title;
    img.loading = 'lazy';
    cover.innerHTML = '';
    cover.appendChild(img);
  } else {
    cover.textContent = item.coverEmoji || node.icon;
  }
  if (badge) cover.appendChild(badge);

  badge.textContent = item.format || '';
  const metaText = [item.author, item.year ? `• ${item.year}` : ''].filter(Boolean).join(' ');
  $('.title', el).textContent = item.title;
  $('.meta', el).innerHTML = metaText ? `<span>${metaText}</span>` : '';
  $('.btn-read', el).href = item.url;
  $('[data-action="info"]', el).onclick = () => openModal(item, node);
  return el;
}

function renderLibrary(node) {
  if (!node) return;

  setIconContent($('#introIcon'), node);
  $('#introName').textContent = node.name;
  $('#introTagline').textContent = node.tagline || '';

  const badge = $('#introStatus');
  const count = node.items.length;
  badge.className = 'status-pill' + (count ? ' ready' : ' queued');
  badge.innerHTML = `<span class="dot"></span>${statusText(count)}`;

  renderTags(node.items);

  const grid = $('#grid');
  grid.innerHTML = '';
  const list = node.items.filter(matches).sort(sorters[state.sort] || sorters.recent);

  if (!node.items.length) {
    grid.appendChild(emptyState(node.icon, 'No materials here yet', `New ${node.name} resources are on the way.`));
    return;
  }
  if (!list.length) {
    grid.appendChild(emptyState('🔎', 'Nothing found', 'Try a different search term or clear the filters.'));
    return;
  }
  list.forEach(item => grid.appendChild(cardFrom(item, node)));
}

function emptyState(icon, title, body) {
  const el = document.createElement('div');
  el.className = 'empty-state';
  el.innerHTML = `<div class="ic">${icon}</div><strong>${title}</strong>${body}`;
  return el;
}

// ====== breadcrumb ======
function renderCrumb() {
  const crumb = $('#crumb');
  if (!state.path.length) { crumb.hidden = true; return; }
  crumb.hidden = false;

  let node = ROOT;
  const parts = [];
  state.path.forEach(key => { node = node.children[key]; if (node) parts.push(node); });

  $('#crumbIcon').textContent = parts.length ? parts[parts.length - 1].icon : '';
  $('#crumbName').textContent = parts.map(p => p.name).join(' › ');
}

// ====== view switching ======
function applyAccent(node) {
  if (node && node.accent) {
    document.body.style.setProperty('--accent', node.accent);
  } else {
    document.body.style.removeProperty('--accent');
  }
}

function render(push = false) {
  const node = currentNode();
  const leaf = isLeaf(node);
  const isRoot = state.path.length === 0;

  $('#pickerView').hidden = leaf;
  $('#libraryView').hidden = !leaf;
  $('#libraryControls').hidden = !leaf;
  $('#tags').style.display = leaf ? '' : 'none';

  applyAccent(isRoot ? null : node);
  renderCrumb();

  if (leaf) {
    $('#q').value = state.q;
    $('#sort').value = state.sort;
    renderLibrary(node);
  } else {
    renderHero(node, isRoot);
    renderPicker(node);
  }
  syncUrl(push);
}

function resetFilters() {
  state.q = ''; state.tag = null; state.sort = 'recent';
}

function goRoot() {
  state.path = [];
  resetFilters();
  render(true);
}
function goBack() {
  if (!state.path.length) return;
  state.path.pop();
  resetFilters();
  render(true);
}

// ====== modal ======
function openModal(item, node) {
  $('#dlgTitle').textContent = item.title;
  $('#dlgDesc').textContent = item.description || '';
  $('#dlgAuthor').textContent = item.author || '';
  $('#dlgYear').textContent = item.year ? `Year: ${item.year}` : 'Year: —';
  $('#dlgFormat').textContent = item.format || '—';

  const tagsBox = $('#dlgTags');
  tagsBox.innerHTML = '';
  (item.tags || []).forEach(t => {
    const el = document.createElement('span');
    el.className = 'tag'; el.textContent = t; tagsBox.appendChild(el);
  });

  const coverBox = $('#dlgCover');
  coverBox.innerHTML = '';
  if (item.coverUrl) {
    const img = document.createElement('img');
    img.src = item.coverUrl;
    img.alt = item.title;
    img.loading = 'lazy';
    coverBox.appendChild(img);
  } else {
    coverBox.textContent = item.coverEmoji || (node ? node.icon : '📖');
  }

  $('#dlgOpen').href = item.url;
  const dl = $('#dlgDownload');
  dl.href = item.url;
  dl.download = (item.title || 'material').replace(/\s+/g, '-').toLowerCase();

  $('#dlg').showModal();
}

$('#dlg').addEventListener('click', (e) => {
  const dlg = $('#dlg');
  const rect = dlg.getBoundingClientRect();
  if (e.clientY < rect.top || e.clientY > rect.bottom || e.clientX < rect.left || e.clientX > rect.right) {
    dlg.close();
  }
});
$('[data-action="close"]').onclick = () => $('#dlg').close();

// ====== UI events ======
$('#brandBtn').addEventListener('click', goRoot);
$('#backBtn').addEventListener('click', goBack);
$('#q').addEventListener('input', (e) => { state.q = e.target.value; renderLibrary(currentNode()); syncUrl(); });
$('#sort').addEventListener('change', (e) => { state.sort = e.target.value; renderLibrary(currentNode()); syncUrl(); });
$('#clearBtn').addEventListener('click', () => {
  state.q = ''; $('#q').value = ''; state.tag = null; state.sort = 'recent'; $('#sort').value = 'recent';
  renderLibrary(currentNode()); syncUrl();
});

// ====== pretty-URL routing (real pathnames, e.g. /webapps/grade4/lectures) ======
function pathToUrl(pathArr) {
  return pathArr.length ? '/' + pathArr.map(encodeURIComponent).join('/') : '/';
}

// The old /didactics/ entry point is kept for existing bookmarks, but every
// in-app link now points at the canonical root-level pretty URL. So on load,
// treat "/didactics" (with nothing after it) the same as the site root.
function stripLegacyMount(pathname) {
  return pathname.replace(/^\/didactics(?=\/|$)/i, '') || '/';
}

function syncUrl(push = false) {
  const params = new URLSearchParams();
  if (state.q) params.set('q', state.q);
  if (state.tag) params.set('tag', state.tag);
  if (state.sort && state.sort !== 'recent') params.set('sort', state.sort);
  const search = params.toString();
  const url = pathToUrl(state.path) + (search ? `?${search}` : '');
  if (push) {
    history.pushState(null, '', url);
  } else {
    history.replaceState(null, '', url);
  }
}

function readLocation() {
  const pathname = stripLegacyMount(decodeURIComponent(location.pathname));
  const candidate = pathname.replace(/^\/|\/$/g, '').split('/').filter(Boolean);

  let node = ROOT;
  const valid = [];
  for (const key of candidate) {
    if (node && node.children && node.children[key]) {
      node = node.children[key];
      valid.push(key);
    } else {
      break;
    }
  }
  state.path = valid;

  const p = new URLSearchParams(location.search);
  state.q = p.get('q') || '';
  state.tag = p.get('tag');
  state.sort = p.get('sort') || 'recent';
}
addEventListener('popstate', () => { readLocation(); render(); });

// ====== init ======
$('#year').textContent = new Date().getFullYear();
readLocation();
render();
