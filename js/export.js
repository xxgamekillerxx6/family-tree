// ===== 8. EXPORT PICTURE =====
// Find the box around all cards, then let html-to-image draw that area into a PNG.
async function exportPicture() {
  if (!data.people.length) return;
  const { minX, minY, maxX, maxY } = treeBounds(60);

  const png = await htmlToImage.toPng(world, {
    width: maxX - minX,
    height: maxY - minY,
    backgroundColor: '#ffffff',
    pixelRatio: 2, // double resolution so it prints sharp
    style: { transform: `translate(${-minX}px, ${-minY}px)` },
    filter: (node) => !node.classList?.contains('add-port'), // leave the "+" buttons out
  });

  // Clicking a download link makes Electron show a "Save as" window.
  const a = document.createElement('a');
  a.href = png;
  a.download = 'family-tree.png';
  a.click();
}

document.getElementById('export-btn').addEventListener('click', exportPicture);
