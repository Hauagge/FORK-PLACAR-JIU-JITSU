// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

var body = document.getElementById("body");
// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

function syncTimerRangeDisplay() {
  var timerInput = document.querySelector('input[type="range"][name="timer"]');
  var timerLabel = document.querySelector('label[for="timer"] > span');

  if (!timerInput || !timerLabel) {
    return;
  }

  if (window.timer) {
    timerInput.value = Number(window.timer.initialMinute || window.timer.minute || 0);
  }

  timerLabel.innerHTML = `${timerInput.value} minutos`;
}

// When the user clicks on the button, open the modal
btn.onclick = function() {
  syncTimerRangeDisplay();
  modal.style.display = "flex";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

document.addEventListener('DOMContentLoaded', syncTimerRangeDisplay);

