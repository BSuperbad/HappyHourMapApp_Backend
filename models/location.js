"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError.js");

/** Related functions for locations. */

class Location {
  /** Create a location (from data), update db, return new location data.
   *
   * data should be { city, neighborhood  }
   *
   * Returns { loc_id, city, neighborhood }
   *
   * Throws BadRequestError if city, neighborhood already in database.
   * */

  static async create({ city, neighborhood }) {
    // in case the string is more than one word AND
    // To account for anyone entering lowercase, will always capitalize the first letter
    const capCity = city.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const capNeighborhood = neighborhood.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const duplicateCheck = await db.query(
          `SELECT city,
            neighborhood
           FROM locations
           WHERE city = $1 AND neighborhood = $2`,
        [capCity,capNeighborhood]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`${capCity}, ${capNeighborhood} already exists.`);

    const result = await db.query(
          `INSERT INTO locations
           (city, neighborhood)
           VALUES ($1, $2)
           RETURNING loc_id, city, neighborhood`,
        [
          capCity,
          capNeighborhood
        ],
    );
    const location = result.rows[0];

    return location;
  }

  /** Find all locations
   *
   * Returns {locations: [{ loc_id, city, neighborhood }, ...]
   * */

  static async findAll() {
    const locRes = await db.query(
        `SELECT loc_id,
            city,
            neighborhood
        FROM locations
        ORDER BY city`,
    );

    return locRes.rows;
  }

  /** Given a space title, return data about that space.
   *
   *  Returns [{ title, description, category, image_url,
   * address, est_year, city, neighborhood }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async getC(city) {
    const locRes = await db.query(
          `SELECT
            loc_id,
            city,
            neighborhood
          FROM locations
           WHERE city = $1`,
        [city]);

    const location = locRes.rows;
    if (location.length===0) throw new NotFoundError(`Cannot find city: ${city}`);
    
    return location;
  }
  static async getN(neighborhood) {
    const locRes = await db.query(
          `SELECT
            loc_id,
            city,
            neighborhood
          FROM locations
           WHERE neighborhood = $1`,
        [neighborhood]);

    const location = locRes.rows;
    if (location.length===0) throw new NotFoundError(`Cannot find neighborhood: ${neighborhood}`);
    
    return location;
  }
  static async findById(loc_id) {
    const locRes = await db.query(
          `SELECT
            loc_id,
            city,
            neighborhood
          FROM locations
           WHERE loc_id = $1`,
        [loc_id]);

    const location = locRes.rows;
    if (location.length===0) throw new NotFoundError(`Cannot find location with id of: ${loc_id}`);
    
    return location;
  }

  /** Update location data with `data`.
   *
   *
   * Data can include: {neighborhood}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update({ loc_id, data }) {
    const locationCheck = await db.query(
      `SELECT loc_id FROM locations WHERE loc_id = $1`,
      [loc_id]
  );

  if (locationCheck.rows.length === 0) {
      // If location with loc_id doesn't exist, throw NotFoundError
      throw new NotFoundError(`Location with id ${loc_id} not found.`);
  }
    // in case the string is more than one word AND
    // To account for anyone entering lowercase, will always capitalize the first letter
    const capCity = data.city ? data.city.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : city;
    const capNeighborhood = data.neighborhood ? data.neighborhood.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : neighborhood;
    const duplicateCheck = await db.query(
      `SELECT loc_id,
        neighborhood
       FROM locations
       WHERE (city = $1 OR $1 IS NULL) AND (neighborhood = $2 OR $2 IS NULL) AND loc_id != $3`,
      [capCity, capNeighborhood, loc_id]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`${capCity}, ${capNeighborhood} already exists.`);

      const result = await db.query(
        `UPDATE locations
         SET city = $1, neighborhood = $2
         WHERE loc_id = $3
         RETURNING loc_id, city, neighborhood`,
        [capCity, capNeighborhood, loc_id]
      );
    const updatedLocation = result.rows[0];

    return updatedLocation;
  }

  /** Delete given neighborhood from database; returns undefined.
   * Throws error if neighborhood is associated with existing space.
   *
   * Throws NotFoundError if neighborhood not found.
   **/

  static async deleteLoc(neighborhood) {
    const locationQuery = await db.query(
        'SELECT loc_id FROM locations WHERE neighborhood = $1',
        [neighborhood]
      );

    const location = locationQuery.rows[0];

    if(!location) throw new NotFoundError(`No neighborhood: ${neighborhood}`);

    const locId = location.loc_id;

    const associatedSpaces = await db.query(
        'SELECT space_id FROM spaces WHERE location_id = $1',
        [locId]
      );

    if(associatedSpaces.rows.length > 0) {
        throw new Error('Cannot delete location with associated spaces!')
    }

    const result = await db.query(
          `DELETE
           FROM locations
           WHERE loc_id = $1
           RETURNING city, neighborhood`,
        [locId]);
    const delLocation = result.rows[0];
    return delLocation;

  }
}


module.exports = Location;
