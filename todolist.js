const API_URL = "http://localhost:3000/todos";

// Function to fetch and render todos
async function fetchTodos() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        const todoList = Array.isArray(data) ? data : data.todos || [];
        renderTodoList(todoList);
    } catch (error) {
        console.error("Error fetching todos:", error);
    }
}

// Function to render the todo list
function renderTodoList(todoList) {
    let todoNo = 1;
    let completedNo = 1;
    let tableBody = document.querySelector(".js-todo-list-items");
    let completedTableBody = document.querySelector(".js-completed-list-items");
    
    tableBody.innerHTML = "";
    completedTableBody.innerHTML = "";

    todoList.forEach((todoObject) => {
        const { id, inputValue, completed } = todoObject;
        
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${completed ? completedNo++ : todoNo++}</td>
            <td class="editable" data-id="${id}">${inputValue}</td>
            <td>
                <label class="switch">
                    <input type="checkbox" ${completed ? "checked" : ""} data-id="${id}">
                    <span class="slider round"></span>
                </label>
            </td>
            <td>
                <button class="js-delete-button delete-button" data-id="${id}">Delete</button>
            </td>
        `;
        
        if (completed) {
            completedTableBody.appendChild(row);
        } else {
            tableBody.appendChild(row);
        }
    });

    attachEventListeners();
}

// Function to attach event listeners to dynamically created elements
function attachEventListeners() {
    document.querySelectorAll(".js-delete-button").forEach((button) => {
        button.addEventListener("click", async (event) => {
            const id = event.target.dataset.id;
            await deleteTodo(id);
        });
    });

    document.querySelectorAll(".switch input").forEach((checkbox) => {
        checkbox.addEventListener("change", async (event) => {
            const id = event.target.dataset.id;
            await toggleTodoStatus(id, event.target.checked);
        });
    });

    document.querySelectorAll(".editable").forEach((td) => {
        td.addEventListener("dblclick", enableEditing);
    });
}

// Enable editing when double-clicking
function enableEditing(event) {
    const td = event.target;
    const currentText = td.innerText;
    const id = td.dataset.id;
    
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentText;
    input.classList.add("edit-input");
    
    td.innerHTML = "";
    td.appendChild(input);
    input.focus();
    input.select(); // Select all text when editing starts
    
    const handleSave = (value) => {
        if (value.trim() === currentText) {
            td.innerText = currentText; // Restore original if no changes
            return;
        }
        saveEdit(td, id, value);
    };
    
    input.addEventListener("blur", () => handleSave(input.value));
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSave(input.value);
        } else if (event.key === "Escape") {
            td.innerText = currentText; // Cancel edit on Escape
        }
    });
}

// Save the edited value
async function saveEdit(td, id, newValue) {
    if (!newValue.trim()) return;
    await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputValue: newValue })
    });
    fetchTodos();
}

// Function to add a new todo
const addTodo = async () => {
    const inputElement = document.querySelector(".js-todo-input");
    const inputValue = inputElement.value.trim();
    
    if (!inputValue) return;
    
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ inputValue, completed: false })
        });
        
        if (response.ok) {
            inputElement.value = ""; // Clear input field
            // Removed automatic focus
            await fetchTodos(); // Reload the list to show the new item
        }
    } catch (error) {
        console.error("Error adding todo:", error);
    }
};

// Function to delete a todo item
const deleteTodo = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchTodos();
};

// Function to toggle todo completion status
const toggleTodoStatus = async (id, completed) => {
    await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed })
    });
    fetchTodos();
};

// Function to search todos
const findTodo = async () => {
    const searchElement = document.querySelector(".js-search-input");
    const searchValue = searchElement.value.trim().toLowerCase();

    const response = await fetch(API_URL);
    let data = await response.json();
    let todoList = Array.isArray(data) ? data : data.todos || [];

    if (searchValue !== "") {
        todoList = todoList.filter(todo =>
            todo.inputValue.toLowerCase().includes(searchValue)
        );
    }
    renderTodoList(todoList);
};

// Event Listeners
document.querySelector(".js-add-button").addEventListener("click", addTodo);
document.querySelector(".js-todo-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") addTodo();
});
document.querySelector(".js-search-input").addEventListener("input", findTodo);

// Fetch initial todos
fetchTodos();
