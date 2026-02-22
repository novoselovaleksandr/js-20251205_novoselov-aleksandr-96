import { Component } from "../../components/component.js";

export default class RangePicker extends Component {
    from= null;
    to=null;

    constructor({ from, to } = {}) {
      super();
      this.from = from ?? this.from;
      this.to = to ?? this.to;

      this.render();
    }

    render() {
      this.html = this.template();
    }

    template() {
      // Форматируем даты для отображения в input
      const fromStr = this.from ? this.formatDate(this.from) : '';
      const toStr = this.to ? this.formatDate(this.to) : '';

      return `
      <div class="rangepicker">
        <div class="rangepicker__input">
          <span>${fromStr}</span>
          <span>-</span>
          <span>${toStr}</span>
        </div>
        <div class="rangepicker__selector"></div>
      </div>
    `;
    }

    formatDate(date) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    }
}