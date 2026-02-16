import fetchJson from './utils/fetch-json.js';
import { Component } from "../../components/component.js";
import { createElement, sortObjects } from "../../utils/helper.js";

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable extends Component {
  #headerConfig = [];
  #data = [];
  #sorted = {};
  #isSortLocally = true;
  #arrow = null;
  #bodyElement = null;
  subElements = {}
  #sortableTable = null
  #header = null;
  #isLoading = false;
  #url = null;
  #start = 0;
  #end = 20;

  constructor(headerConfig = [], { url = null, data = [], sorted = { id: 'title', order: 'asc' } } = {}, isSortLocally = false, start = 0, end = 20) {
    super();

    this.#headerConfig = headerConfig;
    this.#data = data;
    this.#sorted = sorted;
    this.#isSortLocally = isSortLocally;
    this.#url = url;
    this.#start = start;

    this.render();
    this.#bodyElement = this.element.querySelector('[data-element="body"]');
    this.#header = this.element.querySelector('[data-element="header"]');
    this.#sortableTable = this.element.querySelector('.sortable-table');
    this.#createArrow();
    this.#initSubElements();
    this.#initListeners();

    if (this.#url) {
      this.loadData();
    }

    if (this.#isSortLocally) {
      this.sort();
    }

  }

  async loadData() {
    if (this.#isLoading) {return;}
  
    this.#isLoading = true;
    this.#toggleLoader();
  
    try {
      const params = new URLSearchParams({
        _sort: this.#sorted.id,
        _order: this.#sorted.order,
        _start: this.#start,
        _end: this.#end
      });
  
      const data = await fetchJson(`${BACKEND_URL}/${this.#url}?${params}`);
  
      this.#data = data;
      this.#updateBodyColumns();
      this.arrowHandler(this.#sorted.id, this.#sorted.order);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.#isLoading = false;
      this.#toggleLoader();
    }
  }

   #toggleLoader = () => {
     this.#sortableTable.classList.toggle('sortable-table_loading');
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

  #updateBodyColumns = () => {
    this.#bodyElement.innerHTML = this.#bodyColumns();
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

  #removeListeners() {
    this.#header.removeEventListener('pointerdown', this.headerClickHandler);
  }

  sort = () => {
    if (this.#isSortLocally) {
      this.sortOnClient(this.#sorted.id, this.#sorted.order);
    } else {
      this.sortOnServer(this.#sorted.id, this.#sorted.order);
    }
  }

  sortOnClient(id, order) {
    const sortable = this.#headerConfig.find(item => item.id === id)?.sortable;

    if (id && order && sortable) {
      this.sortHandler(id, order);
    }
  }

  sortOnServer (id, order) {
    const sorted = {
      id,
      order,
    };

    this.#sorted = sorted;
    this.loadData();
  }

  headerClickHandler = (event) => {
    const cell = event.target.closest('.sortable-table__cell[data-sortable="true"]');
    
    if (cell) {
      const id = cell.dataset.id;
      const currentOrder = cell.dataset.order;
      const order = currentOrder === 'asc' ? 'desc' : 'asc';
      const sorted = {
        id,
        order,
      };

      this.#sorted = sorted;
      
      this.sort();
    }
  }

  sortHandler = (fieldValue, orderValue, userSort = null) => {
    this.arrowHandler(fieldValue, orderValue);
    const sortType = this.#headerConfig.find(Item => Item.id === fieldValue)?.sortType;

    if (userSort) {
      this.#data.sort(userSort);
    } else {
      this.#data = sortObjects(this.#data, fieldValue, sortType, orderValue);
    }

    this.#bodyElement.innerHTML = this.#bodyColumns();
    
  }

  arrowHandler = (fieldValue, orderValue) => {
    const headerCell = this.element.querySelector(`.sortable-table__cell[data-id="${fieldValue}"]`);
    headerCell.dataset.order = orderValue;
    headerCell.append(this.#arrow);
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
          <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
          <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
            <div>
              <p>No products satisfies your filter criteria</p>
              <button type="button" class="button-primary-outline">Reset all filters</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    this.html = this.template();
  }

  destroy() {
    super.destroy();
    this.#removeListeners();
  }
}
