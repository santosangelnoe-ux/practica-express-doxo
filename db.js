const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres', 
  host: 'localhost',
  database: 'react_express_db',
  password: '5s5ay3zu',
  port: 5432,
});

module.exports = pool;