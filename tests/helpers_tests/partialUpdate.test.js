const { partialUpdate } = require("../../helpers/partialUpdate")
const { BadRequestError } = require('../../expressError');

describe('partialUpdate', () => {
  describe('updating user information', () => {
    it('should generate SQL SET clause and values correctly for user', () => {
      const dataToUpdate = { firstName: 'John', lastName: 'Doe', isAdmin: true };
      const jsToSql = { firstName: 'first_name', lastName: 'last_name', isAdmin: 'is_admin' };
      const expectedSetCols = '"first_name"=$1, "last_name"=$2, "is_admin"=$3';
      const expectedValues = ['John', 'Doe', true];
      const { setCols, values } = partialUpdate(dataToUpdate, jsToSql);
      expect(setCols).toBe(expectedSetCols);
      expect(values).toEqual(expectedValues);
    });
  });

  describe('updating space information', () => {
    it('should generate SQL SET clause and values correctly for space', () => {
      const dataToUpdate = { title: 'New Space', description: 'Updated description' };
      const jsToSql = {};

      const expectedSetCols = '"title"=$1, "description"=$2';
      const expectedValues = ['New Space', 'Updated description'];

      const { setCols, values } = partialUpdate(dataToUpdate, jsToSql);

      expect(setCols).toBe(expectedSetCols);
      expect(values).toEqual(expectedValues);
    });
  });
  describe('handling when data is empty', ()=>{
    it('should throw BadRequestError when dataToUpdate is empty', () => {
        const dataToUpdate = {};
        const jsToSql = {};
        expect(() => partialUpdate(dataToUpdate, jsToSql)).toThrow(BadRequestError);
      });
  })
});
