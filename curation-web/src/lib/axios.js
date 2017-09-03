import axios from 'axios';
import config from '../config';

const token = localStorage.getItem('access_token');
const headers = {};

if (token) {
  headers['Authorization'] = `Token ${token}`;
}

var instance = axios.create({baseURL: config.api.url, headers})

instance
  .interceptors
  .response
  .use(function (response) {
    return response;
  }, function (error) {
    if (error.response.status == config.HTTP_Status.UNAUTHORIZE && localStorage.getItem('access_token')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('logged_user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('logged_user_role');
      window.location.href = '/login';
    }
    console.log('*** This is not called ***');
    return Promise.reject(error);
  });

export default instance