import fetchJson from './utils/fetch-json.js';
import { Component } from '../../components/component.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart extends Component {
  #data = [];
  #isDataLoading = false;
  #from = '';
  #to = '';
  #label = '';
  #link = '#';
  #url = '';
  chartHeight = 50;
  #formatHeading = data => data;
  #subElements = {};

  constructor(options = {}) {
    super();
    
    const { 
      url = '', 
      data = [], 
      range = {from: '', to: ''}, 
      label = '', 
      link = '#', 
      formatHeading = data => data
    } = options;

    this.#data = data;
    this.#from = range.from;
    this.#to = range.to;
    this.#label = label;
    this.#link = link;
    this.#url = url;
    this.#formatHeading = formatHeading;

    this.render();

    if (this.#url && this.#from && this.#to) {
      this.update(this.#from, this.#to);
    }
  }

  get subElements() {
    return this.#subElements;
  }

  #updateSubElements() {
    if (this.element) {
      this.#subElements.header = this.element.querySelector('[data-element="header"]');
      this.#subElements.body = this.element.querySelector('[data-element="body"]');
    }
  }

  isEmpty() {
    return this.#data?.length === 0;
  }

  update = async (from, to) => {
    try {
      let url = new URL(this.#url, BACKEND_URL);

      if (from && to) {
        url.searchParams.set('from', from.toISOString());
        url.searchParams.set('to', to.toISOString());
      }

      this.#isDataLoading = true;
      this.#updateElementState();
      
      const data = await fetchJson(url);
      const values = Object.values(data);
      this.#data = values;
      this.#isDataLoading = false;
      
      this.#updateElementState();

      return data;
    } catch (err) {
      console.error('Failed to load data:', err);
      this.#data = [];
      this.#isDataLoading = false;
      this.#updateElementState();

      return {};
    }
  }

  #updateElementState() {
    if (!this.element) {return;}
    
    // Обновляем класс загрузки
    if (this.#isDataLoading || this.isEmpty()) {
      this.element.classList.add('column-chart_loading');
    } else {
      this.element.classList.remove('column-chart_loading');
    }
    
    // Обновляем содержимое
    const headerElement = this.element.querySelector('[data-element="header"]');
    const bodyElement = this.element.querySelector('[data-element="body"]');
    
    if (headerElement) {
      headerElement.textContent = this.getTotalValue();
    }
    
    if (bodyElement) {
      const maxValue = Math.max(...this.#data);
      const scale = this.chartHeight / (maxValue || 1);
      bodyElement.innerHTML = this.isEmpty() ? '' : this.getColumns(maxValue, scale);
    }
  }

  getTotalValue() {
    return this.#formatHeading(this.#data.reduce((sum, val) => sum + val, 0));
  }

  getColumns(maxValue, scale) {
    return this.#data.map(item => {
      const percent = (item / maxValue * 100).toFixed(0);
      return `<div style="--value: ${Math.floor(item * scale)}" data-tooltip="${percent}%"></div>`;
    }).join('\n');
  }

  template() {
    const maxValue = this.isEmpty() ? 0 : Math.max(...this.#data);
    const scale = this.chartHeight / maxValue;

    return `<div class="column-chart ${this.isEmpty() || this.#isDataLoading ? 'column-chart_loading' : ''}" style="--chart-height: 50">
              <div class="column-chart__title">
                Total ${this.#label}
                ${this.#link !== '#' ? `<a class="column-chart__link" href="${this.#link}">View all</a>` : ''}
              </div>
              <div class="column-chart__container">
                <div data-element="header" class="column-chart__header">${this.getTotalValue()}</div>
                <div data-element="body" class="column-chart__chart">
                  ${this.isEmpty() ? '' : this.getColumns(maxValue, scale)}
                </div>
              </div>
            </div>`;
  }

  render() {
    this.html = this.template();
    this.#updateSubElements();
  }
}