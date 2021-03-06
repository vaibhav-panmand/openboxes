/* eslint-disable no-console */
import _ from 'lodash';
import axios from 'axios';
import Alert from 'react-s-alert';

const justRejectRequestError = error => Promise.reject(error);

const apiClient = axios.create({});

export function parseResponse(data) {
  if (_.isArray(data)) {
    return _.map(data, value => (parseResponse(value)));
  }

  if (_.isPlainObject(data)) {
    const obj = {};
    _.forEach(data, (value, key) => { _.set(obj, key, parseResponse(value)); });
    return obj;
  }

  return data;
}

export function flattenRequest(data) {
  if (_.isArray(data)) {
    return _.map(data, value => flattenRequest(value));
  }

  if (_.isPlainObject(data)) {
    const obj = {};

    _.forEach(data, (value, key) => {
      const flattenedVal = flattenRequest(value);

      if (_.isPlainObject(flattenedVal)) {
        _.forEach(flattenedVal, (childVal, childKey) => { obj[`${key}.${childKey}`] = childVal; });
      } else {
        obj[key] = flattenedVal;
      }
    });

    return obj;
  }

  return data === null || data === undefined ? '' : data;
}

const handleSuccess = response => response;

const handleError = (error) => {
  switch (error.response.status) {
    case 400:
      Alert.error(`<div>Bad request.</br>${_.get(error, 'response.data.errorMessage', '')}</div></br>
        <div>
          ${_.map(error.response.data.data, (item) => {
    let message = '';
    if (item.defaultMessage) {
      message += `${item.defaultMessage}</br>`;
    }
    if (item.field && item.rejectedValue) {
      message += `Field: "${item.field}" with value: ${item.rejectedValue}</br>`;
    }
    return `<span>${message}</span>`;
  })}
        </div>`);
      break;
    case 401:
      Alert.error(`Unauthorized.</br>${_.get(error, 'response.data.errorMessage', '')}`, {
        onClose: () => {
          window.location.reload();
        },
      });
      break;
    case 403:
      Alert.error(`Access denied.</br>${_.get(error, 'response.data.errorMessage', '')}`);
      break;
    case 404:
      Alert.error(`Not found.</br>${_.get(error, 'response.data.errorMessage', '')}`);
      break;
    case 500:
      Alert.error(`Internal server error.</br>${_.get(error, 'response.data.errorMessage', '')}`);
      break;
    default: {
      Alert.error(`${error}</br>${_.get(error, 'response.data.errorMessage', '')}`);
    }
  }
  return Promise.reject(error);
};

apiClient.interceptors.response.use(handleSuccess, handleError);
apiClient.interceptors.request.use(config => config, justRejectRequestError);

export default apiClient;
