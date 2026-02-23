import { Component } from "../../components/component.js";

export default class SortableList extends Component {
  #items = [];
  #draggingElement = null;
  #placeholder = null;
  #dragOffsetY = 0;
  #boundOnPointerDown = null;

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
      item.classList.add('sortable-list__item');
      return item.outerHTML;
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
    const dragHandle = event.target.closest('[data-grab-handle]');

    if (deleteHandle) {
      event.preventDefault();

      const item = deleteHandle.closest('.sortable-list__item');

      if (item) {
        item.remove();
      }

      return;
    }

    if (dragHandle) {
      event.preventDefault();

      const item = dragHandle.closest('.sortable-list__item');

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

    document.addEventListener('pointermove', this.#onPointerMove);
    document.addEventListener('pointerup', this.#onPointerUp);
  }

  #onPointerMove = (e) => {
    if (!this.#draggingElement) {return;}

    const y = e.clientY - this.#dragOffsetY;
    this.#draggingElement.style.top = `${y}px`;

    const items = Array.from(this.element.children).filter(
      child => child !== this.#draggingElement && child !== this.#placeholder
    );

    let targetElement = null;

    // Ищем элемент, перед которым нужно вставить плейсхолдер
    for (const item of items) {
      const rect = item.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;

      // Сравниваем позицию курсора с серединой элемента
      if (e.clientY < midY) {
        targetElement = item;
        break;
      }
    }

    // Если нашли элемент для вставки перед
    if (targetElement) {
    // Вставляем плейсхолдер перед найденным элементом
      if (this.#placeholder.nextSibling !== targetElement) {
        this.element.insertBefore(this.#placeholder, targetElement);
      }
    } else {
    // Если не нашли элемент (курсор ниже всех элементов), вставляем в конец
      if (this.#placeholder.nextSibling !== null) {
        this.element.appendChild(this.#placeholder);
      }
    }
  };

  #onPointerUp = () => {
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
}