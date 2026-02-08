import { Component } from "../../components/component.js";

class Tooltip extends Component {
  static #onlyInstance = null;

  constructor() {
    super();

    if (!Tooltip.#onlyInstance) {
      Tooltip.#onlyInstance = this;
    } else {
      return Tooltip.#onlyInstance;
    }
  }

  initialize () {

  }

  #template() {

  }

  #render() {
    this.html = this.#template();
  }
}
export default Tooltip;
