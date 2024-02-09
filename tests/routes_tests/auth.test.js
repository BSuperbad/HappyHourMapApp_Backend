"use strict";

const request = require("supertest");

const app = require("../../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testUserIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /auth/login */

describe("POST /auth/login", function () {
  it("works", async function () {
    const resp = await request(app)
        .post("/auth/login")
        .send({
          username: "user1",
          password: "password1",
        });
    expect(resp.body).toEqual({
        "token" : expect.any(String),
        "user":  {
             "email": "user1@email.com",
            "firstName": "User1F",
            "isAdmin": false,
            "lastName": "User1L",
            "user_id": testUserIds[0],
            "username": "user1"
        }
    });
  });

  it("should throw unauth with non-existent user", async function () {
    const resp = await request(app)
        .post("/auth/login")
        .send({
          username: "no-such-user",
          password: "password1",
        });
    expect(resp.statusCode).toEqual(401);
  });

  it("should throw unauth with wrong password", async function () {
    const resp = await request(app)
        .post("/auth/login")
        .send({
          username: "user1",
          password: "nope",
        });
    expect(resp.statusCode).toEqual(401);
  });

  it("should throw bad request with missing data", async function () {
    const resp = await request(app)
        .post("/auth/login")
        .send({
          username: "user1",
        });
    expect(resp.statusCode).toEqual(500);
  });

  it("should throw bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/auth/login")
        .send({
          username: 42,
          password: "above-is-a-number",
        });
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** POST /auth/register */

describe("POST /auth/register", function () {
  it("works for anon", async function () {
    const resp = await request(app)
        .post("/auth/register")
        .send({
          username: "new",
          firstName: "first",
          lastName: "last",
          password: "password",
          email: "new@email.com",
        });
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      "token": expect.any(String),
      "newUser": {
        "email": "new@email.com",
        "firstName": "first",
        "isAdmin": false,
        "lastName": "last",
        "username": "new",
    },
    });
  });
  it('should return a 400 error if the username is already taken', async () => {

    const newUser = {
      username: 'user1',
      password: 'testpassword',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com'
    };

    const response = await request(app)
      .post('/auth/register')
      .send(newUser);

    expect(response.status).toBe(400);
    expect(response.body.error).toStrictEqual({ message: 'Duplicate username: user1', status: 400 });
  });

  it("should return error with missing fields", async function () {
    const resp = await request(app)
        .post("/auth/register")
        .send({
          username: "new",
        });
    expect(resp.statusCode).toEqual(500);
  });

  it("should return error with invalid data", async function () {
    const resp = await request(app)
        .post("/auth/register")
        .send({
          username: "new",
          firstName: "first",
          lastName: "last",
          password: "password",
          email: "not-an-email",
        });
    expect(resp.statusCode).toEqual(500);
  });
});
