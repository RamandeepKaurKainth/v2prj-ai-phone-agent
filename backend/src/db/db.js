const mysql = require("mysql2/promise");
require("dotenv").config();

if (!process.env.DB_HOST) throw new Error("Missing DB_HOST");
if (!process.env.DB_USER) throw new Error("Missing DB_USER");
if (!process.env.DB_NAME) throw new Error("Missing DB_NAME");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  ssl: process.env.DB_SSL === "true"
    ? { rejectUnauthorized: false }
    : undefined,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
});

console.log("Connecting to:", process.env.DB_HOST, process.env.DB_PORT);

module.exports = pool;