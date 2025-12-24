// import ConnectDB from "./dbConnection.js";

// const pool = ConnectDB();

// export const dbQuery = (sql, values = []) => {
//   console.log("SQL:", sql);
//   console.log("Values:", values);
//   return pool.query(sql, values);
// };

import ConnectDB from "./dbConnection.js";

const pool = ConnectDB();

export const dbQuery = (...args) => {
  if (args.length !== 2) {
    console.error("❌ INVALID dbQuery CALL:", args);
    throw new Error(
      `dbQuery expects EXACTLY 2 arguments (sql, values). Received ${args.length}`
    );
  }

  const [sql, values] = args;

  if (!Array.isArray(values)) {
    console.error("❌ VALUES NOT ARRAY:", values);
    throw new Error("dbQuery values must be an array");
  }

  console.log("SQL:", sql);
  console.log("Values:", values);

  return pool.query(sql, values);
};
