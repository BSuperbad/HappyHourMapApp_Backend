"use strict";

/** Routes for comments. */

const express = require("express");

const { UnauthorizedError } = require("../expressError.js");
const { ensureLoggedIn } = require("../middleware/auth");
const Comment = require("../models/comment.js");

const router = new express.Router();


/** POST / { comment  } =>  { comment }
 *
 * comment should be { comment }
 *
 * Returns { title, description, comment, comment_date, username }
 *
 * Authorization required: current logged-in user
 */

router.post("/:username/spaces/:title", ensureLoggedIn, async function (req, res, next) {
  try {
    const { username, title } = req.params;
    const { comment } = req.body;
    if (res.locals.user.username !== req.params.username) {
      throw new UnauthorizedError("Unauthorized, must be the current logged-in user");
    }
    const commentData = {
      username,
      spaceTitle: title,
      comment,
    };
    const result = await Comment.addComment(commentData);
    return res.status(201).json({ comment: result });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { space: [ { comment, comment_date }, {comment, comment_date} ...] }
 * Returns all comments for a single space
 *
 * Authorization required: none
 */

router.get("/spaces/:title", async function (req, res, next) {

  try {
    const spaceTitle = req.params.title;
    const comments = await Comment.getAllForSpace(spaceTitle);
    return res.json({ comments });
  } catch (err) {
    return next(err);
  }
  
});

/** GET /  =>
 *   { user: [ { space, comment, comment_date }, {space, comment, comment_date} ...] }
 * Returns all comments a user has posted
 *
 * Authorization required: none
 */

router.get("/users/:username", async function (req, res, next) {

  try {
    const comments = await Comment.getAllForUser(req.params.username);
    return res.json({ comments });
  } catch (err) {
    return next(err);
  }
  
});

/** GET /  =>
 *   { comment: { space, comment, comment_date } }
 * Returns a single comment based on the comment_id
 *
 * Authorization required: must be logged in
 */

router.get("/:comment_id", ensureLoggedIn, async function (req, res, next) {
  try {
    const { comment_id } = req.params;
    const comment = await Comment.getComment(comment_id);
    return res.json({ comment });
  } catch (err) {
    return next(err);
  }
});



/** PATCH /[comment] { newComment } => { comment }
 *
 * Patches comment data.
 *
 * fields can be: { comment }
 *
 * Returns { title, description, comment, comment_date, username }
 *
 * Authorization: current logged-in user's comment
 * (if inappropriate, admin can delete using the DELETE route)
 */

router.patch("/:comment_id/edit", ensureLoggedIn, async function (req, res, next) {
  try {
    const user = res.locals.user;
    console.log(user)
    const updateComment = await Comment.updateComment(req.params.comment_id, user, req.body.comment);
    return res.json({ updated: updateComment });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[comment]  =>  { deleted: comment_id, comment }
 *
 * Authorization: admin or current logged-in user's comment
 */

router.delete('/:comment_id', ensureLoggedIn, async function (req, res, next) {
    try {
      const userId = res.locals.user.user_id;
      console.log("res.locals.user", res.locals.user)
      const isAdmin = res.locals.user.isAdmin;
      const deleted = await Comment.delete(req.params.comment_id, userId, isAdmin);
      return res.json({ deleted });
    } catch (error) {
      return next(error); 
    }
  });


module.exports = router;
