import SortableList from '../2-sortable-list/index.js';
import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';
import { Component } from "../../components/component.js";

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm extends Component {
  productId = null;
  #subcategoriesSelect = null;
  #imagesList = null;
  #saveButton = null;
  #uploadButton = null;
  #boundSave = null;
  #boundUploadImage = null;
  subElements = {};
  #defaultFields = [
    'title',
    'description',
    'quantity',
    'subcategory',
    'status',
    'price',
    'discount'
  ];

  constructor(productId) {
    super();

    this.productId = productId ?? this.productId;

    this.html = this.template();

    this.#subcategoriesSelect = this.element.querySelector('#subcategory');
    this.#initSubElements();
    this.#imagesList = this.subElements.imageListContainer?.querySelector('.sortable-list');

    this.#saveButton = this.element.querySelector('[name="save"]');
    this.#uploadButton = this.element.querySelector('[name="uploadImage"]');

    this.#boundSave = this.save.bind(this);
    this.#boundUploadImage = this.#uploadImage.bind(this);

    this.#initListeners();
  }

  #initListeners() {
    this.#saveButton.addEventListener('click', this.#boundSave);
    this.#uploadButton.addEventListener('click', this.#boundUploadImage);

    // Делегирование для кнопок удаления изображений
    this.subElements.imageListContainer.addEventListener('click', (event) => {
      if (event.target.closest('[data-delete-handle]')) {
        const item = event.target.closest('.sortable-list__item');
        if (item) {
          item.remove();
        }
      }
    });
  }

  #removeListeners() {
    this.#saveButton.removeEventListener('click', this.#boundSave);
    this.#uploadButton.removeEventListener('click', this.#boundUploadImage);
  }

  destroy() {
    this.#removeListeners();
    super.destroy();
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
              ${this.productId ? 'Сохранить товар' : 'Добавить товар'}
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
    for (const field of this.#defaultFields) {
      const el = this.element.querySelector(`#${field}`);
      const value = product?.[field];
      if (el && value !== undefined) {
        el.value = value;
      }
    }
    
    // Рендерим изображения
    if (product?.images?.length && this.#imagesList) {
      this.#imagesList.innerHTML = '';
      for (const image of product.images) {
        this.#addImageToList(image.url, image.source);
      }
    }
  }

  #addImageToList(url, source) {
    const li = document.createElement('li');
    li.className = 'products-edit__imagelist-item sortable-list__item';

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

    this.#imagesList.appendChild(li);
  }

  async #uploadImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) {return;}

      this.#uploadButton.classList.add('is-loading');

      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await fetch('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`
          },
          body: formData
        });

        const data = await response.json();
        
        if (data.success) {
          this.#addImageToList(data.data.link, file.name);
        } else {
          throw new Error('Failed to upload image');
        }
      } catch (error) {
        console.error('Image upload error:', error);
        alert('Ошибка загрузки изображения');
      } finally {
        this.#uploadButton.classList.remove('is-loading');
      }
    };

    input.click();
  }

  #getFormData() {
    const data = {};
    
    // Собираем данные из полей формы
    for (const field of this.#defaultFields) {
      const el = this.element.querySelector(`#${field}`);
      if (el) {
        data[field] = el.value;
      }
    }
    
    // Собираем изображения
    const images = [];
    const imageItems = this.#imagesList?.querySelectorAll('.sortable-list__item') || [];

    for (const item of imageItems) {
      const urlInput = item.querySelector('input[name="url"]');
      const sourceInput = item.querySelector('input[name="source"]');
      if (urlInput?.value) {
        images.push({
          url: urlInput.value,
          source: sourceInput?.value || ''
        });
      }
    }
    data.images = images;
    
    return data;
  }

  async save(event) {
    if (event) {
      event.preventDefault();
    }

    const formData = this.#getFormData();
    
    const dataToSend = { ...formData };

    if (this.productId) {
      dataToSend.id = this.productId;
    }

    const url = `${BACKEND_URL}/api/rest/products`;
    
    const method = this.productId ? 'PATCH' : 'PUT';
    
    const result = await fetchJson(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend)
    });
    
    // Dispatch события в зависимости от режима
    const eventName = this.productId ? 'product-updated' : 'product-saved';
    this.element.dispatchEvent(new CustomEvent(eventName, {
      bubbles: true,
      detail: { id: this.productId || result?.id }
    }));
    
    return result;
  }

  async render() {
    const categoriesPromise = fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);
    const productPromise = this.productId 
      ? fetchJson(`${BACKEND_URL}/api/rest/products/?id=${this.productId}`).then(data => data[0])
      : Promise.resolve(null);

    const [categories, product] = await Promise.all([categoriesPromise, productPromise]);
  
    this.#renderCategories(categories);
    this.#renderProductData(product);

    return this.element;
  }
}