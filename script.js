console.log("Kanban JS loaded...");

// Exemple éventuel de structure
window.addEventListener("DOMContentLoaded", () => {
  // Ici, on récupère les éléments du DOM
  const addCardBtn = document.getElementById("addCardBtn");
  const searchInput = document.getElementById("searchInput");
  const sortByPriorityBtn = document.getElementById("sortByPriorityBtn");
  const columns = document.querySelectorAll(".column");
  const cards = document.querySelectorAll(".card");
  let draggedCard = null;

  const setCardStatus = (card, column) => {
    const status = column.dataset.status;
    if (status) {
      card.dataset.status = status;
    } else {
      delete card.dataset.status;
    }
  };

  cards.forEach((card) => {
    card.setAttribute("draggable", "true");

    const parentColumn = card.closest(".column");
    if (parentColumn) {
      setCardStatus(card, parentColumn);
    }

    card.addEventListener("dragstart", (event) => {
      draggedCard = card;
      card.classList.add("dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", card.dataset.id || "");
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      draggedCard = null;
    });
  });

  columns.forEach((column) => {
    column.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
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

      if (!draggedCard) {
        return;
      }

      column.appendChild(draggedCard);
      setCardStatus(draggedCard, column);
    });
  });

  // Éventuellement, on écoute les événements
  addCardBtn.addEventListener("click", () => {
    // ...
  });

  searchInput.addEventListener("input", () => {
    // ...
  });

  sortByPriorityBtn.addEventListener("click", () => {
    // ...
  });
});
