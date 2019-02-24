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
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyYWRtaW5Ac2V0dGxlbWludC5jb20iLCJpYXQiOjE1NTA5MTUyMTZ9.qVmjCj_RhV-TINklrf_LrHWnmBcAQSP_9yrFfZ-FwI0';
    instance = axios.create({
      baseURL: process.env.REACT_APP_DAPI_URL,
      headers: { Authorization: anonymousJWTToken }
    });
  } else {
    instance = axios.create({
      baseURL: process.env.REACT_APP_DAPI_URL
    });
  }

  return instance;
}
