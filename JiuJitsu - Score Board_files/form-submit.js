document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.form-submit').addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(e.target);
    const startButton = document.querySelector('[data-timer-start]');

    if (typeof clearWinnerState === 'function') {
      clearWinnerState();
    }

    timer.reset();
    player1.reset();
    player2.reset();

    player1.setName(data.get('player1'));
    player2.setName(data.get('player2'));

    // player1.setName(' ');
    // player2.setName(' ');
    timer.stop();
    timer.setMinutes(data.get('timer'));
    startButton.classList.remove('hide');
    startButton.innerHTML = 'Iniciar';


    modal.style.display = "none";
  });
});
