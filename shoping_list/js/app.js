let currentFilter = 'all';

// API endpoints
const FACT_USELESS_API = 'https://uselessfacts.jsph.pl/api/v2/facts/random?language=en';
const TRIVIA_API = 'https://opentdb.com/api.php?amount=1';

const itemInput = document.getElementById('itemInput');
const addItemBtn = document.getElementById('addItemBtn');
const itemList = document.getElementById('itemList');
const refreshFactsBtn = document.getElementById('refreshFactsBtn');
const apiDataList = document.getElementById('apiDataList');

let items = JSON.parse(localStorage.getItem('items')) || [];

/* ===== RENDER LISTY ===== */
function renderItems() {
  itemList.innerHTML = '';
  let filteredItems = items.map((item, originalIndex) => ({ item, originalIndex }));

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
  apiDataList.innerHTML = '<li>Ładowanie danych z API...</li>';

  try {
    // 1) Random Useless Fact JSON
    const respUseless = await fetch(FACT_USELESS_API);
    const uselessJson = await respUseless.json();

    // 2) Random Trivia Question JSON
    const respTrivia = await fetch(TRIVIA_API);
    const triviaJson = await respTrivia.json();

    apiDataList.innerHTML = '';

    // Useless Fact
    const li1 = document.createElement('li');
    li1.textContent = `Fakt: ${uselessJson.text}`;
    apiDataList.appendChild(li1);

    // Trivia Question
    if (triviaJson.results && triviaJson.results.length > 0) {
      const t = triviaJson.results[0];
      const li2 = document.createElement('li');
      // Wyświetlamy pytanie i odpowiedź
      li2.innerHTML = `Quiz: ${t.question} <br> Answer: ${t.correct_answer}`;
      apiDataList.appendChild(li2);
    }

  } catch (error) {
    apiDataList.innerHTML = '<li>Błąd podczas pobierania danych z API.</li>';
    console.error('Błąd API:', error);
  }
}

/* ===== INIT ===== */
addItemBtn.addEventListener('click', addItem);
refreshFactsBtn.addEventListener('click', renderApiData);

renderItems();
renderRoute();
window.addEventListener('hashchange', renderRoute);
