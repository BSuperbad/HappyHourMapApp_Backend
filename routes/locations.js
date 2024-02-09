"use strict";

/** Routes for locations. */

const express = require("express");

const { isAdmin } = require("../middleware/auth");
const Location = require("../models/location.js");

const router = new express.Router();


/** POST / { location  } =>  { location }
 *
 * location should be { city, neighborhood }
 *
 * Returns { loc_id, city, neighborhood }
 *
 * Authorization required: admin
 */

router.post("/", isAdmin, async function (req, res, next) {
  try {
    const location = await Location.create(req.body);
    return res.status(201).json({ location });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { locations: [ { loc_id, city, neighborhood }, ...] }
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {

  try {
    const locations = await Location.findAll();
    return res.json({ locations });
  } catch (err) {
    return next(err);
  }
  
});

/** GET /[city]  =>  { location(s) }
 *
 *  Locations are { loc_id, city, neighborhood }
 * (will find case-insensitive, partial matches for city)
 *
 * Authorization required: none
 */

router.get("/cities/:city", async function (req, res, next) {
  try {
    const location = await Location.getC(req.params.city);
    
    return res.json({ location });
  } catch (err) {
    return next(err);
  }
});

router.get("/:loc_id", async function (req, res, next) {
  try {
    const location = await Location.findById(req.params.loc_id);
    return res.json({ location });
  } catch (err) {
    return next(err);
  }
});


/** GET /[neighborhood]  =>  { location(s) }
 *
 *  Locations are { loc_id, city, neighborhood }
 * (will find case-insensitive, partial matches for neighborhood)
 *
 * Authorization required: none
 */

router.get("/neighborhoods/:neighborhood", async function (req, res, next) {
  try {
    const location = await Location.getN(req.params.neighborhood);
    
    return res.json({ location });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[neighborhood] { fld1, fld2, ... } => { location }
 *
 * Patches location data.
 *
 * fields can be: { city, neighborhood }
 *
 * Returns { loc_id, city, neighborhood }
 *
 * Authorization required: admin
 */

router.patch("/:loc_id", isAdmin, async function (req, res, next) {
  try {
    const { loc_id } = req.params;
    const data = req.body;
    console.log('Received data:', data);

    const location = await Location.update({loc_id, data});
    return res.json({ location });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[neighborhood]  =>  { deleted: city, neighborhood }
 *
 * Authorization: admin
 */

router.delete('/neighborhoods/:neighborhood', isAdmin, async function (req, res, next) {
    try {
      const deletedLocation = await Location.deleteLoc(req.params.neighborhood);
      return res.json({ deletedLocation });
    } catch (error) {
      return next(error); 
    }
  });


module.exports = router;
