# Family Tree

A small offline Windows app for building your own family tree, made with Electron and plain HTML/CSS/JavaScript.

- Infinite grid you can **drag around** and **zoom** with the mouse wheel
- **Cards** with photo, first/last name, optional birth/death dates and description
- **Connection dots ("arms")** on the left and right of every card. Drag from one dot to another to connect two people. Press **+** to add more dots.
- A **color** per card, used for its border, dots and the lines that start from it
- A **people list** showing everyone and who they're connected to, which you can print
- **Export picture** saves the whole tree as a PNG you can print
- Everything stays on your computer. The tree is saved automatically to `Documents\family-tree.json`.

---

## 1. Setup (one time)

1. Install **Node.js** (LTS) from https://nodejs.org. Node lets you run JavaScript outside the browser. It also comes with `npm`, which downloads libraries.
2. Install **Git** from https://git-scm.com.
3. Get the code and install the libraries:

```bash
git clone https://github.com/xxgamekillerxx6/family-tree.git
```

```bash
cd family-tree
```

```bash
npm install
```

If `npm start` later says Electron failed to install, download it manually:

```bash
node node_modules/electron/install.js
```

## 2. Run it

```bash
npm start
```

While it's running, press `Ctrl+Shift+I` to open DevTools, where you can see errors and play in the console.

## 3. Make a real .exe (optional)

```bash
npm run package
```

This creates `dist\FamilyTree-win32-x64\FamilyTree.exe`. Copy that whole folder anywhere and double-click the exe.

---

## 4. How it works (read this to understand the code)

### Why Electron?
Electron is a Chrome browser packed into a desktop app. You write the app like a web page
(HTML = structure, CSS = looks, JavaScript = behaviour), and Electron gives it a window and
access to your disk. Zooming, dragging, drawing lines and exporting pictures are all easy in a browser.

### The files

| File | What it does |
|---|---|
| `package.json` | Project info, libraries, and the `npm start` / `npm run package` commands |
| `main.js` | **Main process.** Opens the window and reads/writes `family-tree.json` |
| `preload.js` | A bridge that gives the page `window.api.load()` and `window.api.save()` |
| `index.html` | The page layout: toolbar, grid, list panel, edit popup |
| `style.css` | How everything looks |
| `app.js` | **All the app logic.** Split into numbered sections, explained below |

Why the split between `main.js` and `app.js`? For safety, a web page isn't allowed to touch
your files. So the page (`app.js`) asks `preload.js` â†’ `main.js` to load and save for it.

### `app.js` section by section

1. **DATA**: the whole tree is one object: `{ people: [...], links: [...] }`.
   A link says "dot 0 on the right of person A is connected to dot 0 on the left of person B".
   After each change we call `save()`, which writes this object to disk as JSON.
2. **PAN & ZOOM**: all cards and lines sit inside one `<div id="world">`. Moving and zooming
   just sets a CSS `transform: translate(x, y) scale(zoom)` on that div. `toWorld()` turns a
   mouse position into a position on the grid.
3. **CARDS**: `render()` deletes all cards and rebuilds them from `data`. That's simple and fast enough.
4. **LINES**: lines are SVG `<path>` curves. `portPos()` finds where a dot is, and `curve()`
   draws a smooth S-shape between two dots.
5. **MOUSE**: one `drag` variable remembers what you're dragging: the grid (`pan`), a card,
   or a new line (`link`). `mousemove` updates it and `mouseup` finishes it.
6. **EDIT POPUP**: a native HTML `<dialog>`. Photos are shrunk to 300px and stored inside
   the JSON as text (a "data URL"), so there are no separate image files to lose.
7. **PEOPLE LIST**: builds the list from `data`. **Print list** uses CSS `@media print` so only the list gets printed.
8. **EXPORT PICTURE**: the [html-to-image](https://github.com/bubkoo/html-to-image) library
   draws the area around all the cards into a PNG at double resolution.
9. **START**: loads the save file and draws everything.

### Your data
Everything is in `Documents\family-tree.json`. **Back this file up.** Copying it is all it takes.

---

## 5. Ideas for next steps (good practice)

- Undo (`Ctrl+Z`): keep a list of earlier copies of `data`
- Remove a connection dot
- A label on each line ("married", "child")
- Search box that zooms to a person
- Several trees: let the user choose the save file with Electron's `dialog.showSaveDialog`

## 6. Git cheat sheet

```bash
git add .
```

```bash
git commit -m "Describe what you changed"
```

```bash
git push
```
