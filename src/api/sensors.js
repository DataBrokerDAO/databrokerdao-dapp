import each from 'lodash/each';
import { stripHexPrefix } from '../utils/hex';

export async function fetchSensorsBulk(axiosClient, sensors) {
  const contractAddressQueryString =
    sensors.length === 1
      ? `item.contractAddress=~${sensors[0]}`
      : sensors
          .map(sensor => `item.contractAddress[]=${stripHexPrefix(sensor)}`)
          .join('&');

  const response = await axiosClient.get(
    `sensorregistry/list?${contractAddressQueryString}`
  );
  return response.data.items;
}

export function fetchSensorMeta(axiosClient, sensors, user) {
  const sensorQueryString =
    sensors.length === 1
      ? `item.sensor=~${sensors[0]}`
      : sensors
          .map(sensor => `item.sensor[]=${stripHexPrefix(sensor)}`)
          .join('&');

  const contractAddressQueryString =
    sensors.length === 1
      ? `item.contractAddress=~${sensors[0]}`
      : sensors
          .map(sensor => `item.contractAddress[]=${stripHexPrefix(sensor)}`)
          .join('&');

  return Promise.all([
    new Promise((resolve, reject) => {
      axiosClient
        .get(
          `purchaseregistry/list?item.purchaser=~${user}&${sensorQueryString}`
        )
        .then(resolve)
        .catch(reject);
    }),
    new Promise((resolve, reject) => {
      axiosClient
        .get(
          `sensorregistry/list?item.owner=~${user}&${contractAddressQueryString}`
        )
        .then(resolve)
        .catch(reject);
    })
  ]);
}

/**
 * API
 */

/**
 * fetches all sensors, with query params.
 */
export function fetchSensors(authenticatedAxiosClient, queryParams) {
  const { limit, start = 0, sort = 'asc', filterUrlQuery } = queryParams;
  let url = `/sensorregistry/list?limit=${limit}&skip=${start}&sort=${sort}&${filterUrlQuery}&sortBy=item.stake`;
  return authenticatedAxiosClient.get(url).then(response => response);
}

/**
 * Fetches one sensor by key
 * @param {*} authenticatedAxiosClient
 * @param {*} key
 * @param {*} queryParams
 */
export function fetchSensor(authenticatedAxiosClient, key, queryParams) {
  // TODO: use query params
  let url = `/sensor/${key}?abi=false`;
  return authenticatedAxiosClient.get(url).then(response => response);
}

/**
 * PARSING
 */

/**
 * Loops through all sensors and parses them one by one
 */
export function parseDatasets(sensors) {
  const parsedSensors = {};
  each(sensors, sensor => {
    parsedSensors[sensor.key] = parseDataset(sensor);
  });
  return parsedSensors;
}

/**
 * Parses one stream
 * @param {} sensor
 */
export function parseStream(sensor) {
  return {
    key: sensor.contractAddress,
    name: sensor.name,
    type: sensor.type,
    price: sensor.price,
    updateinterval: sensor.updateinterval,
    stake: sensor.stake,
    example: sensor.example,
    geometry: {
      type: 'Point',
      coordinates: [sensor.geo.coordinates[1], sensor.geo.coordinates[0]]
    },
    owner: sensor.owner,
    numberofchallenges: sensor.numberOfChallenges,
    challengesstake: sensor.challengesStake
  };
}

/**
 * Parses one sensor
 * @param {} sensor
 */
export function parseDataset(sensor) {
  return {
    key: sensor.key || sensor.contractAddress,
    name: sensor.name,
    price: sensor.price,
    stake: sensor.stake,
    example: sensor.example,
    owner: sensor.owner,
    numberofchallenges: sensor.numberOfChallenges,
    challengesstake: sensor.challengesStake,
    category: sensor.category,
    filetype: sensor.filetype,
    description: sensor.description,
    updateinterval: sensor.updateinterval,
    sensortype: sensor.sensortype
  };
}
