// MAIN PROCESS: starts the app, opens the window, and reads/writes the save file.
// (Web pages can't touch your disk directly, so the page asks this file to do it.)
const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

// Your whole tree is saved in one file: Documents\family-tree.json
const dataFile = () => path.join(app.getPath('documents'), 'family-tree.json');

ipcMain.handle('load', () =>
  fs.existsSync(dataFile()) ? JSON.parse(fs.readFileSync(dataFile(), 'utf8')) : null
);
ipcMain.handle('save', (event, data) => fs.writeFileSync(dataFile(), JSON.stringify(data)));

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
  });
  win.loadFile('index.html');
});

app.on('window-all-closed', () => app.quit());
