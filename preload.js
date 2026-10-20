// PRELOAD: a small bridge. It gives the page `window.api.load()` and `window.api.save()`,
// which send a message to main.js and return its answer.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  load: () => ipcRenderer.invoke('load'),
  save: (data) => ipcRenderer.invoke('save', data),
});
