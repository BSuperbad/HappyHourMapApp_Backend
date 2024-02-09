"use strict";

const db = require("../../db");
const Category = require("../../models/category");
const Comment = require("../../models/comment");
const Location = require("../../models/location");
const Rating = require("../../models/rating");
const Space = require("../../models/space");
const User = require("../../models/user");
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require("../../config")

const testSpaceIds = [];
const testUserIds=[];
const testLocIds = [];
const testCatIds = [];

let category1,
 category2;

async function commonBeforeAll() {
    await db.query("DELETE FROM visits");
    await db.query("DELETE FROM comments");
    await db.query("DELETE FROM ratings");
    await db.query("DELETE FROM spaces");
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM categories");
    await db.query("DELETE FROM locations");
  
    // Create categories
    category1 = await Category.create({ cat_type: "Category1" });
    category2 = await Category.create({ cat_type: "Category2" });
    const categories = await db.query("SELECT cat_id FROM categories");
    testCatIds.push(...categories.rows.map(r=>r.cat_id));
  
    // Create locations
    const location1 = await Location.create({ city: "City1", neighborhood: "Neighborhood1" });
    const location2 = await Location.create({ city: "City2", neighborhood: "Neighborhood2" });
    const locations = await db.query("SELECT loc_id FROM locations");
    testLocIds.push(...locations.rows.map(r=>r.loc_id))
  
    await Space.create({
      title: "Space1",
      description: "Description1",
      image_url: "http://image1.img",
      address: "1234 Fake Address, City1, USA",
      category_id: category1.cat_id,
      location_id: location1.loc_id,
      est_year: 2022
    });
    await Space.create({
      title: "Space2",
      description: "Description2",
      image_url: "http://image2.img",
      address: "568 Fake Street, City 2, USA",
      category_id: category2.cat_id,
      location_id: location2.loc_id,
      est_year: 2023
    });
  
    // Create users and apply to a space
    await User.register({
      username: "user1",
      firstName: "User1F",
      lastName: "User1L",
      email: "user1@email.com",
      password: "password1",
      isAdmin: false
    });
    await User.register({
      username: "user2",
      firstName: "User2F",
      lastName: "User2L",
      email: "user2@email.com",
      password: "password2",
      isAdmin: true
    });
  
    // Populate testSpaceIds
    const spaces = await db.query("SELECT space_id FROM spaces");
    testSpaceIds.push(...spaces.rows.map(row => row.space_id));
    const users = await db.query("SELECT user_id FROM users");
    testUserIds.push(...users.rows.map(r=>r.user_id))

    
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
  


  const u1Token = jwt.sign({ username: "user1", isAdmin: false }, SECRET_KEY);
  const adminToken = jwt.sign({ username: "user2", isAdmin: true }, SECRET_KEY);
  
  module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testSpaceIds,
    testUserIds,
    u1Token,
    adminToken,
    testLocIds,
    testCatIds,
    category1,
    category2
  };;
