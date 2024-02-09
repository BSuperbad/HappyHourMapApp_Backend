"use strict";

const db = require("../db.js");
const {
  NotFoundError,
  UnauthorizedError,
} = require("../expressError.js");

/** Related functions for comments. */

class Comment {
  /** Lets a user add a comment to a space.
   * Authorization: must be logged-in
   *
   * Returns { title, description, comment, comment_date, username  }
   *
   * Throws NotFoundErrors if username/ title are not found.
   **/

  static async addComment({ username, spaceTitle, comment }) {
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

    await db.query(
          `INSERT INTO comments
           (user_id,
            space_id,
            comment,
            comment_date)
           VALUES ($1, $2, $3, CURRENT_DATE)
           RETURNING comment, comment_date`,
        [
          userId,
          spaceId,
          comment
        ],
    );

    const commentedSpace = await db.query(
        `SELECT 
            spaces.title,
            spaces.description,
            comments.comment,
            comments.comment_date,
            comments.comment_id,
            users.username 
         FROM spaces
         JOIN comments ON spaces.space_id = comments.space_id
         JOIN users ON users.user_id = comments.user_id
         WHERE spaces.space_id = $1`,
        [spaceId]
    );
  return commentedSpace.rows[0];

  }

  /** Find all comments for a space.
   *
   * Returns [{ space, {comments} }, ...]
   **/

  static async getAllForSpace(title) {
    const space = await db.query(
        `SELECT space_id, title FROM spaces WHERE title = $1`,
        [title]
      );
    if(!space.rows[0]) throw new NotFoundError(`No such space: ${title}`);
    const spaceId = space.rows[0].space_id;
    const spaceTitle = space.rows[0].title;

    const spaceComments = await db.query(
        `SELECT 
            users.username,
            comments.comment_id,
            comments.comment,
            comments.comment_date
         FROM comments
         JOIN users ON users.user_id = comments.user_id
         WHERE space_id = $1
         ORDER BY comment_date`,
        [spaceId]
    );
    return {
        title:spaceTitle, 
        comments: spaceComments.rows
    };
  }

    /** Find all comments for a user.
   *
   * Returns [{ user, {space, comments} }, ...]
   **/

  static async getAllForUser(username) {
    const user = await db.query(
        `SELECT user_id, username FROM users WHERE username = $1`,
        [username]
      );
    if(!user.rows[0]) throw new NotFoundError(`No such user: ${username}`);
    const userId = user.rows[0].user_id;
    const userComments = await db.query(
        `SELECT 
            comments.comment_id,
            spaces.title,
            comments.comment,
            comments.comment_date
        FROM comments
        JOIN spaces ON spaces.space_id = comments.space_id
        WHERE comments.user_id = $1
        ORDER BY spaces.title ASC, comments.comment_date DESC`,
        [userId]
    );
    return {
        user:user.rows[0].username, 
        comments: userComments.rows
    };
  }

      /** Get a single comment by a user for a space.
   *
   * Returns [comment }, ...]
   **/

      static async getComment(comment_id) {
        const commentData = await db.query(
          `SELECT comments.comment_id, comments.comment, comments.comment_date, users.username, spaces.title
           FROM comments
           JOIN users ON comments.user_id = users.user_id
           JOIN spaces ON comments.space_id = spaces.space_id
           WHERE comments.comment_id = $1`,
          [comment_id]
        );
      
        if (!commentData.rows[0]) {
          throw new NotFoundError(`Comment not found!`);
        }
      
        return commentData.rows[0];
      }

  /** Update comment data with `data`.
   *
   * Data includes:
   * { updatedComment, updatedComment_date (automatically updated) }
   *
   * Returns { title, description, uodatedComment, updatedComment_date, username }
   *
   * Throws NotFoundError if not found - prevents other uses from editing a comment that is not their own.
   * If comment inappropriate, admin can delete it with deletion route.
   *
   */

  static async updateComment(comment_id, user, updatedComment) {
    const commentRes = await db.query(
      `SELECT user_id
       FROM comments
       WHERE comment_id = $1`,
      [comment_id]
    );
  
    if (!commentRes.rows[0]) {
      throw new NotFoundError(`No such comment`);
    }
  
    const commentUserId = commentRes.rows[0].user_id;

  
    // Check if the user is authorized to update the comment
    if (commentUserId !== user.userId) {
      throw new UnauthorizedError("Unauthorized to update this comment.");
    }
    const updatedCommentedSpace = await db.query(
      `UPDATE comments
      SET comment = $1
      WHERE comment_id = $2
      RETURNING 
        (SELECT title FROM spaces WHERE space_id = comments.space_id) AS title,
        (SELECT description FROM spaces WHERE space_id = comments.space_id) AS description,
        comments.comment,
        comments.comment_date,
        (SELECT username FROM users WHERE user_id = comments.user_id) AS username;`,
      [updatedComment, comment_id]
    );
  
    return updatedCommentedSpace.rows[0];
  }

  /** Delete given comment from database;. 
   * Authorization: either logged-in-user who created the comment or Admin
  */


  static async delete(commentId, userId, isAdmin) {
    const result = await db.query(
      `SELECT c.comment_id, 
      u.user_id
       FROM comments c
       JOIN users u ON c.user_id = u.user_id
       WHERE c.comment_id = $1`,
      [commentId]
    );
    if(!result.rows[0]) throw new NotFoundError(`Comment not found`);
    const commentUserId = result.rows[0].user_id;
    console.log(commentUserId)
    console.log(userId)
    if(!(commentUserId === userId || isAdmin)){
      throw new UnauthorizedError("Unauthorized to delete this comment.");
    }

    await db.query(
          `DELETE FROM comments
           WHERE comment_id = $1
           RETURNING comment`,
        [commentId],
    );

    return `Comment successfully deleted.`;
  }
  
}


module.exports = Comment;
