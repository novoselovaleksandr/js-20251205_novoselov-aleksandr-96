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
  #step = 20;
  #loadPromise = null;

  constructor(headerConfig = [], {
    url = '',
    data = [],
    isSortLocally = false
  } = {}) {
    super();
    this.#headerConfig = headerConfig;
    this.#data = data;
    this.#sorted = this.#headerConfig.find(item => item.sortable)?.id;
    this.#isSortLocally = isSortLocally;
    this.#url = url;
    this.#start = 0;
    this.#end = this.#step;

    this.#createArrow();
    this.html = this.template();

    this.#bodyElement = this.element.querySelector('[data-element="body"]');
    this.#headerElement = this.element.querySelector('[data-element="header"]');
    this.#sortableTable = this.element.querySelector('.sortable-table');
    this.#initSubElements();
    this.#initListeners();

    this.arrowHandler(this.#sorted.id, this.#sorted.order);

    if (this.#url && !this.#isSortLocally) {
      this.#loadPromise = this.loadData().catch(() => {});
    }

    if (this.#isSortLocally && this.#data.length > 0) {
      this.sortOnClient(this.#sorted.id, this.#sorted.order);
    }
  }

  async render() {
    if (this.#loadPromise) {
      await this.#loadPromise;
    }
    
    if (this.#url && !this.#isSortLocally && this.#data.length === 0) {
      await this.loadData();
    }

    if (this.#isSortLocally && this.#data.length > 0) {
      this.sortOnClient(this.#sorted.id, this.#sorted.order);
    }

    this.#updateEmptyState();

    return this;
  }

  async loadData(append = false) {
    if (this.#isLoading) {return this.#data;}
    
    this.#isLoading = true;
    this.#toggleLoader();

    try {
      const params = new URLSearchParams({
        _sort: this.#sorted.id,
        _order: this.#sorted.order,
        _start: append ? this.#start : 0,
        _end: append ? this.#end : this.#step
      });

      const url = `${BACKEND_URL}/${this.#url}?${params}`;
      const data = await fetchJson(url);
      
      if (append) {
        this.#data = [...this.#data, ...data];
        this.#start = this.#end;
        this.#end += this.#step;
      } else {
        this.#data = data;
        this.#start = this.#step;
        this.#end = this.#start + this.#step;
      }
      
      this.#updateBodyColumns();
      this.arrowHandler(this.#sorted.id, this.#sorted.order);
      
      return this.#data;
    } catch (error) {
      return this.#data;
    } finally {
      this.#isLoading = false;
      this.#toggleLoader();
      this.#updateEmptyState();
    }
  }

  #toggleLoader = () => {
    if (this.#sortableTable) {
      this.#sortableTable.classList.toggle('sortable-table_loading');
    }
  }

  #updateEmptyState = () => {
    if (!this.#sortableTable) {return;}

    if (!this.#isLoading && this.#data.length === 0) {
      this.#sortableTable.classList.add('sortable-table_empty');
    } else {
      this.#sortableTable.classList.remove('sortable-table_empty');
    }
  }

  #headerColumns() {
    if (!this.#headerConfig?.length) {return '';}
    
    return this.#headerConfig.map(column => {
      const order = column.id === this.#sorted.id ? this.#sorted.order : 'asc';
      return `
        <div class="sortable-table__cell" 
             data-id="${column.id}" 
             data-sortable="${column.sortable}"
             data-order="${order}">
          ${column.title}
        </div>
      `;
    }).join('\n');
  }

  #bodyColumns() {
    if (!this.#headerConfig?.length || !this.#data?.length) {return '';}
    
    return this.#data.map(item => {
      return `
        <a href="#" class="sortable-table__row">
          ${this.#headerConfig.map(column => {
        if (column.template) {
          return column.template(item[column.id], item);
        }
        return `<div class="sortable-table__cell">${item[column.id]}</div>`;
      }).join('')}
        </a>
      `;
    }).join('\n');
  }

  #updateBodyColumns = () => {
    if (this.#bodyElement) {
      this.#bodyElement.innerHTML = this.#bodyColumns();
    }
  }

  #initSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    for (const element of elements) {
      this.subElements[element.dataset.element] = element;
    }
  }

  #initListeners() {
    if (this.#headerElement) {
      this.#headerElement.addEventListener('pointerdown', this.headerClickHandler);
    }
    
    this.#scrollHandler = this.#onScroll.bind(this);
    window.addEventListener('scroll', this.#scrollHandler);
  }

  #removeListeners() {
    if (this.#headerElement) {
      this.#headerElement.removeEventListener('pointerdown', this.headerClickHandler);
    }
    
    if (this.#scrollHandler) {
      window.removeEventListener('scroll', this.#scrollHandler);
    }
  }

  #onScroll = () => {
    if (this.#isLoading || this.#isSortLocally || !this.#url) {return;}
    
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = document.documentElement.scrollTop;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - 100) {
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
    const column = this.#headerConfig.find(item => item.id === id);
    if (column?.sortable) {
      this.sortHandler(id, order);
    }
  }

  sortOnServer(id, order) {
    this.#sorted = { id, order };
    this.#start = 0;
    this.#end = this.#step;
    this.loadData();
  }

  headerClickHandler = (event) => {
    const cell = event.target.closest('[data-sortable="true"]');
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
    
    const column = this.#headerConfig.find(item => item.id === fieldValue);
    const sortType = column?.sortType || 'string';
    
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

  destroy() {
    this.#removeListeners();
    super.destroy();
  }
}