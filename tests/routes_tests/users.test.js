const request = require('supertest');
const app = require('../../app');
const { 
    commonBeforeAll, 
    commonBeforeEach, 
    commonAfterEach, 
    commonAfterAll, 
    u1Token, 
    adminToken,
    testCatIds
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe('POST /users', () => {
  it('should create a new user as admin', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        username: 'newuser',
        password: 'password',
        firstName: 'New',
        lastName: 'User',
        email: 'newuser@example.com',
        isAdmin: false
      })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('token');
  });
  it('should throw BadRequestError if the username is already taken', async () => {

    const response = await request(app)
      .post('/users')
      .send({
        username: 'user1',
        password: 'password',
        firstName: 'New',
        lastName: 'User',
        email: 'newuser@example.com',
        isAdmin: false
      })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
    expect(response.body.error).toStrictEqual({ message: 'Duplicate username: user1', status: 400 });
  });
  it("should throw UnauthorizedError if non-admin", async()=>{
    const response = await request(app)
      .post('/users')
      .send({
        username: 'newuser',
        password: 'password',
        firstName: 'New',
        lastName: 'User',
        email: 'newuser@example.com',
        isAdmin: false
      })
      .set('Authorization', `Bearer ${u1Token}`);
    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({
        "error": {
            "message": "Unauthorized, must be an admin!",
            "status": 401
        }
    })
  })
});

describe('GET /users', () => {
  it('should get all users as admin', async () => {
    const response = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('users');
    expect(Array.isArray(response.body.users)).toBe(true);
  });
  it("should throw UnauthorizedError if non-admin", async () => {
    const response = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${u1Token}`);
      expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({
        "error": {
            "message": "Unauthorized, must be an admin!",
            "status": 401
        }
    })
  })
});

describe('GET /users/:username', () => {
  it('should get user details for logged-in user', async () => {
    const response = await request(app)
      .get('/users/user1')
      .set('Authorization', `Bearer ${u1Token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.username).toBe('user1');
  });
  it('should get user details for admin user', async () => {
    const response = await request(app)
      .get('/users/user1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.username).toBe('user1');
  });
  it('should throw NotFoundError if user not found', async()=>{
    const response = await request(app)
    .get('/users/nonexistentUser')
    .set('Authorization', `Bearer ${adminToken}`);
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
        "error": {
            "message": "No user: nonexistentUser",
            "status": 404
        }
    })
  })
  it("should throw UnauthorizedError if non-admin", async () => {
    const response = await request(app)
      .get('/users/user2')
      .set('Authorization', `Bearer ${u1Token}`);
      expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({
        "error": {
            "message": "Must be admin or logged-in user to access.",
            "status": 401
        }
    })
  })
});

