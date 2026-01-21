let currentFilter = 'all';

/* ===== API ENDPOINTS ===== */
const FACT_USELESS_API =
  'https://uselessfacts.jsph.pl/api/v2/facts/random?language=en';
const TRIVIA_API =
  'https://opentdb.com/api.php?amount=1';

/* ===== TRYB API ===== */
let USE_MOCK_API = false;

/* ===== ELEMENTY DOM ===== */
const itemInput = document.getElementById('itemInput');
const addItemBtn = document.getElementById('addItemBtn');
const itemList = document.getElementById('itemList');
const refreshFactsBtn = document.getElementById('refreshFactsBtn');
const apiDataList = document.getElementById('apiDataList');
const toggleApiModeBtn = document.getElementById('toggleApiModeBtn');

/* ===== DANE ===== */
let items = JSON.parse(localStorage.getItem('items')) || [];

/* ===== MOCK API ===== */
function mockUselessFactAPI() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        text: 'Mock: Ośmiornice mają trzy serca.'
      });
    }, 500);
  });
}

function mockTriviaAPI() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        results: [
          {
            question: 'Mock: Jaki język działa w przeglądarce?',
            correct_answer: 'JavaScript'
          }
        ]
      });
    }, 500);
  });
}

/* ===== RENDER LISTY ===== */
function renderItems() {
  itemList.innerHTML = '';

  let filteredItems = items.map((item, index) => ({ item, index }));

  if (currentFilter === 'active') {
    filteredItems = filteredItems.filter(e => !e.item.purchased);
  } else if (currentFilter === 'purchased') {
    filteredItems = filteredItems.filter(e => e.item.purchased);
  }

  filteredItems.forEach(({ item, index }) => {
    const li = document.createElement('li');
    if (item.purchased) li.classList.add('purchased');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.purchased;
    checkbox.addEventListener('change', () => togglePurchased(index));

    const span = document.createElement('span');
    span.textContent = item.name;
    span.addEventListener('dblclick', () => editItem(index, span));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Usuń';
    deleteBtn.addEventListener('click', () => removeItem(index));

    li.append(checkbox, span, deleteBtn);
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
function editItem(index, span) {
  const input = document.createElement('input');
  input.value = items[index].name;

  input.addEventListener('blur', () => saveEdit(index, input));
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') saveEdit(index, input);
  });

  span.replaceWith(input);
  input.focus();
}

function saveEdit(index, input) {
  const value = input.value.trim();
  if (value) {
    items[index].name = value;
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
document.querySelectorAll('.filters button').forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    renderItems();
  });
});

/* ===== ROUTING ===== */
function renderRoute() {
  const hash = window.location.hash || '#lista';

  document.getElementById('view-lista').style.display =
    hash === '#lista' ? 'block' : 'none';
  document.getElementById('view-about').style.display =
    hash === '#o-aplikacji' ? 'block' : 'none';
  document.getElementById('view-api').style.display =
    hash === '#api' ? 'block' : 'none';

  if (hash === '#api') renderApiData();
}

/* ===== API DATA ===== */
async function renderApiData() {
  apiDataList.innerHTML = '<li>Ładowanie danych...</li>';

  try {
    let uselessJson;
    let triviaJson;

    if (USE_MOCK_API) {
      uselessJson = await mockUselessFactAPI();
      triviaJson = await mockTriviaAPI();
    } else {
      const r1 = await fetch(FACT_USELESS_API);
      uselessJson = await r1.json();

      const r2 = await fetch(TRIVIA_API);
      triviaJson = await r2.json();
    }

    apiDataList.innerHTML = '';

    const li1 = document.createElement('li');
    li1.textContent = `Fakt: ${uselessJson.text}`;
    apiDataList.appendChild(li1);

    const t = triviaJson.results[0];
    const li2 = document.createElement('li');
    li2.innerHTML = `Quiz: ${t.question}<br>Odpowiedź: ${t.correct_answer}`;
    apiDataList.appendChild(li2);

  } catch {
    apiDataList.innerHTML = '<li>Błąd API</li>';
  }
}

/* ===== PRZEŁĄCZNIK TRYBU API ===== */
toggleApiModeBtn.addEventListener('click', () => {
  USE_MOCK_API = !USE_MOCK_API;
  toggleApiModeBtn.textContent =
    `Tryb API: ${USE_MOCK_API ? 'MOCK' : 'PRAWDZIWE'}`;
  renderApiData();
});

/* ===== INIT ===== */
addItemBtn.addEventListener('click', addItem);
refreshFactsBtn.addEventListener('click', renderApiData);

renderItems();
renderRoute();
window.addEventListener('hashchange', renderRoute);
