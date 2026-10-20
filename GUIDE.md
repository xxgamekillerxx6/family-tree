# Family Tree: how the app works

This guide explains the whole app: how to run and install it, how the files fit together,
and what each piece of code does, with snippets from the real code.

**Contents**
1. [Running the app](#1-running-the-app)
2. [Installing it like a normal program](#2-installing-it-like-a-normal-program)
3. [The big picture](#3-the-big-picture)
4. [Folder structure](#4-folder-structure)
5. [The data: one object](#5-the-data-one-object)
6. [The code, file by file](#6-the-code-file-by-file)
7. [Following one action from start to end](#7-following-one-action-from-start-to-end)
8. [How to change things](#8-how-to-change-things)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Running the app

**One-time setup:** install [Node.js](https://nodejs.org) (LTS) and [Git](https://git-scm.com), then:

```bash
git clone https://github.com/xxgamekillerxx6/family-tree.git
```

```bash
cd family-tree
```

```bash
npm install
```

**Start the app** (do this every time you want to work on it):

```bash
npm start
```

A window opens with your tree. When you change the code, close the window and run
`npm start` again to see the change. Press `Ctrl+Shift+I` in the window to open
**DevTools**, where you see errors and can try code in the console.

**Using it**

| To do this | Do this |
|---|---|
| Move around | Drag empty space |
| Zoom | Mouse wheel |
| Find your cards again | **Center** button |
| Add a person | **+ Add person**, fill in, **Save** |
| Edit a person | Double-click their card |
| Move a card | Drag it |
| Connect two people | Drag from a dot on one card to a dot on another |
| Add a dot | **+** under the dots |
| Delete a line (dots stay) | Right-click the line |
| Delete a dot (and its lines) | Right-click the dot |
| Delete a person | Edit → **Delete person** → click again |
| See everyone | **People list** (with **Print list**) |
| Picture of the whole tree | **Export picture** (saves a PNG) |
| Language | **Srpski / English** button top right |

Your tree is saved automatically after every change to **`Documents\family-tree.json`**.
Back that file up. Copying it is all it takes.

## 2. Installing it like a normal program

You don't *need* an installer: `npm start` is enough while you're building the app. The installer is
for using it day to day, or giving it to family, without Node or a terminal.

**Build the setup wizard:**

```bash
npm run dist
```

After a minute or two you get:

```
dist\Family Tree Setup 1.0.0.exe   ← the installer, give this to anyone
dist\win-unpacked\Family Tree.exe  ← the app without installing (can run directly)
```

Double-click the setup file. The wizard asks where to install, then creates a Start menu entry and a
desktop shortcut. You can uninstall it under Windows *Settings → Apps*, like any program.

**"Windows protected your PC"** appears the first time, because the installer isn't *signed*
(signing costs money every year). Click **More info → Run anyway**. That's normal for hobby apps.

**How it works:** the tool is [electron-builder](https://www.electron.build). Its settings are the
`"build"` part of `package.json`:

```json
"build": {
  "appId": "com.aleksandardekan.familytree",
  "productName": "Family Tree",
  "files": ["main.js", "preload.js", "index.html", "style.css", "js/**"],
  "win": { "target": "nsis" },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true
  }
}
```

- `files`: which of our files go into the app. Libraries listed under `dependencies`
  (html-to-image) are added automatically.
- `"target": "nsis"`: NSIS is the program that makes the classic Next → Next → Install wizard.
- `oneClick: false` + `allowToChangeInstallationDirectory`: show the wizard steps and let you pick the folder,
  instead of installing silently.

**New version:** change `"version"` in `package.json` (e.g. `1.0.1`), run `npm run dist` again,
and install the new setup file over the old one. Your tree stays, because it lives in Documents, not in the app folder.

The `dist` folder is in `.gitignore`, so the 100 MB installer never goes into Git. To share it on GitHub,
upload it on your repo page under **Releases → Draft a new release**.

## 3. The big picture

The app is built with **Electron**. Electron is the Chrome browser packed into a desktop program,
so the app is really a web page:

- **HTML** (`index.html`) is *what is on the screen*: buttons, the grid, the popup.
- **CSS** (`style.css`) is *how it looks*: colors, sizes, positions.
- **JavaScript** (`js/` folder) is *what happens* when you click, drag, type.

A web page isn't allowed to touch files on your computer, for safety. So Electron splits the app in two:

```
┌──────────────────────────── Electron app ────────────────────────────┐
│                                                                      │
│  MAIN PROCESS (main.js)              THE PAGE (index.html + js/)     │
│  • opens the window                  • everything you see and click  │
│  • reads/writes family-tree.json     • keeps the tree in `data`      │
│            ▲                                     │                   │
│            │      preload.js = the bridge        │                   │
│            └──── window.api.load() / save() ◄────┘                   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

The page calls `window.api.save(data)`. `preload.js` passes that message to `main.js`, and `main.js` writes the file.

The page itself always follows the same pattern:

```
  you do something  →  change `data`  →  render() redraws  →  save() writes to disk
```

There is **one source of truth**: the `data` object. What's on screen is always rebuilt from it.

## 4. Folder structure

```
family-tree/
├── package.json      project info, libraries, commands (npm start / npm run dist), installer settings
├── main.js           MAIN PROCESS: window + save file
├── preload.js        bridge between page and main.js
├── index.html        the page layout
├── style.css         the looks
├── js/               the page logic, loaded in this order:
│   ├── data.js       1. the tree data + small helpers
│   ├── view.js       2. pan, zoom, Center
│   ├── cards.js      3. drawing cards, adding a person
│   ├── lines.js      4. drawing connection lines
│   ├── mouse.js      5. all mouse actions (drag, click, right-click, double-click)
│   ├── editor.js     6. the edit popup
│   ├── list.js       7. the people list
│   ├── export.js     8. export picture
│   ├── language.js   9. English / Serbian
│   └── start.js     10. starts everything (must be last)
├── node_modules/     downloaded libraries (not in Git, recreated by npm install)
└── dist/             built installer (not in Git, created by npm run dist)
```

**How the `js/` files share code:** `index.html` loads them as normal scripts, one after another:

```html
<script src="js/data.js"></script>
<script src="js/view.js"></script>
...
<script src="js/start.js"></script>
```

Everything a file creates (functions, variables) is visible to every other file. So `mouse.js` can call
`render()` from `cards.js` without any `import`. The only rule: **`start.js` must be last**,
because it's the one that runs everything, and by then all functions must exist.

## 5. The data: one object

Everything about your tree is in one JavaScript object called `data`. It is saved as-is to
`family-tree.json`. A tree with two connected people looks like this:

```json
{
  "people": [
    {
      "id": "3f2a…", "x": 100, "y": 80,
      "first": "Marko", "last": "Dekan",
      "birth": "1940", "death": "2010", "desc": "Grandfather",
      "photo": "data:image/jpeg;base64,/9j/4AAQ…",
      "color": "#c62828",
      "ports": { "left": 1, "right": 2 }
    },
    { "id": "9b1c…", "first": "Ana", "…": "…", "ports": { "left": 1, "right": 1 } }
  ],
  "links": [
    { "from": { "id": "3f2a…", "side": "right", "index": 0 },
      "to":   { "id": "9b1c…", "side": "left",  "index": 0 } }
  ]
}
```

- `x`, `y`: where the card is on the grid.
- `photo`: the picture itself, stored as text (a *data URL*). No separate image files to lose.
- `ports`: how many dots each side has.
- A **link** connects two dots. It says *"Marko's right side, dot number 0 ↔ Ana's left side, dot number 0"*.
  Dots are counted from 0, top to bottom.

## 6. The code, file by file

### `main.js`: the window and the save file

```js
// Your whole tree is saved in one file: Documents\family-tree.json
const dataFile = () => path.join(app.getPath('documents'), 'family-tree.json');

ipcMain.handle('load', () =>
  fs.existsSync(dataFile()) ? JSON.parse(fs.readFileSync(dataFile(), 'utf8')) : null
);
ipcMain.handle('save', (event, data) => fs.writeFileSync(dataFile(), JSON.stringify(data)));
```

`ipcMain.handle('save', …)` means: *"when the page sends a `save` message, run this"*. `JSON.stringify`
turns the object into text, and `JSON.parse` turns it back. The rest of `main.js` just opens an 1280×800 window
with `index.html` in it.

### `preload.js`: the bridge

```js
contextBridge.exposeInMainWorld('api', {
  load: () => ipcRenderer.invoke('load'),
  save: (data) => ipcRenderer.invoke('save', data),
});
```

This creates `window.api` in the page. Calling `window.api.save(data)` sends the `save` message to `main.js`.

### `index.html`: the layout

Four parts: the **toolbar** (buttons), the **viewport** (the grid), the **list panel** (hidden until
you open it) and the **editor** popup. The important one is the grid:

```html
<div id="viewport">          <!-- the visible area, with the grid background -->
  <div id="world">           <!-- moved and zoomed as one piece -->
    <svg id="lines"></svg>   <!-- the connection lines -->
    <!-- cards are added here by cards.js -->
  </div>
</div>
```

The popup is a built-in HTML `<dialog>`: the browser already knows how to show it on top,
dim the background and close it with Esc.

### `js/data.js`: the data and helpers

```js
let data = { people: [], links: [] };
const view = { x: 0, y: 0, zoom: 1 };

const findPerson = (id) => data.people.find((p) => p.id === id);
const fullName = (p) => `${p.first} ${p.last}`.trim() || t('Unnamed');
const save = () => window.api.save(data);
```

`view` is *where you're looking*: how far you've dragged (`x`, `y`) and the zoom level. It's
not saved: the app centers on your cards at every start.

`esc()` makes text safe to put into HTML. Without it, a name like `<b>Ana` would turn the rest of the card bold.

### `js/view.js`: pan, zoom, Center

Moving and zooming is **one line of CSS** on the `world` div:

```js
function applyView() {
  world.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`;
  ...
}
```

`translate` shifts everything and `scale` zooms everything. Cards and lines inside `world` follow automatically.

Zooming with the wheel keeps the point under your mouse in place, like Google Maps:

```js
const zoom = Math.min(3, Math.max(0.15, view.zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1)));
view.x = mx - ((mx - view.x) * zoom) / view.zoom;
```

Each wheel step zooms 10%, limited between 15% and 300%. The second line moves the view so the spot under
the mouse doesn't jump.

`toWorld()` converts a mouse position on the screen into a position on the grid, by undoing the move and the zoom.
`centerView()` finds the box around all cards (`treeBounds()`) and picks the zoom and position that fit it on screen.

### `js/cards.js`: drawing cards

`makeCard(p)` builds the HTML for one person:

```js
card.style.left = p.x + 'px';
card.style.top = p.y + 'px';
card.style.setProperty('--arm', p.color);
card.style.minHeight = (Math.max(p.ports.left, p.ports.right) + 1) * 24 + 16 + 'px';
```

- `--arm` is a CSS variable. `style.css` uses `var(--arm)` for the border and dots, so one line colors the whole card.
- `minHeight` makes the card taller when it has more dots (24 px per dot), so they never squish together.

`render()` is the simplest possible way to update the screen: delete all cards, build them again from `data`:

```js
function render() {
  world.querySelectorAll('.card').forEach((c) => c.remove());
  data.people.forEach((p) => world.appendChild(makeCard(p)));
  drawLines();
}
```

`addPerson()` makes an empty person in the middle of the screen and opens the editor. The person is only
added to `data` when you press **Save**, so **Cancel** leaves nothing behind.

### `js/lines.js`: drawing connections

Lines are SVG `<path>` curves. `portPos()` asks the browser where a dot is on screen, then converts it to grid
coordinates with `toWorld()`. `curve()` makes the S-shape:

```js
function curve(a, aSide, b, bSide) {
  const bend = Math.max(50, Math.abs(b.x - a.x) / 2);
  const ax = a.x + (aSide === 'right' ? bend : -bend);
  const bx = bSide ? b.x + (bSide === 'right' ? bend : -bend) : b.x;
  return `M${a.x},${a.y} C${ax},${a.y} ${bx},${b.y} ${b.x},${b.y}`;
}
```

`M` means *move to the first dot*, and `C` means *curve to the second dot*. The two middle points pull the curve
sideways, so a line always leaves a right dot to the right and a left dot to the left.

`drawLines()` redraws all lines. While you're dragging a new connection, it also draws a dashed
`temp` line from the dot to your mouse.

### `js/mouse.js`: every mouse action

**Dragging** uses one variable, `drag`, that remembers what you grabbed:

```js
viewport.addEventListener('mousedown', (e) => {
  ...
  if (port)      drag = { type: 'link', ... };  // grabbed a dot  → drawing a new line
  else if (card) drag = { type: 'card', ... };  // grabbed a card → moving it
  else           drag = { type: 'pan',  ... };  // grabbed empty space → moving the view
});
```

- `mousemove`: moves the view, moves the card, or redraws the temporary line, depending on `drag.type`.
- `mouseup`: finishes. For a line, if you let go over another person's dot, a link is added to `data`. Then `drag = null`.

**Deleting a dot** (right-click) is the trickiest code in the app, because links remember dots *by number*:

```js
data.links = data.links.filter((l) => !isDot(l.from) && !isDot(l.to));  // 1. remove lines on this dot
data.links.forEach((l) => [l.from, l.to].forEach((end) => {
  if (sameSide(end) && end.index > dot.index) end.index--;               // 2. renumber dots below it
}));
findPerson(dot.id).ports[dot.side]--;                                    // 3. one dot fewer
```

Example: Marko's right side has dots 0, 1, 2. You delete dot 1, so dot 2 is now the 2nd dot, number 1. Its
line must change from `index: 2` to `index: 1`, or it would point to a dot that no longer exists.

**Right-click on a line** deletes just that line: `data.links.splice(index, 1)` removes it from the list, and the dots stay. **Double-click** on a card opens the editor.

### `js/editor.js`: the edit popup

```js
function openEditor(p) {
  editing = p;
  FIELDS.forEach((f) => (form[f].value = p[f]));  // copy the person into the form
  ...
  editor.showModal();
}
```

When the popup closes, `editor.returnValue` says which button closed it:

```js
editor.addEventListener('close', () => {
  if (editor.returnValue === 'save') {
    FIELDS.forEach((f) => (editing[f] = form[f].value.trim()));  // copy the form back into the person
    ...
  } else if (editor.returnValue === 'delete') {
    data.people = data.people.filter((p) => p !== editing);     // remove the person
    data.links = data.links.filter((l) => l.from.id !== editing.id && l.to.id !== editing.id);  // and their lines
  } else {
    return; // Cancel: change nothing
  }
  render();
  save();
});
```

**Photos** are shrunk to at most 300 px with a `<canvas>` and turned into text (`toDataURL`), so a 5 MB
phone photo becomes about 20 KB in the save file.

**Delete** needs two clicks: the first changes the button text to "Click again to delete", and the second closes
the popup with `'delete'`.

### `js/list.js`: the people list

Sorts everyone by name and, for each person, finds every link that has them on either end:

```js
const connected = data.links
  .filter((l) => l.from.id === p.id || l.to.id === p.id)
  .map((l) => fullName(findPerson(l.from.id === p.id ? l.to.id : l.from.id)));
```

**Print list** calls `window.print()`. A rule in `style.css` (`@media print`) hides everything except the list
while printing.

### `js/export.js`: picture of the whole tree

```js
const { minX, minY, maxX, maxY } = treeBounds(60);
const png = await htmlToImage.toPng(world, {
  width: maxX - minX,
  height: maxY - minY,
  pixelRatio: 2, // double resolution so it prints sharp
  ...
});
```

The [html-to-image](https://github.com/bubkoo/html-to-image) library draws the `world` div into a PNG. It's the
only library the app uses. Then a hidden download link is clicked, and Electron shows the "Save as" window.

### `js/language.js`: English and Serbian

The English text is written normally in the HTML and code. One table translates it:

```js
const sr = {
  '+ Add person': '+ Dodaj osobu',
  'Save': 'Sačuvaj',
  ...
};
const t = (english) => (lang === 'sr' && sr[english]) || english;
```

`t('Save')` returns `'Sačuvaj'` in Serbian mode, otherwise `'Save'`. If a translation is missing, the English shows.
In the HTML, elements marked `data-i18n` are translated by `applyLanguage()`:

```html
<button id="add-btn" data-i18n>+ Add person</button>
```

The chosen language is remembered in `localStorage` (the app's small built-in storage), not in your tree file.

### `js/start.js`: starting up

```js
(async () => {
  applyLanguage();
  data = (await window.api.load()) || data;  // load the file, or start empty
  render();
  applyView();
  centerView();
})();
```

`await` waits for `main.js` to read the file. `|| data` means *"if there's no file yet, keep the empty tree"*.

### `style.css`: the looks

Split into commented sections: buttons, toolbar, grid, cards, dots, people list, popup. Two tricks worth knowing:

```css
#viewport {
  background-image:
    linear-gradient(#dcdcdc 1px, transparent 1px),
    linear-gradient(90deg, #dcdcdc 1px, transparent 1px);
}
```

The grid isn't drawn line by line. It's two repeating 1 px stripes, one horizontal and one vertical.

```css
.card { border: 2px solid var(--arm); }
.port { background: var(--arm); }
```

Each card sets its own `--arm` color, and everything inside uses it.

## 7. Following one action from start to end

**Connecting Marko to Ana:**

1. You press the mouse on Marko's right dot. `mousedown` in `mouse.js` sees a `.port` and sets
   `drag = { type: 'link', from: { id: Marko, side: 'right', index: 0 } }`.
2. You move the mouse. `mousemove` calls `drawLines({ from, to: mouse position })`, and a dashed line follows you.
3. You let go on Ana's left dot. `mouseup` finds the `.port` under the mouse. It isn't Marko's own, so
   it adds `{ from: Marko right 0, to: Ana left 0 }` to `data.links` and calls `save()`.
4. `save()` → `window.api.save(data)` → `preload.js` → `main.js` writes `family-tree.json`.
5. `drawLines()` draws the new solid line in Marko's color.

Every feature works this way: **change `data` → redraw → save**.

## 8. How to change things

**Add a field, for example "Place of birth":**
1. `index.html`: add `<label><span data-i18n>Place of birth</span> <input name="place"></label>` in the popup.
2. `js/editor.js`: add `'place'` to `FIELDS`.
3. `js/cards.js`: in `addPerson()` add `place: ''`. In `makeCard()`, show it, e.g. `<div class="desc">${esc(p.place)}</div>`.
4. `js/language.js`: add `'Place of birth': 'Mesto rođenja',`.

People saved before this change have no `place` yet. That's fine, because empty fields simply don't show.

**Translate a new text:** wrap it in `t('...')` in JavaScript (or add `data-i18n` in HTML), then add a line to `sr`.

**Change the default card color:** `color: '#2f6fde'` in `addPerson()` in `js/cards.js`.

**Change the look:** everything is in `style.css`. For example, card width is `.card { width: 200px; }`.

## 9. Troubleshooting

- **`npm start` says Electron failed to install.** Newer npm versions block the script that downloads Electron.
  Download it manually:

  ```bash
  node node_modules/electron/install.js
  ```

- **Something doesn't work.** Press `Ctrl+Shift+I` in the app and look at the **Console** tab. Red text tells you
  which file and line broke.
- **I want to start a fresh tree.** Rename `Documents\family-tree.json` (e.g. to `family-tree-old.json`) and restart.
- **"Windows protected your PC" when installing.** Click **More info → Run anyway** (see [section 2](#2-installing-it-like-a-normal-program)).
