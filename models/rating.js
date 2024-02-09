"use strict";

const db = require("../db.js");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError.js");


/** Related functions for ratings. */

class Rating {
  /** Lets a user add a rating to a space.
   * Authorization: must be logged-in
   *
   * Returns { title, description, username, rating  }
   *
   * Throws NotFoundErrors if username/ title are not found.
   * Throws BadRequestError if user has already added a rating. (user may edit rating later)
   **/

  static async addRating({ username, spaceTitle, rating }) {
    const user = await db.query(
        `SELECT user_id FROM users WHERE username = $1`,
        [username]
      );
    if(!user.rows[0]) throw new NotFoundError(`No such user: ${username}`);
  
    const space = await db.query(
        `SELECT space_id FROM spaces WHERE title = $1`,
        [spaceTitle]
    );
    if(!space.rows[0]) throw new NotFoundError(`No such space: ${spaceTitle}`);
  
    const userId = user.rows[0].user_id;
    const spaceId = space.rows[0].space_id;

    const existingRating = await db.query(
      `SELECT rating FROM ratings WHERE user_id = $1 AND space_id = $2`,
      [userId, spaceId]
  );

  if (existingRating.rows.length > 0) throw new BadRequestError(`User ${username} has already rated space ${spaceTitle}`);


    await db.query(
          `INSERT INTO ratings
           (user_id,
            space_id,
            rating)
           VALUES ($1, $2, $3)
           RETURNING rating`,
        [
          userId,
          spaceId,
          rating
        ],
    );

    const ratedSpace = await db.query(
        `SELECT 
            spaces.title,
            spaces.description,
            users.username,
            ratings.rating,
            ratings.rating_id
         FROM spaces
         JOIN ratings ON spaces.space_id = ratings.space_id
         JOIN users ON users.user_id = ratings.user_id
         WHERE spaces.space_id = $1`,
        [spaceId]
    );
  return ratedSpace.rows[0];

  }


  /** Get a single rating by a user for a space.
   *
   * Returns [rating]
   **/

  static async getRating(username, title) {
    const ratingData = await db.query(
      `SELECT ratings.rating_id, ratings.rating, users.username, spaces.title
      FROM ratings
      JOIN users ON ratings.user_id = users.user_id
      JOIN spaces ON ratings.space_id = spaces.space_id
      WHERE users.username = $1 AND spaces.title = $2`,
        [username, title]
    );
        
    if (!ratingData.rows[0]) {
      throw new NotFoundError(`Rating not found!`);
    }
    return ratingData.rows[0];
  }

  /** Gets rating by ID */
  static async getRatingById(ratingId) {
    const ratingData = await db.query(
      `SELECT ratings.rating, users.username, spaces.title
       FROM ratings
       JOIN users ON ratings.user_id = users.user_id
       JOIN spaces ON ratings.space_id = spaces.space_id
       WHERE ratings.rating_id = $1`,
      [ratingId]
    );
  
    if (!ratingData.rows[0]) {
      throw new NotFoundError(`Rating not found!`);
    }
    return ratingData.rows[0];
  }

  /** Find average rating for a space.
   * Throws NotFoundError if space not found
   *
   * Returns [{ space, {averageRating} }, ...]
   **/

  static async getAvgSpaceRating(title) {
    const query = `
      SELECT
        s.title,
        AVG(r.rating) AS avg_rating
      FROM
        spaces s
      LEFT JOIN
        ratings r ON s.space_id = r.space_id
      WHERE
        s.title = $1
      GROUP BY
        s.title`;

    const spaceRes = await db.query(query, [title]);
    const space = spaceRes.rows[0];

    if (!space) {
      throw new NotFoundError(`No such space: ${title}`);
    }

    const avgRating = parseFloat(space.avg_rating);

    return {
      rating: !isNaN(avgRating) ? avgRating.toFixed(2) : "Not yet rated",
    };
  }



  // static async sortByAvgRating(sortOrder = 'ASC'){
  //   const query = `
  //   SELECT 
  //   s.title,
  //   AVG(r.rating) AS avg_rating
  //   FROM 
  //   spaces s
  //   JOIN
  //   ratings r ON s.space_id = r.space_id
  //   GROUP BY s.title
  //   ORDER BY avg_rating ${sortOrder}`;

  //   const spacesRes = await db.query(query);
  //   return spacesRes.rows;
  // }

  /** Update rating data with `data`.
   *
   *
   * Data can include:
   *   { rating }
   *
   * Returns { title, description, username, newRating }
   *
   * Throws NotFoundError if not found - prevents other uses from editing a rating that is not their own.
   *
   */

  static async updateRating(rating_id, user, updatedRating) {
    const user_id = await db.query(
      `SELECT user_id
       FROM ratings
       WHERE rating_id = $1`,
      [rating_id]
    );

    if (!user_id.rows[0]) {
      throw new NotFoundError(`Rating with ID ${rating_id} not found.`);
    }
      
    if (!(user_id.rows[0].user_id === user.userId)) {
      throw new UnauthorizedError("Unauthorized to update this rating.");
    }
    const updatedRatedSpace = await db.query(
      `UPDATE ratings
      SET rating = $1
      WHERE rating_id = $2
      RETURNING 
      ratings.rating,
        (SELECT title FROM spaces WHERE space_id = ratings.space_id) AS title,
        (SELECT description FROM spaces WHERE space_id = ratings.space_id) AS description,
        (SELECT username FROM users WHERE user_id = ratings.user_id) AS username;`,
      [updatedRating, rating_id]
    );
  
    return updatedRatedSpace.rows[0];
  }

  /** Delete given rating from database;. 
   * Authorization: either logged-in-user who created the rating or Admin
   * Throws NotFoundError if not found.
   * Throws UnauthorizedError if not the user who gave original rating.
  */
  static async delete(ratingId, userId, isAdmin) {
    const result = await db.query(
      `SELECT r.rating_id, 
        u.user_id
       FROM ratings r
       JOIN users u ON r.user_id = u.user_id
       WHERE r.rating_id = $1`,
      [ratingId]
    );
    const rating = result.rows[0];
    if (!rating) throw new NotFoundError(`Rating not found`);
    const ratingUserId = rating.user_id;
    if(ratingUserId !== userId && !isAdmin){
      throw new UnauthorizedError("Unauthorized to delete this rating.")
    }
    await db.query(
      `DELETE FROM ratings
       WHERE rating_id = $1
       RETURNING rating`,
    [ratingId],
    );
    return `Rating successfully deleted.`;
  }
}


module.exports = Rating;
