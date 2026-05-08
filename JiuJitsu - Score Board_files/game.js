window.player1 = new Player('player1', 'Atleta 1');
window.player2 = new Player('player2', 'Atleta 2');
window.timer = new Timer();

const winnerStateClasses = ['winner-player1', 'winner-player2', 'winner-judge'];

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

window.onload = function () {
  const startButton = document.querySelector('[data-timer-start]');
  const configContent = document.querySelector('[data-config-content]');
  const winnerOverlay = document.querySelector('[data-winner-overlay]');

  startButton.addEventListener('click', () => {
    clearWinnerState();
    configContent.classList.add('hide');

    if (timer.timeInSeconds() <= 0) {
      startButton.classList.add('hide');
      return;
    }

    timer.toggle();
    startButton.innerHTML = timer.started ? 'Pausar' : 'Continuar';
  });

  document.addEventListener('match:finished', () => {
    startButton.innerHTML = 'Continuar';
    showWinnerOverlay(decideWinner());
  });

  if (winnerOverlay) {
    winnerOverlay.addEventListener('click', (event) => {
      if (event.target === winnerOverlay) {
        clearWinnerState();
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
};
