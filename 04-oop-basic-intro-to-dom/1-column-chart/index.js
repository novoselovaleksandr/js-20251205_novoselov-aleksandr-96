import { Component } from '../../components/component.js';

export default class ColumnChart extends Component {
  #data = [];
  #label = '';
  #value = 0;
  #link = '#';
  chartHeight = 50;
  #formatHeading = data => data;

  constructor(options = {}) {
    super();

    const { data = [], label = '', value = 0, link = '#', formatHeading = data => data} = options;

    this.#data = data;
    this.#label = label;
    this.#value = value;
    this.#link = link;
    this.#formatHeading = formatHeading;

    this.render();
  }

  isEmpty() {
    return this.#data?.length === 0;
  }

  update(data) {
    this.#data = data;
    this.render();
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
    const maxValue = this.isEmpty() ? 0 : Math.max(...this.#data);
    const scale = this.chartHeight / maxValue;

    return `<div class="column-chart ${this.isEmpty() ? 'column-chart_loading' : '' }" style="--chart-height: 50">
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
    this.html = this.template();
  }
}
