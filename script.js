console.log("Kanban JS loaded...");

// Exemple éventuel de structure
window.addEventListener("DOMContentLoaded", () => {
  // Ici, on récupère les éléments du DOM
  const addCardBtn = document.getElementById("addCardBtn");
  const searchInput = document.getElementById("searchInput");
  const sortByPriorityBtn = document.getElementById("sortByPriorityBtn");
  const priorityOrder = { high: 0, medium: 1, low: 2 };

  // Éventuellement, on écoute les événements
  addCardBtn.addEventListener("click", () => {
    // ...
  });

  searchInput.addEventListener("input", () => {
    // ...
  });

  sortByPriorityBtn.addEventListener("click", () => {
    const columns = document.querySelectorAll(".column");

    columns.forEach((column) => {
      const cards = Array.from(column.querySelectorAll(".card"));

      cards
        .sort((a, b) => {
          const priorityA = priorityOrder[a.dataset.priority] ?? Number.MAX_SAFE_INTEGER;
          const priorityB = priorityOrder[b.dataset.priority] ?? Number.MAX_SAFE_INTEGER;
          return priorityA - priorityB;
        })
        .forEach((card) => column.appendChild(card));
    });
  });
});
