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

  #headerColumns() {
    return this.#headerConfig?.lenght === 0 ? `` : `
      ${this.#headerConfig.map(column => `
        <div class="sortable-table__cell" data-id="${column.id}" data-sortable="${column.sortable}" data-order="asc">
          <span>${column.title}</span>
          <span data-element="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
          </span>
        </div>
      `).join('\n')}
    `; 
  }

  #bodyColumns() {
    return this.#headerConfig?.length === 0 || this.#data?.length === 0 ? `` : `
      ${this.#data.map(row => 
      this.#headerConfig.map(cell => {
        const cellData = row[cell.id];
          
        return cell.template ? cell.template(cellData) : `<div class="sortable-table__cell">${cellData}</div>`;
      }).join('\n')
    ).join('\n')}`;
  }

  template() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.#headerColumns()}
          </div>
          <div data-element="body" class="sortable-table__body">
            <a href="/products/3d-ochki-epson-elpgs03" class="sortable-table__row">
              ${this.#bodyColumns()}
            </a>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    this.html = this.template();
  }
}

