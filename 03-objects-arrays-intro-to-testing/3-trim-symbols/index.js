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

  let result = '';
  let currentSymbol = null;
  let count = 0;

  for (let i = 0; i < string.length; i++) {
    const symbol = string[i];

    if (symbol === currentSymbol) {
      count++;
    } else {
      if (currentSymbol !== null) {
        result += currentSymbol.repeat(Math.min(count, size));
      }
      currentSymbol = symbol;
      count = 1;
    }
  }

  if (currentSymbol !== null) {
    result += currentSymbol.repeat(Math.min(count, size));
  }


  return result;
}