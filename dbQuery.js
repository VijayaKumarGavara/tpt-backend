// dbQuery.js
import ConnectDB from "./dbConnection.js";

export const dbQuery = async (sql, values = []) => {
  const pool = await ConnectDB();
  const [rows] = await pool.query(sql, values);
  return rows;
};
