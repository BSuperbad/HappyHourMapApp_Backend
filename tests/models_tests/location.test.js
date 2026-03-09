const Location = require('../../models/location');
const { BadRequestError, UnauthorizedError, NotFoundError } = require('../../expressError');
const { 
    commonBeforeAll, 
    commonBeforeEach, 
    commonAfterEach, 
    commonAfterAll,
    testLocationIds
 } = require('./_testCommon');

beforeAll(async () => {
  await commonBeforeAll();
});

beforeEach(async () => {
  await commonBeforeEach();
});

afterEach(async () => {
  await commonAfterEach();
});

afterAll(async () => {
  await commonAfterAll();
});

describe('Location', ()=>{
    describe('create', ()=>{
        it('should create a new location', async () => {
            const locationData = {
                city: 'Test City',
                neighborhood: 'Test Neighborhood',
            };
            const newLocation = await Location.create(locationData);
            expect(newLocation).toBeDefined();
            expect(newLocation.city).toBe(locationData.city);
            expect(newLocation.neighborhood).toBe(locationData.neighborhood);
          });
        it('should throw BadRequestError if location already exists', async () => {
            try {
              await Location.create({ 
                city: 'City1',
                neighborhood: 'Neighborhood1' 
            });
              fail('Expected BadRequestError to be thrown');
            } catch (error) {
              expect(error).toBeInstanceOf(BadRequestError);
              expect(error.message).toEqual('City1, Neighborhood1 already exists.');
            }
          });
      });
    describe('findAll', () => {
        it('should return all locations', async () => {
          const locations = await Location.findAll();
          expect(locations).toHaveLength(3);
        });
      });
    describe('getC', () => {
        it('should return an array of locations for the given city', async () => {
          const city = 'City1';
          const locations = await Location.getC(city);
          expect(locations).toBeInstanceOf(Array);
          expect(locations.length).toBeGreaterThan(0);
        });
    
        it('should throw NotFoundError if city not found', async () => {
          const city = 'NonexistentCity';
          await expect(Location.getC(city)).rejects.toThrow(NotFoundError);
        });
      });
    describe('getN', () => {
        it('should return matching neighborhood', async () => {
          const locations = await Location.getN('Neighborhood2');
          const result = locations[0];
          expect(result.city).toBe('City2');
          expect(result.neighborhood).toBe('Neighborhood2');
        });
    
        it('should throw NotFoundError if neighborhood not found', async () => {
          const neighborhood = 'NonexistentNeighborhood';
          await expect(Location.getN(neighborhood)).rejects.toThrow(NotFoundError);
        });
      });

    describe('findById', () => {
        it('should return a single location by loc_id', async () => {
            const expectedId = testLocationIds[0];
            const results = await Location.findById(expectedId);
            const result = results[0];
            expect(result.city).toBe('City1');
            expect(result.neighborhood).toBe('Neighborhood1')
            expect(result.loc_id).toBe(expectedId);
        });
    
        it('should throw NotFoundError if loc_id not found', async () => {
          const loc_id = 0;
          await expect(Location.findById(loc_id)).rejects.toThrow(NotFoundError);
        });
      });

    describe('update', () => {
        it('should update location by loc_id', async () => {
          const loc_id = testLocationIds[0]
          await Location.update({ 
            loc_id: loc_id,
            data: { 
              city: 'New Test City 1',
              neighborhood: 'New Test Neighborhood 1' 
            }
          });
          const updatedLocation = await Location.findById(loc_id);
          expect(updatedLocation[0]).toHaveProperty('city', 'New Test City 1');
          expect(updatedLocation[0]).toHaveProperty('neighborhood', 'New Test Neighborhood 1');
        });
      
        it('should throw NotFoundError if loc_id not found', async () => {
          const loc_id = 0;
          await expect(Location.update({ loc_id, data: { 
            city: 'New Test City 1',
            neighborhood: 'New Test Neighborhood 1' 
          }})).rejects.toThrow(NotFoundError);
        });
      
        it('should throw BadRequestError if updated category already exists', async () => {
          const city = 'City2';
          const neighborhood = 'Neighborhood2';
          const loc_id = testLocationIds[0];
          await expect(Location.update({ 
            loc_id: loc_id,
            data: { 
              city: city,
              neighborhood: neighborhood 
            }
          })).rejects.toThrow(BadRequestError);
        });
      });
    describe('deleteLoc', () => {
        it('should delete location based on neighborhood', async () => {
          const neighb = 'Neighborhood3';
          const result = await Location.deleteLoc(neighb);
          expect(result.neighborhood).toEqual(neighb);
          expect(result.city).toEqual('City3');
        });
    
        it('should throw NotFoundError if neighborhood not found', async () => {
          const neighb = 'NonexistentNeighborhood';
          await expect(Location.deleteLoc(neighb)).rejects.toThrow(NotFoundError);
        });
    
        it('should throw Error if location has associated spaces', async () => {
          const neighb = 'Neighborhood1';
          await expect(Location.deleteLoc(neighb)).rejects.toThrow(Error);
        });
      });
    

});
