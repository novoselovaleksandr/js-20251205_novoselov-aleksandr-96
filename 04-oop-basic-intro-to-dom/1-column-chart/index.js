import { Component } from '../../components/component.js';

export default class ColumnChart extends Component {
  #data = [];
  #label = '';
  #value = 0;
  #link = '#';
  chartHeight = 50;

  constructor(options = {}) {
    super();

    const { data = [], label = '', value = 0, link = '#'} = options;

    this.#data = data ?? this.#data;
    this.#label = label ?? this.#label;
    this.#value = value ?? this.#value;
    this.#link = link ?? this.#link;

    this.render();
  }

  update(data) {
    this.#data = data;
    this.render();
  }

  template() {
    const maxValue = Math.max(...this.#data);
    const scale = this.chartHeight / maxValue;
    return this.#data?.length === 0 
      ? ` <div class="column-chart column-chart_loading" style="--chart-height: 50">
            <div class="column-chart__title">
              Total ${this.#label}
              <a class="column-chart__link" href="${this.#link}">View all</a>
            </div>
            <div class="column-chart__container">
              <div data-element="header" class="column-chart__header">
                344
              </div>
              <div data-element="body" class="column-chart__chart">
              </div>
            </div>
          </div>
        `
      : ` <div class="column-chart" style="--chart-height: 50">
            <div class="column-chart__title">
              Total ${this.#label}
            </div>
            <div class="column-chart__container">
              <div data-element="header" class="column-chart__header">${this.#value}</div>
              <div data-element="body" class="column-chart__chart">
              ${this.#data.map(item => {
  const percent = (item / maxValue * 100).toFixed(0);
  return `<div style="--value: ${Math.floor(item * scale)}" data-tooltip="${percent}%"></div>`;
}).join('\n')}
              </div>
            </div>
          </div>
    `;
  }

  render() {
    this.html = this.template();
  }
}
