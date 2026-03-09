const { BadRequestError } = require("../expressError");

/**
 * Helper for making selective update queries.
 *
 * The calling function can use it to make the SET clause of an SQL UPDATE
 * statement.
 *
 * @param dataToUpdate {Object} {field1: newVal, field2: newVal, ...}
 * @param jsToSql {Object} maps js-style data fields to database column names,
 *
 * @returns {Object} {sqlSetCols, values}

 */

function partialUpdate(dataToUpdate, jsToSql) {
    // Get the keys of the dataToUpdate object
    const keys = Object.keys(dataToUpdate);
  
    // If there are no keys, throw a BadRequestError
    if (keys.length === 0) throw new BadRequestError("No data");
  
    // Map each key to its corresponding database column name
    const setCols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`
  ).join(", ");

  // Map each key to its corresponding value
  const values = keys.map((colName, idx) => dataToUpdate[colName]);

  // Return an object with SQL SET clause and values
  return {
    setCols,
    values,
  };
}
  

module.exports = { partialUpdate };
