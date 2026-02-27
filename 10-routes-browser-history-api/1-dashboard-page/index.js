import { Component } from "../../components/component.js";
import RangePicker from '../../08-forms-fetch-api-part-2/2-range-picker/index.js';
import SortableTable from '../../07-async-code-fetch-api-part-1/2-sortable-table-v3/index.js';
import ColumnChart from '../../07-async-code-fetch-api-part-1/1-column-chart/index.js';
import header from './bestsellers-header.js';

export default class Page extends Component {
  #rangePicker = null;
  #sortableTable = null;
  #ordersChart = null;
  #salesChart = null;
  #customersChart = null;
  #boundUpdateComponents = null;
  subElements = {}

  constructor() {
    super();
    
    this.#boundUpdateComponents = this.#updateComponents.bind(this);
    this.html = this.#template();
  }

  async render() {
    this.#rangePicker = new RangePicker();
    this.element.querySelector('[data-element="rangePicker"]').append(this.#rangePicker.element);
    this.subElements.rangePicker = this.#rangePicker.element;

    this.#sortableTable = new SortableTable(header, {
      url: 'api/dashboard/bestsellers'
    });
    this.element.querySelector('[data-element="sortableTable"]').append(this.#sortableTable.element);
    this.subElements.sortableTable = this.#sortableTable.element;

    const from = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000); // 30 дней, включая сегодня
    const to = new Date();

    this.#ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      range: {
        from,
        to
      },
      label: 'orders',
    });
    this.element.querySelector('[data-element="ordersChart"]').append(this.#ordersChart.element);
    this.subElements.ordersChart = this.#ordersChart.element;

    this.#salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      range: {
        from,
        to
      },
      label: 'sales',
      formatHeading: data => `$${data}`
    });
    this.element.querySelector('[data-element="salesChart"]').append(this.#salesChart.element);
    this.subElements.salesChart = this.#salesChart.element;

    this.#customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: {
        from,
        to
      },
      label: 'customers',
    });
    this.element.querySelector('[data-element="customersChart"]').append(this.#customersChart.element);
    this.subElements.customersChart = this.#customersChart.element;

    this.#initListeners();


    return this.element;

  }

  #initListeners() {
    this.element.addEventListener('date-select', this.#boundUpdateComponents);
  }

  #removeListeners() {
    this.element.removeEventListener('date-select', this.#boundUpdateComponents);
  }
   
  #updateComponents(event) {
    const { from, to} = event.detail;

    this.#sortableTable.updateDateAndLoadData(from, to);
  }

  destroy() {
    this.#removeListeners();
    super.destroy();
  }

  #template() {
    return `
      <div class="dashboard">
        <div class="content__top-panel">
          <h2 class="page-title">Dashboard</h2>
          <!-- RangePicker component -->
          <div data-element="rangePicker"></div>
        </div>
        <div data-element="chartsRoot" class="dashboard__charts">
          <!-- column-chart components -->
          <div data-element="ordersChart" class="dashboard__chart_orders"></div>
          <div data-element="salesChart" class="dashboard__chart_sales"></div>
          <div data-element="customersChart" class="dashboard__chart_customers"></div>
        </div>

        <h3 class="block-title">Best sellers</h3>

        <div data-element="sortableTable">
          <!-- sortable-table component -->
        </div>
      </div>
    `;
  }
}
