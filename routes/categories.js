"use strict";

/** Routes for categories. */

const express = require("express");

const { isAdmin  } = require("../middleware/auth");
const Category = require("../models/category.js");

const router = new express.Router();


/** POST / { category  } =>  { category }
 *
 * category should be { cat_type }
 *
 * Returns { cat_id, cat_type }
 *
 * Authorization required: admin
 */

router.post("/", isAdmin, async function (req, res, next) {
  try {

   const category = await Category.create(req.body);
    return res.status(201).json({ category });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { categories: [ { cat_id, cat_type }, ...] }
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {

  try {

    const categories = await Category.findAll();
    return res.json({ categories });
  } catch (err) {
    return next(err);
  }
  
});

/** GET /[category]  =>  { list of spaces under category }
 *
 *  Categories are { cat_id, cat_type }
 * (will find case-insensitive, partial matches for category type)
 *
 * Authorization required: none
 */

router.get("/:cat_type", async function (req, res, next) {
  try {
    const category = await Category.get(req.params.cat_type);
    
    return res.json({ category });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[neighborhood] { fld1, fld2, ... } => { location }
 *
 * Patches location data.
 *
 * fields can be: { neighborhood }
 *
 * Returns { loc_id, city, neighborhood }
 *
 * Authorization required: admin
 */

router.patch("/:cat_type/edit", isAdmin, async function (req, res, next) {
  try{
    const category = await Category.updateCat(req.params.cat_type, req.body);
    return res.json({ category });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[category]  =>  { deleted: category }
 *
 * Authorization required: admin
 */

router.delete('/:cat_type', isAdmin, async function (req, res, next) {
    try {
      const deletedCategory = await Category.deleteCat(req.params.cat_type);
      return res.json({ deletedCategory });
    } catch (error) {
      return next(error); 
    }
  });


module.exports = router;
