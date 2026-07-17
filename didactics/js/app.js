// ==============================================
// Didactics — app logic
// Depends on window.SUBJECTS from data.js
// ==============================================

const SUBJECTS = window.SUBJECTS;

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const state = { subject: null, q: '', tag: null, sort: 'recent' };

const sorters = {
  recent: (a, b) => (b.year ?? 0) - (a.year ?? 0) || a.title.localeCompare(b.title),
  az: (a, b) => a.title.localeCompare(b.title, 'pl', { sensitivity: 'base' }),
  za: (a, b) => b.title.localeCompare(a.title, 'pl', { sensitivity: 'base' })
};

function currentSubject() {
  return state.subject ? SUBJECTS[state.subject] : null;
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

// ====== HUB (pipeline) ======
function renderHub() {
  const box = $('#pipeline');
  box.innerHTML = '';
  const tpl = $('#tpl-stage');

  Object.values(SUBJECTS).forEach((subj, i) => {
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.style.setProperty('--sc', subj.accent);
    node.style.setProperty('--i', i);
    node.dataset.key = subj.key;

    const btn = $('.node', node);
    btn.textContent = subj.icon;
    btn.setAttribute('aria-label', `Open ${subj.name}`);
    btn.addEventListener('click', () => goSubject(subj.key));

    $('.stage-name', node).textContent = subj.name;

    const status = $('.stage-status', node);
    if (subj.items.length) {
      status.classList.add('ready');
      status.innerHTML = `<span class="dot"></span>${subj.items.length} artifact${subj.items.length === 1 ? '' : 's'}`;
    } else {
      status.classList.add('queued');
      status.innerHTML = `<span class="dot"></span>queued`;
    }
    box.appendChild(node);
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
    el.onclick = () => { state.tag = state.tag === value ? null : value; renderLibrary(); syncHash(); };
    return el;
  };
  box.appendChild(make('All', null));
  allTags.forEach(t => box.appendChild(make(t, t)));
}

function cardFrom(item) {
  const tpl = $('#tpl-card');
  const node = tpl.content.firstElementChild.cloneNode(true);
  node.dataset.id = item.id;
  node.style.setProperty('--sc', currentSubject().accent);

  const cover = $('.cover', node);
  const badge = $('.format-badge', cover);
  if (item.coverUrl) {
    const img = document.createElement('img');
    img.src = item.coverUrl;
    img.alt = item.title;
    img.loading = 'lazy';
    cover.innerHTML = '';
    cover.appendChild(img);
  } else {
    cover.textContent = item.coverEmoji || currentSubject().icon;
  }
  if (badge) cover.appendChild(badge);

  badge.textContent = item.format || '';
  const metaText = [item.author, item.year ? `• ${item.year}` : ''].filter(Boolean).join(' ');
  $('.title', node).textContent = item.title;
  $('.meta', node).innerHTML = metaText ? `<span>${metaText}</span>` : '';
  $('.btn-read', node).href = item.url;
  $('[data-action="info"]', node).onclick = () => openModal(item);
  return node;
}

function renderLibrary() {
  const subj = currentSubject();
  if (!subj) return;

  $('#introIcon').textContent = subj.icon;
  $('#introName').textContent = subj.name;
  $('#introTagline').textContent = subj.tagline;
  $('#crumbIcon').textContent = subj.icon;
  $('#crumbName').textContent = subj.name;

  const badge = $('#introStatus');
  if (subj.items.length) {
    badge.className = 'status-pill ready';
    badge.innerHTML = `<span class="dot"></span>passing · ${subj.items.length} artifact${subj.items.length === 1 ? '' : 's'}`;
  } else {
    badge.className = 'status-pill queued';
    badge.innerHTML = `<span class="dot"></span>queued · nothing built yet`;
  }

  renderTags(subj.items);

  const grid = $('#grid');
  grid.innerHTML = '';
  const list = subj.items.filter(matches).sort(sorters[state.sort] || sorters.recent);

  if (!subj.items.length) {
    grid.appendChild(emptyState(subj.icon, 'No materials here yet', `New ${subj.name} resources are on the way.`));
    return;
  }
  if (!list.length) {
    grid.appendChild(emptyState('🔎', 'Nothing found', 'Try a different search term or clear the filters.'));
    return;
  }
  list.forEach(item => grid.appendChild(cardFrom(item)));
}

function emptyState(icon, title, body) {
  const el = document.createElement('div');
  el.className = 'empty-state';
  el.innerHTML = `<div class="ic">${icon}</div><strong>${title}</strong>${body}`;
  return el;
}

// ====== view switching ======
function applyAccent(subj) {
  if (subj) {
    document.body.style.setProperty('--accent', subj.accent);
  } else {
    document.body.style.removeProperty('--accent');
  }
}

function render(push = false) {
  const inSubject = !!state.subject;
  $('#hubView').hidden = inSubject;
  $('#libraryView').hidden = !inSubject;
  $('#crumb').hidden = !inSubject;
  $('#libraryControls').hidden = !inSubject;
  $('#tags').style.display = inSubject ? '' : 'none';

  applyAccent(currentSubject());

  if (inSubject) {
    $('#q').value = state.q;
    $('#sort').value = state.sort;
    renderLibrary();
  } else {
    renderHub();
  }
  syncHash(push);
}

function goHub() {
  state.subject = null; state.q = ''; state.tag = null; state.sort = 'recent';
  render(true);
}
function goSubject(key) {
  if (!SUBJECTS[key]) return;
  state.subject = key; state.q = ''; state.tag = null; state.sort = 'recent';
  render(true);
}

// ====== modal ======
function openModal(item) {
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
    coverBox.textContent = item.coverEmoji || (currentSubject() ? currentSubject().icon : '📖');
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
$('#brandBtn').addEventListener('click', goHub);
$('#backBtn').addEventListener('click', goHub);
$('#q').addEventListener('input', (e) => { state.q = e.target.value; renderLibrary(); syncHash(); });
$('#sort').addEventListener('change', (e) => { state.sort = e.target.value; renderLibrary(); syncHash(); });
$('#clearBtn').addEventListener('click', () => {
  state.q = ''; $('#q').value = ''; state.tag = null; state.sort = 'recent'; $('#sort').value = 'recent';
  renderLibrary(); syncHash();
});

// ====== hash routing ======
function syncHash(push = false) {
  const params = new URLSearchParams();
  if (state.subject) params.set('subject', state.subject);
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
  const subj = p.get('subject');
  state.subject = SUBJECTS[subj] ? subj : null;
  state.q = p.get('q') || '';
  state.tag = p.get('tag');
  state.sort = p.get('sort') || 'recent';
}
addEventListener('hashchange', () => { readHash(); render(); });

// ====== init ======
$('#year').textContent = new Date().getFullYear();
readHash();
render();