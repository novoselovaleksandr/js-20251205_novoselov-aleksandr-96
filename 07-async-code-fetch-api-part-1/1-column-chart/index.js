import fetchJson from './utils/fetch-json.js';
import { Component } from '../../components/component.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart extends Component {
  #data = [];
  #isDataLoading = false;
  #from = '';
  #to = '';
  #label = '';
  #value = 0;
  #link = '#';
  #url = '';
  chartHeight = 50;
  #formatHeading = data => data;

  constructor(options = {}) {
    super();

    const { url = '', data = [], range = {from: '', to: ''}, label = '', value = 0, link = '#', formatHeading = data => data} = options;

    this.#data = data;
    this.#from = range.from;
    this.#to = range.to;
    this.#label = label;
    this.#value = value;
    this.#link = link;
    this.#url = url;
    this.#formatHeading = formatHeading;

    this.render();
    this.update(this.#from, this.#to);
  }

  get subElements() {
    const result = {};
    if (this.element) {
      result.header = this.element.querySelector('[data-element="header"]');
      result.body = this.element.querySelector('[data-element="body"]');
    }
    return result;
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
      this.render();
      const data = await fetchJson(url);
      const values = Object.values(data);
      this.#data = values;
      this.#isDataLoading = false;
      this.render();

      return data;
    } catch (err) {
      console.error('Failed to load data:', err);
      this.#data = [];
      this.#isDataLoading = false;
      this.render();

      return {};
    }
  }

  getTotalValue() {
    return this.#formatHeading(this.#value);
  }

  getColumns(maxValue, scale) {
    return this.#data.map(item => {
      const percent = (item / maxValue * 100).toFixed(0);
      return `<div style="--value: ${Math.floor(item * scale)}" data-tooltip="${percent}%"></div>`;
    }).join('\n');
  }

  template() {
    const maxValue = this.isEmpty() ? 0 : Math.max(...Object.values(this.#data));
    const scale = this.chartHeight / maxValue;

    return `<div class="column-chart ${this.isEmpty() || this.#isDataLoading ? 'column-chart_loading' : '' }" style="--chart-height: 50">
              <div class="column-chart__title">
                Total ${this.#label}
                ${this.isEmpty() ? `<a class="column-chart__link" href="${this.#link}">View all</a>` : ''}
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
    const oldElement = this.element;

    this.html = this.template();

    if (oldElement && oldElement.parentNode) {
      // Заменяем старый элемент новым в родителе
      oldElement.parentNode.replaceChild(this.element, oldElement);
    }
  }
}
