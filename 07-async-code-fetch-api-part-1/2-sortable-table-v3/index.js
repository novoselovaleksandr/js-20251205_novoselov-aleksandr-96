import fetchJson from './utils/fetch-json.js';
import { Component } from "../../components/component.js";
import { createElement, sortObjects } from "../../utils/helper.js";

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable extends Component {
  #headerConfig = [];
  #data = [];
  #sorted = {};
  #isSortLocally = false;
  #arrow = null;
  #bodyElement = null;
  subElements = {};
  #sortableTable = null;
  #headerElement = null;
  #isLoading = false;
  #url = null;
  #start = 0;
  #end = 20;
  #scrollHandler = null;
  #initialEnd = 20;

  constructor(headerConfig = [], {
    url = '',
    data = [],
    sorted = { id: 'title', order: 'asc' },
    isSortLocally = false
  } = {}) {
    super();
    this.#headerConfig = headerConfig;
    this.#data = data;
    this.#sorted = sorted;
    this.#isSortLocally = isSortLocally;
    this.#url = url;
    this.#start = 0;
    this.#end = 20;
    this.#initialEnd = 20;
    
    this.render();
    
    this.#bodyElement = this.element.querySelector('[data-element="body"]');
    this.#headerElement = this.element.querySelector('[data-element="header"]');
    this.#sortableTable = this.element.querySelector('.sortable-table');
    this.#createArrow();
    this.#initSubElements();
    this.#initListeners();

    if (this.#url) {
      this.loadData();
    }

    if (this.#isSortLocally && this.#data.length > 0) {
      this.sortOnClient(this.#sorted.id, this.#sorted.order);
    }
  }

  async loadData(append = false) {
    if (this.#isLoading) { return; }
    
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
      
      if (append) {
        this.#data = [...this.#data, ...data];
      } else {
        this.#data = data;
      }
      
      this.#updateBodyColumns();
      this.#updateEmptyState();
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

  #updateEmptyState = () => {
    if (this.#data.length === 0) {
      this.#sortableTable.classList.add('sortable-table_empty');
    } else {
      this.#sortableTable.classList.remove('sortable-table_empty');
    }
  }

  #headerColumns() {
    if (this.#headerConfig?.length === 0) { return ''; }
    return this.#headerConfig.map(column => {
      const order = column.id === this.#sorted.id ? this.#sorted.order : 'asc';
      
      return `
        <div class="sortable-table__cell sortable-table__header-cell" 
             data-id="${column.id}" 
             data-sortable="${column.sortable}"
             data-order="${order}">
          ${column.title}
        </div>
      `;
    }).join('\n');
  }

  #bodyColumns() {
    if (this.#headerConfig?.length === 0 || this.#data?.length === 0) { return ''; }
    return this.#data.map(row => `
      <a class="sortable-table__row">
        ${this.#headerConfig.map(cell => {
      const cellData = row[cell.id];
      return cell.template 
        ? cell.template(cellData, row) 
        : `<div class="sortable-table__cell">${cellData}</div>`;
    }).join('\n')}
      </a>
    `).join('\n');
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
    this.#headerElement.addEventListener('pointerdown', this.headerClickHandler);
    this.#scrollHandler = this.#onScroll.bind(this);
    window.addEventListener('scroll', this.#scrollHandler);
  }

  #removeListeners() {
    this.#headerElement.removeEventListener('pointerdown', this.headerClickHandler);
    if (this.#scrollHandler) {
      window.removeEventListener('scroll', this.#scrollHandler);
    }
  }

  #onScroll = () => {
    if (this.#isLoading || this.#isSortLocally || !this.#url) { return; }
    
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = document.documentElement.scrollTop;
    const clientHeight = document.documentElement.clientHeight;

    console.log('scrollHeight', scrollHeight);
    console.log('scrollTop', scrollTop);
    console.log('clientHeight', clientHeight);
    
    // осталось прокрутить меньше 100px
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      this.#start = this.#end;
      this.#end += this.#initialEnd;
      this.loadData(true);
    }
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

  sortOnServer(id, order) {
    this.#start = 0;
    this.#end = this.#initialEnd;
    this.#sorted = { id, order };
    this.loadData();
  }

  headerClickHandler = (event) => {
    const cell = event.target.closest('.sortable-table__cell[data-sortable="true"]');
    if (cell) {
      const id = cell.dataset.id;
      const currentOrder = cell.dataset.order;
      const order = currentOrder === 'asc' ? 'desc' : 'asc';
      this.#sorted = { id, order };
      this.sort();
    }
  }

  sortHandler = (fieldValue, orderValue) => {
    this.arrowHandler(fieldValue, orderValue);
    const sortType = this.#headerConfig.find(item => item.id === fieldValue)?.sortType;
    this.#data = sortObjects(this.#data, fieldValue, sortType, orderValue);
    this.#updateBodyColumns();
  }

  arrowHandler = (fieldValue, orderValue) => {
    const headerCell = this.element.querySelector(`.sortable-table__cell[data-id="${fieldValue}"]`);
    if (headerCell) {
      headerCell.dataset.order = orderValue;
      headerCell.append(this.#arrow);
    }
  }

  #arrowTemplate() {
    return `<span data-element="arrow" class="sortable-table__sort-arrow"><span class="sort-arrow"></span></span>`;
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