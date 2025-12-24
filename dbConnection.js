import mysql from "mysql2/promise";
import config from "./config.js";

let pool;

function ConnectDB() {
  if (!pool) {
    pool = mysql.createPool(config.db); // 👈 already promise-based
    console.log("MySql Pool created successfully.");
  }
  return pool;
}

export default ConnectDB;
