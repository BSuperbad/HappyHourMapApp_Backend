"use strict";

const db = require("../db.js");
const bcrypt = require("bcrypt");
const { partialUpdate } = require("../helpers/partialUpdate.js")
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError.js");

const { BCRYPT_WORK_FACTOR } = require("../config.js");
const { isAdmin } = require("../middleware/auth.js");

/** Related functions for users. */

class User {
  /** authenticate user with username, password.
   *
   * Returns { username, first_name, last_name, email, is_admin }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

  static async authenticate(username, password) {
    // try to find the user first
    const result = await db.query(
          `SELECT user_id,
                  username,
                  password,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin"
           FROM users
           WHERE username = $1`,
        [username],
    );

    const user = result.rows[0];

    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register(
      { username, password, firstName, lastName, email, isAdmin }) {
    const duplicateCheck = await db.query(
          `SELECT username
           FROM users
           WHERE username = $1`,
        [username],
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
          `INSERT INTO users
           (username,
            password,
            first_name,
            last_name,
            email,
            is_admin)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING username, first_name AS "firstName", last_name AS "lastName", email, is_admin AS "isAdmin"`,
        [
          username,
          hashedPassword,
          firstName,
          lastName,
          email,
          isAdmin
        ],
    );

    const user = result.rows[0];

    return user;
  }

  /** Find all users.
   *
   * Returns [users: { username, first_name, last_name, email, is_admin }, ...]
   **/

  static async findAll() {
    const result = await db.query(
          `SELECT user_id,
                  username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin"
           FROM users
           ORDER BY username`,
    );

    return result.rows;
  }

  /** Given a username, return data about user.
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(username, currentUsername, isAdmin) {
    if(!(username === currentUsername || isAdmin)){
      throw new UnauthorizedError('Must be admin or logged-in user to access.')
    } 
    const userRes = await db.query(
          `SELECT username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin"
           FROM users
           WHERE username = $1`,
        [username],
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    return user;
  }

  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { username, firstName, lastName, password, email, isAdmin }
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws NotFoundError if not found.
   *
   */

