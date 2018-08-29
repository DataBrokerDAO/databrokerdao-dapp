import axios from 'axios';
import localStorage from '../localstorage';

//Note: I removed cachedToken from boilerplate, not clear what it was used for

export default function getAxios(
  jwtToken = false,
  anonymous = false,
  noAuthorization = false
) {
  let instance;

  if (noAuthorization)
    //Useful for CORS requests where authorization header is not allowed (such as google maps reverse geocoding)
    instance = axios.create({
      baseURL: process.env.REACT_APP_DAPI_URL,
      headers: {}
    });
  else if (jwtToken) {
    instance = axios.create({
      baseURL: process.env.REACT_APP_DAPI_URL,
      headers: {
        Authorization: localStorage.getItem('jwtToken')
          ? localStorage.getItem('jwtToken')
          : jwtToken
      }
    });
  } else if (anonymous) {
    const anonymousJWTToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRJZCI6IjViN2FiMmU0OTdhNzllMDAyNjMwMmNjNSIsImlhdCI6MTUzNTQ2MjQxMn0.DhFG6hGhO7VrlWCgYkqDF5VIOXyrijnjqIpCxl_xSr4';
    instance = axios.create({
      baseURL: process.env.REACT_APP_DAPI_URL,
      headers: { Authorization: anonymousJWTToken }
    });
  } else {
    instance = axios.create({
      baseURL: process.env.REACT_APP_DAPI_URL
    });
  }

  instance.interceptors.response.use(
    response => {
      return response;
    },
    error => {
      const originalRequest = error.config;
      if (error.response.status === 401 && !originalRequest._retry) {
        console.log('LOGGING OUT DUE TO 401');
        localStorage.removeItem('jwtToken');
      }
      return Promise.reject(error);
    }
  );

  return instance;
}
