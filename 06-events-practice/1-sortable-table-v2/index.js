import { Component } from "../../components/component.js";
import { createElement, sortObjects } from "../../utils/helper.js";
export default class SortableTable extends Component {
  #headerConfig = [];
  #data = [];
  #sorted = {};
  #isSortLocally = true;
  #arrow = null;
  #bodyElement = null;
  subElements = {}
  #header = null;

  constructor(headerConfig = [], { data = [], sorted = {}, isSortLocally = true } = {}) {
    super();

    this.#headerConfig = headerConfig;
    this.#data = data;
    this.#sorted = sorted;
    this.#isSortLocally = isSortLocally;

    this.render();
    this.#bodyElement = this.element.querySelector('[data-element="body"]');
    this.#header = this.element.querySelector('[data-element="header"]');
    this.#createArrow();
    this.#initSubElements();

    this.sort();

    this.#initListeners();
  }

  #headerColumns() {
    return this.#headerConfig?.length === 0 ? `` : `
      ${this.#headerConfig.map(column => `
        <div class="sortable-table__cell" data-id="${column.id}" data-sortable="${column.sortable}" data-order="asc">
          <span>${column.title}</span>
        </div>
      `).join('\n')}
    `; 
  }

  #bodyColumns() {
    return this.#headerConfig?.length === 0 || this.#data?.length === 0 ? `` : `
      ${this.#data.map(row => `
        <a class="sortable-table__row">
          ${this.#headerConfig.map(cell => {
      const cellData = row[cell.id];
              
      return cell.template ? cell.template(cellData) : `<div class="sortable-table__cell">${cellData}</div>`;
    }).join('\n')}
        </a>
      `
    ).join('\n')}`;
  }

  #initSubElements() {
    const result = {};
    this.element.querySelectorAll('[data-element]').forEach(el => {
      result[el.dataset.element] = el;
    });
    this.subElements = result;
  }

  #initListeners() {
    this.#header.addEventListener('pointerdown', this.headerClickHandler);
  }

  sort = (userSort = null) => {
    if (this.#isSortLocally) {
      this.#sortOnClient(userSort);
    } else {
      this.#sortOnServer();
    }
  }

  #sortOnClient(userSort = null) {
    const order = this.#sorted.order;
    const id = this.#sorted.id;
    const sortable = this.#headerConfig.find(item => item.id === this.#sorted.id)?.sortable;

    if (id && order && sortable) {
      this.sortHandler(id, order, userSort);
    }
  }

  #sortOnServer() {
    throw new Error('Not implemented');
  }

  headerClickHandler = (event) => {
    const cell = event.target.closest('.sortable-table__cell[data-sortable="true"]');
    
    if (cell) {
      const id = cell.dataset.id;
      const order = cell.dataset.order === 'asc' ? 'desc' : 'asc';
      const sorted = {
        id,
        order,
        sortable: true,
      };

      this.#sorted = sorted;
      
      this.sort();
    }
  }

  sortHandler(fieldValue, orderValue, userSort = null) {
    const headerCell = this.element.querySelector(`.sortable-table__cell[data-id="${fieldValue}"]`);
    headerCell.dataset.order = orderValue;
    headerCell.append(this.#arrow);
    const sortType = this.#headerConfig.find(Item => Item.id === fieldValue)?.sortType;

    if (userSort) {
      this.#data.sort(userSort);
    } else {
      this.#data = sortObjects(this.#data, fieldValue, sortType, orderValue);
    }

    this.#bodyElement.innerHTML = this.#bodyColumns();
    
  }

  #arrowTemplate() {
    return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;
  }

  #createArrow() {
    this.#arrow = createElement(this.#arrowTemplate());
  }

  template() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.#headerColumns()}
          </div>
          <div data-element="body" class="sortable-table__body">
              ${this.#bodyColumns()}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    this.html = this.template();
  }
}