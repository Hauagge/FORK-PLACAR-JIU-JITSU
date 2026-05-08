function Timer(minute = 5, renderElementSelector = '[data-show-timer]', countdownSoundSelector = '[data-countdown-sound]') {
  this.initialMinute = Number(minute);
  this.initialSeconds = Number(minute) * 60;
  this.remainingSeconds = this.initialSeconds;
  this.started = false;
  this.finished = false;
  this.interval = null;

  this.emitStateChange = () => {
    document.dispatchEvent(new CustomEvent('match:state-changed'));
  }

  this.timeInSeconds = () => this.remainingSeconds;

  this.getState = () => ({
    initialMinute: this.initialMinute,
    remainingSeconds: this.remainingSeconds,
    started: this.started,
    finished: this.finished,
  })

  this.loadState = (state = {}) => {
    const initialMinute = Number(state.initialMinute ?? this.initialMinute);
    const remainingSeconds = Number(state.remainingSeconds ?? initialMinute * 60);

    this.initialMinute = initialMinute;
    this.initialSeconds = initialMinute * 60;
    this.remainingSeconds = Math.max(0, remainingSeconds);
    this.started = false;
    this.finished = Boolean(state.finished) && this.remainingSeconds === 0;
    this.stop(false);
    this.render();
  }

  this.setMinutes = (minute, shouldEmit = true) => {
    this.initialMinute = Number(minute);
    this.initialSeconds = this.initialMinute * 60;
    this.remainingSeconds = this.initialSeconds;
    this.finished = false;
    this.stop(false);
    this.render();

    if (shouldEmit) {
      this.emitStateChange();
    }
  }

  this.toggle = () => {
    this.started ? this.stop() : this.start();
  }

  this.start = () => {
    if (this.remainingSeconds <= 0 || this.started) {
      this.render();
      return;
    }

    this.finished = false;
    this.started = true;
    clearInterval(this.interval);
    this.emitStateChange();

    this.interval = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds -= 1;
      }

      if (this.remainingSeconds <= 0) {
        this.remainingSeconds = 0;
        this.finished = true;
        this.stop(false);
      }

      this.countSoundPlayer(this.remainingSeconds > 0 && this.remainingSeconds <= 4);
      this.render();
      this.emitStateChange();

      if (this.finished) {
        document.dispatchEvent(new CustomEvent('match:finished'));
      }
    }, 1000);
  }

  this.stop = (shouldEmit = true) => {
    this.started = false;
    this.countSoundPlayer(false);
    clearInterval(this.interval);
    this.interval = null;

    if (shouldEmit) {
      this.emitStateChange();
    }
  }

  this.reset = (shouldEmit = true) => {
    this.started = false;
    this.finished = false;
    this.remainingSeconds = this.initialSeconds;
    this.countSoundPlayer(false);
    clearInterval(this.interval);
    this.interval = null;
    this.render();

    if (shouldEmit) {
      this.emitStateChange();
    }
  }

  this.timer_format = () => {
    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  this.render = () => {
    const element = document.querySelector(renderElementSelector);

    if (element) {
      element.innerHTML = this.timer_format();
    }
  }

  this.countSoundPlayer = (play = true) => {
    const audioPlayer = document.querySelector(countdownSoundSelector);

    if (!audioPlayer) {
      return;
    }

    if (play) {
      audioPlayer.paused && audioPlayer.play();
    } else {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
    }
  }
}
