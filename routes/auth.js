"use strict";

/** Routes for authentication. */

const User = require("../models/user");
const express = require("express");
const router = new express.Router();
const jwt = require("jsonwebtoken")
const {SECRET_KEY} = require("../config")

/** POST /auth/token:  { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
    try {
        const user = await User.authenticate(username, password);
        const token = jwt.sign({ username: user.username, userId: user.user_id, isAdmin: user.isAdmin }, SECRET_KEY);
      res.json({ user, token });
    } catch (error) {
      next(error);
    }
  });


/** POST /auth/register:   { user } => { token }
 *
 * user must include { username, password, firstName, lastName, email }
 * automatically makes user not an admin
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/register", async function (req, res, next) {
  try {
    const newUser = await User.register({ ...req.body, isAdmin: false });
    const token = jwt.sign({
      username: newUser.username,
      userId: newUser.user_id,
      isAdmin: newUser.is_admin,
    }, SECRET_KEY);
    return res.status(201).json({ newUser, token });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
