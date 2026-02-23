import { Component } from "../../components/component.js";

export default class SortableList extends Component {
  #items = [];
  #draggingElement = null;
  #placeholder = null;
  #dragOffsetY = 0;
  #boundOnPointerDown = null;
  #onPointerMove = null;
  #onPointerUp = null;

  constructor({ items = [] } = {}) {
    super();
    this.#items = items;
    this.render();
    this.#boundOnPointerDown = this.#onPointerDown.bind(this);
    this.#initListeners();
  }

  render() {
    this.html = `<ul class="sortable-list">${this.#template()}</ul>`;
  }

  #template() {
    return this.#items.map(item => {
      const clone = item.cloneNode(true);
      clone.classList.add('sortable-list__item');
      return clone.outerHTML;
    }).join('');
  }

  destroy() {
    this.#removeListeners();
    super.destroy();
  }


  #initListeners() {
    this.element.addEventListener('pointerdown', this.#boundOnPointerDown);
  }

  #removeListeners() {
    this.element.removeEventListener('pointerdown', this.#boundOnPointerDown);
  }

  #onPointerDown(event) {
    const deleteHandle = event.target.closest('[data-delete-handle]');
    const grabHandle = event.target.closest('[data-grab-handle]');

    if (deleteHandle) {
      event.preventDefault();
      const item = deleteHandle.closest('.sortable-list__item');
      if (item) {
        item.remove();
      }
      return;
    }

    if (grabHandle) {
      event.preventDefault();
      const item = grabHandle.closest('.sortable-list__item');
      if (item) {
        this.#onDragStart(event, item);
      }
    }
  }

  #onDragStart(e, item) {
    this.#draggingElement = item;
    const rect = item.getBoundingClientRect();
    this.#dragOffsetY = e.clientY - rect.top;

    item.classList.add('sortable-list__item_dragging');
    item.style.width = `${rect.width}px`;
    item.style.left = `${rect.left}px`;
    item.style.top = `${rect.top}px`;

    this.#placeholder = document.createElement('li');
    this.#placeholder.className = 'sortable-list__placeholder';
    this.#placeholder.style.height = `${rect.height}px`;
    item.parentNode.insertBefore(this.#placeholder, item.nextSibling);

    this.#onPointerMove = (e) => {
      if (!this.#draggingElement) {return;}

      const y = e.clientY - this.#dragOffsetY;
      this.#draggingElement.style.top = `${y}px`;

      const items = Array.from(this.element.children).filter(
        child => child !== this.#draggingElement && child !== this.#placeholder
      );

      for (const item of items) {
        const rect = item.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;

        if (y < midY) {
          if (this.#placeholder.previousSibling !== item) {
            this.element.insertBefore(this.#placeholder, item);
          }
          return;
        }
      }

      if (this.#placeholder.nextSibling !== null) {
        this.element.appendChild(this.#placeholder);
      }
    };

    this.#onPointerUp = () => {
      if (!this.#draggingElement) {return;}

      this.#draggingElement.classList.remove('sortable-list__item_dragging');
      this.#draggingElement.style.position = '';
      this.#draggingElement.style.left = '';
      this.#draggingElement.style.top = '';
      this.#draggingElement.style.width = '';
      this.#draggingElement.style.margin = '';

      this.element.insertBefore(this.#draggingElement, this.#placeholder);
      this.#placeholder.remove();

      document.removeEventListener('pointermove', this.#onPointerMove);
      document.removeEventListener('pointerup', this.#onPointerUp);

      this.#draggingElement = null;
      this.#placeholder = null;
    };

    document.addEventListener('pointermove', this.#onPointerMove);
    document.addEventListener('pointerup', this.#onPointerUp);
  }
}