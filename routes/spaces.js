"use strict";

/** Routes for spaces. */

const express = require("express");
const { isAdmin, ensureLoggedIn } = require("../middleware/auth");
const Space = require("../models/space.js");

const router = new express.Router();


/** POST / { space } =>  { space }
 *
 * space should be { title, description, image_url, category_id, address, location_id, est_year }
 *
 * Returns { space_id, title, description, image_url, category_id, address, location_id, est_year }
 *
 * Authorization required: admin
 */

router.post("/", isAdmin, async function (req, res, next) {
  try {
    const space = await Space.create(req.body);
    return res.status(201).json({ space });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { spaces: [ { title, description, category, image_url, address, est_year, city,meighborhood }, ...] }
 *
 * Can filter on provided search filters (will find case-insensitive, partial matches):
 * - title
 * - category
 * - city 
 * - neighborhood
 * - highest rated
 * - lowest rated
 * 
 * Authorization required: logged in
 */

router.get("/", ensureLoggedIn, async function (req, res, next) {
  const q = req.query;

  try {
    const spaces = await Space.findAll(q);
    return res.json({ spaces });
  } catch (err) {
    return next(err);
  }
  
});

/** GET /[title]  =>  { space }
 *
 *  space is { title, description, category, image_url, address, est_year, city,meighborhood }
    (will find case-insensitive, partial matches for s.title)
 *
 * Authorization required: logged in
 */

router.get("/:title", ensureLoggedIn, async function (req, res, next) {
  try {
    const space = await Space.get(req.params.title);
    
    return res.json({ space });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[title] { fld1, fld2, ... } => { space }
 *
 * Patches space data.
 *
 * fields can be: { title,  }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: admin
 */

router.patch("/:title/edit", isAdmin, async function (req, res, next) {
  try {
    const space = await Space.update(req.params.title, req.body);
    return res.json({ space });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[title]  =>  { deleted: title }
 *
 * Authorization: admin
 */

router.delete("/:title", isAdmin, async function (req, res, next) {
  try {
    const space = await Space.remove(req.params.title);
    return res.json({ deleted: space });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
