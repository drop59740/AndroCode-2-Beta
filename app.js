/* ================= AndroCode 2 — прототип ================= */

// ---------- i18n ----------
const I18N = {
  ru: {
    tagline: 'Создавай 2D-игры и приложения прямо на телефоне',
    m_projects: 'Проекты', m_settings: 'Настройки', m_info: 'Информация',
    projects: 'Проекты', import: 'Импорт', create: 'Создать проект',
    search_ph: 'Поиск по названию...', save: 'Сохранить', run: 'Запустить',
    build: 'Собрать APK', palette: 'Палитра блоков', screens: 'Экраны',
    add_screen: 'Экран', components: 'Компоненты экрана', props: 'Свойства',
    build_title: 'Сборка APK', back_editor: 'К редактору',
    build_settings: 'Параметры сборки', apk_name: 'Название APK',
    apk_ver: 'Версия', apk_icon: 'Иконка', do_build: 'Собрать',
    install: 'Установить', share: 'Поделиться', theme: 'Тёмная тема',
    theme_sub: 'Светлая / тёмная палитра', lang: 'Язык',
    grid: 'Размер сетки', grid_sub: 'Шаг сетки редактора',
    vibro: 'Вибрация', vibro_sub: 'Отклик на действия',
    autosave: 'Автосохранение', autosave_sub: 'Сохранять при каждом изменении',
    cache: 'Очистить кэш', cache_sub: 'Удалит локальные данные прототипа',
    clear: 'Очистить', about: 'О приложении', open: 'Открыть',
    back: 'Назад', new_project: 'Новый проект', empty: 'Пустой проект',
    tpl_clicker: 'Шаблон: кликер', tpl_demo: 'Шаблон: демо',
    cancel: 'Отмена', ok: 'ОК', preview: 'Тестовый запуск', close: 'Закрыть',
    site: 'Сайт',
    info_desc: 'Конструктор, в котором ты можешь создать 2D-игру или приложение прямо на своём телефоне. Просто соединяй входы и выходы блоков!'
  },
  en: {
    tagline: 'Build 2D games and apps right on your phone',
    m_projects: 'Projects', m_settings: 'Settings', m_info: 'About',
    projects: 'Projects', import: 'Import', create: 'Create project',
    search_ph: 'Search by name...', save: 'Save', run: 'Run',
    build: 'Build APK', palette: 'Block palette', screens: 'Screens',
    add_screen: 'Screen', components: 'Components', props: 'Properties',
    build_title: 'Build APK', back_editor: 'Back to editor',
    build_settings: 'Build settings', apk_name: 'APK name',
    apk_ver: 'Version', apk_icon: 'Icon', do_build: 'Build',
    install: 'Install', share: 'Share', theme: 'Dark theme',
    theme_sub: 'Light / dark palette', lang: 'Language',
    grid: 'Grid size', grid_sub: 'Editor grid step',
    vibro: 'Vibration', vibro_sub: 'Haptic feedback',
    autosave: 'Autosave', autosave_sub: 'Save on every change',
    cache: 'Clear cache', cache_sub: 'Removes local prototype data',
    clear: 'Clear', about: 'About', open: 'Open',
    back: 'Back', new_project: 'New project', empty: 'Empty project',
    tpl_clicker: 'Template: clicker', tpl_demo: 'Template: demo',
    cancel: 'Cancel', ok: 'OK', preview: 'Test run', close: 'Close',
    site: 'Website',
    info_desc: 'A constructor where you can build a 2D game or an app right on your phone. Just connect block inputs and outputs!'
  }
};

// ---------- Палитра блоков ----------
const CATS = [
  { id: 'events',     name: 'События',    color: '#F2C94C', blocks: ['когда кнопка нажата', 'когда экран открыт', 'когда произошло касание'] },
  { id: 'control',    name: 'Управление', color: '#39E639', blocks: ['если ... то', 'иначе', 'повтор N раз', 'ждать 1 сек'] },
  { id: 'vars',       name: 'Переменные', color: '#8CC63F', blocks: ['создать переменную', 'изменить переменную', 'прочитать переменную'] },
  { id: 'math',       name: 'Математика', color: '#2CA5E0', blocks: ['сложение', 'вычитание', 'умножение', 'случайное число'] },
  { id: 'text',       name: 'Текст',      color: '#C3C36E', blocks: ['соединить текст', 'длина текста', 'кусок текста'] },
  { id: 'components', name: 'Компоненты', color: '#3DA639', blocks: ['кнопка', 'текст', 'картинка'] },
  { id: 'media',      name: 'Медиа',      color: '#2CA5E0', blocks: ['камера', 'звук', 'вибрация'] },
  { id: 'custom',     name: 'Мои функции',color: '#B5B35C', blocks: ['моя процедура'] },
];

