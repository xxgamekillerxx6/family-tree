// ===== 9. LANGUAGE =====
// The English text is written in index.html and in the code. This table translates it to Serbian.
// To translate something new: wrap it in t('...') (or add data-i18n in index.html) and add a line here.
const sr = {
  '+ Add person': '+ Dodaj osobu',
  'People list': 'Spisak osoba',
  'Export picture': 'Sačuvaj sliku',
  'Center': 'Centriraj',
  'Drag empty space to move · Scroll to zoom · Double-click a card to edit · Drag from dot to dot to connect · Right-click a line or dot to delete it':
    'Prevuci prazan prostor za pomeranje · Točkić za zum · Dupli klik na karticu za izmenu · Prevuci od tačke do tačke za povezivanje · Desni klik briše liniju ili tačku',
  'Print list': 'Štampaj spisak',
  'Close': 'Zatvori',
  'People': 'Osobe',
  'Edit person': 'Izmeni osobu',
  'Choose photo': 'Izaberi sliku',
  'Remove photo': 'Ukloni sliku',
  'First name': 'Ime',
  'Last name': 'Prezime',
  'Born (optional)': 'Rođen/a (opciono)',
  'Died (optional)': 'Preminuo/la (opciono)',
  'e.g. 1950 or 12.03.1950': 'npr. 1950 ili 12.03.1950',
  'Description (optional)': 'Opis (opciono)',
  'Arm color': 'Boja krakova',
  'Delete person': 'Obriši osobu',
  'Click again to delete': 'Klikni ponovo za brisanje',
  'Cancel': 'Otkaži',
  'Save': 'Sačuvaj',
  'Unnamed': 'Bez imena',
  'Add connection point': 'Dodaj tačku za povezivanje',
  'Connected to:': 'Povezan/a sa:',
  'Relations': 'Srodstvo',
  'Relations:': 'Srodstvo:',
  '+ Add relation': '+ Dodaj srodstvo',
  'of': 'od',
  // relation words (js/relations.js)
  father: 'otac', mother: 'majka', son: 'sin', daughter: 'ćerka',
  brother: 'brat', sister: 'sestra',
  grandpa: 'deda', grandma: 'baba', grandson: 'unuk', granddaughter: 'unuka',
  uncle: 'ujak/stric', aunt: 'tetka', nephew: 'nećak', niece: 'nećaka',
  cousin: 'rođak/rođaka', husband: 'muž', wife: 'žena',
  child: 'dete', parent: 'roditelj', sibling: 'brat/sestra', grandchild: 'unuče', grandparent: 'deda/baba',
  'nephew/niece': 'nećak/nećaka', 'uncle/aunt': 'ujak/tetka', spouse: 'supružnik',
};

// The chosen language is remembered in the app's local storage (not in the tree file).
let lang = localStorage.getItem('lang') || 'en';
const t = (english) => (lang === 'sr' && sr[english]) || english;

function applyLanguage() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.dataset.i18n ||= el.textContent; // remember the English text the first time
    el.textContent = t(el.dataset.i18n);
  });
  form.birth.placeholder = t('e.g. 1950 or 12.03.1950');
  document.getElementById('lang-btn').textContent = lang === 'sr' ? 'English' : 'Srpski';
}

document.getElementById('lang-btn').addEventListener('click', () => {
  lang = lang === 'sr' ? 'en' : 'sr';
  localStorage.setItem('lang', lang);
  applyLanguage();
  render(); // cards contain some text too ("Unnamed", "+" tooltip)
  if (!listPanel.hidden) showList();
});
