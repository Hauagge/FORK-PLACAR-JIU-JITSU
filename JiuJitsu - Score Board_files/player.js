const pointValues = { mounted: 4, guard: 3, overthrow: 2, advantage: 1, punishment: 1 }

function Player(dataKey, name) {
  this.mounted = 0;
  this.guard = 0;
  this.overthrow = 0;
  this.advantage = 0;
  this.punishment = 0;

  this.dataKey = dataKey;
  this.name = name;

  this.emitStateChange = () => {
    document.dispatchEvent(new CustomEvent('match:state-changed'));
  }

  this.total = () => { return this.mounted + this.guard + this.overthrow }

  this.getState = () => ({
    name: this.name,
    mounted: this.mounted,
    guard: this.guard,
    overthrow: this.overthrow,
    advantage: this.advantage,
    punishment: this.punishment,
  })

  this.loadState = (state = {}) => {
    this.name = state.name || this.name;
    this.mounted = Number(state.mounted || 0);
    this.guard = Number(state.guard || 0);
    this.overthrow = Number(state.overthrow || 0);
    this.advantage = Number(state.advantage || 0);
    this.punishment = Number(state.punishment || 0);

    this.renderAllPoints();
    this.setName(this.name, false);
  }

  this.mountedIncrement = () => { this.pointIncrement('mounted'); }
  this.mountedDecrement = () => { this.pointDecrement('mounted'); }
  this.guardIncrement = () => { this.pointIncrement('guard'); }
  this.guardDecrement = () => { this.pointDecrement('guard'); }
  this.overthrowIncrement = () => { this.pointIncrement('overthrow'); }
  this.overthrowDecrement = () => { this.pointDecrement('overthrow'); }
  this.advantageIncrement = () => { this.pointIncrement('advantage'); }
  this.advantageDecrement = () => { this.pointDecrement('advantage'); }
  this.punishmentIncrement = () => { this.pointIncrement('punishment'); }
  this.punishmentDecrement = () => { this.pointDecrement('punishment'); }

  this.pointIncrement = function (key) {
    this[key] += pointValues[key]

    this.renderPointElement(key)
    this.renderTotal(key)
    this.emitStateChange();

    return this[key];
  }

  this.pointDecrement = function (key) {
    const result = this[key] - pointValues[key]
    if (result >= 0) {
      this[key] = result;

      this.renderPointElement(key)
      this.renderTotal(key)
      this.emitStateChange();
    }

    return this[key];
  }

  this.renderTotal = (key) => {
    if (['advantage', 'punishment'].includes(key)) { return }

    this.renderPointElement('total')
  }

  this.renderPointElement = (key) => {
    const element = document.querySelector(`[data-point-${key}="${this.dataKey}"]`)
    const result = (key == 'total') ? this.total() : this[key]

    if (element) { element.innerHTML = result }

    return this[key];
  }

  this.renderAllPoints = () => {
    ['mounted', 'guard', 'overthrow', 'advantage', 'punishment', 'total'].forEach(key => {
      this.renderPointElement(key)
    })
  }

  this.reset = () => {
    this.mounted = 0;
    this.guard = 0;
    this.overthrow = 0;
    this.advantage = 0;
    this.punishment = 0;

    this.renderAllPoints();
    this.emitStateChange();
  }

  this.setName = (name, shouldPersist = true) => {
    this.name = name;
    document.querySelector(`[data-player-name="${this.dataKey}"]`).innerHTML = this.name;

    if (shouldPersist) {
      this.emitStateChange();
    }
  }
}
