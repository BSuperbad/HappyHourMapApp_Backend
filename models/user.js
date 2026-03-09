"use strict";

const db = require("../db.js");
const bcrypt = require("bcrypt");
const { partialUpdate } = require("../helpers/partialUpdate.js");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError.js");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {
  /** Authenticate user with username, password.
   *
   * Returns { user_id, username, firstName, lastName, email, isAdmin }
   *
   * Throws UnauthorizedError if user not found or wrong password.
   */

  static async authenticate(username, password) {
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
      [username]
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
   */

  static async register({ username, password, firstName, lastName, email, isAdmin }) {
    const duplicateCheck = await db.query(
      `SELECT username FROM users WHERE username = $1`,
      [username]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users
         (username, password, first_name, last_name, email, is_admin)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING username, first_name AS "firstName", last_name AS "lastName", email, is_admin AS "isAdmin"`,
      [username, hashedPassword, firstName, lastName, email, isAdmin]
    );

    return result.rows[0];
  }

  /** Find all users.
   *
   * Returns [{ user_id, username, firstName, lastName, email, isAdmin }, ...]
   */

  static async findAll() {
    const result = await db.query(
      `SELECT user_id,
              username,
              first_name AS "firstName",
              last_name AS "lastName",
              email,
              is_admin AS "isAdmin"
       FROM users
       ORDER BY username`
    );

    return result.rows;
  }

  /** Given a username, return data about user.
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws NotFoundError if user not found.
   */

  static async get(username, currentUsername, isAdmin) {
    if (!(username === currentUsername || isAdmin)) {
      throw new UnauthorizedError('Must be admin or logged-in user to access.');
    }

    const userRes = await db.query(
      `SELECT username,
              first_name AS "firstName",
              last_name AS "lastName",
              email,
              is_admin AS "isAdmin"
       FROM users
       WHERE username = $1`,
      [username]
    );

    const user = userRes.rows[0];
    if (!user) throw new NotFoundError(`No user: ${username}`);
    return user;
  }

  /** Update user data with `data`.
   *
   * Data can include: { username, firstName, lastName, password, email, isAdmin }
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws NotFoundError if not found.
   */

  static async update(username, loggedInUser, data) {
    if (!(username === loggedInUser.username || loggedInUser.isAdmin)) {
      throw new UnauthorizedError('Must be admin or logged-in user to access.');
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

    const querySql = `
      UPDATE users
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

  /** Delete given user from database. */

  static async remove(username, loggedInUser) {
    if (!(username === loggedInUser.username || loggedInUser.isAdmin)) {
      throw new UnauthorizedError('Must be admin or logged-in user to access.');
    }

    const result = await db.query(
      `DELETE FROM users WHERE username = $1 RETURNING username`,
      [username]
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
    return user;
  }

  /** Like a space: adds user_id and space_id to likes table.
   *
   * Authorization: logged-in user only (cannot like for another user).
   *
   * Returns the liked space { title, description, image_url, address, est_year }.
   * Throws NotFoundError if username or space not found.
   * Throws BadRequestError if already liked.
   */

  static async likeSpace(username, spaceTitle, loggedInUser) {
    if (username !== loggedInUser) {
      throw new UnauthorizedError(`Cannot 'like' a space for another user`);
    }

    // Resolve user and space in one round-trip
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

    const duplicateCheck = await db.query(
      `SELECT 1 FROM likes WHERE user_id = $1 AND space_id = $2`,
      [user_id, space_id]
    );
    if (duplicateCheck.rows[0]) throw new BadRequestError(`Cannot like a space more than once.`);

    await db.query(
      `INSERT INTO likes (user_id, space_id) VALUES ($1, $2)`,
      [user_id, space_id]
    );

    const likedSpace = await db.query(
      `SELECT title, description, image_url, address, est_year
       FROM spaces WHERE space_id = $1`,
      [space_id]
    );
    return likedSpace.rows[0];
  }

  /** Unlike a space: removes the like from the likes table.
   *
   * Authorization: logged-in user only.
   */

  static async unlikeSpace(username, spaceTitle, loggedInUser) {
    if (username !== loggedInUser.username) {
      throw new UnauthorizedError(`Cannot 'unlike' a space for another user`);
    }

    await db.query(
      `DELETE FROM likes
       USING users u, spaces s
       WHERE likes.user_id = u.user_id
         AND likes.space_id = s.space_id
         AND u.username = $1
         AND s.title = $2`,
      [username, spaceTitle]
    );
  }

  /** Retrieve all spaces the user has liked.
   *
   * Returns [{ title, description, image_url, address, est_year, cat_type, city, neighborhood }, ...]
   * Throws NotFoundError if username not found.
   */

  static async getUserLikedSpaces(username) {
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
       JOIN users u ON u.user_id = l.user_id
       JOIN categories c ON s.category_id = c.cat_id
       JOIN locations loc ON s.location_id = loc.loc_id
       WHERE u.username = $1`,
      [username]
    );

    if (likedSpaces.rows.length === 0) {
      const userCheck = await db.query(`SELECT user_id FROM users WHERE username = $1`, [username]);
      if (!userCheck.rows[0]) throw new NotFoundError(`No such user: ${username}`);
    }

    return likedSpaces.rows;
  }

  /** Mark a space as visited.
   *
   * Authorization: logged-in user only.
   *
   * Returns the visited space record.
   * Throws NotFoundError if username or space not found.
   * Throws BadRequestError if already visited.
   */

  static async markAsVisited(username, spaceTitle, loggedInUser) {
    if (username !== loggedInUser) {
      throw new UnauthorizedError(`Cannot mark a space as 'visited' for another user`);
    }

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

    const duplicateCheck = await db.query(
      `SELECT 1 FROM visits WHERE user_id = $1 AND space_id = $2`,
      [user_id, space_id]
    );
    if (duplicateCheck.rows[0]) throw new BadRequestError(`Already marked as visited.`);

    await db.query(
      `INSERT INTO visits (user_id, space_id, visit_date) VALUES ($1, $2, CURRENT_DATE)`,
      [user_id, space_id]
    );

    const visitedSpace = await db.query(
      `SELECT
         s.title,
         s.description,
         s.image_url,
         s.category_id,
         s.address,
         s.est_year,
         v.visit_date
       FROM spaces s
       JOIN visits v ON s.space_id = v.space_id
       WHERE s.space_id = $1 AND v.user_id = $2`,
      [space_id, user_id]
    );
    return visitedSpace.rows[0];
  }

  /** Get all spaces visited by a user.
   *
   * Returns [{ title, description, image_url, address, est_year, visit_date, cat_type, city, neighborhood }, ...]
   * Throws NotFoundError if username not found.
   */

  static async getVisits(username) {
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
       JOIN users u ON u.user_id = v.user_id
       JOIN categories c ON s.category_id = c.cat_id
       JOIN locations l ON s.location_id = l.loc_id
       WHERE u.username = $1`,
      [username]
    );

    if (visitedSpaces.rows.length === 0) {
      const userCheck = await db.query(`SELECT user_id FROM users WHERE username = $1`, [username]);
      if (!userCheck.rows[0]) throw new NotFoundError(`No such user: ${username}`);
    }

    return visitedSpaces.rows;
  }
}


module.exports = User;
