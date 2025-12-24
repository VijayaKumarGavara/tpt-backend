import ConnectDB from "./dbConnection.js";

const pool = ConnectDB();

export const dbQuery = (sql, values = [],...other) => {
  console.log("SQL:", sql);
  console.log("Values:", values);
  console.log("Other", other);
  return pool.query(sql, values);
};
