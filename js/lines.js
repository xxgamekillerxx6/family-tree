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
  const line = (from, d, extra) =>
    `<path ${extra} fill="none" stroke-width="3" stroke="${findPerson(from.id).color}" d="${d}"/>`;
  svg.innerHTML = data.links
    .map((l, i) => line(l.from, curve(portPos(l.from), l.from.side, portPos(l.to), l.to.side), `data-index="${i}"`))
    .join('');
  if (temp) svg.innerHTML += line(temp.from, curve(portPos(temp.from), temp.from.side, temp.to), 'class="temp"');
}

const portInfo = (el) => ({
  id: el.closest('.card').dataset.id,
  side: el.dataset.side,
  index: Number(el.dataset.index),
});