// ---------- Состояние ----------
let state = {
  settings: { theme: 'dark', lang: 'ru', grid: 32, vibro: true, autosave: true },
  projects: [],
  current: null,        // id открытого проекта
  view: { x: 0, y: 0, z: 1 },
  sel: { screen: null, comp: null, block: null },
};
let undoStack = [], redoStack = [];

const LS = 'androcode2_state';
function persist() { localStorage.setItem(LS, JSON.stringify({ settings: state.settings, projects: state.projects })); }
function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(LS));
    if (raw) { Object.assign(state.settings, raw.settings || {}); state.projects = raw.projects || []; }
  } catch (e) {}
}
const uid = () => Math.random().toString(36).slice(2, 9);
const vib = (ms = 25) => { if (state.settings.vibro && navigator.vibrate) navigator.vibrate(ms); };

// ---------- Toast ----------
let toastTimer;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

// ---------- Навигация ----------
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
  if (id === 'projects') renderProjects();
  if (id === 'editor') renderEditor();
}

// ---------- Утилиты модалок ----------
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
let promptCb = null;
function openPrompt(title, value, cb) {
  document.getElementById('prompt-title').textContent = title;
  const inp = document.getElementById('prompt-input');
  inp.value = value;
  promptCb = cb;
  openModal('modal-prompt');
  setTimeout(() => { inp.focus(); inp.select(); }, 50);
}

// ---------- Контекстное меню ----------
function openCtx(items, x, y) {
  const ctx = document.getElementById('ctx');
  ctx.innerHTML = '';
  items.forEach(it => {
    const b = document.createElement('div');
    b.className = 'btn' + (it.danger ? ' danger' : '');
    b.textContent = it.label;
    b.onclick = e => { e.stopPropagation(); closeCtx(); it.action(); };
    ctx.appendChild(b);
  });
  ctx.style.left = Math.min(x, innerWidth - 220) + 'px';
  ctx.style.top = Math.min(y, innerHeight - items.length * 48 - 16) + 'px';
  ctx.classList.add('open');
  vib();
}
function closeCtx() { document.getElementById('ctx').classList.remove('open'); }
document.addEventListener('pointerdown', e => { if (!e.target.closest('.ctx')) closeCtx(); });

// ---------- Проекты ----------
function newProject(name, icon, tpl) {
  const p = {
    id: uid(), name: name || 'Мой проект', icon: icon || 'icon.svg',
    created: Date.now(), modified: Date.now(),
    screens: [{ id: uid(), name: 'Экран 1', components: [
      { id: uid(), type: 'Кнопка', props: { text: 'Нажми меня', color: '#3DA639', size: 16 } },
      { id: uid(), type: 'Текст', props: { text: 'Привет, AndroCode!', color: '#39E639', size: 16 } },
    ], blocks: [] }],
  };
  if (tpl === 'clicker') {
    p.screens[0].components = [{ id: uid(), type: 'Кнопка', props: { text: 'Клик!', color: '#3DA639', size: 20 } }];
    p.screens[0].blocks = [
      { id: uid(), x: 60, y: 40, cat: 'events', label: 'когда кнопка нажата', next: null },
      { id: uid(), x: 60, y: 150, cat: 'vars', label: 'изменить переменную: счёт +1', next: null },
      { id: uid(), x: 60, y: 260, cat: 'components', label: 'кнопка: обновить текст', next: null },
    ];
    chain(p.screens[0].blocks);
  } else if (tpl === 'demo') {
    p.screens[0].blocks = [
      { id: uid(), x: 60, y: 40, cat: 'events', label: 'когда экран открыт', next: null },
      { id: uid(), x: 60, y: 150, cat: 'control', label: 'повтор 10 раз', next: null },
      { id: uid(), x: 60, y: 260, cat: 'media', label: 'звук: fanfare', next: null },
    ];
    chain(p.screens[0].blocks);
  }
  return p;
}
function chain(blocks) { for (let i = 0; i < blocks.length - 1; i++) blocks[i].next = blocks[i + 1].id; }

