const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const DATA_FILE = "./data.json";

// Ensure data.json exists with an empty array
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ todos: [] }, null, 2), "utf-8");
}

// Function to read JSON data safely
const readData = () => {
    try {
        const rawData = fs.readFileSync(DATA_FILE, "utf-8");
        return JSON.parse(rawData).todos || [];
    } catch (error) {
        console.error("Error reading data.json:", error);
        return [];
    }
};

// Function to write JSON data
const writeData = (todos) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ todos }, null, 2), "utf-8");
};

// Get all todos
app.get("/todos", (req, res) => {
    res.json({ todos: readData() });
});

// Add a new todo
app.post("/todos", (req, res) => {
    const todos = readData();
    const newTodo = { id: Date.now().toString(), ...req.body };
    todos.push(newTodo);
    writeData(todos);
    res.status(201).json(newTodo);
});

// Delete a todo
app.delete("/todos/:id", (req, res) => {
    let todos = readData();
    todos = todos.filter((todo) => todo.id !== req.params.id);
    writeData(todos);
    res.status(200).json({ message: "Deleted successfully" });
});

// Update a todo
app.patch("/todos/:id", (req, res) => {
    let todos = readData();
    todos = todos.map((todo) =>
        todo.id === req.params.id ? { ...todo, ...req.body } : todo
    );
    writeData(todos);
    res.status(200).json({ message: "Updated successfully" });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
