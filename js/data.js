// RENDERER: everything you see and click. Plain JavaScript, no framework.
// The js/ files are loaded one after another by index.html (numbered 1–10 below and in each file).
// They share everything: a function or variable made in one file can be used in all the others.

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
const fullName = (p) => `${p.first} ${p.last}`.trim() || t('Unnamed');
const dates = (p) => (p.birth || p.death ? `${p.birth || '?'} – ${p.death || ''}` : '');
const save = () => window.api.save(data);

// Turns text into safe HTML (so a name like "<b>" shows as text instead of breaking the page).
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