const cur = () => state.projects.find(p => p.id === state.current);
const curScr = () => { const p = cur(); return p && p.screens.find(s => s.id === state.sel.screen); };

function renderProjects() {
  const q = document.getElementById('search').value.trim().toLowerCase();
  const list = document.getElementById('project-list');
  list.innerHTML = '';
  const items = state.projects.filter(p => !q || p.name.toLowerCase().includes(q));
  if (!items.length) {
    list.innerHTML = '<div class="empty-note">проектов пока нет — создай первый!</div>';
    return;
  }
  items.forEach(p => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML =
      '<img class="thumb" src="' + p.icon + '" style="' + (p.iconStyle || '') + '">' +
      '<div><div class="name">' + esc(p.name) + '</div>' +
      '<div class="meta">' + new Date(p.modified).toLocaleDateString() + ' · ' +
      p.screens.length + ' экран(ов) · ' + p.screens.reduce((n, s) => n + s.blocks.length, 0) + ' блоков</div></div>';
    card.onclick = () => openProject(p.id);
    longPress(card, e => projectCtx(p.id, e));
    card.oncontextmenu = e => { e.preventDefault(); projectCtx(p.id, e); };
    list.appendChild(card);
  });
}
function projectCtx(id, e) {
  openCtx([
    { label: '✏️ Переименовать', action: () => {
        const p = state.projects.find(x => x.id === id);
        openPrompt('Переименовать проект', p.name, v => { p.name = v || p.name; p.modified = Date.now(); save(); renderProjects(); });
      } },
    { label: '📄 Дублировать', action: () => {
        const p = state.projects.find(x => x.id === id);
        const copy = JSON.parse(JSON.stringify(p));
        copy.id = uid(); copy.name = p.name + ' (копия)'; copy.created = copy.modified = Date.now();
        state.projects.unshift(copy); save(); renderProjects(); toast('Проект дублирован');
      } },
    { label: '🗑 Удалить', danger: true, action: () => {
        state.projects = state.projects.filter(x => x.id !== id);
        save(); renderProjects(); toast('Проект удалён');
      } },
  ], e.clientX, e.clientY);
}
function longPress(el, fn) {
  let timer = null, sx = 0, sy = 0;
  el.addEventListener('pointerdown', e => {
    sx = e.clientX; sy = e.clientY;
    timer = setTimeout(() => { timer = null; fn(e); }, 500);
  });
  el.addEventListener('pointermove', e => {
    if (timer && Math.hypot(e.clientX - sx, e.clientY - sy) > 10) { clearTimeout(timer); timer = null; }
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev =>
    el.addEventListener(ev, () => { if (timer) { clearTimeout(timer); timer = null; } }));
}
function save() {
  const p = cur(); if (p) p.modified = Date.now();
  persist();
  if (state.settings.autosave) toast('Сохранено');
}

// ---------- Создание проекта ----------
document.getElementById('btn-create-project').onclick = () => {
  const name = document.getElementById('new-project-name').value.trim() || 'Мой проект';
  const icon = document.querySelector('#create-icons .sel').dataset.icon;
  const iconStyle = document.querySelector('#create-icons .sel').getAttribute('style') || '';
  const tpl = document.querySelector('#create-type .on').dataset.tpl;
  const p = newProject(name, icon, tpl);
  if (iconStyle) p.iconStyle = iconStyle;
  state.projects.unshift(p);
  save();
  closeModal('modal-create');
  openProject(p.id);
};

// иконки / шаблоны — переключатели
document.querySelectorAll('#create-icons img, #apk-icons img').forEach(img => {
  img.onclick = () => {
    img.parentElement.querySelectorAll('img').forEach(i => i.classList.remove('sel'));
    img.classList.add('sel');
  };
});
document.querySelectorAll('#create-type .btn').forEach(b => {
  b.onclick = () => {
    b.parentElement.querySelectorAll('.btn').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
  };
});

// ---------- Импорт ----------
document.querySelector('[data-import]').onclick = () => document.getElementById('import-file').click();
document.getElementById('import-file').onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const data = JSON.parse(r.result);
      const p = data.screens ? data : newProject(data.name || f.name.replace('.json', ''), 'icon.svg', 'empty');
      p.id = uid();
      state.projects.unshift(p); save(); renderProjects(); toast('Проект импортирован');
    } catch (err) { toast('Ошибка: это не файл проекта'); }
  };
  r.readAsText(f);
  e.target.value = '';
};

