# Family Tree

A small offline Windows app for building your own family tree, made with Electron and plain HTML/CSS/JavaScript.

- Infinite grid you can **drag around** and **zoom** with the mouse wheel. **Center** brings all cards back into view.
- **Cards** with photo, first/last name, optional birth/death dates and description
- **Connection dots ("arms")** on the left and right of every card. Drag from one dot to another to connect two people.
  **+** adds a dot. Right-click deletes a line or a dot.
- **Relations**: in a card's popup, add "brother of …", "son of …", "grandma of …" and the line is drawn for you
  (parent lines in the elder's color, others in yours). The people list shows every relation.
- A **color** per card, used for its border, dots and the lines that start from it
- A **people list** showing everyone and who they're connected to, which you can print
- **Export picture** saves the whole tree as a PNG you can print
- **English / Serbian** switch
- Everything stays on your computer. The tree is saved automatically to `Documents\family-tree.json`.

**📖 [GUIDE.md](GUIDE.md) explains the whole app: structure, every file, and the code, with snippets.**

## Quick start

Needs [Node.js](https://nodejs.org) (LTS) and [Git](https://git-scm.com).

```bash
git clone https://github.com/xxgamekillerxx6/family-tree.git
```

```bash
cd family-tree
```

```bash
npm install
```

```bash
npm start
```

## Build the installer

```bash
npm run dist
```

This creates `dist\Family Tree Setup 1.0.1.exe`, a normal setup wizard with Start menu and desktop shortcuts.
See [GUIDE.md section 2](GUIDE.md#2-installing-it-like-a-normal-program).

## Ideas for next steps

- Undo (`Ctrl+Z`): keep a list of earlier copies of `data`
- Search box that zooms to a person
- Several trees: let the user choose the save file with Electron's `dialog.showSaveDialog`
- An app icon: add `build/icon.ico` and electron-builder uses it

## Git cheat sheet

```bash
git add .
```

```bash
git commit -m "Describe what you changed"
```

```bash
git push
```
