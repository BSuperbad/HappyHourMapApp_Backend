const request = require('supertest');
const app = require('../../app');
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  adminToken,
  testSpaceIds,
  testCatIds,
  testLocIds,
  u1Token
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe('Spaces Routes', () => {
  describe('POST /spaces', () => {
    it('should create a new space with admin token', async () => {
      const newSpace = {
        title: 'New Space',
        description: 'Description of New Space',
        image_url: 'http://example.com/image.jpg',
        category_id: testCatIds[0],
        address: '123 Example St',
        location_id: testLocIds[0],
        est_year: 2023
      };

      const response = await request(app)
        .post('/spaces')
        .send(newSpace)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('space');
      expect(response.body.space.title).toBe(newSpace.title);
    });
    it('should throw BadRequestError for duplicate space title', async ()=>{
        const newSpace = {
            title: 'Space1',
            description: 'Description of New Space',
            image_url: 'http://example.com/image.jpg',
            category_id: testCatIds[0],
            address: '123 Example St',
            location_id: testLocIds[0],
            est_year: 2023
          };
        const response = await request(app)
        .post('/spaces')
        .send(newSpace)
        .set("authorization", `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(400);
        expect(response.body).toStrictEqual({
        "error": {
                "message": "Duplicate space: Space1",
                "status": 400,
                }

        });
    });
    it('should throw UnauthorizedError with non-admin token', async () => {
      const newSpace = {
        title: 'New Space',
        description: 'Description of New Space',
        image_url: 'http://example.com/image.jpg',
        category_id: testCatIds[0],
        address: '123 Example St',
        location_id: testLocIds[0],
        est_year: 2023
      };

      const response = await request(app)
        .post('/spaces')
        .send(newSpace)
        .set('Authorization', `Bearer ${u1Token}`);

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        "error": {
            "message": "Unauthorized, must be an admin!", 
            "status": 401
        }});
    });
  });

  describe('GET /spaces', () => {
    it('should get all spaces when logged in', async () => {
      const response = await request(app)
        .get('/spaces')
        .set('Authorization', `Bearer ${u1Token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('spaces');
      expect(response.body).toEqual({
        "spaces": [{
            "address": "1234 Fake Address, City1, USA", 
            "avg_rating": null, 
            "category": "Category1", 
            "city": "City1", 
            "description": "Description1", 
            "est_year": 2022, 
            "image_url": "http://image1.img", 
            "neighborhood": "Neighborhood1", 
            "space_id": testSpaceIds[0], 
            "title": "Space1"
        }, 
        {
            "address": "568 Fake Street, City 2, USA", 
            "avg_rating": null, 
            "category": "Category2", 
            "city": "City2", 
            "description": "Description2", 
            "est_year": 2023, 
            "image_url": "http://image2.img", 
            "neighborhood": "Neighborhood2", 
            "space_id": testSpaceIds[1], 
            "title": "Space2"
        }]
    });
    });
    it('should throw UnauthorizedError if not logged in', async() => {
        const response = await request(app)
        .get('/spaces');

        expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        "error": {
            "message": "Unauthorized, must be logged-in!", 
            "status": 401
        }});
    });
    it('should filter spaces by title when query parameter is provided', async () => {
      const response = await request(app)
        .get('/spaces')
        .query({ title: 'Space1' })
        .set('Authorization', `Bearer ${u1Token}`);
  
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('spaces');
      expect(Array.isArray(response.body.spaces)).toBe(true);
    });
  
    it('should filter spaces by category when query parameter is provided', async () => {
      const response = await request(app)
        .get('/spaces')
        .query({ category: 'Category1' })
        .set('Authorization', `Bearer ${u1Token}`);
  
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('spaces');
      expect(Array.isArray(response.body.spaces)).toBe(true);
    });
    it('should filter spaces by city when query parameter is provided', async () => {
      const response = await request(app)
        .get('/spaces')
        .query({ city: 'City1' })
        .set('Authorization', `Bearer ${u1Token}`);
  
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('spaces');
      expect(Array.isArray(response.body.spaces)).toBe(true);
    });
  
    it('should filter spaces by neighborhood when query parameter is provided', async () => {
      const response = await request(app)
        .get('/spaces')
        .query({ neighborhood: 'Neighborhood1' })
        .set('Authorization', `Bearer ${u1Token}`);
  
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('spaces');
      expect(Array.isArray(response.body.spaces)).toBe(true);
    });
  
    it('should sort spaces by average rating in ascending order when sortBy query parameter is provided as "asc"', async () => {
      const response = await request(app)
        .get('/spaces')
        .query({ sortBy: 'avg_rating', sortOrder: 'asc' })
        .set('Authorization', `Bearer ${u1Token}`);
  
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('spaces');
      expect(Array.isArray(response.body.spaces)).toBe(true);
    });
  
    it('should sort spaces by average rating in descending order when sortBy query parameter is provided as "desc"', async () => {
      const response = await request(app)
        .get('/spaces')
        .query({ sortBy: 'avg_rating', sortOrder: 'desc' })
        .set('Authorization', `Bearer ${u1Token}`);
  
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('spaces');
      expect(Array.isArray(response.body.spaces)).toBe(true);
    });
  });

  describe('GET /spaces/:title', () => {
    it('should get a space by title', async () => {
      const response = await request(app)
        .get(`/spaces/Space1`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('space');
      expect(response.body.space.title).toBe('Space1');
    });
    it('should throw NotFoundError if space does not exist', async() => {
        const response = await request(app)
        .get('/spaces/nonExistentSpace')
        .set('Authorization', `Bearer ${u1Token}`);
        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({
            "error": {
                "message": "Cannot find space: nonExistentSpace",
                "status" : 404
            }
        })
    })
    it('should throw UnauthorizedError if not logged in', async() => {
        const response = await request(app)
        .get('/spaces/Space1');

        expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        "error": {
            "message": "Unauthorized, must be logged-in!", 
            "status": 401
        }});
    });
  });

  describe('PATCH /spaces/:title/edit', () => {
    it('should update a space if admin', async () => {
      const updatedSpaceData = {
        description: 'Updated description'
      };

      const response = await request(app)
        .patch(`/spaces/Space1/edit`)
        .send(updatedSpaceData)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('space');
      expect(response.body.space.description).toBe(updatedSpaceData.description);
    });
    it('should throw NotFoundError if space does not exist', async() => {
        const updatedSpaceData = {
            description: 'Updated description'
          };
        const response = await request(app)
        .patch(`/spaces/nonExistentSpace/edit`)
        .send(updatedSpaceData)
        .set('Authorization', `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({
            "error": {
                "message": "No space: nonExistentSpace",
                "status" : 404
            }
        })
    })
    it('should throw UnauthorizedError if not logged in', async() => {
        const updatedSpaceData = {
            description: 'Updated description'
          };
        const response = await request(app)
        .patch(`/spaces/Space1/edit`)
        .send(updatedSpaceData)
        .set('Authorization', `Bearer ${u1Token}`);

        expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        "error": {
            "message": "Unauthorized, must be an admin!", 
            "status": 401
        }});
    });
  });

  describe('DELETE /spaces/:title', () => {
    it('should delete a space', async () => {
      const response = await request(app)
        .delete(`/spaces/Space1`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('deleted');
      expect(response.body.deleted.title).toBe('Space1');
    });
    it('should throw NotFoundError if space does not exist', async() => {
        const response = await request(app)
        .delete(`/spaces/nonExistentSpace`)
        .set('Authorization', `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({
            "error": {
                "message": "No space: nonExistentSpace",
                "status" : 404
            }
        })
    });
    it('should throw UnauthorizedError if not logged in', async() => {
        const response = await request(app)
        .delete(`/spaces/Space1`)
        .set('Authorization', `Bearer ${u1Token}`);

        expect(response.statusCode).toBe(401);
        expect(response.body).toEqual({
        "error": {
            "message": "Unauthorized, must be an admin!", 
            "status": 401
        }});
    });
  });
});
