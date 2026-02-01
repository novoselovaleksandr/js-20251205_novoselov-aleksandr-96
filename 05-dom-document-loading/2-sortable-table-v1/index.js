import { Component } from "../../components/component.js";
export default class SortableTable extends Component {
  #headerConfig = [];
  #data = [];

  constructor(headerConfig = [], data = []) {
    super();

    this.#headerConfig = headerConfig;
    this.#data = data;

    this.render();
  }

  template() {
    return ``;
  }

  render() {
    this.html = this.template();
  }
}

