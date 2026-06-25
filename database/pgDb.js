const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/smartdaro',
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
