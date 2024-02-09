const request = require('supertest');
const app = require("../../app");


const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    adminToken,
    testLocIds
  } = require("./_testCommon");
  
  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);

describe('Locations Routes', () => {
  describe('POST /locations', () => {
    it('should create a new location', async () => {
      const newLocation = { 
        city: 'new city',
        neighborhood: 'new neighborhood' 
    };

      const response = await request(app)
        .post('/locations')
        .send(newLocation)
        .set("authorization", `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual({
        "location": {
          "loc_id": expect.any(Number),
          "city": "New City",
          "neighborhood": "New Neighborhood"
        }
        });
    });
    it('should throw BadRequestError for duplicate city/neighborhood', async ()=>{
        const response = await request(app)
        .post('/locations')
        .send({
            city: "city2",
        neighborhood: "neighborhood2"
    })
        .set("authorization", `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(400);
        expect(response.body).toStrictEqual({
        "error": {
                "message": "City2, Neighborhood2 already exists.",
                "status": 400,
                }

        });
    });
    it('should throw UnauthorizedError for non admin', async ()=>{
        const newLocation = { 
            city: 'new city',
            neighborhood: 'new neighborhood' 
        };
    
          const response = await request(app)
            .post('/locations')
            .send(newLocation)
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
  describe('GET /locations', () => {
    it('should get all locations', async () => {

      const response = await request(app).get('/locations');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ 
        "locations": [
                {
                    "loc_id": expect.any(Number),
                    "city": "City1",
                    "neighborhood": "Neighborhood1"
                },
                {
                    "loc_id": expect.any(Number),
                    "city": "City2",
                    "neighborhood": "Neighborhood2"
                }
             ],
       });
    });
  });

  describe('GET /locations/cities/:city', () => {
    it('should get neighborhoods under a specific city', async () => {
      const response = await request(app).get('/locations/cities/City1');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
            "location": [
                {
            "loc_id": expect.any(Number), 
            "city": "City1", 
            "neighborhood": "Neighborhood1",
            }
        ]
        });
    });
    it('should throw NotFoundError if the city does not exist', async () => {
        const response = await request(app).get('/locations/cities/NonexistentCity');
  
        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({
          "error": {
            "message": "Cannot find city: NonexistentCity",
            "status":404,
          }
        });
      });
  });
  describe('GET /locations/:loc_id', () => {
    it('should get location by loc_id', async () => {
      const loc_id = testLocIds[0];
      const response = await request(app).get(`/locations/${loc_id}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        "location": [
            {
        "loc_id": loc_id, 
        "city": "City1", 
        "neighborhood": "Neighborhood1",
        }
    ]
    });
    });
  
    it('should throw NotFoundError if loc_id does not exist', async () => {
      const loc_id = 0;
      const response = await request(app).get(`/locations/${loc_id}`);
      
      expect(response.statusCode).toBe(404);
    });
  });
  
  describe('GET /locations/neighborhoods/:neighborhood', () => {
    it('should get locations by neighborhood', async () => {
      const neighborhood = 'Neighborhood1'; // Assuming 'Neighborhood1' exists in the database
      const response = await request(app).get(`/locations/neighborhoods/${neighborhood}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        "location": [
            {
        "loc_id": expect.any(Number), 
        "city": "City1", 
        "neighborhood": "Neighborhood1",
        }
    ]
})
    });
  
    it('should throw NotFoundError if neighborhood does not exist', async () => {
      const neighborhood = 'NonexistentNeighborhood';
      const response = await request(app).get(`/locations/neighborhoods/${neighborhood}`);
      
      expect(response.statusCode).toBe(404);
    });
});
describe('PATCH /locations/:loc_id', () => {
    it('should update location by loc_id', async () => {
      const loc_id = testLocIds[0];
      const updateData = { city: 'UpdatedCity', neighborhood: 'UpdatedNeighborhood' };
      const response = await request(app)
        .patch(`/locations/${loc_id}`)
        .send(updateData)
        .set('Authorization', `Bearer ${adminToken}`);
  
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        "location": {
        "loc_id": loc_id, 
        "city": "UpdatedCity", 
        "neighborhood": "UpdatedNeighborhood",
        }
})

    });
  
    it('should throw NotFoundError if loc_id does not exist', async () => {
      const loc_id = 0;
      const updateData = { city: 'UpdatedCity', neighborhood: 'UpdatedNeighborhood' };
      const response = await request(app)
        .patch(`/locations/${loc_id}`)
        .send(updateData)
        .set('Authorization', `Bearer ${adminToken}`);
  
      expect(response.statusCode).toBe(404);
    });
    it('should throw UnauthroizedError if not admin', async () => {
      const loc_id = testLocIds[0];
      const updateData = { city: 'UpdatedCity', neighborhood: 'UpdatedNeighborhood' };
      const response = await request(app)
        .patch(`/locations/${loc_id}`)
        .send(updateData)
        .set('Authorization', `Bearer ${u1Token}`);
  
      expect(response.statusCode).toBe(401);
    });
  });
  
  describe('DELETE /locations/neighborhoods/:neighborhood', () => {
    it('should delete location by neighborhood', async () => {
      const neighborhood = 'Neighborhood1';
      const response = await request(app)
        .delete(`/locations/neighborhoods/${neighborhood}`)
        .set('Authorization', `Bearer ${adminToken}`);
  
      expect(response.statusCode).toBe(200);
    });
  
    it('should throw NotFoundError if neighborhood does not exist', async () => {
      const neighborhood = 'NonexistentNeighborhood';
      const response = await request(app)
        .delete(`/locations/neighborhoods/${neighborhood}`)
        .set('Authorization', `Bearer ${adminToken}`);
  
      expect(response.statusCode).toBe(404);
    });
    it('should throw UnauthroizedError if not admin', async () => {
        const response = await request(app)
          .delete(`/locations/neighborhoods/Neighborhood2`)
          .set('Authorization', `Bearer ${u1Token}`);
    
        expect(response.statusCode).toBe(401);
      });
  });


  })
