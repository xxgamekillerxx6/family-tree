// ===== RELATIONS: "brother of Alexa" rows in the edit popup, connected automatically =====
// A relation is stored on its line: link.relation = { who, word } means "person `who` is `word` of the other person".
// Each relation word, and how it reads from the other person's side.
const INVERSE = {
  father: 'child', mother: 'child', son: 'parent', daughter: 'parent',
  brother: 'sibling', sister: 'sibling',
  grandpa: 'grandchild', grandma: 'grandchild', grandson: 'grandparent', granddaughter: 'grandparent',
  uncle: 'nephew/niece', aunt: 'nephew/niece', nephew: 'uncle/aunt', niece: 'uncle/aunt',
  cousin: 'cousin', husband: 'spouse', wife: 'spouse',
};
// For these the OTHER person is the elder, so the line starts at them and takes their color.
// For every other word the line starts at the card you are editing and takes its color.
const YOUNGER = ['son', 'daughter', 'grandson', 'granddaughter'];

const relationsBox = document.getElementById('relations');

function addRelationRow(word = 'father', personId = '') {
  const others = data.people.filter((o) => o !== editing).sort((a, b) => fullName(a).localeCompare(fullName(b)));
  const row = document.createElement('div');
  row.className = 'relation';
  row.innerHTML = `
    <select class="rel-word">${Object.keys(INVERSE).map((w) => `<option value="${w}">${t(w)}</option>`).join('')}</select>
    ${t('of')}
    <select class="rel-person">${others.map((o) => `<option value="${o.id}">${esc(fullName(o))}</option>`).join('')}</select>
    <button type="button" class="remove-relation">×</button>`;
  row.querySelector('.rel-word').value = word;
  if (personId) row.querySelector('.rel-person').value = personId;
  relationsBox.appendChild(row);
}

// Fill the popup with the relations this person has declared.
function showRelations(p) {
  relationsBox.innerHTML = '';
  data.links
    .filter((l) => l.relation?.who === p.id)
    .forEach((l) => addRelationRow(l.relation.word, l.from.id === p.id ? l.to.id : l.from.id));
}

document.getElementById('add-relation-btn').addEventListener('click', () => addRelationRow());
relationsBox.addEventListener('click', (e) => e.target.closest('.remove-relation')?.closest('.relation').remove());

// A dot on the side of `p` that faces `other`: the first one without a line, or a new one.
function dotFacing(p, other) {
  const side = other.x >= p.x ? 'right' : 'left';
  const used = (i) => data.links.some((l) => [l.from, l.to].some((e) => e.id === p.id && e.side === side && e.index === i));
  let index = 0;
  while (index < p.ports[side] && used(index)) index++;
  if (index === p.ports[side]) p.ports[side]++; // all dots taken: add one
  return { id: p.id, side, index };
}

// On Save: replace this person's relations with the rows in the popup, drawing a line for each.
function saveRelations(p) {
  data.links = data.links.filter((l) => l.relation?.who !== p.id);
  relationsBox.querySelectorAll('.relation').forEach((row) => {
    const word = row.querySelector('.rel-word').value;
    const other = findPerson(row.querySelector('.rel-person').value);
    if (!other) return;
    const from = YOUNGER.includes(word) ? other : p;
    const to = from === p ? other : p;
    data.links.push({ from: dotFacing(from, to), to: dotFacing(to, from), relation: { who: p.id, word } });
  });
}

// How a relation line reads for person p, e.g. "son of Alexa Dekan" or "parent of Petar Dekan".
function relationText(l, p) {
  const other = findPerson(l.from.id === p.id ? l.to.id : l.from.id);
  const word = l.relation.who === p.id ? l.relation.word : INVERSE[l.relation.word];
  return `${t(word)} ${t('of')} ${fullName(other)}`;
}
