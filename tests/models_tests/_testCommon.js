const bcrypt = require("bcrypt");
const db = require("../../db.js");
const { BCRYPT_WORK_FACTOR } = require("../../config.js");

const testSpaceIds = [];
const testUserIds = [];
const testCommentIds = [];
const testLocationIds = [];
const testCategoryIds=[];

async function commonBeforeAll() {
  // Clean up the database
  await db.query("DELETE FROM likes");
  await db.query("DELETE FROM ratings");
  await db.query("DELETE FROM visits");
  await db.query("DELETE FROM comments");
  await db.query("DELETE FROM spaces");
  await db.query("DELETE FROM users");
  await db.query("DELETE FROM locations");
  await db.query("DELETE FROM categories");

  // Insert sample data
  const resultsCategories = await db.query(`
    INSERT INTO categories (cat_type)
    VALUES ('Category1'), ('Category2'), ('Category3')
    RETURNING cat_id`);
  testCategoryIds.splice(0,0, ...resultsCategories.rows.map(r=>r.cat_id));

  const resultsLocations = await db.query(`
    INSERT INTO locations (city, neighborhood)
    VALUES ('City1', 'Neighborhood1'), ('City2', 'Neighborhood2'), ('City3', 'Neighborhood3')
    RETURNING loc_id`);
  testLocationIds.splice(0,0, ...resultsLocations.rows.map(r=>r.loc_id));

  const resultsSpaces = await db.query(`
    INSERT INTO spaces (title, description, image_url, category_id, address, location_id, est_year)
    VALUES 
      ('Space1', 'Description1', 'http://image1.img', $1, 'Address1', $2, 2022),
      ('Space2', 'Description2', 'http://image2.img', $3, 'Address2', $4, 2023)
    RETURNING space_id`, [testCategoryIds[0], testLocationIds[0], testCategoryIds[1], testLocationIds[1]]);
  testSpaceIds.splice(0, 0, ...resultsSpaces.rows.map(r => r.space_id));

  const resultsUsers = await db.query(`
    INSERT INTO users (username, password, first_name, last_name, email, is_admin)
    VALUES 
      ('user1', $1, 'User1F', 'User1L', 'user1@email.com', FALSE),
      ('user2', $2, 'User2F', 'User2L', 'user2@email.com', TRUE)
    RETURNING user_id`, [
    await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
    await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
  ]);
  testUserIds.splice(0, 0, ...resultsUsers.rows.map(r => r.user_id));

const resultsComments = await db.query(`
  INSERT INTO comments (user_id, space_id, comment, comment_date)
  VALUES ($1, $2, 'Test comment 1', CURRENT_DATE),
        ($1, $2, 'Test comment same space 2', CURRENT_DATE),
        ($3, $4, 'Test comment 2', CURRENT_DATE)
        RETURNING comment_id`,
  [testUserIds[0], testSpaceIds[0], testUserIds[1], testSpaceIds[1]]
);
testCommentIds.splice(0,0, ...resultsComments.rows.map(r=>r.comment_id));
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testSpaceIds,
  testUserIds,
  testCommentIds,
  testLocationIds,
  testCategoryIds
};
