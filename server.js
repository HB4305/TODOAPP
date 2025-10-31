const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const port = 3000;

const dataPath = path.join(__dirname, "database", "task.json");

// Disable caching for API responses so clients always fetch fresh data
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

function readTodos() {
  if (!fs.existsSync(dataPath)) {
    return [];
  }

  const data = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(data);
}

function writeTodos(todos) {
  if (!fs.existsSync(path.dirname(dataPath))) {
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
  }
  fs.writeFileSync(dataPath, JSON.stringify(todos, null, 2));
}
  
// Set EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", "./views");

// Route to render products with EJS
app.get("/api/todos", (req, res) => {
  const todos = readTodos();
  res.json(todos);
});

app.post("/api/todos", (req, res) => {
  const todo = req.body;
  const todos = readTodos();
  todo.id = todos.length > 0 ? todos[todos.length - 1].id + 1 : 1;
  todos.push(todo);
  writeTodos(todos);
  res.json(todo);
});

app.put("/api/todos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { completed } = req.body;

  let todos = readTodos();
  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }

  todo.completed = completed;

  writeTodos(todos);
  res.json(todo);
});

app.get("/todos", (req, res) => {
  res.render("todos", { title: "TODO list" });
});

app.delete("/api/todos/:id", (req, res) => {
  const id = req.params.id;
  let todos = readTodos();
  todos = todos.filter((t) => t.id !== parseInt(id));
  writeTodos(todos);
  res.json({ message: "Deleted successfully" });
});

// Root route
app.get("/", (req, res) => {
  res.render("index", { title: "TODO", message: "Welcome to the TODO app!" });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