  static async update(username, loggedInUser, data) {
    if(!(username === loggedInUser.username || loggedInUser.isAdmin)){
      throw new UnauthorizedError('Must be admin or logged-in user to access.')
    }
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }
    const { setCols, values } = partialUpdate(data, {
      firstName: "first_name",
      lastName: "last_name",
      isAdmin: "is_admin",
    });   
    const usernameVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE username = ${usernameVarIdx}
                      RETURNING username,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                email,
                                is_admin AS "isAdmin"`;
    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    delete user.password;
    return user;
  }

  /** Delete given user from database; returns undefined. */

  static async remove(username, loggedInUser) {
    if(!(username === loggedInUser.username || loggedInUser.isAdmin)){
      throw new UnauthorizedError('Must be admin or logged-in user to access.')
    }
    let result = await db.query(
          `DELETE
           FROM users
           WHERE username = $1
           RETURNING username`,
        [username],
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
    return user;
  }

  /** Like a space: adds user_id  and space_id to like table in db,
   *  returns the liked space.
   *
   * Authorization: either logged-in-user or admin
   * 
   * Returns NotFoundErrors if username or title are not found.
   **/

  static async likeSpace(username, spaceTitle, loggedInUser) {
    if(username !== loggedInUser){
      throw new UnauthorizedError(`Cannot 'like' a space for another user`)
    }
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

    const duplicateCheck = await db.query(
        `SELECT user_id, space_id
         FROM likes
         WHERE user_id = $1 AND space_id = $2`,
        [userId, spaceId],
    );

    if (duplicateCheck.rows[0]) {
        throw new BadRequestError(`Cannot like a space more than once.`);
    };

    await db.query(
        `INSERT INTO likes (user_id, space_id)
         VALUES ($1, $2)`,
        [userId, spaceId]);

    const likedSpace = await db.query(
          `SELECT 
              title,
              description,
              image_url,
              address,
              est_year
           FROM spaces
           WHERE space_id = $1`,
          [spaceId]
      );
    return likedSpace.rows[0]
}

  /** Unlike (delete a like) a space: 
   *
   * Authorization: logged-in-user 
   * 
   * Returns NotFoundErrors if username or title are not found.
   **/
static async unlikeSpace(username, spaceTitle, loggedInUser) {
  if (username !== loggedInUser.username) {
    throw new UnauthorizedError(`Cannot 'unlike' a space for another user`);
  }

  const user = await db.query(
    `SELECT user_id FROM users WHERE username = $1`,
    [username]
  );
  if (!user.rows[0]) throw new NotFoundError(`No such user: ${username}`);

  const space = await db.query(
    `SELECT space_id FROM spaces WHERE title = $1`,
    [spaceTitle]
  );
  if (!space.rows[0]) throw new NotFoundError(`No such space: ${spaceTitle}`);

  const userId = user.rows[0].user_id;
  const spaceId = space.rows[0].space_id;

  await db.query(
    `DELETE FROM likes WHERE user_id = $1 AND space_id = $2`,
    [userId, spaceId]
  );
}

  /** Retrieves a list of spaces the user has "liked"
   *
   * Authorization: either logged-in-user
   * 
   * Returns NotFoundErrors if username is not found.
   **/


static async getUserLikedSpaces(username) {
  const user = await db.query(
    `SELECT user_id FROM users WHERE username = $1`,
    [username]
  );

  if (!user.rows[0]) throw new NotFoundError(`No such user: ${username}`);

  const userId = user.rows[0].user_id;

  const likedSpaces = await db.query(
    `SELECT
    s.title,
    s.description,
    s.image_url,
    s.address,
    s.est_year,
    c.cat_type,
    loc.city,
    loc.neighborhood
FROM spaces s
JOIN likes l ON s.space_id = l.space_id
JOIN categories c ON s.category_id = c.cat_id
JOIN locations loc ON s.location_id = loc.loc_id
WHERE l.user_id = $1`,
    [userId]
  );

  

  return likedSpaces.rows;
}

/** Mark a space as visited: adds user_id  and space_id to like table in db,
   *  returns the visited space.
   *
   * Authorization: either logged-in-user or admin
   * 
   * Returns NotFoundErrors if username or title are not found.
   **/

  static async markAsVisited(username, spaceTitle, loggedInUser) {
    if(username !== loggedInUser){
      throw new UnauthorizedError(`Cannot mark a space as 'visited' for another user`)
    }
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

    const duplicateCheck = await db.query(
        `SELECT user_id, space_id
         FROM visits
         WHERE user_id = $1 AND space_id = $2`,
        [userId, spaceId],
    );

    if (duplicateCheck.rows[0]) {
        throw new BadRequestError(`Already marked as visted.`);
    }

    await db.query(
        `INSERT INTO visits (user_id, space_id, visit_date)
         VALUES ($1, $2, CURRENT_DATE)`,
        [userId, spaceId]);

    const visitedSpace = await db.query(
          `SELECT 
              title,
              description,
              image_url,
              category_id,
              address,
              est_year,
              visit_date
           FROM spaces
           JOIN visits ON spaces.space_id = visits.space_id
           WHERE spaces.space_id = $1`,
          [spaceId]
      );
    return visitedSpace.rows[0];
}

static async getVisits(username) {
  const user = await db.query(
    `SELECT user_id FROM users WHERE username = $1`,
    [username]
  );

  if (!user.rows[0]) throw new NotFoundError(`No such user: ${username}`);

  const userId = user.rows[0].user_id;

  const visitedSpaces = await db.query(
    `SELECT
        s.title,
        s.description,
        s.image_url,
        s.address,
        s.est_year,
        v.visit_date,
        c.cat_type,
        l.city,
        l.neighborhood
     FROM spaces s
     JOIN visits v ON s.space_id = v.space_id
     JOIN categories c ON s.category_id = c.cat_id
     JOIN locations l ON s.location_id = l.loc_id
     WHERE v.user_id = $1`,
    [userId]
  );

  return visitedSpaces.rows;
}
}


module.exports = User;
