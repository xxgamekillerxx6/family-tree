// RENDERER: everything you see and click. Plain JavaScript, no framework.

// ===== 1. DATA =====
// The whole tree is just this object. It is saved to disk as JSON after every change.
// person: { id, x, y, first, last, birth, death, desc, photo, color, ports: { left, right } }
// link:   { from: { id, side, index }, to: { id, side, index } }
let data = { people: [], links: [] };

// Where we are looking: pan offset (in screen pixels) and zoom level.
const view = { x: 0, y: 0, zoom: 1 };

const viewport = document.getElementById('viewport');
const world = document.getElementById('world');
const svg = document.getElementById('lines');
const editor = document.getElementById('editor');
const form = editor.querySelector('form');

const findPerson = (id) => data.people.find((p) => p.id === id);
const fullName = (p) => `${p.first} ${p.last}`.trim() || 'Unnamed';
const dates = (p) => (p.birth || p.death ? `${p.birth || '?'} – ${p.death || ''}` : '');
const save = () => window.api.save(data);

// Turns text into safe HTML (so a name like "<b>" shows as text instead of breaking the page).
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// ===== 2. PAN & ZOOM =====
function applyView() {
  world.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`;
  // Move/scale the background grid so it follows the cards.
  const size = 40 * view.zoom;
  viewport.style.backgroundSize = `${size}px ${size}px`;
  viewport.style.backgroundPosition = `${view.x}px ${view.y}px`;
}

// Screen position (mouse) -> position inside the world (where cards live).
function toWorld(clientX, clientY) {
  const r = viewport.getBoundingClientRect();
  return { x: (clientX - r.left - view.x) / view.zoom, y: (clientY - r.top - view.y) / view.zoom };
}

viewport.addEventListener('wheel', (e) => {
  e.preventDefault();
  const r = viewport.getBoundingClientRect();
  const mx = e.clientX - r.left;
  const my = e.clientY - r.top;
  const zoom = Math.min(3, Math.max(0.15, view.zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1)));
  // Keep the spot under the mouse in the same place while zooming.
  view.x = mx - ((mx - view.x) * zoom) / view.zoom;
  view.y = my - ((my - view.y) * zoom) / view.zoom;
  view.zoom = zoom;
  applyView();
}, { passive: false });

// ===== 3. CARDS =====
function makeCard(p) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.id = p.id;
  card.style.left = p.x + 'px';
  card.style.top = p.y + 'px';
  card.style.setProperty('--arm', p.color);

  const ports = (side) =>
    Array.from({ length: p.ports[side] }, (_, i) => `<div class="port" data-side="${side}" data-index="${i}"></div>`).join('') +
    `<button class="add-port" data-side="${side}" title="Add connection point">+</button>`;

  card.innerHTML = `
    ${p.photo ? `<img class="photo" src="${p.photo}">` : ''}
    <div class="name">${esc(fullName(p))}</div>
    <div class="dates">${esc(dates(p))}</div>
    ${p.desc ? `<div class="desc">${esc(p.desc)}</div>` : ''}
    <div class="ports left">${ports('left')}</div>
    <div class="ports right">${ports('right')}</div>`;
  return card;
}

// Redraw everything from `data`. Simple: throw away the old cards and build new ones.
function render() {
  world.querySelectorAll('.card').forEach((c) => c.remove());
  data.people.forEach((p) => world.appendChild(makeCard(p)));
  drawLines();
}

function addPerson() {
  const r = viewport.getBoundingClientRect();
  const center = toWorld(r.left + r.width / 2, r.top + r.height / 2);
  const p = {
    id: crypto.randomUUID(),
    x: Math.round(center.x - 100),
    y: Math.round(center.y - 60),
    first: '', last: '', birth: '', death: '', desc: '', photo: '',
    color: '#2f6fde',
    ports: { left: 1, right: 1 },
  };
  data.people.push(p);
  render();
  save();
  openEditor(p);
}

// ===== 4. LINES =====
// Center of a connection dot, in world coordinates.
function portPos({ id, side, index }) {
  const el = world.querySelector(`.card[data-id="${id}"] .port[data-side="${side}"][data-index="${index}"]`);
  const r = el.getBoundingClientRect();
  return toWorld(r.left + r.width / 2, r.top + r.height / 2);
}

// A smooth "S" curve that leaves each dot sideways (left dots go left, right dots go right).
function curve(a, aSide, b, bSide) {
  const bend = Math.max(50, Math.abs(b.x - a.x) / 2);
  const ax = a.x + (aSide === 'right' ? bend : -bend);
  const bx = bSide ? b.x + (bSide === 'right' ? bend : -bend) : b.x;
  return `M${a.x},${a.y} C${ax},${a.y} ${bx},${b.y} ${b.x},${b.y}`;
}

// `temp` is the line you are currently dragging (or null).
// (fill and stroke-width are written on each line, not in CSS, so they also show up in the exported picture.)
function drawLines(temp = null) {
  svg.innerHTML = data.links.map((l, i) => {
    const color = findPerson(l.from.id).color;
    return `<path data-index="${i}" fill="none" stroke-width="3" stroke="${color}" d="${curve(portPos(l.from), l.from.side, portPos(l.to), l.to.side)}"/>`;
  }).join('');
  if (temp) {
    const color = findPerson(temp.from.id).color;
    svg.innerHTML += `<path class="temp" fill="none" stroke-width="3" stroke="${color}" d="${curve(portPos(temp.from), temp.from.side, temp.to)}"/>`;
  }
}

const portInfo = (el) => ({
  id: el.closest('.card').dataset.id,
  side: el.dataset.side,
  index: Number(el.dataset.index),
});

// ===== 5. MOUSE: drag the grid, drag a card, or drag a new line =====
let drag = null;

viewport.addEventListener('mousedown', (e) => {
  if (e.button !== 0 || e.target.closest('.add-port') || e.target.closest('path')) return;
  const port = e.target.closest('.port');
  const card = e.target.closest('.card');
  const start = { startX: e.clientX, startY: e.clientY };

  if (port) {
    drag = { type: 'link', from: portInfo(port), ...start };
  } else if (card) {
    const p = findPerson(card.dataset.id);
    drag = { type: 'card', person: p, el: card, x0: p.x, y0: p.y, ...start };
  } else {
    drag = { type: 'pan', x0: view.x, y0: view.y, ...start };
  }
});

window.addEventListener('mousemove', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.startX;
  const dy = e.clientY - drag.startY;

  if (drag.type === 'pan') {
    view.x = drag.x0 + dx;
    view.y = drag.y0 + dy;
    applyView();
  } else if (drag.type === 'card') {
    drag.person.x = Math.round(drag.x0 + dx / view.zoom);
    drag.person.y = Math.round(drag.y0 + dy / view.zoom);
    drag.el.style.left = drag.person.x + 'px';
    drag.el.style.top = drag.person.y + 'px';
    drawLines();
  } else if (drag.type === 'link') {
    drawLines({ from: drag.from, to: toWorld(e.clientX, e.clientY) });
  }
});

window.addEventListener('mouseup', (e) => {
  if (!drag) return;
  if (drag.type === 'link') {
    const target = e.target.closest('.port');
    if (target) {
      const to = portInfo(target);
      if (to.id !== drag.from.id) {
        data.links.push({ from: drag.from, to });
        save();
      }
    }
    drawLines();
  } else if (drag.type === 'card') {
    save();
  }
  drag = null;
});

// "+" adds a connection point on that side of the card.
viewport.addEventListener('click', (e) => {
  const btn = e.target.closest('.add-port');
  if (btn) {
    findPerson(btn.closest('.card').dataset.id).ports[btn.dataset.side]++;
    render();
    save();
  }
});

// Clicking a line deletes it (after asking).
svg.addEventListener('click', (e) => {
  const path = e.target.closest('path');
  if (path && confirm('Delete this connection?')) {
    data.links.splice(Number(path.dataset.index), 1);
    drawLines();
    save();
  }
});

viewport.addEventListener('dblclick', (e) => {
  const card = e.target.closest('.card');
  if (card && !e.target.closest('.ports')) openEditor(findPerson(card.dataset.id));
});

// ===== 6. EDIT POPUP =====
let editing = null;      // the person being edited
let editingPhoto = '';   // their photo while the popup is open
const photoPreview = document.getElementById('photo-preview');

function openEditor(p) {
  editing = p;
  editingPhoto = p.photo;
  for (const field of ['first', 'last', 'birth', 'death', 'desc', 'color']) form[field].value = p[field];
  photoPreview.src = p.photo;
  document.getElementById('photo-input').value = '';
  editor.returnValue = '';
  editor.showModal();
}

// Shrink the chosen picture to max 300px so the save file stays small.
function readPhoto(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 300 / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = URL.createObjectURL(file);
  });
}

document.getElementById('photo-input').addEventListener('change', async (e) => {
  if (!e.target.files[0]) return;
  editingPhoto = await readPhoto(e.target.files[0]);
  photoPreview.src = editingPhoto;
});

document.getElementById('remove-photo-btn').addEventListener('click', () => {
  editingPhoto = '';
  photoPreview.src = '';
});

// The popup closes when any of its buttons is pressed; returnValue says which one.
editor.addEventListener('close', () => {
  if (editor.returnValue === 'save') {
    for (const field of ['first', 'last', 'birth', 'death', 'desc', 'color']) editing[field] = form[field].value.trim();
    editing.photo = editingPhoto;
  } else if (editor.returnValue === 'delete') {
    if (!confirm(`Delete ${fullName(editing)} and all their connections?`)) return;
    data.people = data.people.filter((p) => p !== editing);
    data.links = data.links.filter((l) => l.from.id !== editing.id && l.to.id !== editing.id);
  } else {
    return;
  }
  render();
  save();
});

// ===== 7. PEOPLE LIST =====
const listPanel = document.getElementById('list-panel');

function showList() {
  const people = [...data.people].sort((a, b) => fullName(a).localeCompare(fullName(b)));
  document.getElementById('people-list').innerHTML = people.map((p) => {
    const connected = data.links
      .filter((l) => l.from.id === p.id || l.to.id === p.id)
      .map((l) => fullName(findPerson(l.from.id === p.id ? l.to.id : l.from.id)));
    return `<li>
      <b>${esc(fullName(p))}</b> <span class="muted">${esc(dates(p))}</span>
      ${p.desc ? `<div class="muted">${esc(p.desc)}</div>` : ''}
      <div>Connected to: ${connected.length ? esc(connected.join(', ')) : '—'}</div>
    </li>`;
  }).join('');
  listPanel.hidden = false;
}

document.getElementById('list-btn').addEventListener('click', showList);
document.getElementById('close-list-btn').addEventListener('click', () => (listPanel.hidden = true));
document.getElementById('print-list-btn').addEventListener('click', () => window.print());

// ===== 8. EXPORT PICTURE =====
// Find the box around all cards, then let html-to-image draw that area into a PNG.
async function exportPicture() {
  if (!data.people.length) return alert('Add some people first.');
  const cards = [...world.querySelectorAll('.card')];
  const pad = 60;
  const minX = Math.min(...data.people.map((p) => p.x)) - pad;
  const minY = Math.min(...data.people.map((p) => p.y)) - pad;
  const maxX = Math.max(...cards.map((c) => c.offsetLeft + c.offsetWidth)) + pad;
  const maxY = Math.max(...cards.map((c) => c.offsetTop + c.offsetHeight)) + pad;

  const png = await htmlToImage.toPng(world, {
    width: maxX - minX,
    height: maxY - minY,
    backgroundColor: '#ffffff',
    pixelRatio: 2, // double resolution so it prints sharp
    style: { transform: `translate(${-minX}px, ${-minY}px)` },
    filter: (node) => !node.classList?.contains('add-port'), // leave the "+" buttons out
  });

  // Clicking a download link makes Electron show a "Save as" window.
  const a = document.createElement('a');
  a.href = png;
  a.download = 'family-tree.png';
  a.click();
}

document.getElementById('export-btn').addEventListener('click', exportPicture);
document.getElementById('add-btn').addEventListener('click', addPerson);

// ===== 9. START =====
(async () => {
  data = (await window.api.load()) || data;
  applyView();
  render();
})();
