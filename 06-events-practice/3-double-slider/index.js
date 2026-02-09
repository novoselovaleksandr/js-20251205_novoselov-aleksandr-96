import { Component } from "../../components/component.js";
export default class DoubleSlider extends Component {
    #leftThumb = null;
    #rightThumb = null;
    #fromValueElement = null;
    #toValueElement = null;
    min = 0;
    max = 100;
    #from = 0;
    #to = 100;
    #formatValue = value => value;
    #onLeftThumbPointerMove = event => this.#onThumbPointerMove(event, 'left');
    #onRightThumbPointerMove = event => this.#onThumbPointerMove(event, 'right');
    
    constructor({
      min = 0,
      max = 100,
      formatValue = value => value,
      selected = {}
    } = {}) {
      super();
    
      this.min = min;
      this.max = max;
      this.#from = selected.from ?? min;
      this.#to = selected.to ?? max;
      this.#formatValue = formatValue;

      this.#render();
      this.#fromValueElement = this.element.querySelector('span[data-element="from"]');
      this.#toValueElement = this.element.querySelector('span[data-element="to"]');
      this.#initListeners();
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

      this.#leftThumb.ondragstart = () => false;
      this.#rightThumb.ondragstart = () => false;

      this.#leftThumb.addEventListener('pointerdown', this.#onLeftThumbPointerDown);
      this.#rightThumb.addEventListener('pointerdown', this.#onRightThumbPointerDown);
    }

    #onLeftThumbPointerDown = event => {
      document.addEventListener('pointermove', this.#onLeftThumbPointerMove);
      document.addEventListener('pointerup', this.#onLeftThumbPointerUp);
    }

    #onRightThumbPointerDown = event => {
      document.addEventListener('pointermove', this.#onRightThumbPointerMove);
      document.addEventListener('pointerup', this.#onRightThumbPointerUp);
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

      let leftPercents = leftRelative * 100;
      thumb.style.left = `${leftPercents}%`;

      const approximateValue = leftRelative * (this.max - this.min) + this.min;
      // this.#progress.style.width = `${leftPercents}%`;

      if (direction === 'left') {
        this.#leftThumbValueChangeHandler(Math.round(approximateValue));
      } else {
        this.#rightThumbValueChangeHandler(Math.round(approximateValue));
      }
    };

    #onLeftThumbPointerUp = event => {
      document.removeEventListener('pointermove', this.#onLeftThumbPointerMove);
      document.removeEventListener('pointerup', this.#onLeftThumbPointerUp);
    }

    #leftThumbValueChangeHandler = value => {
      this.#from = value;
      this.#fromValueElement.innerHTML = this.#formatValue(this.#from);
    }

    #rightThumbValueChangeHandler = value => {
      this.#to = value;
      this.#toValueElement.innerHTML = this.#formatValue(this.#to);
    }

    #onRightThumbPointerUp = event => {
      document.removeEventListener('pointermove', this.#onRightThumbPointerMove);
      document.removeEventListener('pointerup', this.#onRightThumbPointerUp);
    }
}