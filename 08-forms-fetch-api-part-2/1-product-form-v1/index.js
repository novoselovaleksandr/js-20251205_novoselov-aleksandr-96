import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';
import { Component } from "../../components/component.js";

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm extends Component {
  productId = null;
  #subcategoriesSelect = null;
  subElements = {};
  #deaultFields = [
    { id: 'title', key: 'title' },
    { id: 'description', key: 'description' },
    { id: 'quantity', key: 'quantity' },
    { id: 'subcategory', key: 'subcategory' },
    { id: 'status', key: 'status' },
    { id: 'price', key: 'price' },
    { id: 'discount', key: 'discount' }
  ];

  constructor (productId) {
    super();

    this.productId = productId ?? this.productId;

    this.html = this.template();
    this.#subcategoriesSelect = this.element.querySelector('#subcategory');
    this.#initSubElements();
  }

  template() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input required type="text" name="title" id="title" class="form-control" placeholder="Название товара">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required class="form-control" name="description" id="description" data-element="productDescription" placeholder="Описание товара"></textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer"><ul class="sortable-list"></ul></div>
            <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select class="form-control" name="subcategory" id="subcategory"></select>
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input required type="number" name="price" id="price" class="form-control" placeholder="100">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input required type="number" name="discount" id="discount" class="form-control" placeholder="0">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input required type="number" class="form-control" name="quantity" id="quantity" placeholder="1">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" name="status" id="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              Сохранить товар
            </button>
          </div>
        </form>
      </div>
    `;
  }

  #initSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    for (const el of elements) {
      const key = el.dataset.element;
      this.subElements[key] = el;
    }
  }

  #renderCategories(categories) {
    this.#subcategoriesSelect.innerHTML = '';
    
    for (const category of categories) {
      for (const subcategory of category.subcategories) {
        const option = document.createElement('option');
        option.value = subcategory.id;
        option.textContent = `${escapeHtml(category.title)} > ${escapeHtml(subcategory.title)}`;
        this.#subcategoriesSelect.appendChild(option);
      }
    }
  }

  #renderProductData(product) {  
    for (const field of this.#deaultFields) {
      const el = this.element.querySelector(`#${field.id}`);
      const value = product[field.key];
      if (el && value !== undefined) {
        el.value = value;
      }
    }
    
    // Рендерим изображения
    if (product.images?.length) {
      const list = this.subElements.imageListContainer?.querySelector('.sortable-list');
      if (list) {
        list.innerHTML = '';
        for (const image of product.images) {
          const li = document.createElement('li');
          li.className = 'products-edit__imagelist-item sortable-list__item';
          const url = image['url '] || image.url || '';
          const source = image['source '] || image.source || '';
          li.innerHTML = `
            <input type="hidden" name="url" value="${escapeHtml(url)}">
            <input type="hidden" name="source" value="${escapeHtml(source)}">
            <span>
              <img src="icon-grab.svg" data-grab-handle alt="grab">
              <img class="sortable-table__cell-img" alt="${escapeHtml(source)}" src="${escapeHtml(url)}">
              <span>${escapeHtml(source)}</span>
            </span>
            <button type="button">
              <img src="icon-trash.svg" data-delete-handle alt="delete">
            </button>
          `;
          list.appendChild(li);
        }
      }
    }
  }

  async render () {
    const categoriesPromise = await fetchJson(`${BACKEND_URL}/api/rest/categories?_refs=subcategory`);
    const productPromise = this.productId 
      ? fetchJson(`${BACKEND_URL}/api/rest/products/?id=${this.productId}`).then(data => data[0])
      : Promise.resolve(null);

    const [categories, product] = await Promise.all([categoriesPromise, productPromise]);
  
    this.#renderCategories(categories);
    this.#renderProductData(product);

    return this.element;
  }
}
