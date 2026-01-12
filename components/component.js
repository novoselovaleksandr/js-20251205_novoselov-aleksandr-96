export class Component {
    #element = null;

    constructor(tagName = 'div') {
      this.#element = document.createElement(tagName);
    }

    set html(content) {
      this.#element.innerHTML = content;
    }

    get element() {
      return this.#element.firstElementChild;
    }
}