// backend/index.js
const express = require('express');
const cors = require('cors');
const db = require('./db'); // importamos la conexión

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Ruta de prueba para obtener usuarios
app.get('/usuarios', (req, res) => {
  db.query('SELECT * FROM usuarios', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});