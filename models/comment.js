"use strict";

const db = require("../db.js");
const {
  NotFoundError,
  UnauthorizedError,
} = require("../expressError.js");

/** Related functions for comments. */

class Comment {
  /** Add a comment to a space.
   * Authorization: must be logged-in.
   *
   * Returns { title, description, comment, comment_date, comment_id, username }
   *
   * Throws NotFoundError if username or space title not found.
   */

  static async addComment({ username, spaceTitle, comment }) {
    // Resolve user and space in one query, then insert and return in a CTE
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

    const result = await db.query(
      `WITH new_comment AS (
         INSERT INTO comments (user_id, space_id, comment, comment_date)
         VALUES ($1, $2, $3, CURRENT_DATE)
         RETURNING comment_id, space_id, user_id, comment, comment_date
       )
       SELECT
         sp.title,
         sp.description,
         nc.comment,
         nc.comment_date,
         nc.comment_id,
         u.username
       FROM new_comment nc
       JOIN spaces sp ON sp.space_id = nc.space_id
       JOIN users u ON u.user_id = nc.user_id`,
      [user_id, space_id, comment]
    );

    return result.rows[0];
  }

  /** Find all comments for a space.
   *
   * Returns { title, comments: [{ username, comment_id, comment, comment_date }, ...] }
   * Throws NotFoundError if space not found.
   */

  static async getAllForSpace(title) {
    const result = await db.query(
      `SELECT
         s.title,
         u.username,
         c.comment_id,
         c.comment,
         c.comment_date
       FROM spaces s
       LEFT JOIN comments c ON c.space_id = s.space_id
       LEFT JOIN users u ON u.user_id = c.user_id
       WHERE s.title = $1
       ORDER BY c.comment_date`,
      [title]
    );

    if (result.rows.length === 0) throw new NotFoundError(`No such space: ${title}`);

    const spaceTitle = result.rows[0].title;
    const comments = result.rows
      .filter(row => row.comment_id !== null)
      .map(({ username, comment_id, comment, comment_date }) => ({
        username, comment_id, comment, comment_date,
      }));

    return { title: spaceTitle, comments };
  }

  /** Find all comments by a user.
   *
   * Returns { user, comments: [{ comment_id, title, comment, comment_date }, ...] }
   * Throws NotFoundError if user not found.
   */

  static async getAllForUser(username) {
    const result = await db.query(
      `SELECT
         u.username,
         c.comment_id,
         s.title,
         c.comment,
         c.comment_date
       FROM users u
       LEFT JOIN comments c ON c.user_id = u.user_id
       LEFT JOIN spaces s ON s.space_id = c.space_id
       WHERE u.username = $1
       ORDER BY s.title ASC, c.comment_date DESC`,
      [username]
    );

    if (result.rows.length === 0) throw new NotFoundError(`No such user: ${username}`);

    const user = result.rows[0].username;
    const comments = result.rows
      .filter(row => row.comment_id !== null)
      .map(({ comment_id, title, comment, comment_date }) => ({
        comment_id, title, comment, comment_date,
      }));

    return { user, comments };
  }

  /** Get a single comment by ID.
   *
   * Returns { comment_id, comment, comment_date, username, title }
   * Throws NotFoundError if not found.
   */

  static async getComment(comment_id) {
    const commentData = await db.query(
      `SELECT c.comment_id, c.comment, c.comment_date, u.username, s.title
       FROM comments c
       JOIN users u ON c.user_id = u.user_id
       JOIN spaces s ON c.space_id = s.space_id
       WHERE c.comment_id = $1`,
      [comment_id]
    );

    if (!commentData.rows[0]) throw new NotFoundError(`Comment not found!`);
    return commentData.rows[0];
  }

  /** Update a comment.
   *
   * Returns { title, description, comment, comment_date, username }
   *
   * Throws NotFoundError if comment not found.
   * Throws UnauthorizedError if user does not own the comment.
   */

  static async updateComment(comment_id, user, updatedComment) {
    const commentRes = await db.query(
      `SELECT user_id FROM comments WHERE comment_id = $1`,
      [comment_id]
    );

    if (!commentRes.rows[0]) throw new NotFoundError(`No such comment`);

    if (commentRes.rows[0].user_id !== user.userId) {
      throw new UnauthorizedError("Unauthorized to update this comment.");
    }

    const result = await db.query(
      `UPDATE comments
       SET comment = $1
       WHERE comment_id = $2
       RETURNING
         (SELECT title FROM spaces WHERE space_id = comments.space_id) AS title,
         (SELECT description FROM spaces WHERE space_id = comments.space_id) AS description,
         comments.comment,
         comments.comment_date,
         (SELECT username FROM users WHERE user_id = comments.user_id) AS username`,
      [updatedComment, comment_id]
    );

    return result.rows[0];
  }

  /** Delete a comment.
   *
   * Authorization: logged-in user who created the comment, or admin.
   * Throws NotFoundError if comment not found.
   * Throws UnauthorizedError if not authorized.
   */

  static async delete(commentId, userId, isAdmin) {
    const result = await db.query(
      `SELECT c.comment_id, u.user_id
       FROM comments c
       JOIN users u ON c.user_id = u.user_id
       WHERE c.comment_id = $1`,
      [commentId]
    );

    if (!result.rows[0]) throw new NotFoundError(`Comment not found`);

    const commentUserId = result.rows[0].user_id;
    if (!(commentUserId === userId || isAdmin)) {
      throw new UnauthorizedError("Unauthorized to delete this comment.");
    }

    await db.query(`DELETE FROM comments WHERE comment_id = $1`, [commentId]);

    return `Comment successfully deleted.`;
  }
}


module.exports = Comment;
