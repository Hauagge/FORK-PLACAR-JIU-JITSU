window.onkeydown = function (e) {
  if (e.keyCode === 116) {
    e.keyCode = 0;
    e.returnValue = false;
    return false;
  }
}

const restart = () => {
  const confirmed = confirm("Deseja reiniciar o placar?");
  // var timerValue = document.getElementById("timer");
  // console.log("Timer Value:", timerValue.value);
  const startButton = document.querySelector('[data-timer-start]');
  const configContent = document.querySelector('[data-config-content]');
  if (confirmed) {
    timer.stop();
    timer.started = false;
    timer.reset();
    // timer.setMinutes(timerValue);
    configContent.classList.remove('hide');
    player1.reset();
    player2.reset();
    startButton.innerHTML = 'Iniciar';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  resetButtons = document.querySelectorAll('[data-game-reset]');

  resetButtons.forEach((button) => {
    button.addEventListener('click', restart);
  });
});