// ---------- Редактор ----------
function openProject(id) {
  state.current = id;
  const p = cur();
  state.sel = { screen: p.screens[0].id, comp: null, block: null };
  state.view = { x: 0, y: 0, z: 1 };
  undoStack = []; redoStack = [];
  show('editor');
}

function snapshot() {
  undoStack.push(JSON.stringify(cur()));
  if (undoStack.length > 50) undoStack.shift();
  redoStack = [];
}
function undo() {
  if (!undoStack.length) return toast('Нечего отменять');
  redoStack.push(JSON.stringify(cur()));
  Object.assign(cur(), JSON.parse(undoStack.pop()));
  renderEditor(); toast('Отменено');
}
function redo() {
  if (!redoStack.length) return toast('Нечего возвращать');
  undoStack.push(JSON.stringify(cur()));
  Object.assign(cur(), JSON.parse(redoStack.pop()));
  renderEditor(); toast('Возвращено');
}

function renderEditor() {
  const p = cur(); if (!p) return show('projects');
  document.getElementById('editor-pname').value = p.name;
  renderPalette();
  renderCanvas();
  renderInspector();
}

// Палитра
function renderPalette() {
  const pal = document.getElementById('palette');
  pal.querySelectorAll('.cat').forEach(c => c.remove());
  CATS.forEach(cat => {
    const el = document.createElement('div');
    el.className = 'cat';
    el.innerHTML =
      '<div class="cat-head"><span><i class="dot" style="background:' + cat.color + '"></i>' + cat.name + '</span><span class="arr">&#9654;</span></div>' +
      '<div class="cat-items"></div>';
    el.querySelector('.cat-head').onclick = () => el.classList.toggle('open');
    const items = el.querySelector('.cat-items');
    cat.blocks.forEach(label => {
      const t = document.createElement('div');
      t.className = 'tpl';
      t.textContent = label;
      t.onclick = () => addBlockFromTpl(cat.id, label);
      items.appendChild(t);
    });
    pal.appendChild(el);
  });
}

function addBlockFromTpl(catId, label) {
  snapshot(); vib();
  const s = curScr();
  const v = state.view;
  const b = { id: uid(), x: (80 - v.x) / v.z, y: (80 - v.y) / v.z, cat: catId, label, next: null };
  s.blocks.push(b);
  renderCanvas();
  if (state.settings.autosave) persist();
  toast('Блок добавлен: ' + label);
}

// Холст
function renderCanvas() {
  const inner = document.getElementById('canvas-inner');
  const svg = document.getElementById('links');
  inner.querySelectorAll('.block').forEach(b => b.remove());
  svg.innerHTML = '';
  const s = curScr(); if (!s) return;

  s.blocks.forEach(b => {
    const el = document.createElement('div');
    el.className = 'block' + (state.sel.block === b.id ? ' sel' : '');
    el.style.left = b.x + 'px';
    el.style.top = b.y + 'px';
    el.dataset.id = b.id;
    const cat = CATS.find(c => c.id === b.cat);
    el.innerHTML = '<div class="bcat">' + (cat ? cat.name : '') + '</div>' + esc(b.label) +
      '<div class="ports"><div><div class="port"></div><div class="port-label" style="font-size:10px;color:var(--text-dim)">in</div></div>' +
      '<div><div class="port out"></div><div class="port-label" style="font-size:10px;color:var(--text-dim)">out</div></div></div>';
    inner.appendChild(el);
    dragBlock(el, b);
  });

  // связи
  const w = inner.querySelector.bind(inner);
  s.blocks.forEach(b => {
    if (!b.next) return;
    const a = w('[data-id="' + b.id + '"]'), c = w('[data-id="' + b.next + '"]');
    if (!a || !c) return;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', 2000 + a.offsetLeft + a.offsetWidth / 2);
    line.setAttribute('y1', 2000 + a.offsetTop + a.offsetHeight - 6);
    line.setAttribute('x2', 2000 + c.offsetLeft + c.offsetWidth / 2);
    line.setAttribute('y2', 2000 + c.offsetTop + 6);
    svg.appendChild(line);
  });

  applyView();
}
function applyView() {
  const v = state.view;
  document.getElementById('canvas-inner').style.transform =
    'translate(' + v.x + 'px,' + v.y + 'px) scale(' + v.z + ')';
}

