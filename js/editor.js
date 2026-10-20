// ===== 6. EDIT POPUP =====
const FIELDS = ['first', 'last', 'birth', 'death', 'desc', 'color'];
let editing = null; // the person being edited
const photoPreview = document.getElementById('photo-preview'); // also holds the photo until Save
const photoInput = document.getElementById('photo-input');
const deleteBtn = document.getElementById('delete-btn');

function openEditor(p) {
  editing = p;
  FIELDS.forEach((f) => (form[f].value = p[f]));
  photoPreview.src = p.photo;
  photoInput.value = '';
  deleteBtn.textContent = t('Delete person');
  deleteBtn.hidden = !data.people.includes(p); // a brand-new person has nothing to delete yet
  editor.returnValue = '';
  editor.showModal();
}

// Shrink the chosen picture to max 300px so the save file stays small.
photoInput.addEventListener('change', () => {
  if (!photoInput.files[0]) return; // closed the picker without choosing
  const img = new Image();
  img.onload = () => {
    const scale = Math.min(1, 300 / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    photoPreview.src = canvas.toDataURL('image/jpeg', 0.85);
  };
  img.src = URL.createObjectURL(photoInput.files[0]);
});

document.getElementById('remove-photo-btn').addEventListener('click', () => (photoPreview.src = ''));

// Delete needs two clicks, so you can't delete someone by accident.
deleteBtn.addEventListener('click', () => {
  if (deleteBtn.textContent === t('Delete person')) deleteBtn.textContent = t('Click again to delete');
  else editor.close('delete');
});

// The popup closes when Save/Cancel is pressed (or Delete twice); returnValue says which one.
editor.addEventListener('close', () => {
  if (editor.returnValue === 'save') {
    FIELDS.forEach((f) => (editing[f] = form[f].value.trim()));
    editing.photo = photoPreview.getAttribute('src');
    if (!data.people.includes(editing)) data.people.push(editing); // new person
  } else if (editor.returnValue === 'delete') {
    data.people = data.people.filter((p) => p !== editing);
    data.links = data.links.filter((l) => l.from.id !== editing.id && l.to.id !== editing.id);
  } else {
    return; // Cancel
  }
  render();
  save();
});
