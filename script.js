console.log("Kanban JS loaded...");

// Exemple éventuel de structure
window.addEventListener("DOMContentLoaded", () => {
  // Ici, on récupère les éléments du DOM
  const addCardBtn = document.getElementById("addCardBtn");
  const searchInput = document.getElementById("searchInput");
  const sortByPriorityBtn = document.getElementById("sortByPriorityBtn");
  const STORAGE_KEY = 'kanban-board-state';

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"'`]/g, (s) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '`': '&#96;'
    }[s]));
  }

  function getBoardState() {
    const columns = Array.from(document.querySelectorAll('.column'));
    return columns.map(col => {
      const status = col.dataset.status || col.getAttribute('data-status') || '';
      const cards = Array.from(col.querySelectorAll('.card')).map(card => ({
        id: card.dataset.id || generateId(),
        title: (card.querySelector('h3') && card.querySelector('h3').innerText) || '',
        content: (card.querySelector('p') && card.querySelector('p').innerText) || '',
        priority: card.dataset.priority || card.getAttribute('data-priority') || '',
      }));
      return { status, cards };
    });
  }

  function saveBoardState() {
    try {
      const state = getBoardState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Erreur lors de la sauvegarde:', e);
    }
  }

  function createCardElement(cardData) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = cardData.id || generateId();
    if (cardData.priority) card.dataset.priority = cardData.priority;
    card.draggable = true;
    card.innerHTML = `<h3>${escapeHtml(cardData.title)}</h3><p>${escapeHtml(cardData.content)}</p>`;

    card.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', card.dataset.id);
      e.dataTransfer.effectAllowed = 'move';
    });

    card.addEventListener('dblclick', () => {
      if (confirm('Supprimer cette carte ?')) {
        card.remove();
        saveBoardState();
      }
    });

    return card;
  }

  function buildBoardFromState(state) {
    if (!Array.isArray(state)) return;
    const columns = Array.from(document.querySelectorAll('.column'));
    columns.forEach(col => {
      const existing = Array.from(col.querySelectorAll('.card'));
      existing.forEach(c => c.remove());
    });

    state.forEach(colState => {
      const status = colState.status;
      const col = document.querySelector(`.column[data-status="${status}"]`);
      if (!col) return;
      (colState.cards || []).forEach(cardData => {
        const cardEl = createCardElement(cardData);
        col.appendChild(cardEl);
      });
    });
  }

  function debounce(fn, wait = 200) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  // Observe changes to automatically save
  const kanbanRoot = document.querySelector('.kanban');
  if (kanbanRoot) {
    const observer = new MutationObserver(debounce(() => saveBoardState(), 250));
    observer.observe(kanbanRoot, { childList: true, subtree: true, attributes: true, characterData: true });
  }

  // Load saved state if present
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      buildBoardFromState(parsed);
    } else {
      saveBoardState();
    }
  } catch (e) {
    console.error('Erreur lors du chargement du state:', e);
  }

  // Éventuellement, on écoute les événements
  addCardBtn.addEventListener("click", () => {
    const title = prompt('Titre de la carte :');
    if (!title) return;
    const todoCol = document.querySelector('.column[data-status="todo"]');
    if (!todoCol) return;
    const cardObj = { id: generateId(), title, content: '', priority: 'low' };
    const cardEl = createCardElement(cardObj);
    todoCol.appendChild(cardEl);
    saveBoardState();
  });

  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    document.querySelectorAll('.card').forEach(card => {
      const title = (card.querySelector('h3') && card.querySelector('h3').innerText.toLowerCase()) || '';
      card.style.display = title.includes(q) ? '' : 'none';
    });
  });

  sortByPriorityBtn.addEventListener("click", () => {
    const order = { high: 0, medium: 1, low: 2, '': 3 };
    document.querySelectorAll('.column').forEach(col => {
      const cards = Array.from(col.querySelectorAll('.card'));
      cards.sort((a, b) => (order[a.dataset.priority] || 3) - (order[b.dataset.priority] || 3));
      cards.forEach(c => col.appendChild(c));
    });
    saveBoardState();
  });

  // Simple drag/drop pour les colonnes
  document.querySelectorAll('.column').forEach(col => {
    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
    col.addEventListener('drop', (e) => {
      e.preventDefault();
      const id = e.dataTransfer.getData('text/plain');
      if (!id) return;
      const card = document.querySelector(`.card[data-id="${id}"]`);
      if (!card) return;
      col.appendChild(card);
      saveBoardState();
    });
  });
});