// Перетаскивание блока + магнитный прилип
function dragBlock(el, b) {
  let sx, sy, ox, oy, moved = false, lp = null, target = null;
  el.addEventListener('pointerdown', e => {
    e.stopPropagation();
    moved = false;
    sx = e.clientX; sy = e.clientY;
    ox = b.x; oy = b.y;
    el.setPointerCapture(e.pointerId);
    state.sel.block = b.id;
    lp = setTimeout(() => { lp = null; blockCtx(b, e.clientX, e.clientY); }, 550);
  });
  el.addEventListener('pointermove', e => {
    if (sx === undefined) return;
    if (!moved && Math.hypot(e.clientX - sx, e.clientY - sy) > 8) {
      moved = true;
      if (lp) { clearTimeout(lp); lp = null; }
      snapshot();
    }
    if (!moved) return;
    const v = state.view;
    b.x = ox + (e.clientX - sx) / v.z;
    b.y = oy + (e.clientY - sy) / v.z;
    // магнитный прилип
    target = findSnap(b);
    document.querySelectorAll('.block').forEach(x => x.classList.remove('snap-target'));
    if (target) {
      const te = document.querySelector('[data-id="' + target.id + '"]');
      if (te) te.classList.add('snap-target');
      b.x = target.x; b.y = target.y + target.h;
    }
    el.style.left = b.x + 'px';
    el.style.top = b.y + 'px';
    renderLinks();
  });
  el.addEventListener('pointerup', () => {
    if (lp) { clearTimeout(lp); lp = null; }
    document.querySelectorAll('.block').forEach(x => x.classList.remove('snap-target'));
    if (moved) {
      const s = curScr();
      s.blocks.forEach(x => { if (x.next === b.id) x.next = null; });
      if (target) {
        const parent = s.blocks.find(x => x.id === target.id);
        if (parent) parent.next = b.id;
        vib(40);
        toast('Блок подключён');
      }
      renderCanvas();
      if (state.settings.autosave) persist();
    }
    sx = undefined;
  });
}
function findSnap(b) {
  const s = curScr();
  const el = document.querySelector('[data-id="' + b.id + '"]');
  const h = el ? el.offsetHeight : 90;
  let best = null;
  s.blocks.forEach(o => {
    if (o.id === b.id) return;
    const oel = document.querySelector('[data-id="' + o.id + '"]');
    const oh = oel ? oel.offsetHeight : 90;
    if (Math.abs(o.x - b.x) < 70 && Math.abs(o.y + oh + 14 - b.y) < 50) {
      if (!best || Math.abs(o.y + oh + 14 - b.y) < best.d) best = { id: o.id, x: o.x, y: o.y, h: oh, d: Math.abs(o.y + oh + 14 - b.y) };
    }
  });
  return best;
}
function renderLinks() {
  const inner = document.getElementById('canvas-inner');
  const svg = document.getElementById('links');
  svg.innerHTML = '';
  const s = curScr(); if (!s) return;
  s.blocks.forEach(b => {
    if (!b.next) return;
    const a = inner.querySelector('[data-id="' + b.id + '"]'), c = inner.querySelector('[data-id="' + b.next + '"]');
    if (!a || !c) return;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', 2000 + a.offsetLeft + a.offsetWidth / 2);
    line.setAttribute('y1', 2000 + a.offsetTop + a.offsetHeight - 6);
    line.setAttribute('x2', 2000 + c.offsetLeft + c.offsetWidth / 2);
    line.setAttribute('y2', 2000 + c.offsetTop + 6);
    svg.appendChild(line);
  });
}
function blockCtx(b, x, y) {
  openCtx([
    { label: '📄 Копировать', action: () => {
        snapshot();
        const s = curScr();
        const copy = JSON.parse(JSON.stringify(b));
        copy.id = uid(); copy.x += 30; copy.y += 30; copy.next = null;
        s.blocks.push(copy);
        renderCanvas(); persist();
        toast('Блок скопирован');
      } },
    { label: '🗑 Удалить', danger: true, action: () => {
        snapshot();
        const s = curScr();
        s.blocks = s.blocks.filter(x => x.id !== b.id && x.next !== b.id);
        state.sel.block = null;
        renderCanvas(); persist();
        toast('Блок удалён');
      } },
  ], x, y);
}

