const request = require('supertest');
const app = require("../../app");


const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    adminToken
  } = require("./_testCommon");
  
  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);

describe('Categories Routes', () => {
  describe('POST /categories', () => {
    it('should create a new category', async () => {
      const newCategory = { cat_type: 'Test Category' };

      const response = await request(app)
        .post('/categories')
        .send(newCategory)
        .set("authorization", `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual({
        "category": {
          "cat_id": expect.any(Number),
          "cat_type": "Test Category"
        }
        });
    });
    it('should throw BadRequestError for duplicate category', async ()=>{
        const response = await request(app)
        .post('/categories')
        .send({cat_type: "Category1"})
        .set("authorization", `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(409);
        expect(response.body).toStrictEqual({
        "error": {
                "message": "Category1 already exists.",
                "status": 409,
                }

        });
    });
    it('should throw UnauthorizedError for non admin', async ()=>{
        const response = await request(app)
        .post('/categories')
        .send({cat_type: "Test Category"})
        .set("authorization", `Bearer ${u1Token}`);

        expect(response.statusCode).toBe(401);
        expect(response.body).toStrictEqual({
        "error": {
                "message": "Unauthorized, must be an admin!",
                "status": 401,
                }

        });
    });
});
  describe('GET /categories', () => {
    it('should get all categories', async () => {

      const response = await request(app).get('/categories');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ 
        "categories": [
                {
                    "cat_id": expect.any(Number),
                    "cat_type": "Category1"
                },
                {
                    "cat_id": expect.any(Number),
                    "cat_type": "Category2"
                }
             ],
       });
    });
  });

  describe('GET /categories/:cat_type', () => {
    it('should get spaces under a specific category', async () => {
      const response = await request(app).get('/categories/Category1');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
            "category": {
            "cat_id": expect.any(Number), 
            "cat_type": "Category1", 
            "spaces": [],
            }
        });
    });
    it('should throw NotFoundError if the category type does not exist', async () => {
        const response = await request(app).get('/categories/NonexistentCategory');
  
        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({
          "error": {
            "message": "Cannot find category: NonexistentCategory",
            "status":404,
          }
        });
      });
  });

  describe('PATCH /categories/:cat_type/edit', () => {
    it('should update a category', async () => {

      const response = await request(app)
        .patch('/categories/Category2/edit')
        .send({ cat_type: 'Updated Category' })
        .set("authorization", `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({"category": "Category successfully updated to Updated Category."});
    });
    it('should throw NotFoundError if the category type does not exist', async () => {
        const response = await request(app)
        .patch('/categories/NonexistentCategory/edit')
        .send({ cat_type: 'Updated Category' })
        .set("authorization", `Bearer ${adminToken}`);
  
        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({
          "error": {
            "message": "No such category: NonexistentCategory",
            "status":404,
          }
        });
    });
    it('should throw BadRequestError for duplicate category', async ()=>{
        const response = await request(app)
        .patch('/categories/Category2/edit')
        .send({cat_type: "Category1"})
        .set("authorization", `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(409);
        expect(response.body).toStrictEqual({
        "error": {
                "message": "Category1 already exists.",
                "status": 409,
                }

        });
    });
    it('should throw UnauthorizedError for non admin', async ()=>{
        const response = await request(app)
        .patch('/categories/Category1/edit')
        .send({cat_type: "Test Category"})
        .set("authorization", `Bearer ${u1Token}`);

        expect(response.statusCode).toBe(401);
        expect(response.body).toStrictEqual({
        "error": {
                "message": "Unauthorized, must be an admin!",
                "status": 401,
                }

        });
    });
  });

  describe('DELETE /categories/:cat_type', () => {
    it('should delete a category', async () => {
      const response = await request(app)
      .delete('/categories/Category1')
      .set("authorization", `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        "deletedCategory": "Category 'Category1' successfully deleted."
      });
    });
    it('should throw NotFoundError if the category type does not exist', async () => {
        const response = await request(app)
        .delete('/categories/NonexistentCategory')
        .set("authorization", `Bearer ${adminToken}`);
  
        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({
          "error": {
            "message": "No such category: NonexistentCategory",
            "status":404,
          }
        });
      });
      it('should throw UnauthorizedError for non admin', async ()=>{
        const response = await request(app)
        .delete('/categories/Category1')
        .set("authorization", `Bearer ${u1Token}`);

        expect(response.statusCode).toBe(401);
        expect(response.body).toStrictEqual({
        "error": {
                "message": "Unauthorized, must be an admin!",
                "status": 401,
                }

        })
    });
  });

})
