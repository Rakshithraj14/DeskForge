const sprite = document.getElementById('sprite');

let dragging = false;

sprite.addEventListener('mousedown', (event) => {
  dragging = true;
  sprite.style.cursor = 'grabbing';
  window.deskforge.startDrag(event.screenX, event.screenY);
});

window.addEventListener('mousemove', (event) => {
  if (!dragging) return;
  window.deskforge.dragTo(event.screenX, event.screenY);
});

window.addEventListener('mouseup', () => {
  if (!dragging) return;
  dragging = false;
  sprite.style.cursor = 'grab';
  window.deskforge.endDrag();
});
