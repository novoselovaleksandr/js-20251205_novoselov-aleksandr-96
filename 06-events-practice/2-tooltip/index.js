import { Component } from "../../components/component.js";

class Tooltip extends Component {
  #tooltipText = '';
  static #instance = null;

  constructor() {
    super();
    
    if (Tooltip.#instance) {
      return Tooltip.#instance;
    }
    
    Tooltip.#instance = this;
  }

  initialize() {
    document.addEventListener('pointerover', this.pointerOverHandler);
    document.addEventListener('pointerout', this.pointerOutHandler);
  }

  pointerOverHandler = event => {
    const dataTooltipElem = event.target.closest('[data-tooltip]');
    if (!dataTooltipElem) {return;}

    const text = dataTooltipElem.dataset.tooltip;
    this.render(text);
  
    document.addEventListener('pointermove', this.pointerMoveHandler);
  }

  pointerMoveHandler = event => {
    this.element.style.left = `${event.clientX + 10}px`;
    this.element.style.top = `${event.clientY + 10}px`;
  }

  pointerOutHandler = event => {
    const dataTooltipElem = event.target?.closest('[data-tooltip]');
    if (!dataTooltipElem) {return;}

    this.remove();

    document.removeEventListener('pointermove', this.pointerMoveHandler);
  }

  #template() {
    return `<div class="tooltip">${this.#tooltipText}</div>`;
  }

  render(text = '') {
    this.#tooltipText = text;

    this.html = this.#template();

    if (this.element && !document.body.contains(this.element)) {
      document.body.append(this.element);
    }
  }
}
export default Tooltip;
