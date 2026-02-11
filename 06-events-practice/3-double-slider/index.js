import { Component } from "../../components/component.js";

export default class DoubleSlider extends Component {
  #leftThumb = null;
  #rightThumb = null;
  #progress = null;
  #fromValueElement = null;
  #toValueElement = null;
  min = 0;
  max = 100;
  #from = 0;
  #to = 100;
  #formatValue = value => value;
  #activeThumb = null;
  #isDragging = false;

  constructor({
    min = 0,
    max = 100,
    formatValue = value => value,
    selected = {}
  } = {}) {
    super();

    this.min = min;
    this.max = max;
    this.#from = Math.min(selected.from ?? min, max);
    this.#to = Math.max(selected.to ?? max, min);
    this.#formatValue = formatValue;

    this.#render();
    this.#fromValueElement = this.element.querySelector('span[data-element="from"]');
    this.#toValueElement = this.element.querySelector('span[data-element="to"]');
    this.#initListeners();

    this.#updateSliderPositions();
  }

  #template() {
    return `
      <div class="range-slider">
        <span data-element="from">${this.#formatValue(this.#from)}</span>
        <div class="range-slider__inner">
          <span class="range-slider__progress"></span>
          <span class="range-slider__thumb-left"></span>
          <span class="range-slider__thumb-right"></span>
        </div>
        <span data-element="to">${this.#formatValue(this.#to)}</span>
      </div>
    `;
  }

  #render() {
    this.html = this.#template();
  }

  #initListeners() {
    this.#leftThumb = this.element.querySelector('.range-slider__thumb-left');
    this.#rightThumb = this.element.querySelector('.range-slider__thumb-right');
    this.#progress = this.element.querySelector('.range-slider__progress');

    this.#leftThumb.ondragstart = () => false;
    this.#rightThumb.ondragstart = () => false;

    this.#leftThumb.addEventListener('pointerdown', e => this.#onPointerDown(e, 'left'));
    this.#rightThumb.addEventListener('pointerdown', e => this.#onPointerDown(e, 'right'));
  }

  #onPointerDown = (event, direction) => {
    event.preventDefault();
    this.#activeThumb = direction;
    this.#isDragging = true;

    document.addEventListener('pointermove', this.#onPointerMove);
    document.addEventListener('pointerup', this.#onPointerUp);
  }

  #onPointerMove = (event) => {
    if (!this.#isDragging || !this.#activeThumb) {return;}

    const rect = this.element.getBoundingClientRect();
    if (rect.width === 0) {return;}

    // Рассчитываем позицию относительно слайдера
    const newLeft = event.clientX - rect.left;
    let leftRelative = newLeft / rect.width;
    leftRelative = Math.max(0, Math.min(1, leftRelative));

    // Получаем текущие позиции в процентах
    const leftPercent = parseFloat(this.#leftThumb.style.left) || 0;
    const rightPercent = parseFloat(this.#rightThumb.style.left) || 100;

    // Ограничиваем, чтобы слайдеры не пересекались
    if (this.#activeThumb === 'left') {
      leftRelative = Math.min(leftRelative, rightPercent / 100);
    } else {
      leftRelative = Math.max(leftRelative, leftPercent / 100);
    }

    const leftPercents = leftRelative * 100;
    const thumb = this.#activeThumb === 'left' ? this.#leftThumb : this.#rightThumb;
    thumb.style.left = `${leftPercents}%`;

    // Рассчитываем значение
    const value = Math.round(leftRelative * (this.max - this.min) + this.min);

    if (this.#activeThumb === 'left') {
      this.#from = Math.min(value, this.#to);
      this.#fromValueElement.textContent = this.#formatValue(this.#from);
    } else {
      this.#to = Math.max(value, this.#from);
      this.#toValueElement.textContent = this.#formatValue(this.#to);
    }

    this.#updateProgress();
  }

  #onPointerUp = () => {
    if (!this.#isDragging) {return;}

    this.#isDragging = false;
    this.element.removeEventListener('pointermove', this.#onPointerMove);
    this.element.removeEventListener('pointerup', this.#onPointerUp);

    this.#dispatchRangeSelectEvent();
    this.#activeThumb = null;
  }

  #updateSliderPositions() {
    // Предотвращаем деление на ноль
    const range = this.max - this.min;
    if (range === 0) {
      this.#leftThumb.style.left = '0%';
      this.#rightThumb.style.left = '0%';
      this.#updateProgress();
      return;
    }

    // Вычисляем проценты для текущих значений
    const leftPercent = ((this.#from - this.min) / range) * 100;
    const rightPercent = ((this.#to - this.min) / range) * 100;

    // Ограничиваем значения в пределах 0-100%
    this.#leftThumb.style.left = `${leftPercent}%`;
    this.#rightThumb.style.left = `${rightPercent}%`;

    this.#updateProgress();
  }

  #updateProgress() {
    const leftPercent = parseFloat(this.#leftThumb.style.left) || 0;
    const rightPercent = parseFloat(this.#rightThumb.style.left) || 100;

    this.#progress.style.left = `${leftPercent}%`;
    this.#progress.style.width = `${Math.max(0, rightPercent - leftPercent)}%`;
  }

  #dispatchRangeSelectEvent() {
    this.element.dispatchEvent(new CustomEvent('range-select', {
      detail: { from: this.#from, to: this.#to },
      bubbles: true
    }));
  }

  destroy() {
    this.element.remove();
  }
}