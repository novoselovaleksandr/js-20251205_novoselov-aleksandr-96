import { Component } from "../../components/component.js";

class Tooltip extends Component {
  constructor() {
    super();
    this.#render();
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
