import SortableList from '../2-sortable-list/index.js';
import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';
import { Component } from "../../components/component.js";

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm extends Component {
  productId = null;
  #subcategoriesSelect = null;
  #sortableList = null;
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

    this.#saveButton = this.element.querySelector('[name="save"]');
    this.#uploadButton = this.element.querySelector('[name="uploadImage"]');

    this.#boundSave = this.save.bind(this);
    this.#boundUploadImage = this.#uploadImage.bind(this);

    this.#initListeners();
    
    this.#initSortableList();
  }

  #initListeners() {
    this.#saveButton.addEventListener('click', this.#boundSave);
    this.#uploadButton.addEventListener('click', this.#boundUploadImage);
  }

  #removeListeners() {
    this.#saveButton.removeEventListener('click', this.#boundSave);
    this.#uploadButton.removeEventListener('click', this.#boundUploadImage);
    this.#sortableList.destroy();
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
          <div class="form-group form-group__wide" data-element="imageListContainer">
            <label class="form-label">Фото</label>
            <div data-element="sortableListContainer"></div>
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

  #initSortableList() {
    // Создаем пустой SortableList
    this.#sortableList = new SortableList({
      items: []
    });

    // Вставляем SortableList в контейнер
    const container = this.subElements.sortableListContainer;
    container.innerHTML = '';
    container.append(this.#sortableList.element);
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
    
    // Обновляем список изображений в SortableList
    const images = product?.images || [];
    this.#updateImagesList(images);
  }

  #updateImagesList(images) {
    if (!this.#sortableList) {return;}

    // Создаем элементы для SortableList
    const items = images.map(image => this.#createImageElement(image.url, image.source));

    // Используем метод updateItems для полной замены списка
    this.#sortableList.updateItems(items);
  }

  #createImageElement(url, source) {
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

    return li;
  }

  async #uploadImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) {return;}

      this.#uploadButton.classList.add('is-loading');
      this.#uploadButton.disabled = true;

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
          // Создаем элемент нового изображения
          const newImageElement = this.#createImageElement(data.data.link, file.name);
          
          // Добавляем его в SortableList с помощью метода addItem
          this.#sortableList.addItem(newImageElement);
        } else {
          throw new Error('Failed to upload image');
        }
      } catch (error) {
        console.error('Image upload error:', error);
        alert('Ошибка загрузки изображения');
      } finally {
        this.#uploadButton.classList.remove('is-loading');
        this.#uploadButton.disabled = false;
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
    
    // Собираем изображения из SortableList используя его метод getItems
    const images = [];
    
    if (this.#sortableList) {
      const items = this.#sortableList.getItems();
      
      for (const item of items) {
        const urlInput = item.querySelector('input[name="url"]');
        const sourceInput = item.querySelector('input[name="source"]');
        
        if (urlInput?.value) {
          images.push({
            url: urlInput.value,
            source: sourceInput?.value || ''
          });
        }
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
    
    try {
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
    } catch (error) {
      console.error('Save error:', error);
      alert('Ошибка сохранения товара');
    }
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