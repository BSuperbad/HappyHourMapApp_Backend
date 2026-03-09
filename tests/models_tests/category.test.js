const Category = require('../../models/category');
const { BadRequestError, NotFoundError } = require('../../expressError');
const { 
    commonBeforeAll, 
    commonBeforeEach, 
    commonAfterEach, 
    commonAfterAll
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


  describe('Category', () => {
    describe('create', ()=>{
        it('should create a new category', async () => {
            const result = await Category.create({ cat_type: 'Test Category' });
            expect(result).toHaveProperty('cat_id');
            expect(result.cat_type).toEqual('Test Category');
          });
        it('should throw BadRequestError if category already exists', async () => {
            try {
              await Category.create({ cat_type: 'Category1' });
              fail('Expected BadRequestError to be thrown');
            } catch (error) {
              expect(error).toBeInstanceOf(BadRequestError);
              expect(error.message).toEqual('Category1 already exists.');
            }
          });

      });
    describe('findAll', () => {
        it('should return all categories', async () => {
          const categories = await Category.findAll();
          expect(categories).toHaveLength(3);
        });
      });
    
      describe('get', () => {
        it('should return category with spaces', async () => {
          const catType = 'Category1';
          const category = await Category.get(catType);
          expect(category).toHaveProperty('cat_id');
          expect(category).toHaveProperty('cat_type', catType);
          expect(category).toHaveProperty('spaces');
          expect(category.spaces).toHaveLength(1);
        });
    
        it('should throw NotFoundError if category not found', async () => {
          const catType = 'NonexistentCategory';
          await expect(Category.get(catType)).rejects.toThrow(NotFoundError);
        });
      });
    
      describe('updateCat', () => {
        it('should update category type', async () => {
          const catType = 'Category1';
          const newCatType = 'UpdatedCategory';
          await Category.updateCat(catType, { cat_type: newCatType });
          const updatedCategory = await Category.get(newCatType);
          expect(updatedCategory).toHaveProperty('cat_type', newCatType);
        });
    
        it('should throw NotFoundError if category not found', async () => {
          const catType = 'NonexistentCategory';
          await expect(Category.updateCat(catType, { cat_type: 'UpdatedCategory' })).rejects.toThrow(NotFoundError);
        });
    
        it('should throw BadRequestError if updated category already exists', async () => {
          const catType = 'Category1';
          const newCatType = 'Category2';
          await expect(Category.updateCat(catType, { cat_type: newCatType })).rejects.toThrow(BadRequestError);
        });
      });
    
      describe('deleteCat', () => {
        it('should delete category', async () => {
          const catType = 'Category3';
          const result = await Category.deleteCat(catType);
          expect(result).toEqual(`Category '${catType}' successfully deleted.`);
        });
    
        it('should throw NotFoundError if category not found', async () => {
          const catType = 'NonexistentCategory';
          await expect(Category.deleteCat(catType)).rejects.toThrow(NotFoundError);
        });
    
        it('should throw Error if category has associated spaces', async () => {
          const catType = 'Category1';
          await expect(Category.deleteCat(catType)).rejects.toThrow(Error);
        });
      });
   
    
});
