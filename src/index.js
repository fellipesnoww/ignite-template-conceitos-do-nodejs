const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const user = users.find((user) => user.username === username);

  if(!user){
    return response.status(400).send({error: "User not found"})
  }

  request.user = user;
  next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;
  
  const usernameExist = users.some((u) => u.username === username);

  if(usernameExist){
    return response.status(400).json({error: "Username already used"})
  }
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;

  return response.send(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
    
  const {user} = request;

  const todo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }
  
  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;
  const {title, deadline} = request.body;

  const selectedTodo = user.todos.find(t => t.id === id);
  if(!selectedTodo){
    return response.status(404).json({error: 'Todo not found'});
  }

  selectedTodo.title = title;
  selectedTodo.deadline = new Date(deadline);

  return response.status(201).json(selectedTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const selectedTodo = user.todos.find((todo) => todo.id === id);

  if(!selectedTodo){
    return response.status(404).json({error: "Todo not found"})
  }

  selectedTodo.done = true;
  
  return response.status(201).json(selectedTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const selectedTodo = user.todos.find((todo) => todo.id === id);

  if(!selectedTodo){
    return response.status(404).json({error: "Todo not found"})
  }

  user.todos.splice(selectedTodo, 1);
  
  return response.status(204).send();
});

module.exports = app;