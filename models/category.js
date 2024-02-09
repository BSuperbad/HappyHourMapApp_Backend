"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError.js");

/** Related functions for locations. */

class Category {
  /** Create a category (from data), update db, return new location data.
   *
   * data should be { cat_type }
   *
   * Returns { cat_id, cat_type }
   *
   * Throws BadRequestError if category is already in database.
   * */

  static async create({ cat_type }) {
    // in case the string is more than one word:
    const words = cat_type.split(' ');
    const cappedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    const cappedType = cappedWords.join(' ')
    const duplicateCheck = await db.query(
          `SELECT cat_type
           FROM categories
           WHERE cat_type = $1`,
        [cappedType]);

    if (duplicateCheck.rows[0]) {
      const error =  new BadRequestError(`${cappedType} already exists.`);
      error.status = 409;
      throw error;
    }

    const result = await db.query(
          `INSERT INTO categories
           (cat_type)
           VALUES ($1)
           RETURNING cat_id, cat_type`,
        [
          cappedType
        ],
    );
    const category = result.rows[0];

    return category;
  }

  /** Find all categories
   *
   * Returns {categories: [{ cat_id, cat_type }, ...]
   * */

  static async findAll() {
    const catRes = await db.query(
        `SELECT cat_id,
        cat_type
        FROM categories
        ORDER BY cat_id`,
    );

    return catRes.rows;
  }

  /** Given a category type, return spaces about that type.
   *
   *  Returns [{ cat_id, cat_type, spaces: []  }, ...]
   *
   * Throws NotFoundError if not found.
   **/


  static async get(cat_type) {
    const catRes = await db.query(
        `SELECT
            cat_id,
            cat_type
         FROM categories
         WHERE cat_type = $1`,
        [cat_type]);
    const category = catRes.rows[0];
    if (!category) throw new NotFoundError(`Cannot find category: ${cat_type}`);
    const spacesRes = await db.query(
        `SELECT 
            title,
            space_id,
            description,
            address,
            est_year
         FROM spaces
         WHERE category_id = $1
         ORDER BY title`,
        [category.cat_id]
    );
    category.spaces = spacesRes.rows.map(space => space);
    return  category;
}



  /** Update category data with `cat_type`.
   *
   * Data can include: {cat_type}
   *
   * Returns {(updated_cat_type}
   *
   * Throws NotFoundError if not found.
   */

  static async updateCat(cat_type, data) {
    const categoryQuery = await db.query(
        'SELECT cat_id, cat_type FROM categories WHERE cat_type = $1',
        [cat_type]
      );
    if(!categoryQuery.rows[0]) throw new NotFoundError(`No such category: ${cat_type}`);
    const originalCat = categoryQuery.rows[0].cat_type;
    const newCat = data.cat_type;
    const words = newCat.split(' ');
    const cappedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    const cappedNewType = cappedWords.join(' ');
    
    const duplicateCheck = await db.query(
        `SELECT cat_type
         FROM categories
         WHERE cat_type = $1`,
        [cappedNewType]
      );

      if (duplicateCheck.rows[0]) {
        const error =  new BadRequestError(`${cappedNewType} already exists.`);
        error.status = 409;
        throw error;
      }

    

    await db.query(
          `UPDATE categories
           SET cat_type = $1
           WHERE cat_type = $2
           RETURNING cat_type`,
        [cappedNewType, originalCat]);
        return `Category successfully updated to ${cappedNewType}.`;
  }

  /** Delete given neighborhood from database; returns undefined.
   * Throws error if neighborhood is associated with existing space.
   *
   * Throws NotFoundError if neighborhood not found.
   **/

  static async deleteCat(cat_type) {
    const categoryQuery = await db.query(
        'SELECT cat_id, cat_type FROM categories WHERE cat_type = $1',
        [cat_type]
      );
    if(!categoryQuery.rows[0]) throw new NotFoundError(`No such category: ${cat_type}`);
    const category = categoryQuery.rows[0];
    const catId = category.cat_id;
    const associatedSpaces = await db.query(
        'SELECT space_id FROM spaces WHERE category_id = $1',
        [catId]
      );
    if(associatedSpaces.rows.length > 0) {
        throw new Error('Cannot delete category with associated spaces!')
    }
    const catType = category.cat_type;
    try{
    const deletedCat = await db.query(
          `DELETE
           FROM categories
           WHERE cat_type = $1
           RETURNING cat_type`,
        [catType]);

        return `Category '${catType}' successfully deleted.`;
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}


module.exports = Category;
