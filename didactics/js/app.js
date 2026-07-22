// ==============================================
// Didactics — app logic
// Depends on window.SUBJECTS from data.js
// Supports arbitrarily nested categories: a node either has
// `children` (an object of sub-nodes to drill into) or `items`
// (a leaf library of materials).
// ==============================================

const SUBJECTS = window.SUBJECTS;
const ROOT = { key: null, name: 'Didactics', icon: '📚', accent: null, children: SUBJECTS };

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

function uniqueTags(items) {
  return [...new Set(items.flatMap(b => b.tags || []))].sort((a, b) => a.localeCompare(b, 'pl', { sensitivity: 'base' }));
}

function matches(item) {
  const q = state.q.trim().toLowerCase();
  const hitQ = !q || [item.title, item.author, (item.tags || []).join(' ')].join(' ').toLowerCase().includes(q);
  const hitT = !state.tag || (item.tags || []).includes(state.tag);
  return hitQ && hitT;
}

// ====== HERO ======
function renderHero(node, isRoot) {
  const eyebrow = $('#heroEyebrow');
  const title = $('#heroTitle');
  const lede = $('#heroLede');
  if (isRoot) {
    eyebrow.textContent = 'select-subject.sh';
    title.textContent = 'What are you teaching or studying today?';
    lede.textContent = 'Worksheets, mock exams and lab material, organised by subject. Pick a stage to open it.';
  } else {
    eyebrow.textContent = `${state.path.join('/')}/select.sh`;
    title.textContent = `Browsing ${node.name}`;
    lede.textContent = node.tagline || 'Pick a category to continue.';
  }
}

// ====== PIPELINE (hub + intermediate category pickers) ======
function renderPipeline(node) {
  const box = $('#pipeline');
  box.innerHTML = '';
  const tpl = $('#tpl-stage');

  Object.values(node.children).forEach((child, i) => {
    const el = tpl.content.firstElementChild.cloneNode(true);
    el.style.setProperty('--sc', child.accent);
    el.style.setProperty('--i', i);
    el.dataset.key = child.key;

    const btn = $('.node', el);
    if (child.logoUrl) {
      btn.textContent = '';
      btn.classList.add('node--logo');
      const img = document.createElement('img');
      img.src = child.logoUrl;
      img.alt = child.name;
      img.className = 'node-logo';
      btn.appendChild(img);
    } else {
      btn.textContent = child.icon;
    }
    btn.setAttribute('aria-label', `Open ${child.name}`);
    btn.addEventListener('click', () => goInto(child.key));

    $('.stage-name', el).textContent = child.name;

    const status = $('.stage-status', el);
    const count = countItems(child);
    if (count) {
      status.classList.add('ready');
      status.innerHTML = `<span class="dot"></span>${count} artifact${count === 1 ? '' : 's'}`;
    } else {
      status.classList.add('queued');
      status.innerHTML = `<span class="dot"></span>queued`;
    }
    box.appendChild(el);
  });
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
    el.onclick = () => { state.tag = state.tag === value ? null : value; renderLibrary(currentNode()); syncHash(); };
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
  if (item.coverUrl) {
    const img = document.createElement('img');
    img.src = item.coverUrl;
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

function renderLibrary(node) {
  if (!node) return;

  setIconContent($('#introIcon'), node);
  $('#introName').textContent = node.name;
  $('#introTagline').textContent = node.tagline || '';

  const badge = $('#introStatus');
  if (node.items.length) {
    badge.className = 'status-pill ready';
    badge.innerHTML = `<span class="dot"></span>passing · ${node.items.length} artifact${node.items.length === 1 ? '' : 's'}`;
  } else {
    badge.className = 'status-pill queued';
    badge.innerHTML = `<span class="dot"></span>queued · nothing built yet`;
  }

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

  $('#hubView').hidden = leaf;
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
    renderPipeline(node);
  }
  syncHash(push);
}

function resetFilters() {
  state.q = ''; state.tag = null; state.sort = 'recent';
}

function goRoot() {
  state.path = [];
  resetFilters();
  render(true);
}
function goInto(key) {
  const node = currentNode();
  if (!node || !node.children || !node.children[key]) return;
  state.path.push(key);
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
$('#q').addEventListener('input', (e) => { state.q = e.target.value; renderLibrary(currentNode()); syncHash(); });
$('#sort').addEventListener('change', (e) => { state.sort = e.target.value; renderLibrary(currentNode()); syncHash(); });
$('#clearBtn').addEventListener('click', () => {
  state.q = ''; $('#q').value = ''; state.tag = null; state.sort = 'recent'; $('#sort').value = 'recent';
  renderLibrary(currentNode()); syncHash();
});

// ====== hash routing ======
function syncHash(push = false) {
  const params = new URLSearchParams();
  if (state.path.length) params.set('path', state.path.join('.'));
  if (state.q) params.set('q', state.q);
  if (state.tag) params.set('tag', state.tag);
  if (state.sort && state.sort !== 'recent') params.set('sort', state.sort);
  const h = params.toString();
  const url = h ? `#${h}` : ' ';
  if (push) {
    history.pushState(null, '', url);
  } else {
    history.replaceState(null, '', url);
  }
}
function readHash() {
  const h = location.hash.replace(/^#/, '');
  const p = new URLSearchParams(h);
  const rawPath = p.get('path');
  const candidate = rawPath ? rawPath.split('.') : [];

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
  state.q = p.get('q') || '';
  state.tag = p.get('tag');
  state.sort = p.get('sort') || 'recent';
}
addEventListener('hashchange', () => { readHash(); render(); });

// ====== init ======
$('#year').textContent = new Date().getFullYear();
readHash();
render();