// Зум / панорама
const wrap = document.getElementById('canvas-wrap');
wrap.addEventListener('wheel', e => {
  e.preventDefault();
  const v = state.view;
  const k = e.deltaY < 0 ? 1.12 : 1 / 1.12;
  const nz = Math.min(2.5, Math.max(0.3, v.z * k));
  const r = wrap.getBoundingClientRect();
  const mx = e.clientX - r.left, my = e.clientY - r.top;
  v.x = mx - (mx - v.x) * (nz / v.z);
  v.y = my - (my - v.y) * (nz / v.z);
  v.z = nz;
  applyView();
}, { passive: false });

let pan = null, pinch = null;
wrap.addEventListener('pointerdown', e => {
  if (e.target.closest('.block') || e.target.closest('.btn')) return;
  pan = { x: e.clientX, y: e.clientY, vx: state.view.x, vy: state.view.y };
  wrap.setPointerCapture(e.pointerId);
});
wrap.addEventListener('pointermove', e => {
  if (pan) {
    state.view.x = pan.vx + e.clientX - pan.x;
    state.view.y = pan.vy + e.clientY - pan.y;
    applyView();
  }
});
['pointerup', 'pointercancel'].forEach(ev => wrap.addEventListener(ev, () => pan = null));

// Правая панель
function renderInspector() {
  const p = cur(); if (!p) return;
  const sl = document.getElementById('screens-list');
  sl.innerHTML = '';
  p.screens.forEach(s => {
    const el = document.createElement('div');
    el.className = 'scr-item' + (state.sel.screen === s.id ? ' on' : '');
    el.innerHTML = '<span>' + esc(s.name) + '</span><span style="color:var(--text-dim);font-size:11px">' + s.blocks.length + ' бл.</span>';
    el.onclick = () => { state.sel.screen = s.id; state.sel.comp = null; state.sel.block = null; renderEditor(); };
    longPress(el, e => screenCtx(s, e));
    el.oncontextmenu = e => { e.preventDefault(); screenCtx(s, e); };
    sl.appendChild(el);
  });

  const s = curScr();
  const cl = document.getElementById('components-list');
  cl.innerHTML = '';
  s.components.forEach(c => {
    const el = document.createElement('div');
    el.className = 'comp-item' + (state.sel.comp === c.id ? ' on' : '');
    el.innerHTML = '<span>' + iconFor(c.type) + ' ' + esc(c.props.text || c.type) + '</span>';
    el.onclick = () => { state.sel.comp = c.id; renderInspector(); };
    cl.appendChild(el);
  });

  renderProps();
}
function iconFor(t) { return t === 'Кнопка' ? '🔘' : t === 'Текст' ? '🔤' : '🖼'; }
function screenCtx(s, e) {
  openCtx([
    { label: '✏️ Переименовать', action: () => openPrompt('Переименовать экран', s.name, v => { s.name = v || s.name; persist(); renderEditor(); }) },
    { label: '🗑 Удалить', danger: true, action: () => {
        const p = cur();
        if (p.screens.length <= 1) return toast('Нужен хотя бы один экран');
        p.screens = p.screens.filter(x => x.id !== s.id);
        state.sel.screen = p.screens[0].id;
        persist(); renderEditor();
      } },
  ], e.clientX, e.clientY);
}
function renderProps() {
  const s = curScr();
  const form = document.getElementById('prop-form');
  const c = s.components.find(x => x.id === state.sel.comp);
  if (!c) { form.innerHTML = '<div class="empty-note">выбери компонент</div>'; return; }
  form.innerHTML =
    '<label>Текст<input type="text" value="' + esc(c.props.text || '') + '" data-prop="text"></label>' +
    '<label>Цвет<input type="color" value="' + (c.props.color || '#3DA639') + '" data-prop="color"></label>' +
    '<label>Размер (' + c.props.size + ')<input type="range" min="10" max="48" value="' + c.props.size + '" data-prop="size"></label>';
  form.querySelectorAll('[data-prop]').forEach(inp => {
    inp.oninput = () => {
      c.props[inp.dataset.prop] = inp.dataset.prop === 'size' ? +inp.value : inp.value;
      if (inp.dataset.prop === 'size') inp.parentElement.firstChild.textContent = 'Размер (' + inp.value + ')';
      persist();
    };
  });
}

