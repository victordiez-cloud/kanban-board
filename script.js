console.log("Kanban JS loaded...");

window.addEventListener("DOMContentLoaded", () => {
  const addCardBtn = document.getElementById("addCardBtn");
  const searchInput = document.getElementById("searchInput");
  const sortByPriorityBtn = document.getElementById("sortByPriorityBtn");
  const kanbanRoot = document.querySelector(".kanban");
  const STORAGE_KEY = "kanban-board-state";

  let draggedCard = null;

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function getBoardState() {
    const columns = Array.from(document.querySelectorAll(".column"));
    return columns.map((col) => {
      const status = col.dataset.status || col.getAttribute("data-status") || "";
      const cards = Array.from(col.querySelectorAll(".card")).map((card) => ({
        id: card.dataset.id || generateId(),
        title: (card.querySelector("h3") && card.querySelector("h3").innerText) || "",
        content: (card.querySelector("p") && card.querySelector("p").innerText) || "",
        priority: card.dataset.priority || card.getAttribute("data-priority") || "",
      }));
      return { status, cards };
    });
  }

  function saveBoardState() {
    try {
      const state = getBoardState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Erreur lors de la sauvegarde:", e);
    }
  }

  function createDeleteButton() {
    const btn = document.createElement("button");
    btn.className = "delete-btn";
    btn.type = "button";
    btn.title = "Supprimer la carte";
    btn.textContent = "×";
    return btn;
  }

  function attachCardHandlers(card) {
    if (!card) return;
    if (!card.dataset.id) card.dataset.id = generateId();
    card.setAttribute("draggable", "true");

    if (!card.querySelector(".delete-btn")) {
      card.appendChild(createDeleteButton());
    }

    if (card.dataset.dragBound === "true") return;
    card.dataset.dragBound = "true";

    card.addEventListener("dragstart", (event) => {
      draggedCard = card;
      card.classList.add("dragging");
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", card.dataset.id || "");
      }
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      draggedCard = null;
    });

    card.addEventListener("dblclick", () => {
      if (confirm("Supprimer cette carte ?")) {
        card.remove();
        saveBoardState();
      }
    });
  }

  function createCardElement(cardData) {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = cardData.id || generateId();
    if (cardData.priority) card.dataset.priority = cardData.priority;
    const h3 = document.createElement("h3");
    h3.textContent = cardData.title || "";
    const p = document.createElement("p");
    p.textContent = cardData.content || "";
    card.appendChild(h3);
    card.appendChild(p);
    attachCardHandlers(card);
    return card;
  }

  function buildBoardFromState(state) {
    if (!Array.isArray(state)) return;
    const columns = Array.from(document.querySelectorAll(".column"));
    columns.forEach((col) => {
      const existing = Array.from(col.querySelectorAll(".card"));
      existing.forEach((c) => c.remove());
    });

    state.forEach((colState) => {
      const status = colState.status;
      const col = document.querySelector(`.column[data-status="${status}"]`);
      if (!col) return;
      (colState.cards || []).forEach((cardData) => {
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

  function setupColumnDnD() {
    document.querySelectorAll(".column").forEach((column) => {
      column.addEventListener("dragover", (event) => {
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
      });

      column.addEventListener("dragenter", (event) => {
        event.preventDefault();
        column.classList.add("drag-over");
      });

      column.addEventListener("dragleave", (event) => {
        if (!column.contains(event.relatedTarget)) {
          column.classList.remove("drag-over");
        }
      });

      column.addEventListener("drop", (event) => {
        event.preventDefault();
        column.classList.remove("drag-over");

        const id = event.dataTransfer ? event.dataTransfer.getData("text/plain") : "";
        const byId = id ? document.querySelector(`.card[data-id="${id}"]`) : null;
        const card = byId || draggedCard;
        if (!card) return;

        column.appendChild(card);
        saveBoardState();
      });
    });
  }

  function initializeExistingCards() {
    document.querySelectorAll(".card").forEach((card) => {
      attachCardHandlers(card);
    });
  }

  if (kanbanRoot) {
    const observer = new MutationObserver(debounce(() => saveBoardState(), 250));
    observer.observe(kanbanRoot, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    kanbanRoot.addEventListener("click", (event) => {
      const btn = event.target.closest(".delete-btn");
      if (!btn) return;
      const card = btn.closest(".card");
      if (!card) return;
      if (confirm("Supprimer cette carte ?")) {
        card.remove();
        saveBoardState();
      }
    });
  }

  let loadedFromStorage = false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      buildBoardFromState(parsed);
      loadedFromStorage = true;
    }
  } catch (e) {
    console.error("Erreur lors du chargement du state:", e);
  }

  initializeExistingCards();
  setupColumnDnD();

  if (!loadedFromStorage) {
    saveBoardState();
  }

  if (addCardBtn) {
    addCardBtn.addEventListener("click", () => {
      const title = window.prompt("Titre de la carte :", "");
      if (!title) return;

      const content = window.prompt("Contenu de la carte :", "");
      let priority = window.prompt("Priorité (high / medium / low) :", "medium");
      if (!priority) priority = "medium";
      priority = priority.toLowerCase();
      if (!["high", "medium", "low"].includes(priority)) priority = "medium";

      const todoCol = document.querySelector('.column[data-status="todo"]');
      if (!todoCol) return;
      const cardEl = createCardElement({
        id: generateId(),
        title,
        content,
        priority,
      });
      todoCol.appendChild(cardEl);
      saveBoardState();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim().toLowerCase();
      document.querySelectorAll(".card").forEach((card) => {
        const text = card.textContent.toLowerCase();
        card.style.display = query === "" || text.includes(query) ? "" : "none";
      });
    });
  }

  if (sortByPriorityBtn) {
    sortByPriorityBtn.addEventListener("click", () => {
      const order = { high: 0, medium: 1, low: 2, "": 3 };
      document.querySelectorAll(".column").forEach((col) => {
        const cards = Array.from(col.querySelectorAll(".card"));
        cards
          .sort(
            (a, b) =>
              (order[a.dataset.priority] || 3) - (order[b.dataset.priority] || 3)
          )
          .forEach((c) => col.appendChild(c));
      });
      saveBoardState();
    });
  }
});
