"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError.js");
const { partialUpdate } = require("../helpers/partialUpdate");
const { geocodeAddress } = require("../helpers/geocoding");

/** Related functions for spaces. */

class Space {
  /** Create a space (from data), update db, return new space data.
   *
   * data should be { title, description, image_url, category_id, address, location_id, est_year }
   *
   * Returns { space_id, title, description, category, image_url, address, latitude, longitude,
   *           est_year, city, neighborhood }
   *
   * Throws BadRequestError if space already in database.
   */

  static async create({ title, description, image_url, category_id, address, location_id, est_year }) {
    const capTitle = title.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    const duplicateCheck = await db.query(
      `SELECT title FROM spaces WHERE title = $1`,
      [capTitle]
    );
    if (duplicateCheck.rows[0]) throw new BadRequestError(`Duplicate space: ${capTitle}`);

    const { latitude, longitude } = await geocodeAddress(address);

    const result = await db.query(
      `WITH new_space AS (
         INSERT INTO spaces
           (title, description, image_url, category_id, address, location_id, est_year, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING space_id, title, description, image_url, address, est_year, latitude, longitude,
                   category_id, location_id
       )
       SELECT
         ns.space_id,
         ns.title,
         ns.description,
         ns.image_url,
         ns.address,
         ns.est_year,
         ns.latitude,
         ns.longitude,
         c.cat_type AS category,
         l.city,
         l.neighborhood
       FROM new_space ns
       JOIN categories c ON ns.category_id = c.cat_id
       JOIN locations l ON ns.location_id = l.loc_id`,
      [capTitle, description, image_url, category_id, address, location_id, est_year, latitude, longitude]
    );

    return result.rows[0];
  }

  /** Find all spaces (optional filter on searchFilters).
   *
   * searchFilters (all optional):
   * - title (case-insensitive, partial match)
   * - category
   * - city
   * - neighborhood
   * - sortBy: 'ASC' | 'DESC' (by avg_rating)
   *
   * Returns [{ space_id, title, description, category, image_url, address, latitude, longitude,
   *            est_year, city, neighborhood, avg_rating }, ...]
   */

  static async findAll(searchFilters = {}) {
    let query = `
      SELECT
        s.space_id,
        s.title,
        s.description,
        c.cat_type AS "category",
        s.image_url,
        s.address,
        s.latitude,
        s.longitude,
        s.est_year,
        l.city,
        l.neighborhood,
        AVG(r.rating) AS avg_rating
      FROM spaces s
      JOIN categories c ON s.category_id = c.cat_id
      JOIN locations l ON s.location_id = l.loc_id
      LEFT JOIN ratings r ON s.space_id = r.space_id
    `;

    let whereExpressions = [];
    let queryValues = [];
    const { title, category, city, neighborhood, sortBy } = searchFilters;

    if (title) {
      queryValues.push(`%${title}%`);
      whereExpressions.push(`s.title ILIKE $${queryValues.length}`);
    }
    if (category) {
      queryValues.push(`%${category}%`);
      whereExpressions.push(`c.cat_type ILIKE $${queryValues.length}`);
    }
    if (city) {
      queryValues.push(`%${city}%`);
      whereExpressions.push(`l.city ILIKE $${queryValues.length}`);
    }
    if (neighborhood) {
      queryValues.push(`%${neighborhood}%`);
      whereExpressions.push(`l.neighborhood ILIKE $${queryValues.length}`);
    }
    if (whereExpressions.length > 0) {
      query += ` WHERE ${whereExpressions.join(' AND ')}`;
    }

    query += ` GROUP BY s.space_id, s.title, s.description, c.cat_type, s.image_url,
                         s.address, s.latitude, s.longitude, s.est_year, l.city, l.neighborhood`;

    if (sortBy) {
      const sortOrder = sortBy.toUpperCase() === 'DESC'
        ? `avg_rating DESC NULLS LAST`
        : `avg_rating ASC NULLS FIRST`;
      query += ` ORDER BY ${sortOrder}`;
    }

    const spacesRes = await db.query(query, queryValues);
    if (spacesRes.rows.length === 0) {
      throw new NotFoundError("No spaces found matching the criteria.");
    }
    return spacesRes.rows;
  }

  /** Given a space title, return data about that space.
   *
   * Returns { space_id, title, description, category, image_url, address, latitude, longitude,
   *           est_year, city, neighborhood }
   *
   * Throws NotFoundError if not found.
   */

  static async get(title) {
    const spaceRes = await db.query(
      `SELECT
         s.space_id,
         s.title,
         s.description,
         c.cat_type AS "category",
         s.image_url,
         s.address,
         s.latitude,
         s.longitude,
         s.est_year,
         l.city,
         l.neighborhood
       FROM spaces s
       JOIN categories c ON s.category_id = c.cat_id
       JOIN locations l ON s.location_id = l.loc_id
       WHERE s.title = $1`,
      [title]
    );

    const space = spaceRes.rows[0];
    if (!space) throw new NotFoundError(`Cannot find space: ${title}`);
    return space;
  }

  /** Update space data with `data`.
   *
   * Data can include: { title, description, image_url, category_id, address, location_id, est_year }
   * Re-geocodes if address changes.
   *
   * Returns { title, description, category, image_url, address, latitude, longitude,
   *           est_year, city, neighborhood }
   *
   * Throws NotFoundError if not found.
   */

  static async update(spaceTitle, data) {
    if (spaceTitle !== data.title) {
      const duplicateCheck = await db.query(
        `SELECT title FROM spaces WHERE title = $1`,
        [data.title]
      );
      if (duplicateCheck.rows[0]) {
        throw new BadRequestError(`Duplicate space title: ${data.title}`);
      }
    }

    if (data.title) {
      data.title = data.title.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    if (data.address) {
      const { latitude, longitude } = await geocodeAddress(data.address);
      data.latitude = latitude;
      data.longitude = longitude;
    }

    const { setCols, values } = partialUpdate(data, {});
    const titleVarIdx = "$" + (values.length + 1);

    const querySql = `
      UPDATE spaces
      SET ${setCols}
      FROM categories AS c, locations AS l
      WHERE spaces.title = ${titleVarIdx}
        AND spaces.category_id = c.cat_id
        AND spaces.location_id = l.loc_id
      RETURNING
        spaces.title,
        spaces.description,
        c.cat_type AS "category",
        spaces.image_url,
        spaces.address,
        spaces.latitude,
        spaces.longitude,
        spaces.est_year,
        l.city,
        l.neighborhood`;

    const result = await db.query(querySql, [...values, spaceTitle]);
    const space = result.rows[0];
    if (!space) throw new NotFoundError(`No space: ${spaceTitle}`);
    return space;
  }

  /** Delete given space from database.
   *
   * Throws NotFoundError if space not found.
   */

  static async remove(title) {
    const space = await db.query(
      `DELETE FROM spaces WHERE title = $1 RETURNING title`,
      [title]
    );
    if (space.rows.length === 0) throw new NotFoundError(`No space: ${title}`);
    return space.rows[0];
  }
}


module.exports = Space;
