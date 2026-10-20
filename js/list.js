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
      <div>${t('Connected to:')} ${esc(connected.join(', ') || '—')}</div>
    </li>`;
  }).join('');
  listPanel.hidden = false;
}

document.getElementById('list-btn').addEventListener('click', showList);
document.getElementById('close-list-btn').addEventListener('click', () => (listPanel.hidden = true));
document.getElementById('print-list-btn').addEventListener('click', () => window.print());
