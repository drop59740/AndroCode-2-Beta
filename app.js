// Навигация по экранам
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

document.addEventListener('click', e => {
  const nav = e.target.closest('[data-go]');
  if (nav) { show(nav.dataset.go); return; }

  const toast = e.target.closest('[data-toast]');
  if (toast) { alert(toast.dataset.toast); return; }

  const add = e.target.closest('[data-add-block]');
  if (add) { addBlock(); return; }

  const kb = e.target.closest('[data-kb]');
  if (kb) { kbPress(kb.dataset.kb); return; }
});

// Создание проекта
document.getElementById('btn-create-project').addEventListener('click', () => {
  const name = document.getElementById('new-project-name').value.trim() || 'project';
  const list = document.getElementById('project-list');
  const card = document.createElement('div');
  card.className = 'project-card';
  card.dataset.go = 'project';
  card.innerHTML =
    '<img class="thumb app-icon" src="icon.svg" alt="">' +
    '<div><div class="name outline-green">' + name.toUpperCase() + '</div>' +
    '<div class="meta">только что создан · блоков: 0</div></div>';
  list.prepend(card);
  document.getElementById('modal-create').classList.remove('open');
  show('projects');
});

// Клавиатура
const input = document.getElementById('kb-input');
function kbPress(k) {
  if (k === 'back') input.value = input.value.slice(0, -1);
  else if (k === 'ДА' || k === 'ОК') show('editor');
  else if (k === 'ТЕКСТ') input.value = '';
  else input.value += k;
}

// Добавление блока в редактор
function addBlock() {
  const b = document.createElement('div');
  b.className = 'block';
  b.style.left = (10 + Math.random() * 40) + '%';
  b.style.top = (10 + Math.random() * 50) + '%';
  b.innerHTML = 'new block<div class="ports">' +
    '<div><div class="port"></div><div class="port-label">in</div></div>' +
    '<div><div class="port out"></div><div class="port-label">out</div></div></div>';
  makeDraggable(b);
  document.getElementById('canvas').appendChild(b);
}

// Перетаскивание блоков
function makeDraggable(el) {
  let sx = 0, sy = 0, ox = 0, oy = 0, drag = false;
  el.addEventListener('pointerdown', e => {
    drag = true;
    sx = e.clientX; sy = e.clientY;
    ox = el.offsetLeft; oy = el.offsetTop;
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointermove', e => {
    if (!drag) return;
    el.style.left = ox + e.clientX - sx + 'px';
    el.style.top = oy + e.clientY - sy + 'px';
  });
  el.addEventListener('pointerup', () => drag = false);
}

document.querySelectorAll('.block').forEach(makeDraggable);
