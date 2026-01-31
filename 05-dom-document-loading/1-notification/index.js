import { Component } from '../../components/component.js';
export default class NotificationMessage extends Component {
    #message = '';
    #duration = 2000;
    #type = 'success';

    constructor(message = '', { duration = 2000, type = 'success'}) {
      super();

      this.#message = message;
      this.#duration = duration;
      this.#type = type;

      this.render();
    }

    show() {
      document.body.append(this.element);
    }

    template() {
      return `
        <div class="notification success" style="--value:${this.#duration / 100}s">
            <div class="timer"></div>
            <div class="inner-wrapper">
            <div class="notification-header">${this.#type}</div>
            <div class="notification-body">
                ${this.#message}
            </div>
            </div>
        </div>`;
    }

    render() {
      this.html = this.template();
    }
}
