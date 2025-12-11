/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
  const result = {};

  Object.entries(obj).forEach(prop => {
    const key = prop[0];
	
    if (fields.includes(key)) {return;}

    if (key in obj) {
      result[key] = prop[1];
    }
  });

  return result;
};
