import mysql from "mysql2/promise";
import config from "./config.js";
let pool;
function ConnectDB() {
  try {
    if (!pool) {
      pool = mysql.createPool(config.db);
      console.log("MySql Pool created successfully.");
    }
    return pool;
  } catch (error) {
    console.error("DB Pool creation failed:", error);
  }
}

export default ConnectDB;