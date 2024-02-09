"use strict";

/** Routes for ratings. */

const express = require("express");

const { UnauthorizedError } = require("../expressError.js");
const { isAdmin, ensureLoggedIn, currentUserOrAdmin } = require("../middleware/auth");
const Rating = require("../models/rating.js");
const router = new express.Router();


/** POST / { rating  } =>  { user, space, rating }
 *
 * Returns { user, space, rating }
 *
 * Authorization required: logged-in user
 */

router.post("/:username/spaces/:title", ensureLoggedIn, async function (req, res, next) {
  try {
    const { username, title } = req.params;
    const { rating } = req.body;
    if (res.locals.user.username !== req.params.username) {
      throw new UnauthorizedError("Unauthorized, must be the current logged-in user");
    }
    const ratingData = {
      username,
      spaceTitle: title,
      rating,
    };

    const result = await Rating.addRating(ratingData);

    return res.status(201).json({ rating: result });
  } catch (err) {
    return next(err);
  }
});


/** GET /  =>
 *   { rating : { space, description, rating, username } }
 * 
 * Returns a single rating for a space by a user
 *
 * Authorization required: must be logged in
 */


router.get("/:username/spaces/:title", async function (req, res, next) {
  try {
    const { username, title } = req.params;
    const rating = await Rating.getRating(username, title);
    return res.json({ rating });
  } catch (err) {
    return next(err);
  }
});


/** GET /  =>
 *   { Average rating for a space: [ rating: { title, averageRate} ...] }
 *
 * Authorization required: none
 */

router.get("/spaces/:title", async function (req, res, next) {

  try {
    const spaceTitle = req.params.title;
    const rating = await Rating.getAvgSpaceRating(spaceTitle);
    return res.json({ rating });
  } catch (err) {
    return next(err);
  }
  
});

/** GET /  =>
 *   { rating by id:}
 *
 * Authorization required: none
 */

router.get("/:rating_id", async function (req, res, next) {
  try {
    const { rating_id } = req.params;
    const rating = await Rating.getRatingById(rating_id);
    return res.json({ rating });
  } catch (err) {
    return next(err);
  }
});
/** GET /  =>
 *   { sorted: [ { title, rating }, ...] }
 * Lists the spaces by either highest or lowest rating depending on how the user sorts
 *
 * Authorization required: none
 */
// router.get("/:sortOrder", async function (req, res, next) {

//   try {

//     const order = req.params.sortOrder;
//     const sorted = await Rating.sortByAvgRating(order);
//     return res.json({ sorted });
//   } catch (err) {
//     return next(err);
//   }
  
// });

/** PATCH /[rating] { newRating } => { rating }
 *
 * Patches rating data.
 *
 * fields can be: { rating }
 *
 * Returns { title, description, username, newRating }
 *
 * Authorization required: logged-in-user that gave the original rating
 */

router.patch("/:rating_id/edit", ensureLoggedIn, async function (req, res, next) {
  try {
    const user = res.locals.user;
    const updatedRating = await Rating.updateRating(req.params.rating_id, user, req.body.rating);
    return res.json({ updated: updatedRating });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[rating]  =>  { deletedRating }
 *
 * Authorization: admin or logged-in-user that gave the rating
 */

router.delete('/:rating_id', ensureLoggedIn, async function (req, res, next) {
    try {
      const userId = res.locals.user.userId;
      const isAdmin = res.locals.user.isAdmin;
      const deletedRating = await Rating.delete(req.params.rating_id, userId, isAdmin);
      return res.json({ deletedRating });
    } catch (error) {
      return next(error); 
    }
  });


module.exports = router;
