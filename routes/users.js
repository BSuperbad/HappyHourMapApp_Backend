"use strict";

/** Routes for users. */

const express = require("express");
const jwt = require("jsonwebtoken")
const { isAdmin } = require("../middleware/auth");
const User = require("../models/user.js");
const router = express.Router();
const {SECRET_KEY} = require("../config")


/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 *
 * Authorization required: admin
 **/

router.post("/", isAdmin, async function (req, res, next) {
  try {
    const user = await User.register(req.body);
    const token = jwt.sign({
      username: user.username,
      userId: user.user_id,
      isAdmin: user.is_admin,
    }, SECRET_KEY);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});


/** GET / => { users: [ {username, firstName, lastName, email, isAdmin }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: admin
 **/
router.get("/", isAdmin, async function (req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName, email, isAdmin
 *
 * Authorization required: admin or same current logged- in user as :username
 **/
router.get("/:username", async function (req, res, next) {
  try {
    const loggedInUser = res.locals.user;
    const user = await User.get(req.params.username, loggedInUser.username, loggedInUser.isAdmin);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: admin or same-user-as-:username
 **/

router.patch("/:username/edit", async function (req, res, next) {
  try {
    const loggedInUser = res.locals.user
    const user = await User.update(req.params.username, loggedInUser, req.body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: admin or same-user-as-:username
 **/

router.delete("/:username", async function (req, res, next) {
  try {
    const loggedInUser = res.locals.user
    const delUser =  await User.remove(req.params.username, loggedInUser);
    return res.json({ deleted: req.params.username });
  } catch (err) {
    return next(err);
  }
});



// MAY CHANGE TO HAVE LIKE AND VISIT AS OWN ROUTE/ MODEL
/** POST /[username]/spaces/[space_id]  { state } => { application }
 *
 * Returns {"liked": userId, spaceId}
 *
 * Authorization required: same-user-as-:username
 * */
router.post("/:username/like/:title", async function (req, res, next) {
  try {
    const loggedInUser = res.locals.user.username;
    const space = req.params.title;
    const likedSpace = await User.likeSpace(req.params.username, space, loggedInUser);
    return res.json({ liked: likedSpace });
  } catch (err) {
    return next(err);
  }
});

router.delete('/:username/like/:title', async function (req, res, next) {
  try {
    const loggedInUser = res.locals.user;

    if (req.params.username !== loggedInUser.username) {
      throw new UnauthorizedError(`Cannot 'unlike' a space for another user`);
    }

    await User.unlikeSpace(req.params.username, req.params.title, loggedInUser);

    res.json({ message: 'Unlike successful' });
  } catch (err) {
    return next(err);
  }
});

/** GET /[username]/likes
 *
 * Returns {"liked": spaces}
 *
 * Authorization required: same-user-as-:username
 * */
router.get("/:username/likes", async function (req, res, next) {
  try {
    const likedSpaces = await User.getUserLikedSpaces(req.params.username);
    return res.json({ likedSpaces });
  } catch (err) {
    return next(err);
  }
});

/** POST /[username]/spaces/[space_id]  { state } => { application }
 *
 * Returns {"visited": userId, spaceId}
 *
 * Authorization required: same-user-as-:username
 * */

router.post("/:username/visit/:title", async function (req, res, next) {
  try {
    const loggedInUser = res.locals.user.username; 
    const space = req.params.title;
    const vistedSpace = await User.markAsVisited(req.params.username, space, loggedInUser);
    return res.json({ visited: vistedSpace });
  } catch (err) {
    return next(err);
  }
});

/** GET /[username]/likes
 *
 * Returns {"visited": spaces}
 *
 * Authorization required: same-user-as-:username
 * */
router.get("/:username/visits", async function (req, res, next) {
  try {
    const visits = await User.getVisits(req.params.username);
    return res.json({ visits });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
