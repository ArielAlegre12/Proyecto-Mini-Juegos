const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;
const USERS_FILE = './users.json';

app.use(cors());
app.use(bodyParser.json());

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  const data = fs.readFileSync(USERS_FILE, 'utf8');
  return JSON.parse(data || '[]');
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'El usuario ya existe.' });
  }

  users.push({ username, password });
  saveUsers(users);
  res.json({ message: 'Usuario registrado correctamente.' });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();

  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Credenciales inválidas.' });
  }

  res.json({ message: 'Login exitoso', username });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
