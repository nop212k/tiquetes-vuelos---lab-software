// backend/db.js
const mysql = require('mysql2');

// Configura tu conexión
const connection = mysql.createConnection({
  host: 'localhost',       // usualmente localhost si usas XAMPP
  user: 'root',            // tu usuario de MySQL
  password: '',            // contraseña, por defecto vacío en XAMPP
  database: 'db_pearl_airlines'    // el nombre de tu base de datos
});

// Conectar
connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
  } else {
    console.log('Conectado a la base de datos MySQL ✅');
  }
});

module.exports = connection;