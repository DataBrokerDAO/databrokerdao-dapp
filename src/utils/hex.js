const HEX_PREFIX = '0x';

export function isHexPrefixed(valueToCheck) {
  return valueToCheck.substring(0, 2) === HEX_PREFIX;
}

export function addHexPrefix(fromValue) {
  return isHexPrefixed(fromValue) ? fromValue : HEX_PREFIX + fromValue;
}

export function stripHexPrefix(fromValue) {
  return isHexPrefixed(fromValue) ? fromValue.slice(2) : fromValue;
}
