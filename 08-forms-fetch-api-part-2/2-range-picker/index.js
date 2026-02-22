import { Component } from "../../components/component.js";

export default class RangePicker extends Component {
  from = null;
  to = null;
  isOpen = false;
  #rangepickerInput = null;
  #boundRangepickerClickHandler = null
  #rangepickerSelector = null

  constructor({ from, to } = {}) {
    super();
    this.from = from ?? this.from;
    this.to = to ?? this.to;

    this.render();

    this.#rangepickerInput = this.element.querySelector('.rangepicker__input');
    this.#boundRangepickerClickHandler = this.rangepickerClickHandler.bind(this);

    this.#rangepickerSelector = this.element.querySelector('.rangepicker__selector');

    this.#initListeners();
  }

  render() {
    this.html = this.template();
  }

  #initListeners() {
    this.#rangepickerInput.addEventListener('click', this.#boundRangepickerClickHandler);
  }

  #removeListeners() {
    this.#rangepickerInput.removeEventListener('click', this.#boundRangepickerClickHandler);
  }

  destroy() {
    this.#removeListeners();
    super.destroy();
  }

  rangepickerClickHandler() {
    this.isOpen = !this.isOpen;
    this.element.classList.toggle('rangepicker_open');
    
    if (this.isOpen) {
      this.renderSelector();
    } 


  }

  renderSelector() {
    this.#rangepickerSelector.innerHTML = this.selectorTemplate();
  }

  template() {
    const fromStr = this.from ? this.formatDate(this.from) : '';
    const toStr = this.to ? this.formatDate(this.to) : '';

    return `
      <div class="rangepicker">
        <div class="rangepicker__input">
          <span>${fromStr}</span>
          <span>-</span>
          <span>${toStr}</span>
        </div>
        <div class="rangepicker__selector"></div>
      </div>
    `;
  }

  selectorTemplate() {
    return `
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__calendar">
        <div class="rangepicker__month-indicator"></div>
        <div class="rangepicker__selector-control-left"></div>
        <div class="rangepicker__selector-control-right"></div>
        <div class="rangepicker__day-of-week">
          <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
        </div>
        <div class="rangepicker__date-grid"></div>
      </div>
      <div class="rangepicker__calendar">
        <div class="rangepicker__month-indicator"></div>
        <div class="rangepicker__day-of-week">
          <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
        </div>
        <div class="rangepicker__date-grid"></div>
      </div>
    `;
  }

  formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }
}