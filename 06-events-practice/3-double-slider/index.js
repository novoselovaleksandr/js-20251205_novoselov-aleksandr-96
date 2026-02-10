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

      this.#leftThumb.addEventListener('pointerdown', this.#onLeftThumbPointerDown);
      this.#rightThumb.addEventListener('pointerdown', this.#onRightThumbPointerDown);
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
      this.#leftThumb.style.left = `${Math.max(0, Math.min(100, leftPercent))}%`;
      this.#rightThumb.style.left = `${Math.max(0, Math.min(100, rightPercent))}%`;

      this.#updateProgress();
    }

    #onLeftThumbPointerDown = event => {
      event.preventDefault();
      
      const moveHandler = event => this.#onThumbPointerMove(event, 'left');
      const upHandler = () => {
        document.removeEventListener('pointermove', moveHandler);
        document.removeEventListener('pointerup', upHandler);
        this.#updateProgress();
        this.#dispatchRangeSelectEvent();
      };
      
      document.addEventListener('pointermove', moveHandler);
      document.addEventListener('pointerup', upHandler);
    }

    #onRightThumbPointerDown = event => {
      event.preventDefault();
      
      const moveHandler = event => this.#onThumbPointerMove(event, 'right');
      const upHandler = () => {
        document.removeEventListener('pointermove', moveHandler);
        document.removeEventListener('pointerup', upHandler);
        this.#updateProgress();
        this.#dispatchRangeSelectEvent();
      };
      
      document.addEventListener('pointermove', moveHandler);
      document.addEventListener('pointerup', upHandler);
    }

    #onThumbPointerMove = (event, direction) => {
      if (!this.element) { return; }

      const thumb = direction === 'left'
        ? this.#leftThumb
        : this.#rightThumb;

      const rect = this.element.getBoundingClientRect();
      if (rect.width === 0) { return; }

      const newLeft = event.clientX - rect.left;
      let leftRelative = newLeft / rect.width;

      leftRelative = Math.max(0, Math.min(1, leftRelative)); // Ограничиваем диапазон

      // Получаем текущие позиции слайдеров в процентах
      const leftThumbLeft = parseFloat(this.#leftThumb.style.left) || 0;
      const rightThumbLeft = parseFloat(this.#rightThumb.style.left) || 100;

      // Ограничиваем движение, чтобы слайдеры не пересекались
      if (direction === 'left') {
        // Левый слайдер не может пройти дальше правого
        const maxLeftPercent = rightThumbLeft;
        leftRelative = Math.min(leftRelative, maxLeftPercent / 100);
      } else {
        // Правый слайдер не может пройти дальше левого
        const minLeftPercent = leftThumbLeft;
        leftRelative = Math.max(leftRelative, minLeftPercent / 100);
      }

      let leftPercents = leftRelative * 100;
      thumb.style.left = `${leftPercents}%`;

      const approximateValue = leftRelative * (this.max - this.min) + this.min;

      if (direction === 'left') {
        this.#leftThumbValueChangeHandler(Math.round(approximateValue));
      } else {
        this.#rightThumbValueChangeHandler(Math.round(approximateValue));
      }
      
      this.#updateProgress();
    }

    #leftThumbValueChangeHandler = value => {
      // Ограничиваем, чтобы не пересекался с правым слайдером
      this.#from = Math.min(value, this.#to);
      this.#fromValueElement.innerHTML = this.#formatValue(this.#from);
    }

    #rightThumbValueChangeHandler = value => {
      // Ограничиваем, чтобы не пересекался с левым слайдером
      this.#to = Math.max(value, this.#from);
      this.#toValueElement.innerHTML = this.#formatValue(this.#to);
    }

    #updateProgress() {
      if (!this.element || !this.#progress || !this.#leftThumb || !this.#rightThumb) {return;}
      
      const leftPercent = parseFloat(this.#leftThumb.style.left) || 0;
      const rightPercent = parseFloat(this.#rightThumb.style.left) || 100;
      
      this.#progress.style.left = `${leftPercent}%`;
      this.#progress.style.width = `${Math.max(0, rightPercent - leftPercent)}%`;
    }

    #dispatchRangeSelectEvent() {
      if (!this.element) {return;}

      this.element.dispatchEvent(new CustomEvent('range-select', {
        detail: { from: this.#from, to: this.#to },
        bubbles: true
      }));
    }
}