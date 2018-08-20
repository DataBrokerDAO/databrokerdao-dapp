import axios from 'axios';
import localStorage from '../localstorage';

//Note: I removed cachedToken from boilerplate, not clear what it was used for

export default function getAxios(
  jwtToken = false,
  anonymous = false,
  noAuthorization = false
) {
  if (noAuthorization)
    //Useful for CORS requests where authorization header is not allowed (such as google maps reverse geocoding)
    return axios.create({
      baseURL: process.env.REACT_APP_DAPI_URL,
      headers: {}
    });
  else if (localStorage.getItem('jwtToken') || jwtToken) {
    return axios.create({
      baseURL: process.env.REACT_APP_DAPI_URL,
      headers: {
        Authorization: localStorage.getItem('jwtToken')
          ? localStorage.getItem('jwtToken')
          : jwtToken
      }
    });
  } else if (anonymous) {
    const anonymousJWTToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRJZCI6IjViNzZhNmU4ODFkZmNlNzVhMzVjOGJkNSIsImlhdCI6MTUzNDc0NzA5MywiZXhwIjoxNTM0ODMzNDkzfQ.tBYLwKlrdsESZjWygXCtZt2qxeljKk50NVv5kOeHpcQ';
    return axios.create({
      baseURL: process.env.REACT_APP_DAPI_URL,
      headers: { Authorization: anonymousJWTToken }
    });
  }

  return axios.create({
    baseURL: process.env.REACT_APP_DAPI_URL
  });
}
