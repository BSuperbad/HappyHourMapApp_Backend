const request = require('supertest');
const app = require('../../app');
const { 
    commonBeforeAll, 
    commonBeforeEach, 
    commonAfterEach, 
    commonAfterAll, 
    testUserIds, 
    u1Token, 
    adminToken
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe('POST /ratings/:username/spaces/:title', () => {
  it('should create a new rating', async () => {
    const response = await request(app)
      .post(`/ratings/user1/spaces/Space1`)
      .send({ rating: 5 })
      .set('Authorization', `Bearer ${u1Token}`);
    
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('rating');
  });
  it('should throw NotFoundError if space is not found', async()=>{
    const response = await request(app)
    .post(`/rating/user1/spaces/nonexistentSpace`)
    .send({rating: 4})
    .set('Authorization', `Bearer ${u1Token}`)

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
        "error": {
          "message": "Not Found",
          "status": 404
        }
      });

  });

  it('should throw UnauthorizedError if current user is not user param', async () => {
    const response = await request(app)
      .post(`/ratings/user2/spaces/Space1`)
      .send({ rating: 5 })
      .set('Authorization', `Bearer ${u1Token}`);
    
    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({
      "error": {
        "message": "Unauthorized, must be the current logged-in user",
        "status": 401
      }
    });
  });
});

describe('GET /ratings/:username/spaces/:title', () => {
  it('should get a single rating for a space by a user', async () => {
    await request(app)
      .post(`/ratings/user1/spaces/Space1`)
      .send({ rating: 5 })
      .set('Authorization', `Bearer ${u1Token}`);
    const response = await request(app)
      .get(`/ratings/user1/spaces/Space1`)
      .set('Authorization', `Bearer ${u1Token}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('rating');
  });
});

describe('GET /ratings/spaces/:title', () => {
  it('should get average rating for a space', async () => {
    await request(app)
      .post(`/ratings/user1/spaces/Space1`)
      .send({ rating: 5 })
      .set('Authorization', `Bearer ${u1Token}`);
    const response = await request(app)
      .get(`/ratings/spaces/Space1`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('rating');
  });
  it('should throw NotFoundError if space is not found', async()=>{
    await request(app)
      .post(`/ratings/user1/spaces/Space1`)
      .send({ rating: 5 })
      .set('Authorization', `Bearer ${u1Token}`);
    const response = await request(app)
    .post(`/rating/user1/spaces/nonexistentSpace`)
    .send({rating: 4})
    .set('Authorization', `Bearer ${u1Token}`)

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
        "error": {
          "message": "Not Found",
          "status": 404
        }
      });

  });
});

describe('GET /ratings/:rating_id', () => {
  it('should get a rating by id', async () => {
    const ratingRes = await request(app)
        .post(`/ratings/user1/spaces/Space1`)
        .send({ rating: 5 })
        .set('Authorization', `Bearer ${u1Token}`);
    const ratingId = ratingRes.body.rating.rating_id;
    const response = await request(app)
      .get(`/ratings/${ratingId}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('rating');
  });
  it('should throw NotFoundError if rating is not found', async()=>{
    await request(app)
      .post(`/ratings/user1/spaces/Space1`)
      .send({ rating: 5 })
      .set('Authorization', `Bearer ${u1Token}`);
      const response = await request(app)
      .get(`/ratings/0`);

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
        "error": {
          "message": "Rating not found!",
          "status": 404
        }
      });

  });
});

describe('PATCH /ratings/:rating_id/edit', () => {
    it('should throw NotFoundError if rating is not found', async()=>{
        await request(app)
          .post(`/ratings/user1/spaces/Space1`)
          .send({ rating: 5 })
          .set('Authorization', `Bearer ${u1Token}`);
          const response = await request(app)
          .delete(`/ratings/0`)
          .set('Authorization', `Bearer ${adminToken}`);
    
        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({
            "error": {
              "message": "Rating not found",
              "status": 404
            }
          });
    
      });
});

describe('DELETE /ratings/:rating_id', () => {
  it('should delete a rating', async () => {
    const ratingRes = await request(app)
    .post(`/ratings/user1/spaces/Space1`)
    .send({ rating: 5 })
    .set('Authorization', `Bearer ${u1Token}`);
    const ratingId = ratingRes.body.rating.rating_id;
    const response = await request(app)
      .delete(`/ratings/${ratingId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('deletedRating');
  });
});
