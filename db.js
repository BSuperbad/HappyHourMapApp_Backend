"use strict";

/** Database setup for HappyHour backend. */

const { Pool } = require("pg");
const { getDatabaseUri } = require("./config");

const db = new Pool({
  connectionString: getDatabaseUri(),
  ...(process.env.NODE_ENV === "production" && {
    ssl: { rejectUnauthorized: false },
  }),
});

module.exports = db;
