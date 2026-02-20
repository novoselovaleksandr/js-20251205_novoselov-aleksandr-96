export function createElement(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.firstElementChild;
}

export function sortObjects(arr, fieldValue, sortType = 'string', orderValue = 'asc') {
  //создаём новый массив
  const sorted = [...arr];
  const multiplier = orderValue === 'asc' ? 1 : -1;

  if (sortType === 'string') {
    // Сортируем с учетом русской и английской локалей
    sorted.sort((a, b) => (a[fieldValue]).localeCompare(b[fieldValue], ['ru', 'en'], {
      caseFirst: 'upper', // Заглавные буквы идут первыми
    }) * multiplier);
  } else {
    sorted.sort((a, b) => (a[fieldValue] - b[fieldValue]) * multiplier);
  }

  return sorted;
}