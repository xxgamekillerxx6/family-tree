// ===== 3. CARDS =====
function makeCard(p) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.id = p.id;
  card.style.left = p.x + 'px';
  card.style.top = p.y + 'px';
  card.style.setProperty('--arm', p.color);
  // Grow with the side that has the most dots: 24px per dot (16px dot + 8px gap), +1 for the "+" button.
  card.style.minHeight = (Math.max(p.ports.left, p.ports.right) + 1) * 24 + 16 + 'px';

  const ports = (side) =>
    Array.from({ length: p.ports[side] }, (_, i) => `<div class="port" data-side="${side}" data-index="${i}"></div>`).join('') +
    `<button class="add-port" data-side="${side}" title="${t('Add connection point')}">+</button>`;

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
  openEditor({
    id: crypto.randomUUID(),
    x: Math.round(center.x - 100),
    y: Math.round(center.y - 60),
    first: '', last: '', birth: '', death: '', desc: '', photo: '',
    color: '#2f6fde',
    ports: { left: 1, right: 1 },
  }); // only added to the tree when you press Save
}

document.getElementById('add-btn').addEventListener('click', addPerson);
