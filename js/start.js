// ===== 10. START =====
(async () => {
  applyLanguage();
  data = (await window.api.load()) || data;
  render();
  applyView();
  centerView(); // start with the whole tree in view
})();
