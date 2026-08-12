const sprite = document.getElementById('sprite');
const panel = document.getElementById('panel');
const promptInput = document.getElementById('prompt-input');
const bubble = document.getElementById('bubble');

const CHARACTER_DIR = '../../../characters/default-cat/';

let character = null;
let currentAnimation = null;
let frameIndex = 0;
let frameTimer = null;

async function loadCharacter() {
  const response = await fetch(CHARACTER_DIR + 'character.json');
  character = await response.json();
}

function playAnimation(name) {
  if (!character) return;
  const anim = character.animations[name] || character.animations.idle;
  if (name === currentAnimation) return;
  currentAnimation = name;
  frameIndex = 0;

  const frameSize = character.frameSize * character.scale;
  sprite.style.backgroundImage = `url(${CHARACTER_DIR}${anim.sheet})`;
  sprite.style.backgroundSize = `${frameSize * anim.frames}px ${frameSize}px`;
  sprite.style.backgroundPosition = '0px 0px';

  clearInterval(frameTimer);
  frameTimer = setInterval(() => {
    frameIndex = (frameIndex + 1) % anim.frames;
    sprite.style.backgroundPosition = `-${frameIndex * frameSize}px 0px`;
  }, 1000 / anim.fps);
}

loadCharacter().then(() => playAnimation('idle'));

window.deskforge.onStateUpdate(({ animation, facingLeft }) => {
  playAnimation(animation);
  sprite.style.transform = facingLeft ? 'scaleX(-1)' : 'scaleX(1)';
});

sprite.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  window.deskforge.requestContextMenu();
});

let dragging = false;
let dragMoved = false;
let dragStart = null;
let promptOpen = false;
let submitting = false;

sprite.addEventListener('mousedown', (event) => {
  dragging = true;
  dragMoved = false;
  dragStart = { x: event.screenX, y: event.screenY };
  sprite.style.cursor = 'grabbing';
  window.deskforge.startDrag(event.screenX, event.screenY);
});

window.addEventListener('mousemove', (event) => {
  if (!dragging) return;
  if (!dragMoved && Math.hypot(event.screenX - dragStart.x, event.screenY - dragStart.y) > 4) {
    dragMoved = true;
  }
  window.deskforge.dragTo(event.screenX, event.screenY);
});

window.addEventListener('mouseup', () => {
  if (!dragging) return;
  dragging = false;
  sprite.style.cursor = 'grab';
  window.deskforge.endDrag();
});

function openPrompt() {
  promptOpen = true;
  submitting = false;
  panel.classList.remove('hidden');
  bubble.classList.add('hidden');
  promptInput.classList.remove('hidden');
  promptInput.value = '';
  window.deskforge.expandForPrompt();
  setTimeout(() => promptInput.focus(), 50);
}

function closePrompt() {
  promptOpen = false;
  panel.classList.add('hidden');
  window.deskforge.collapse();
}

sprite.addEventListener('click', () => {
  if (dragMoved || promptOpen) return;
  openPrompt();
});

promptInput.addEventListener('keydown', async (event) => {
  if (event.key === 'Escape') {
    closePrompt();
    return;
  }
  if (event.key !== 'Enter') return;

  const text = promptInput.value.trim();
  if (!text) return;

  submitting = true;
  promptInput.classList.add('hidden');
  bubble.classList.remove('hidden');
  bubble.textContent = 'Thinking...';

  const response = await window.deskforge.sendPrompt(text);
  bubble.textContent = response.reply || '...';

  setTimeout(closePrompt, Math.min(12000, Math.max(4000, bubble.textContent.length * 60)));
});

promptInput.addEventListener('blur', () => {
  if (promptOpen && !submitting) closePrompt();
});
