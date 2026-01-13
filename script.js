console.log("Kanban JS loaded...");

// Exemple éventuel de structure
window.addEventListener("DOMContentLoaded", () => {
  // Ici, on récupère les éléments du DOM
  const addCardBtn = document.getElementById("addCardBtn");
  const searchInput = document.getElementById("searchInput");
  const sortByPriorityBtn = document.getElementById("sortByPriorityBtn");

  // Éventuellement, on écoute les événements
  addCardBtn.addEventListener("click", () => {
    // Simple prompt-based flow (keeps UI minimal and matches current project style)
    const title = window.prompt("Titre de la carte:", "");
    if (!title) return; // cancel or empty -> do nothing

    const content = window.prompt("Contenu de la carte:", "");
    // allow empty content

    // Ask for priority with a small, forgiving prompt; normalize values
    let priority = window.prompt("Priorité (high / medium / low) :", "medium");
    if (!priority) priority = "medium";
    priority = priority.toLowerCase();
    if (!["high", "medium", "low"].includes(priority)) priority = "medium";

    // Create DOM node for the card
    const card = document.createElement("div");
    card.className = "card";
    // generate a simple unique id
    card.dataset.id = `c_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    card.dataset.priority = priority;

    const h3 = document.createElement("h3");
    h3.textContent = title;
    const p = document.createElement("p");
    p.textContent = content || "";

    card.appendChild(h3);
    card.appendChild(p);

    // Append to the To Do column (data-status="todo")
    const todoCol = document.querySelector('.column[data-status="todo"]');
    if (todoCol) {
      todoCol.appendChild(card);
    } else {
      // fallback: append to the kanban container
      const kanban = document.querySelector('.kanban');
      kanban.appendChild(card);
    }
  });

  searchInput.addEventListener("input", () => {
    // ...
  });

  sortByPriorityBtn.addEventListener("click", () => {
    // ...
  });
});
