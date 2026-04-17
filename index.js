const express = require('express');
const pool = require('./db');
const app = express();

// IMPORTANTE: Esto permite recibir datos JSON desde Postman
app.use(express.json());

pool.connect()
  .then(() => {
    console.log('Conexión exitosa a PostgreSQL');
  })
  .catch((err) => {
    console.error('Error de conexión:', err);
  });

app.get('/', (req, res) => {
  res.send('API funcionando');
});

// Ruta GET: Obtener todos los alumnos
app.get('/alumnos', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM alumno');
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al consultar alumnos:', error);
    res.status(500).json({ error: 'Error al obtener los alumnos' });
  }
});

// NUEVA RUTA POST: Insertar un nuevo alumno
app.post('/alumnos', async (req, res) => {
  try {
    // 1. Recibimos los datos que manda Postman
    const { nombre, apellido, edad, correo } = req.body;

    // 2. Validación: Revisamos que no falte nada
    if (!nombre || !apellido || !edad || !correo) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // 3. Insertamos en la base de datos
    const resultado = await pool.query(
      'INSERT INTO alumno (nombre, apellido, edad, correo) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, apellido, edad, correo]
    );

    // 4. Respondemos con éxito
    res.status(201).json({
      mensaje: 'Alumno insertado correctamente',
      alumno: resultado.rows[0]
    });
  } catch (error) {
    console.error('Error al insertar alumno:', error);
    res.status(500).json({ error: 'Error al insertar el alumno' });
  }
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});