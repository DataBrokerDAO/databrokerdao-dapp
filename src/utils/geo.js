import axios from './axios';

const APIKey = 'AIzaSyBv4e2Uj5ZFp82G8QXKfYv7Ea3YutD4eTg';

export async function fetchStreetAddress(lat, lng) {
  const unAuthenticatedAxiosClient = axios(false, true, true);
  const latlng = `${lat},${lng}`;

  const response = await unAuthenticatedAxiosClient.get(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}&key=${APIKey}&result_type=street_address`
  );

  const streetAddress = response.data.results[0]
    ? response.data.results[0].formatted_address
    : 'Unkown address';

  return streetAddress;
}

export async function fetchLocation(lat, lng) {
  const unAuthenticatedAxiosClient = axios(false, true, true);
  const latlng = `${lat},${lng}`;

  const response = await unAuthenticatedAxiosClient.get(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}&key=${APIKey}&result_type=locality`
  );

  const location = response.data.results[0]
    ? response.data.results[0].formatted_address
    : 'Unkown address';

  return location;
}

export async function getGeolocationByAddress(address) {
  const unAuthenticatedAxiosClient = axios(false, true, true);
  const response = await unAuthenticatedAxiosClient.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${APIKey}&result_type=locality`
  );

  const geoLocation = response.data.results.shift().geometry.location;
  return geoLocation;
}
