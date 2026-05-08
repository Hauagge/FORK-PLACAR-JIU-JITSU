function Timer(minute = 5, renderElementSelector = '[data-show-timer]', countdownSoundSelector = '[data-countdown-sound]') {
  this.initialMinute = minute;
  this.minute = minute;
  this.started = false;
  this.finished = false;

  this.timeInSeconds = () => {
    return this.minute * 60;
  }

  this.setMinutes = (minute) => {
    this.minute = minute;
    this.initialMinute = this.minute;
    this.stop();
    this.render();
  }

  this.toggle = () => { this.started ? this.stop() : this.start(); }

  this.start = () => {
    this.finished = false;
    this.started = true;

    this.interval = setInterval(() => {
      if (this.timeInSeconds() >= 1) {
        this.minute = (this.timeInSeconds() - 1) / 60;
      } else {
        this.minute = 0;
        this.stop();
        this.finished = true;
      }

      this.countSoundPlayer(this.timeInSeconds() <= 4)

      this.render();

      if (this.finished) {
        document.dispatchEvent(new CustomEvent('match:finished'));
      }
    }, 1000);
  }

  this.stop = () => {
    this.started = false;
    this.countSoundPlayer(false)

    clearInterval(this.interval);
  }

  this.reset = () => {
    this.started = false;
    this.finished = false;
    this.minute = this.initialMinute;
    this.countSoundPlayer(false);
    clearInterval(this.interval);
    this.render();
  }

  this.timer_format = () => {
    const minutes = Math.floor(this.timeInSeconds() / 60);
    const seconds = this.timeInSeconds() % 60;

    return `${minutes.toFixed(0).padStart(2, '0')}:${seconds.toFixed(0).padStart(2, '0')}`;
  }

  this.render = () => {
    const element = document.querySelector(renderElementSelector)

    if (element) { element.innerHTML = this.timer_format() }
  }

  this.countSoundPlayer = (play = true) => {
    const audioPlayer = document.querySelector(countdownSoundSelector);

    if (play) {
      audioPlayer.paused && audioPlayer.play();
    } else {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
    }
  }
}
