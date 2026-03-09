"use strict";

const db = require("../db.js");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError.js");


/** Related functions for ratings. */

class Rating {
  /** Add a rating to a space.
   * Authorization: must be logged-in.
   *
   * Returns { title, description, username, rating, rating_id }
   *
   * Throws NotFoundError if username or space not found.
   * Throws BadRequestError if user has already rated this space.
   */

  static async addRating({ username, spaceTitle, rating }) {
    // Resolve user + space in one query
    const lookup = await db.query(
      `SELECT u.user_id, s.space_id
       FROM users u, spaces s
       WHERE u.username = $1 AND s.title = $2`,
      [username, spaceTitle]
    );

    if (!lookup.rows[0]) {
      const userCheck = await db.query(`SELECT user_id FROM users WHERE username = $1`, [username]);
      if (!userCheck.rows[0]) throw new NotFoundError(`No such user: ${username}`);
      throw new NotFoundError(`No such space: ${spaceTitle}`);
    }

    const { user_id, space_id } = lookup.rows[0];

    const existingRating = await db.query(
      `SELECT 1 FROM ratings WHERE user_id = $1 AND space_id = $2`,
      [user_id, space_id]
    );
    if (existingRating.rows.length > 0) {
      throw new BadRequestError(`User ${username} has already rated space ${spaceTitle}`);
    }

    const result = await db.query(
      `WITH new_rating AS (
         INSERT INTO ratings (user_id, space_id, rating)
         VALUES ($1, $2, $3)
         RETURNING rating_id, space_id, user_id, rating
       )
       SELECT
         sp.title,
         sp.description,
         u.username,
         nr.rating,
         nr.rating_id
       FROM new_rating nr
       JOIN spaces sp ON sp.space_id = nr.space_id
       JOIN users u ON u.user_id = nr.user_id`,
      [user_id, space_id, rating]
    );

    return result.rows[0];
  }

  /** Get a single rating by username and space title.
   *
   * Returns { rating_id, rating, username, title }
   * Throws NotFoundError if not found.
   */

  static async getRating(username, title) {
    const ratingData = await db.query(
      `SELECT r.rating_id, r.rating, u.username, s.title
       FROM ratings r
       JOIN users u ON r.user_id = u.user_id
       JOIN spaces s ON r.space_id = s.space_id
       WHERE u.username = $1 AND s.title = $2`,
      [username, title]
    );

    if (!ratingData.rows[0]) throw new NotFoundError(`Rating not found!`);
    return ratingData.rows[0];
  }

  /** Get a rating by its ID.
   *
   * Returns { rating, username, title }
   * Throws NotFoundError if not found.
   */

  static async getRatingById(ratingId) {
    const ratingData = await db.query(
      `SELECT r.rating, u.username, s.title
       FROM ratings r
       JOIN users u ON r.user_id = u.user_id
       JOIN spaces s ON r.space_id = s.space_id
       WHERE r.rating_id = $1`,
      [ratingId]
    );

    if (!ratingData.rows[0]) throw new NotFoundError(`Rating not found!`);
    return ratingData.rows[0];
  }

  /** Get average rating for a space.
   *
   * Returns { rating: <number | "Not yet rated"> }
   * Throws NotFoundError if space not found.
   */

  static async getAvgSpaceRating(title) {
    const spaceRes = await db.query(
      `SELECT s.title, AVG(r.rating) AS avg_rating
       FROM spaces s
       LEFT JOIN ratings r ON s.space_id = r.space_id
       WHERE s.title = $1
       GROUP BY s.title`,
      [title]
    );

    const space = spaceRes.rows[0];
    if (!space) throw new NotFoundError(`No such space: ${title}`);

    const avgRating = parseFloat(space.avg_rating);
    return {
      rating: !isNaN(avgRating) ? avgRating.toFixed(2) : "Not yet rated",
    };
  }

  /** Update a rating.
   *
   * Returns { rating, title, description, username }
   *
   * Throws NotFoundError if rating not found.
   * Throws UnauthorizedError if user does not own the rating.
   */

  static async updateRating(rating_id, user, updatedRating) {
    const user_id = await db.query(
      `SELECT user_id FROM ratings WHERE rating_id = $1`,
      [rating_id]
    );

    if (!user_id.rows[0]) throw new NotFoundError(`Rating with ID ${rating_id} not found.`);

    if (!(user_id.rows[0].user_id === user.userId)) {
      throw new UnauthorizedError("Unauthorized to update this rating.");
    }

    const result = await db.query(
      `UPDATE ratings
       SET rating = $1
       WHERE rating_id = $2
       RETURNING
         ratings.rating,
         (SELECT title FROM spaces WHERE space_id = ratings.space_id) AS title,
         (SELECT description FROM spaces WHERE space_id = ratings.space_id) AS description,
         (SELECT username FROM users WHERE user_id = ratings.user_id) AS username`,
      [updatedRating, rating_id]
    );

    return result.rows[0];
  }

  /** Delete a rating.
   *
   * Authorization: logged-in user who gave the rating, or admin.
   * Throws NotFoundError if not found.
   * Throws UnauthorizedError if not authorized.
   */

  static async delete(ratingId, userId, isAdmin) {
    const result = await db.query(
      `SELECT r.rating_id, u.user_id
       FROM ratings r
       JOIN users u ON r.user_id = u.user_id
       WHERE r.rating_id = $1`,
      [ratingId]
    );

    const rating = result.rows[0];
    if (!rating) throw new NotFoundError(`Rating not found`);

    if (rating.user_id !== userId && !isAdmin) {
      throw new UnauthorizedError("Unauthorized to delete this rating.");
    }

    await db.query(`DELETE FROM ratings WHERE rating_id = $1`, [ratingId]);

    return `Rating successfully deleted.`;
  }
}


module.exports = Rating;
