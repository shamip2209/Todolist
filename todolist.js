// Initialize the todoList array from localStorage or as an empty array
const todoList = JSON.parse(localStorage.getItem("todoList")) || [
  { inputValue: "Buy groceries", completed: false },
  { inputValue: "Buy accommodation", completed: false },
  { inputValue: "Pay bills", completed: false },
  { inputValue: "Clean house", completed: false }
];

console.log(todoList);
renderTodoList(todoList);

// Function to render the todo list
function renderTodoList(filteredList = todoList) {
  let todoNo = 1;
  let completedNo = 1;
  let tableBody = document.querySelector(".js-todo-list-items");
  let completedTableBody = document.querySelector(".js-completed-list-items");

  tableBody.innerHTML = ""; // Clear previous data
  completedTableBody.innerHTML = ""; // Clear completed tasks

  filteredList.forEach((todoObject, index) => {
    const { inputValue, completed } = todoObject;

    // Create a new row element
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${completed ? completedNo++ : todoNo++}</td>
      <td>${inputValue}</td>
      <td>
          <label class="switch">
              <input type="checkbox" ${completed ? "checked" : ""} data-index="${index}">
              <span class="slider round"></span>
          </label>
      </td>
      <td>
          <button class="js-delete-button delete-button">Delete</button>
      </td>
    `;

    // Append the row to the correct table
    if (completed) {
      completedTableBody.appendChild(row);
    } else {
      tableBody.appendChild(row);
    }
  });

  // Add event listeners to delete buttons
  document.querySelectorAll(".js-delete-button").forEach((deleteButton) => {
    deleteButton.addEventListener("click", (event) => {
      const row = event.target.closest("tr");
      const todoText = row.children[1].textContent;
      const itemIndex = todoList.findIndex((todo) => todo.inputValue === todoText);

      if (itemIndex !== -1) {
        todoList.splice(itemIndex, 1);
        localStorage.setItem("todoList", JSON.stringify(todoList));
        renderTodoList(todoList);
      }
    });
  });

  // Add event listeners to checkboxes
  document.querySelectorAll(".switch input").forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
      const index = event.target.dataset.index;
      todoList[index].completed = event.target.checked;
      localStorage.setItem("todoList", JSON.stringify(todoList));
      renderTodoList(todoList);
    });
  });
}

// Function to add a new todo item
const addTodo = () => {
  const inputElement = document.querySelector(".js-todo-input");
  const inputValue = inputElement.value.trim();

  if (!inputValue) {
    alert("Please add a todo item");
    return;
  }

  todoList.push({ inputValue, completed: false });
  inputElement.value = "";
  localStorage.setItem("todoList", JSON.stringify(todoList));
  renderTodoList(todoList);
};

// Event listeners for adding todos
document.querySelector(".js-add-button").addEventListener("click", addTodo);
document.querySelector(".js-todo-input").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addTodo();
  }
});

// Function to filter the todo list dynamically as user types
const findTodo = () => {
  const searchElement = document.querySelector(".js-search-input");
  const searchValue = searchElement.value.trim().toLowerCase();

  if (searchValue === "") {
    renderTodoList(todoList); // Show full list if search is empty
  } else {
    const filteredTodos = todoList.filter((todo) =>
      todo.inputValue.toLowerCase().includes(searchValue)
    );

    renderTodoList(filteredTodos);
  }
};

// Event listener for real-time search filtering
document.querySelector(".js-search-input").addEventListener("input", findTodo);
