import axios from 'axios';

/**
 * @description Get http request
 * @param {String} url
 * @param {Object|null} query
 * @param {Object|null} headers
 */
const apiGet = ({ url, query = null, headers = null }) => {
  const queryString = query ? Object.keys(query).map(item => `${item}=${query[item]}`).join('&') : '';

  const configs = {};
  if (headers) {
    configs.headers = headers;
  }

  return axios.get(
    url + (queryString ? `?${queryString}` : ''),
    {
      headers,
    }
  )
    .then(res => res.data);
}

export {
  apiGet,
}
