/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size <= 0) {return '';}

  if (size === undefined) {
    return string;
  }

  let counter = 0;
  let result = '';

  while (counter < string.length) {
    const currentSymbol = string[counter];
    let count = 0;
		
    while (counter < string.length && string[counter] === currentSymbol) {
      counter++;
      count++;
    }
		
    result += currentSymbol.repeat(Math.min(count, size));
  }


  return result;
}