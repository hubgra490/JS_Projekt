let currentFilter = 'all';
const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

const itemInput = document.getElementById('itemInput');
const addItemBtn = document.getElementById('addItemBtn');
const itemList = document.getElementById('itemList');

let items = JSON.parse(localStorage.getItem('items')) || [];

/* ===== RENDER LISTY ===== */
function renderItems() {
  itemList.innerHTML = '';

  let filteredItems = items
    .map((item, originalIndex) => ({ item, originalIndex }));

  if (currentFilter === 'active') {
    filteredItems = filteredItems.filter(entry => !entry.item.purchased);
  } else if (currentFilter === 'purchased') {
    filteredItems = filteredItems.filter(entry => entry.item.purchased);
  }

  filteredItems.forEach(({ item, originalIndex }) => {
    const li = document.createElement('li');
    if (item.purchased) li.classList.add('purchased');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.purchased;
    checkbox.addEventListener('change', () => togglePurchased(originalIndex));

    const span = document.createElement('span');
    span.textContent = item.name;
    span.style.cursor = 'pointer';
    span.addEventListener('dblclick', () => editItem(originalIndex, span));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Usuń';
    deleteBtn.addEventListener('click', () => removeItem(originalIndex));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    itemList.appendChild(li);
  });
}
/* ===== CRUD ===== */
function addItem() {
  const value = itemInput.value.trim();
  if (!value) return;

  items.push({ name: value, purchased: false });
  saveAndRender();
}

function removeItem(index) {
  items.splice(index, 1);
  saveAndRender();
}

function togglePurchased(index) {
  items[index].purchased = !items[index].purchased;
  saveAndRender();
}

/* ===== EDYCJA ===== */
function editItem(index, spanElement) {
  const input = document.createElement('input');
  input.type = 'text';
  input.value = items[index].name;

  input.addEventListener('blur', () => saveEdit(index, input));
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') saveEdit(index, input);
  });

  spanElement.replaceWith(input);
  input.focus();
}

function saveEdit(index, inputElement) {
  const newValue = inputElement.value.trim();
  if (newValue) {
    items[index].name = newValue;
    saveAndRender();
  } else {
    renderItems();
  }
}

/* ===== STORAGE ===== */
function saveAndRender() {
  localStorage.setItem('items', JSON.stringify(items));
  itemInput.value = '';
  renderItems();
}

/* ===== FILTROWANIE ===== */
document.querySelectorAll('.filters button').forEach(button => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    renderItems();
  });
});

/* ===== ROUTING ===== */
function renderRoute() {
  const hash = window.location.hash || '#lista';
  document.getElementById('view-lista').style.display =
    hash === '#o-aplikacji' ? 'none' : hash === '#api' ? 'none' : 'block';
  document.getElementById('view-about').style.display =
    hash === '#o-aplikacji' ? 'block' : 'none';
  document.getElementById('view-api').style.display =
    hash === '#api' ? 'block' : 'none';

  if (hash === '#api') {
    renderApiData();
  }
}

/* ===== RENDER API DATA ===== */
async function renderApiData() {
  const apiDataList = document.getElementById('apiDataList');
  apiDataList.innerHTML = 'Ładowanie danych...';

  try {
    const response = await fetch(`${API_BASE_URL}/todos?_limit=5`);
    const todos = await response.json();

    apiDataList.innerHTML = '';
    todos.forEach(todo => {
      const li = document.createElement('li');
      li.textContent = `${todo.id}: ${todo.title}`;
      apiDataList.appendChild(li);
    });
  } catch (error) {
    apiDataList.innerHTML = 'Błąd podczas ładowania danych.';
    console.error('Błąd API:', error);
  }
}

/* ===== INIT ===== */
addItemBtn.addEventListener('click', addItem);
renderItems();
renderRoute();
// fetchUsers();
// fetchTodos();

window.addEventListener('hashchange', renderRoute);