/**
 * pick - Creates an object composed of the picked object properties:
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to pick
 * @returns {object} - returns the new object
 */
export const pick = (obj, ...fields) => {
  const result = {};

  Object.entries(obj).forEach(prop => {
    const key = prop[0];

    if (fields.includes(key)) {
      result[key] = prop[1];
    }
  });

  return result;
};