document.querySelector('[data-add-screen]').onclick = () => {
  const p = cur();
  openPrompt('Новый экран', 'Экран ' + (p.screens.length + 1), v => {
    p.screens.push({ id: uid(), name: v || 'Экран', components: [], blocks: [] });
    state.sel.screen = p.screens[p.screens.length - 1].id;
    persist(); renderEditor(); vib();
  });
};
document.querySelectorAll('[data-add-comp]').forEach(b => {
  b.onclick = () => {
    const s = curScr();
    const type = b.dataset.addComp;
    s.components.push({ id: uid(), type, props: { text: type, color: '#3DA639', size: 16 } });
    persist(); renderInspector(); vib();
  };
});

// Кнопки верхней панели
document.getElementById('editor-pname').onchange = e => { cur().name = e.target.value || cur().name; persist(); };
document.querySelector('[data-save]').onclick = () => { save(); vib(); };
document.querySelector('[data-undo]').onclick = undo;
document.querySelector('[data-redo]').onclick = redo;

// Запуск (превью)
document.querySelector('[data-run]').onclick = () => {
  const s = curScr();
  const pv = document.getElementById('run-preview');
  pv.innerHTML = '';
  s.components.forEach(c => {
    if (c.type === 'Кнопка') {
      const b = document.createElement('button');
      b.className = 'pv-btn';
      b.textContent = c.props.text;
      b.style.fontSize = c.props.size + 'px';
      b.onclick = () => { vib(); toast('Кнопка нажата! (прототип)'); };
      pv.appendChild(b);
    } else if (c.type === 'Текст') {
      const t = document.createElement('div');
      t.className = 'pv-text';
      t.textContent = c.props.text;
      t.style.fontSize = c.props.size + 'px';
      t.style.color = c.props.color;
      pv.appendChild(t);
    } else {
      const i = document.createElement('div');
      i.className = 'pv-img';
      i.textContent = '🖼 ' + (c.props.text || 'Картинка');
      pv.appendChild(i);
    }
  });
  if (!s.components.length) pv.innerHTML = '<div class="empty-note">Экран пуст — добавь компоненты</div>';
  openModal('modal-run');
};

// ---------- Сборка ----------
document.querySelector('[data-go="build"]').onclick = () => {
  document.getElementById('apk-name').value = cur() ? cur().name : 'AndroCode App';
};
document.getElementById('btn-build').onclick = () => {
  vib(40);
  const bar = document.getElementById('build-bar');
  const prog = document.getElementById('build-progress');
  const st = document.getElementById('build-status');
  const errs = document.getElementById('build-errors');
  const btnI = document.getElementById('btn-install');
  const btnS = document.getElementById('btn-share');
  errs.innerHTML = '';
  btnI.style.cssText = 'opacity:0.4;pointer-events:none';
  btnS.style.cssText = 'opacity:0.4;pointer-events:none';
  prog.classList.add('on'); st.classList.add('on');
  const steps = ['Компиляция скриптов...', 'Упаковка ресурсов...', 'Генерация манифеста...', 'Подписание APK...'];
  let p = 0;
  const timer = setInterval(() => {
    p += 4 + Math.random() * 8;
    bar.style.width = Math.min(100, p) + '%';
    st.textContent = steps[Math.min(steps.length - 1, Math.floor(p / 28))] + ' ' + Math.floor(Math.min(100, p)) + '%';
    if (p >= 100) {
      clearInterval(timer);
      st.textContent = 'Готово: ' + document.getElementById('apk-name').value + '-' +
        document.getElementById('apk-version').value + '.apk';
      btnI.style.cssText = ''; btnS.style.cssText = '';
      toast('Сборка завершена!');
      // случайные замечания-ошибки для демо
      const s = curScr();
      if (s && s.blocks.length && Math.random() < 0.5) {
        const b = s.blocks[s.blocks.length - 1];
        const e = document.createElement('div');
        e.className = 'error-item';
        e.textContent = '⚠ Блок «' + b.label + '» не подключён к событию — нажми, чтобы перейти';
        e.onclick = () => { show('editor'); state.sel.block = b.id; renderCanvas(); };
        errs.appendChild(e);
      }
    }
  }, 120);
  vib();
};
document.getElementById('btn-install').onclick = () => toast('Установка на устройство (в прототипе — демо)');
document.getElementById('btn-share').onclick = async () => {
  if (navigator.share) { try { await navigator.share({ title: 'Моё приложение AndroCode' }); } catch (e) {} }
  else toast('Ссылка на APK скопирована (демо)');
};