describe('PATCH /users/:username/edit', () => {
  it('should update user details for logged-in user', async () => {
    const response = await request(app)
      .patch('/users/user1/edit')
      .send({
        firstName: 'UpdatedFirstName',
        lastName: 'UpdatedLastName'
      })
      .set('Authorization', `Bearer ${u1Token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.firstName).toBe('UpdatedFirstName');
    expect(response.body.user.lastName).toBe('UpdatedLastName');
  });
  it('should update user details for admin user', async () => {
    const response = await request(app)
      .patch('/users/user1/edit')
      .send({
        firstName: 'UpdatedFirstName',
        lastName: 'UpdatedLastName'
      })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.firstName).toBe('UpdatedFirstName');
    expect(response.body.user.lastName).toBe('UpdatedLastName');
  });
  it('should throw NotFoundError if user not found', async () => {
    const response = await request(app)
      .patch('/users/nonexistentUser/edit')
      .send({
        firstName: 'UpdatedFirstName',
        lastName: 'UpdatedLastName'
      })
      .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
          "error": {
              "message": "No user: nonexistentUser",
              "status": 404
          }
      })
  });
  it('should throw UnauthorizedError if user not admin or logged-in user', async () => {
    const response = await request(app)
      .patch('/users/user2/edit')
      .send({
        firstName: 'UpdatedFirstName',
        lastName: 'UpdatedLastName'
      })
      .set('Authorization', `Bearer ${u1Token}`);

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
          "error": {
              "message": "Must be admin or logged-in user to access.",
              "status": 401
          }
      })
  });

});

describe('DELETE /users/:username', () => {
  it('should delete user for admin user', async () => {
    const response = await request(app)
      .delete('/users/user1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('deleted', 'user1');
  });
  it('should delete user for logged-in user', async () => {
    const response = await request(app)
      .delete('/users/user1')
      .set('Authorization', `Bearer ${u1Token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('deleted', 'user1');
  });
  it('should throw NotFoundError if user not found', async () => {
    const response = await request(app)
      .delete('/users/nonexistentUser')
      .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
          "error": {
              "message": "No user: nonexistentUser",
              "status": 404
          }
      })
  });
  it('should throw UnauthorizedError if user not admin or logged-in user', async () => {
    const response = await request(app)
      .delete('/users/user2')
      .set('Authorization', `Bearer ${u1Token}`);

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
          "error": {
              "message": "Must be admin or logged-in user to access.",
              "status": 401
          }
      })
  });
});
  describe('POST /users/:username/like/:title', () => {
    it('should allow a user to like a space', async () => {
      const response = await request(app)
        .post(`/users/user1/like/Space1`)
        .set('Authorization', `Bearer ${u1Token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('liked');
    });
    it("should throw BadRequestEror if user has already 'liked' the space", async () => {
      await request(app)
        .post(`/users/user1/like/Space1`)
        .set('Authorization', `Bearer ${u1Token}`);
        const response = await request(app)
        .post(`/users/user1/like/Space1`)
        .set('Authorization', `Bearer ${u1Token}`);

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        "error": {
            "message": "Cannot like a space more than once.",
            "status": 400
        }
      });
    });
    it('should throw NotFoundError if space non-existent', async () => {
      const response = await request(app)
        .post(`/users/user1/like/nonexistentSpace`)
        .set('Authorization', `Bearer ${u1Token}`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        "error": {
            "message": "No such space: nonexistentSpace",
            "status": 404
        }
      });
    });
    it('should throw UnauthorizedError if not correct user', async () => {
      const response = await request(app)
        .post(`/users/user2/like/nonexistentSpace`)
        .set('Authorization', `Bearer ${u1Token}`);

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        "error": {
            "message": "Cannot 'like' a space for another user",
            "status": 401
        }
      });
    });
  });

  describe('DELETE /users/:username/like/:title', () => {
    it('should allow a user to unlike a space', async () => {
        await request(app)
        .post(`/users/user1/like/Space1`)
        .set('Authorization', `Bearer ${u1Token}`);
      const response = await request(app)
        .delete(`/users/user1/like/Space1`)
        .set('Authorization', `Bearer ${u1Token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ message: 'Unlike successful' });
    });
    it('should throw NotFoundError if space non-existent', async () => {
        const response = await request(app)
          .delete(`/users/user1/like/nonexistentSpace`)
          .set('Authorization', `Bearer ${u1Token}`);
  
        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({
          "error": {
              "message": "No such space: nonexistentSpace",
              "status": 404
          }
        });
      });
  });

  describe('GET /users/:username/likes', () => {
    it('should return the spaces liked by the user', async () => {
      const response = await request(app)
        .get(`/users/user1/likes`)
        .set('Authorization', `Bearer ${u1Token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('likedSpaces');
    });
  });

  describe('POST /users/:username/visit/:title', () => {
    it('should mark a space as visited by the user', async () => {
      const response = await request(app)
        .post(`/users/user1/visit/Space1`)
        .set('Authorization', `Bearer ${u1Token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        "visited": {
            "address": "1234 Fake Address, City1, USA",
            "category_id": testCatIds[0],
            "description": "Description1",
            "est_year": 2022,
            "image_url": "http://image1.img",
            "title": "Space1",
            "visit_date": expect.any(String)
        },
      });
    });
  });

  describe('GET /users/:username/visits', () => {
    it('should return the spaces visited by the user', async () => {
      const response = await request(app)
        .get(`/users/user1/visits`)
        .set('Authorization', `Bearer ${u1Token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('visits');
    });
  });

