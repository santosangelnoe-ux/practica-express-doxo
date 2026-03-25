const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('API funcionando');
});

// Este es tu nuevo endpoint
app.get('/usuario', (req, res) => {
  const usuario = {
    id: 1,
    nombre: 'Angel Noe Santos',
    rol: 'Desarrollador Backend'
  };

  res.json(usuario);
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});