// ---------- Настройки ----------
function applySettings() {
  document.body.dataset.theme = state.settings.theme;
  document.documentElement.style.setProperty('--grid', state.settings.grid + 'px');
  document.getElementById('set-theme').checked = state.settings.theme === 'dark';
  document.getElementById('set-lang').value = state.settings.lang;
  document.getElementById('set-grid').value = state.settings.grid;
  document.getElementById('set-grid-val').textContent = state.settings.grid;
  document.getElementById('set-vibro').checked = state.settings.vibro;
  document.getElementById('set-autosave').checked = state.settings.autosave;
  applyLang();
}
function applyLang() {
  const d = I18N[state.settings.lang];
  document.querySelectorAll('[data-i18n]').forEach(el => { if (d[el.dataset.i18n]) el.textContent = d[el.dataset.i18n]; });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { if (d[el.dataset.i18nPh]) el.placeholder = d[el.dataset.i18nPh]; });
}
document.getElementById('set-theme').onchange = e => { state.settings.theme = e.target.checked ? 'dark' : 'light'; persist(); applySettings(); };
document.getElementById('set-lang').onchange = e => { state.settings.lang = e.target.value; persist(); applySettings(); };
document.getElementById('set-grid').oninput = e => {
  state.settings.grid = +e.target.value;
  document.getElementById('set-grid-val').textContent = e.target.value;
  document.documentElement.style.setProperty('--grid', e.target.value + 'px');
  persist();
};
document.getElementById('set-vibro').onchange = e => { state.settings.vibro = e.target.checked; persist(); vib(); };
document.getElementById('set-autosave').onchange = e => { state.settings.autosave = e.target.checked; persist(); };
document.getElementById('btn-clear-cache').onclick = () => {
  openCtx([{ label: '🗑 Да, очистить всё', danger: true, action: () => { localStorage.removeItem(LS); location.reload(); } }], innerWidth / 2 - 100, innerHeight / 2);
};

// ---------- Глобальные клики ----------
document.addEventListener('click', e => {
  const nav = e.target.closest('[data-go]');
  if (nav) { vib(); show(nav.dataset.go); return; }
  const t = e.target.closest('[data-toast]');
  if (t) { toast(t.dataset.toast); return; }
  const opener = e.target.closest('[data-open-create]');
  if (opener) { openModal('modal-create'); return; }
  const closer = e.target.closest('[data-close-modal]');
  if (closer) { closer.closest('.modal-overlay').classList.remove('open'); return; }
  if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('open');
});
document.getElementById('prompt-ok').onclick = () => {
  const v = document.getElementById('prompt-input').value;
  closeModal('modal-prompt');
  if (promptCb) { promptCb(v); promptCb = null; }
};
document.getElementById('prompt-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('prompt-ok').click();
});
document.getElementById('search').oninput = renderProjects;

// escape — закрыть меню/модалки
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeCtx(); document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open')); }
});

// ---------- Старт ----------
load();
// демо-проект при первом запуске
if (!state.projects.length) state.projects.push(newProject('Мой проект', 'icon.svg', 'clicker'));
persist();
applySettings();
renderProjects();
