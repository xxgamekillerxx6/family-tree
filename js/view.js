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

// The box around all cards (in world coordinates), with some empty space around it.
function treeBounds(pad) {
  const cards = [...world.querySelectorAll('.card')];
  return {
    minX: Math.min(...cards.map((c) => c.offsetLeft)) - pad,
    minY: Math.min(...cards.map((c) => c.offsetTop)) - pad,
    maxX: Math.max(...cards.map((c) => c.offsetLeft + c.offsetWidth)) + pad,
    maxY: Math.max(...cards.map((c) => c.offsetTop + c.offsetHeight)) + pad,
  };
}

// "Center" button: zoom and move so every card fits on screen (never zooms in past 100%).
function centerView() {
  if (!data.people.length) return;
  const b = treeBounds(60);
  const r = viewport.getBoundingClientRect();
  view.zoom = Math.min(1, r.width / (b.maxX - b.minX), r.height / (b.maxY - b.minY));
  view.x = r.width / 2 - ((b.minX + b.maxX) / 2) * view.zoom;
  view.y = r.height / 2 - ((b.minY + b.maxY) / 2) * view.zoom;
  applyView();
}

document.getElementById('center-btn').addEventListener('click', centerView);
