(() => {
  const HEALTH_ENDPOINT = '/api/health';
  const CHAT_ENDPOINT = '/api/chat';
  const launcher = document.getElementById('ai-launcher');
  const panel = document.getElementById('ai-study-panel');
  const closeButton = document.getElementById('ai-panel-close');
  const modelLabel = document.getElementById('ai-model-label');
  const composer = document.getElementById('ai-composer');

  if (!launcher || !panel || !closeButton || !modelLabel || !composer) return;

  const setOpen = (open) => {
    panel.hidden = !open;
    launcher.setAttribute('aria-expanded', String(open));
    if (open) document.getElementById('ai-question')?.focus();
  };

  launcher.addEventListener('click', () => setOpen(true));
  closeButton.addEventListener('click', () => setOpen(false));
  composer.addEventListener('submit', (event) => {
    event.preventDefault();
    composer.dataset.endpoint = CHAT_ENDPOINT;
  });

  fetch(HEALTH_ENDPOINT, { headers: { Accept: 'application/json' } })
    .then((response) => response.ok ? response.json() : Promise.reject(new Error('not ready')))
    .then((health) => {
      if (!health.ready) return;
      modelLabel.textContent = health.model || '已就绪';
      launcher.hidden = false;
    })
    .catch(() => {
      launcher.hidden = true;
      panel.hidden = true;
    });
})();
