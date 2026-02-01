import { Component } from "../../components/component.js";
export default class SortableTable extends Component {
  #headerConfig = [];
  #data = [];

  constructor(headerConfig = [], data = []) {
    super();

    this.#headerConfig = headerConfig;
    this.#data = data;

    this.render();
  }

  template() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">

          </div>
          <div data-element="body" class="sortable-table__body">

          </div>
        </div>
      </div>
    `;
  }

  render() {
    this.html = this.template();
  }
}

