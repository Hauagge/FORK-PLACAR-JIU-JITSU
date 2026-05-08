window.player1 = new Player('player1', 'Atleta 1');
window.player2 = new Player('player2', 'Atleta 2');
window.timer = new Timer();

const winnerStateClasses = ['winner-player1', 'winner-player2', 'winner-judge'];
const STORAGE_KEY = 'jiujitsu-scoreboard-state-v2';
const CHANNEL_NAME = 'jiujitsu-scoreboard-sync';
const TAB_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
const urlParams = new URLSearchParams(window.location.search);
const APP_MODE = urlParams.get('mode') === 'viewer' ? 'viewer' : 'operator';
const isViewerMode = APP_MODE === 'viewer';
const syncChannel = ('BroadcastChannel' in window) ? new BroadcastChannel(CHANNEL_NAME) : null;

let suppressSync = false;
let lastStateVersion = 0;

function clearWinnerState() {
  const body = document.getElementById('body');
  const overlay = document.querySelector('[data-winner-overlay]');

  body.classList.remove(...winnerStateClasses);

  if (overlay) {
    overlay.classList.add('hide');
  }
}

function decideWinner() {
  const competitors = [
    { id: 'player1', player: window.player1 },
    { id: 'player2', player: window.player2 },
  ];

  competitors.sort((left, right) => {
    if (right.player.total() !== left.player.total()) {
      return right.player.total() - left.player.total();
    }

    if (right.player.advantage !== left.player.advantage) {
      return right.player.advantage - left.player.advantage;
    }

    if (left.player.punishment !== right.player.punishment) {
      return left.player.punishment - right.player.punishment;
    }

    return 0;
  });

  const [first, second] = competitors;

  if (first.player.total() !== second.player.total()) {
    return {
      type: 'winner',
      winnerId: first.id,
      winnerName: first.player.name,
      criteriaText: `Vitória por pontos: ${first.player.total()} x ${second.player.total()}.`,
    };
  }

  if (first.player.advantage !== second.player.advantage) {
    return {
      type: 'winner',
      winnerId: first.id,
      winnerName: first.player.name,
      criteriaText: `Empate em pontos. Vitória por vantagens: ${first.player.advantage} x ${second.player.advantage}.`,
    };
  }

  if (first.player.punishment !== second.player.punishment) {
    return {
      type: 'winner',
      winnerId: first.id,
      winnerName: first.player.name,
      criteriaText: `Empate em pontos e vantagens. Vitória por menos punições: ${first.player.punishment} x ${second.player.punishment}.`,
    };
  }

  return {
    type: 'judge',
    winnerName: 'Decisão do Juiz',
    criteriaText: 'Empate em pontos, vantagens e punições. O juiz definirá o vencedor.',
  };
}

function showWinnerOverlay(result) {
  const body = document.getElementById('body');
  const overlay = document.querySelector('[data-winner-overlay]');
  const winnerName = document.querySelector('[data-winner-name]');
  const winnerCriteria = document.querySelector('[data-winner-criteria]');

  if (!overlay || !winnerName || !winnerCriteria) {
    return;
  }

  body.classList.remove(...winnerStateClasses);

  if (result.type === 'winner') {
    body.classList.add(`winner-${result.winnerId}`);
  } else {
    body.classList.add('winner-judge');
  }

  winnerName.textContent = result.winnerName;
  winnerCriteria.textContent = result.criteriaText;
  overlay.classList.remove('hide');
}

function buildMatchState() {
  return {
    version: Date.now(),
    mode: APP_MODE,
    result: null,
    player1: player1.getState(),
    player2: player2.getState(),
    timer: timer.getState(),
  };
}

function persistState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function saveAndBroadcastState(extra = {}) {
  if (suppressSync) {
    return;
  }

  const state = { ...buildMatchState(), ...extra };
  lastStateVersion = state.version;

  try {
    persistState(state);
  } catch (error) {
    console.error('Falha ao salvar o estado do placar.', error);
  }

  if (syncChannel) {
    syncChannel.postMessage({ sourceId: TAB_ID, state });
  }
}

function applyState(state, options = {}) {
  if (!state) {
    return;
  }

  suppressSync = true;

  try {
    player1.loadState(state.player1 || {});
    player2.loadState(state.player2 || {});
    timer.loadState(state.timer || {});

    clearWinnerState();

    if (state.result) {
      showWinnerOverlay(state.result);
    }

    lastStateVersion = Number(state.version || Date.now());

    if (!options.skipPersist) {
      persistState(state);
    }
  } catch (error) {
    console.error('Falha ao aplicar o estado sincronizado.', error);
  } finally {
    suppressSync = false;
  }
}

function loadMatchState() {
  try {
    const rawState = localStorage.getItem(STORAGE_KEY);

    if (!rawState) {
      player1.renderAllPoints();
      player2.renderAllPoints();
      timer.render();
      return;
    }

    applyState(JSON.parse(rawState), { skipPersist: true });
  } catch (error) {
    console.error('Falha ao restaurar o estado do placar.', error);
    player1.renderAllPoints();
    player2.renderAllPoints();
    timer.render();
  }
}

