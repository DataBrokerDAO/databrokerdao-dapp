import each from 'lodash/each';

/**
 * API
 */

/**
 * fetches all sensors, with query params.
 */
export function fetchSensors(authenticatedAxiosClient, queryParams) {
  const { limit, start = 0, sort = 'asc', filterUrlQuery } = queryParams;
  let url = `/sensorregistry/list?limit=${limit}&skip=${start}&sort=${sort}&${filterUrlQuery}&sortBy=stake`;
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
  let url = `/sensorregistry/list/${key}`;
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
 * Parses one sensor
 * @param {} sensor
 */
export function parseDataset(sensor) {
  return {
    id: sensor._id,
    key: sensor.key,
    name: sensor.name,
    price: sensor.price,
    stake: sensor.stake,
    example: sensor.example,
    owner: sensor.owner,
    numberofchallenges: sensor.numberofchallenges,
    challengesstake: sensor.challengesstake,
    category: sensor.category,
    filetype: sensor.filetype,
    description: sensor.description,
    updateinterval: sensor.updateinterval,
    sensortype: sensor.sensortype
  };
}
