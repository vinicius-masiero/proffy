import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://m9-nb2.anonymous.mobile.exp.direct:3333'
  baseURL: 'http://192.168.0.3:3333'
});

export default api;