function updateStartButtonLabel(startButton) {
  if (!startButton) {
    return;
  }

  startButton.classList.remove('hide');

  if (timer.started) {
    startButton.innerHTML = 'Pausar';
    return;
  }

  if (timer.timeInSeconds() <= 0) {
    startButton.innerHTML = 'Iniciar';
    return;
  }

  if (timer.timeInSeconds() < timer.initialSeconds) {
    startButton.innerHTML = 'Continuar';
    return;
  }

  startButton.innerHTML = 'Iniciar';
}

function openConfigModal() {
  if (isViewerMode) {
    return;
  }

  if (typeof syncTimerRangeDisplay === 'function') {
    syncTimerRangeDisplay();
  }

  if (window.modal) {
    window.modal.style.display = 'flex';
  }
}

function shouldIgnoreKeyboardShortcut(event) {
  const activeElement = document.activeElement;

  if (isViewerMode) {
    return true;
  }

  if (window.modal && window.modal.style.display === 'flex') {
    return true;
  }

  if (!activeElement) {
    return false;
  }

  const tagName = activeElement.tagName;
  return activeElement.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(tagName);
}

function bindKeyboardShortcuts(startButton) {
  const actions = {
    '1': () => player1.mountedIncrement(),
    '2': () => player1.guardIncrement(),
    '3': () => player1.overthrowIncrement(),
    '4': () => player1.advantageIncrement(),
    '5': () => player1.punishmentIncrement(),
    '6': () => player2.punishmentIncrement(),
    '7': () => player2.advantageIncrement(),
    '8': () => player2.overthrowIncrement(),
    '9': () => player2.guardIncrement(),
    '0': () => player2.mountedIncrement(),
  };

  document.addEventListener('keydown', (event) => {
    if (shouldIgnoreKeyboardShortcut(event)) {
      return;
    }

    const key = event.key.toLowerCase();

    if (event.code === 'Space') {
      event.preventDefault();
      startButton.click();
      return;
    }

    if (key === 'r') {
      event.preventDefault();
      document.querySelector('[data-game-reset]')?.click();
      return;
    }

    if (key === 'c') {
      event.preventDefault();
      openConfigModal();
      return;
    }

    if (key === 'escape') {
      const overlay = document.querySelector('[data-winner-overlay]');
      if (overlay && !overlay.classList.contains('hide')) {
        clearWinnerState();
      }
      return;
    }

    if (actions[key]) {
      event.preventDefault();
      clearWinnerState();
      actions[key]();
    }
  });
}

function setupModeUI() {
  const body = document.getElementById('body');
  const badge = document.querySelector('[data-mode-badge]');

  body.classList.add(`mode-${APP_MODE}`);

  if (badge) {
    badge.textContent = isViewerMode ? 'Modo Exibição' : 'Modo Operador';
  }

  if (isViewerMode && window.modal) {
    window.modal.style.display = 'none';
  }
}

function handleIncomingState(state) {
  if (!state || Number(state.version || 0) < lastStateVersion) {
    return;
  }

  applyState(state);
}

function setupRealtimeSync() {
  if (syncChannel) {
    syncChannel.addEventListener('message', (event) => {
      const payload = event.data;

      if (!payload || payload.sourceId === TAB_ID) {
        return;
      }

      handleIncomingState(payload.state);
    });
  }

  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY || !event.newValue) {
      return;
    }

    try {
      handleIncomingState(JSON.parse(event.newValue));
    } catch (error) {
      console.error('Falha ao ler atualização do storage.', error);
    }
  });
}

window.onload = function () {
  const startButton = document.querySelector('[data-timer-start]');
  const configContent = document.querySelector('[data-config-content]');
  const winnerOverlay = document.querySelector('[data-winner-overlay]');

  setupModeUI();
  setupRealtimeSync();
  clearWinnerState();
  loadMatchState();
  updateStartButtonLabel(startButton);

  if (startButton && !isViewerMode) {
    startButton.addEventListener('click', () => {
      clearWinnerState();
      configContent.classList.add('hide');

      if (timer.timeInSeconds() <= 0) {
        openConfigModal();
        return;
      }

      timer.toggle();
      updateStartButtonLabel(startButton);
    });
  }

  document.addEventListener('match:finished', () => {
    updateStartButtonLabel(startButton);
    const result = decideWinner();
    showWinnerOverlay(result);
    saveAndBroadcastState({ result });
  });

  document.addEventListener('match:state-changed', () => {
    if (suppressSync) {
      return;
    }

    updateStartButtonLabel(startButton);
    saveAndBroadcastState();
  });

  if (winnerOverlay) {
    winnerOverlay.addEventListener('click', (event) => {
      if (event.target === winnerOverlay) {
        clearWinnerState();
        if (!isViewerMode) {
          saveAndBroadcastState();
        }
      }
    });
  }

  document.querySelectorAll('input[type="range"]').forEach(input => {
    input.addEventListener('input', () => {
      const value = input.value;
      const id = input.id;
      const labelSpan = document.querySelector(`label[for="${id}"] > span`);

      if (labelSpan) {
        labelSpan.innerHTML = `${value} minutos`;
      }
    });
  });

  if (!isViewerMode) {
    bindKeyboardShortcuts(startButton);
  }
};
