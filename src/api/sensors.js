import each from 'lodash/each';

export function fetchSensorMeta(authenticatedAxiosClient, sensor, owner) {
  return Promise.all([
    new Promise((resolve, reject) => {
      authenticatedAxiosClient
        .get(
          `purchaseregistry/list?item.sensor=~${sensor}&item.purchaser=~${owner}`
        )
        .then(resolve)
        .catch(reject);
    }),
    new Promise((resolve, reject) => {
      authenticatedAxiosClient
        .get(
          `sensorregistry/list?item.owner=~${owner}&item.contractAddress=~${sensor}`
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
