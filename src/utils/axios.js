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
      }
    });
  } else if (anonymous) {
    const anonymousJWTToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRJZCI6IjViN2FiMmU0OTdhNzllMDAyNjMwMmNjNSIsImlhdCI6MTUzNjA1NTEyN30.yUFYgc4vya9R12FIYvu2KCmGPRwEFJkZDhGh1UY5msk';
    instance = axios.create({
      baseURL: process.env.REACT_APP_DAPI_URL,
      headers: { Authorization: anonymousJWTToken }
    });
  } else {
    instance = axios.create({
      baseURL: process.env.REACT_APP_DAPI_URL
    });
  }

  // instance.interceptors.response.use(
  //   response => {
  //     return response;
  //   },
  //   error => {
  //     const originalRequest = error.config;
  //     if (error.response.status === 401 && !originalRequest._retry) {
  //       console.log('RECEIVED 401');
  //     }
  //     return Promise.reject(error);
  //   }
  // );

  return instance;
}
