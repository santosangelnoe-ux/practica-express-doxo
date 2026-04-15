const express = require('express');
const pool = require('./db');
const app = express();

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

app.get('/usuario', (req, res) => {
  const usuario = {
    id: 1,
    nombre: 'Angel Noe Santos',
    rol: 'Desarrollador Backend'
  };
  res.json(usuario);
});

app.get('/pokemon/:nombre', async (req, res) => {
  try {
    const elPokemonQuePidieron = req.params.nombre; 

    const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${elPokemonQuePidieron}`);
    const pokemon = await respuesta.json();

    const miPokemon = {
      nombre: pokemon.name,
      numero: pokemon.id,
      peso: pokemon.weight
    };

    res.json(miPokemon);
    
  } catch (error) {
    res.status(404).json({ error: 'Ese Pokémon no existe o está mal escrito' });
  }
});
app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');

});

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

app.get('/alumnos', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM alumno');
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al consultar alumnos:', error);
    res.status(500).json({ error: 'Error al obtener los alumnos' });
  }
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});