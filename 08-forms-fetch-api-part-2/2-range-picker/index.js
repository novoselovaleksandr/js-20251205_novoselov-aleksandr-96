import { Component } from "../../components/component.js";

export default class RangePicker extends Component {
  from = null;
  to = null;
  isOpen = false;
  
  currentMonth = null;
  currentYear = null;

  #rangepickerInput = null;
  #boundRangepickerClickHandler = null;
  #rangepickerSelector = null;
  
  #boundSelectorClickHandler = null;
  #boundDocumentClickHandler = null;

  constructor({ from, to } = {}) {
    super();
    this.from = from ?? this.from;
    this.to = to ?? this.to;

    // Инициализируем текущий месяц для отображения
    if (this.from) {
      this.currentMonth = this.from.getMonth();
      this.currentYear = this.from.getFullYear();
    } else {
      const now = new Date();
      this.currentMonth = now.getMonth();
      this.currentYear = now.getFullYear();
    }

    this.render();

    this.#rangepickerInput = this.element.querySelector('.rangepicker__input');
    this.#rangepickerSelector = this.element.querySelector('.rangepicker__selector');
    
    this.#boundRangepickerClickHandler = this.rangepickerClickHandler.bind(this);
    this.#boundSelectorClickHandler = this.selectorClickHandler.bind(this);
    this.#boundDocumentClickHandler = this.documentClickHandler.bind(this);

    this.#initListeners();
  }

  render() {
    this.html = this.template();
    this.#rangepickerInput = this.element.querySelector('.rangepicker__input');
    this.#rangepickerSelector = this.element.querySelector('.rangepicker__selector');
  }

  #initListeners() {
    this.#rangepickerInput.addEventListener('click', this.#boundRangepickerClickHandler);
    this.element.addEventListener('click', this.#boundSelectorClickHandler);
    document.addEventListener('click', this.#boundDocumentClickHandler);
  }

  #removeListeners() {
    this.#rangepickerInput.removeEventListener('click', this.#boundRangepickerClickHandler);
    this.element.removeEventListener('click', this.#boundSelectorClickHandler);
    document.removeEventListener('click', this.#boundDocumentClickHandler);
  }

  destroy() {
    this.#removeListeners();
    super.destroy();
  }

  rangepickerClickHandler(event) {
    event.stopPropagation(); // Чтобы не сработал document click сразу
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      this.element.classList.add('rangepicker_open');
      this.renderSelector();
    } else {
      this.close();
    }
  }

  close() {
    this.isOpen = false;
    this.element.classList.remove('rangepicker_open');
  }

  documentClickHandler(event) {
    if (this.isOpen && !this.element.contains(event.target)) {
      this.close();
    }
  }

  // Единый обработчик для всех кликов внутри селектора (делегирование)
  selectorClickHandler(event) {
    const target = event.target;

    // Клик по левой стрелке
    if (target.closest('.rangepicker__selector-control-left')) {
      event.stopPropagation();
      this.switchMonths(-1);
      return;
    }

    // Клик по правой стрелке
    if (target.closest('.rangepicker__selector-control-right')) {
      event.stopPropagation();
      this.switchMonths(1);
      return;
    }

    // Клик по дате
    const cell = target.closest('.rangepicker__cell');
    if (cell && !cell.style.visibility === 'hidden') {
      event.stopPropagation();
      const day = parseInt(cell.textContent.trim(), 10);
      
      // Определяем месяц и год из родителя .rangepicker__calendar
      const calendar = cell.closest('.rangepicker__calendar');
      const month = parseInt(calendar.dataset.month, 10);
      const year = parseInt(calendar.dataset.year, 10);

      this.selectDate(new Date(year, month, day));
    }
  }

  selectDate(date) {
    // Логика выбора диапазона
    if (!this.from || (this.from && this.to)) {
      // Начинаем новый выбор
      this.from = date;
      this.to = null;
    } else if (date < this.from) {
      // Если выбрали дату раньше текущей from, то это новая from
      this.from = date;
      this.to = null;
    } else if (date.getTime() === this.from.getTime()) {
      // Кликнули ту же дату - сброс
      this.from = null;
      this.to = null;
    } else {
      // Завершаем выбор
      this.to = date;
    }

    // Обновляем input
    this.updateInput();
    
    // Перерисовываем календарь с новыми классами
    this.renderSelector();
    
    if (this.from && this.to) {
      this.element.dispatchEvent(new CustomEvent('date-select', {
        bubbles: true,
        detail: { from: this.from, to: this.to }
      }));
    }
  }

  updateInput() {
    const spans = this.#rangepickerInput.querySelectorAll('span');
    if (spans.length >= 3) {
      spans[0].textContent = this.from ? this.formatDate(this.from) : '';
      spans[2].textContent = this.to ? this.formatDate(this.to) : '';
    }
  }

  switchMonths(direction) {
    let newMonth = this.currentMonth + direction;
    let newYear = this.currentYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }

    this.currentMonth = newMonth;
    this.currentYear = newYear;

    this.renderSelector();
  }

  renderSelector() {
    if (!this.#rangepickerSelector) {return;}
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
    return this.selectorTemplateWithDate(this.currentYear, this.currentMonth);
  }

  selectorTemplateWithDate(year, month) {
    const firstMonth = month;
    const firstYear = year;
    const secondMonth = firstMonth === 11 ? 0 : firstMonth + 1;
    const secondYear = firstMonth === 11 ? firstYear + 1 : firstYear;

    return `
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__calendar" data-month="${firstMonth}" data-year="${firstYear}">
        <div class="rangepicker__month-indicator">${this.getMonthName(firstMonth)}</div>
        <div class="rangepicker__selector-control-left"></div>
        <div class="rangepicker__selector-control-right"></div>
        <div class="rangepicker__day-of-week">
          <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
        </div>
        <div class="rangepicker__date-grid">
          ${this.renderDateGrid(firstYear, firstMonth)}
        </div>
      </div>
      <div class="rangepicker__calendar" data-month="${secondMonth}" data-year="${secondYear}">
        <div class="rangepicker__month-indicator">${this.getMonthName(secondMonth)}</div>
        <div class="rangepicker__day-of-week">
          <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
        </div>
        <div class="rangepicker__date-grid">
          ${this.renderDateGrid(secondYear, secondMonth)}
        </div>
      </div>
    `;
  }

  renderDateGrid(year, month) {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    // 0 - Вс, 1 - Пн, ..., 6 - Сб. Нам нужно Пн=1 ... Вс=7
    let startDay = firstDayOfMonth.getDay();
    startDay = startDay === 0 ? 7 : startDay;
    
    const cells = [];
    
    // Пустые ячейки
    for (let i = 1; i < startDay; i++) {
      cells.push(`<div class="rangepicker__cell" style="visibility: hidden"></div>`);
    }
    
    // Дни
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const classes = ['rangepicker__cell'];
      
      if (this.from && this.isSameDate(currentDate, this.from)) {
        classes.push('rangepicker__selected-from');
      }
      
      if (this.to && this.isSameDate(currentDate, this.to)) {
        classes.push('rangepicker__selected-to');
      }
      
      if (this.from && this.to && currentDate > this.from && currentDate < this.to) {
        classes.push('rangepicker__selected-between');
      }
      
      cells.push(`<div class="${classes.join(' ')}">${day}</div>`);
    }
    
    return cells.join('');
  }

  isSameDate(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  getMonthName(month) {
    const months = [
      'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
      'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
    ];
    return months[month];
  }

  formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }
}