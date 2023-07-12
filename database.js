const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS book_inventories (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    author VARCHAR(100) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    quantity INTEGER
  );
`;

const createTable = async () => {
  try {
    const client = await pool.connect();
    await client.query(createTableQuery);
    client.release();
    console.log("Table created successfully");
  } catch (err) {
    console.error("Error executing query", err.stack);
  }
};

createTable();

module.exports = {
  query: async (text, params) => {
    console.log("QUERY:", text, params || "");
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } catch (err) {
      console.error("Error executing query", err.stack);
    } finally {
      client.release();
    }
  },
};
