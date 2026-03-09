const Space = require('../../models/space');
const { NotFoundError, BadRequestError, UnauthorizedError } = require('../../expressError');

const { 
    commonBeforeAll, 
    commonBeforeEach, 
    commonAfterEach, 
    commonAfterAll,
    testCategoryIds,
    testLocationIds,
    testUserIds
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

  describe('Space', ()=>{
    describe('create', () => {
        it('should create a new space', async () => {
          const newSpace = await Space.create({
            title: 'New Space',
            description: 'Description for new space',
            image_url: 'http://example.com/image.jpg',
            category_id: testCategoryIds[0],
            address: '123 Main St',
            location_id: testLocationIds[0],
            est_year: 2022
          });
          expect(newSpace.title).toEqual('New Space');
          expect(newSpace.description).toEqual('Description for new space');
        });
        it('should throw BadRequestError if space already exists', async () => {
            await expect(Space.create({
              title: 'Space1',
              description: 'Description for existing space',
              image_url: 'http://example.com/image.jpg',
              category_id: testCategoryIds[0],
              address: '456 Elm St',
              location_id: testLocationIds[0],
              est_year: 2021
            })).rejects.toThrow(BadRequestError);
          });
    });
    describe('findAll', ()=>{
        it('should return all spaces when no search filters provided', async () => {
            const spaces = await Space.findAll();
            expect(Array.isArray(spaces)).toBe(true);
            spaces.forEach(space => {
                expect(space).toHaveProperty('space_id');
                expect(space).toHaveProperty('title');
                expect(space).toHaveProperty('description');
            });
          });
        
          it('should return spaces filtered by title', async () => {
            const searchFilters = { title: 'Space1' };
            const spaces = await Space.findAll(searchFilters);
            expect(spaces[0].title).toBe('Space1')
            expect(spaces[0].description).toBe('Description1')
          });
        
          it('should return spaces filtered by category', async () => {
            const searchFilters = { category: 'Category1' };
            const spaces = await Space.findAll(searchFilters);
            expect(spaces.length).toBeGreaterThan(0);
            spaces.forEach(space => {
                expect(space.category).toBe('Category1');
            });
          });
        
          it('should return spaces filtered by city', async () => {
            const searchFilters = { city: 'City1' };
            const spaces = await Space.findAll(searchFilters);
            expect(spaces.length).toBeGreaterThan(0);
            spaces.forEach(space => {
                expect(space.city).toBe('City1');
                expect(space.neighborhood).toBe('Neighborhood1')
            });
          });
        
          it('should return spaces filtered by neighborhood', async () => {
            const searchFilters = { neighborhood: 'Neighborhood2' };
            const spaces = await Space.findAll(searchFilters);
            spaces.forEach(space => {
                expect(space.city).toBe('City2');
                expect(space.neighborhood).toBe('Neighborhood2')
            });
          });
    });
    describe('get', () => {
        it('should return space data by title', async () => {
          const spaceTitle = 'Space1';
          const space = await Space.get(spaceTitle);
          
          expect(space).toBeDefined();
          expect(space.title).toBe(spaceTitle);
        });
    
        it('should throw NotFoundError if space not found', async () => {
          const nonExistingTitle = 'NonExistingSpace';
          await expect(Space.get(nonExistingTitle)).rejects.toThrowError(NotFoundError);
        });
      });
      describe('update', () => {
        it('should update space data', async () => {
          const spaceTitle = 'Space1';
          const updatedData = { title: 'Updated Space Title' };
          const updatedSpace = await Space.update(spaceTitle, updatedData);
          
          expect(updatedSpace).toBeDefined();
          expect(updatedSpace.title).toBe(updatedData.title);
        });
    
        it('should throw NotFoundError if space not found', async () => {
          const nonExistingTitle = 'NonExistingSpace';
          const updatedData = { title: 'Updated Space Title' };
          await expect(Space.update(nonExistingTitle, updatedData)).rejects.toThrowError(NotFoundError);
        });
    
        it('should throw BadRequestError if duplicate space title provided', async () => {
          const spaceTitle = 'Space1';
          const updatedData = { title: 'Space2' };
          await expect(Space.update(spaceTitle, updatedData)).rejects.toThrowError(BadRequestError);
        });
      });
      describe('remove', () => {
        it('should remove space by title', async () => {
          const spaceTitle = 'Space1';
          const removedSpace = await Space.remove(spaceTitle);
          
          expect(removedSpace).toBeDefined();
          expect(removedSpace.title).toBe(spaceTitle);
        });
    
        it('should throw NotFoundError if space not found', async () => {
          const nonExistingTitle = 'NonExistingSpace';
          await expect(Space.remove(nonExistingTitle)).rejects.toThrowError(NotFoundError);
        });
      });

  })