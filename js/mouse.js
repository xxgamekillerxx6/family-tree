// ===== 5. MOUSE: drag the grid, drag a card, or drag a new line =====
let drag = null;

viewport.addEventListener('mousedown', (e) => {
  if (e.button !== 0 || e.target.closest('.add-port, path')) return;
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
    if (target && portInfo(target).id !== drag.from.id) {
      data.links.push({ from: drag.from, to: portInfo(target) });
      save();
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
  if (!btn) return;
  findPerson(btn.closest('.card').dataset.id).ports[btn.dataset.side]++;
  render();
  save();
});

// Right-click deletes: a line (the dots stay), or a dot together with its lines.
viewport.addEventListener('contextmenu', (e) => {
  const path = e.target.closest('path');
  const port = e.target.closest('.port');
  if (!path && !port) return;
  e.preventDefault();

  if (path) {
    data.links.splice(Number(path.dataset.index), 1);
    drawLines();
    save();
    return;
  }

  // Lines remember their dot by number, so lines on dots below it move up one number too.
  const dot = portInfo(port);
  const sameSide = (end) => end.id === dot.id && end.side === dot.side;
  const isDot = (end) => sameSide(end) && end.index === dot.index;

  data.links = data.links.filter((l) => !isDot(l.from) && !isDot(l.to));
  data.links.forEach((l) => [l.from, l.to].forEach((end) => {
    if (sameSide(end) && end.index > dot.index) end.index--;
  }));
  findPerson(dot.id).ports[dot.side]--;
  render();
  save();
});

// Double-click a card to edit it.
viewport.addEventListener('dblclick', (e) => {
  const card = e.target.closest('.card');
  if (card && !e.target.closest('.ports')) openEditor(findPerson(card.dataset.id));
});
