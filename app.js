"use strict";

/** Express app for HappyHour. */

const express = require("express");
const cors = require("cors");
require('dotenv').config();

const { NotFoundError } = require("./expressError.js");

const { authenticateJWT } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const spacesRoutes = require("./routes/spaces.js");
const locationRoutes = require("./routes/locations.js");
const catRoutes = require("./routes/categories.js")
const commentRoutes = require("./routes/comments.js")
const ratingRoutes = require("./routes/ratings.js")


const app = express();

app.use(cors());
app.use(express.json());
app.use(authenticateJWT);

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/spaces", spacesRoutes);
app.use("/locations", locationRoutes)
app.use("/categories", catRoutes)
app.use("/comments", commentRoutes)
app.use("/ratings", ratingRoutes)


/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
