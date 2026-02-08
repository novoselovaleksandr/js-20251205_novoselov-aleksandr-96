export class Component {
    #element = null;
    #tagname = 'div'

    constructor(tagName = 'div') {
      this.#tagname = tagName ?? this.#tagname;
    }

    set html(content) {
      const elem = document.createElement(this.#tagname);
      elem.innerHTML = content?.trim();
      this.#element = elem.firstElementChild;
    }

    get element() {
      return this.#element;
    }

    remove() {
      if (this.#element) {
        this.#element.remove();
      }
    }

    destroy() {
      this.#element = null;
    }
}