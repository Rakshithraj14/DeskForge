const sprite = document.getElementById('sprite');

const SPRITE_BASE = '../../../characters/default-cat/sprites/';
const ANIMATIONS = {
  idle: SPRITE_BASE + 'idle.svg',
  walk: SPRITE_BASE + 'walk.svg',
  sleep: SPRITE_BASE + 'sleep.svg',
};

window.deskforge.onStateUpdate(({ animation, facingLeft }) => {
  sprite.src = ANIMATIONS[animation] || ANIMATIONS.idle;
  sprite.style.transform = facingLeft ? 'scaleX(-1)' : 'scaleX(1)';
});

sprite.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  window.deskforge.requestContextMenu();
});

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
