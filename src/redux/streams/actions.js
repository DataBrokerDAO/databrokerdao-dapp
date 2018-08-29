import each from 'lodash/each';
import find from 'lodash/find';
import map from 'lodash/map';
import axios from '../../utils/axios';
import { fetchSensors } from '../../api/sensors';
import {
  dtxApproval,
  prepareDtxSpendFromSensorRegistry,
  sensorChallenge
} from '../../api/util';

const APIKey = 'AIzaSyBv4e2Uj5ZFp82G8QXKfYv7Ea3YutD4eTg';

export const STREAMS_TYPES = {
  FETCH_ERROR: 'FETCH_ERROR',
  FETCH_STREAMS: 'FETCH_STREAMS',
  FETCHING_STREAMS: 'FETCHING_STREAMS',
  FETCH_STREAM: 'FETCH_STREAM',
  FETCH_LANDING_STREAMS: 'FETCH_LANDING_STREAMS',
  FETCH_AVAILABLE_STREAM_TYPES: 'FETCH_AVAILABLE_STREAM_TYPES',
  UPDATED_FILTER: 'UPDATED_FILTER',
  UPDATED_MAP: 'UPDATED_MAP',
  FETCH_STREAM_COUNTER: 'FETCH_STREAM_COUNTER',
  CHALLENGING_STREAM: 'CHALLENGING_STREAM',
  FETCH_NEARBY_STREAMS: 'FETCH_NEARBY_STREAMS',
  FETCHING_NEARBY_STREAMS: 'FETCHING_NEARBY_STREAMS',
  FETCH_CHALLENGES: 'FETCH_CHALLENGES',
  FETCHING_CHALLENGES: 'FETCHING_CHALLENGES',
  FETCH_FORMATTED_ADDRESS: 'FETCH_FORMATTED_ADDRESS', //Address in stream details
  FETCH_FILTER_ADDRESS: 'FETCH_FILTER_ADDRESS' //Address (city) in location filter
};

const unAuthenticatedAxiosClient = axios(null, true, true);

function fetchFilterAddress(dispatch, lat, lng) {
  //Geocode map center to set value of location filter (so e.g. "Kessel-Lo" shows up when moving the map to Kessel-Lo)
  const latlng = `${lat},${lng}`;
  unAuthenticatedAxiosClient
    .get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}&key=${APIKey}&result_type=locality`
    )
    .then(response => {
      const filterAddress = response.data.results[0]
        ? response.data.results[0].formatted_address
        : 'Unkown address';

      dispatch({
        type: STREAMS_TYPES.FETCH_FILTER_ADDRESS,
        filterAddress
      });
    });
}

function getGeolocationByAddress(address) {
  return unAuthenticatedAxiosClient
    .get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${APIKey}&result_type=locality`
    )
    .then(({ data }) => data.results.shift().geometry.location);
}

export const STREAMS_ACTIONS = {
  fetchStreams: (_filter, _lat, _lng, _distance) => {
    return (dispatch, getState) => {
      const state = getState();

      dispatch({
        type: STREAMS_TYPES.FETCHING_STREAMS,
        value: true
      });

      let filterUrlQuery = '';

      //Filter on type
      const filter = _filter ? _filter : state.streams.filter;
      if (filter.types && filter.types.length === 0)
        filterUrlQuery = `item.type=none`;
      else if (filter.types && filter.types.length === 1)
        filterUrlQuery = `item.type=${filter.types[0]}`;
      else
        filterUrlQuery = map(filter.types, type => {
          return `item.type[]=${type}`;
        }).join('&');

      if (_filter) {
        dispatch({
          type: STREAMS_TYPES.UPDATED_FILTER,
          filter //ES6 syntax sugar
        });
      }

      //Only get streams near certain point
      if (_lat && _lng && _distance) {
        filterUrlQuery += `&near=${_lng},${_lat},${_distance}`;
        dispatch({
          type: STREAMS_TYPES.UPDATED_MAP,
          map: {
            ...state.map,
            distance: _distance,
            lat: _lat,
            lng: _lng
          }
        });
      } else {
        // Get from Redux state
        const distance = state.streams.map.distance;
        const lat = state.streams.map.lat;
        const lng = state.streams.map.lng;

        filterUrlQuery += `&near=${lng},${lat},${distance}`;
      }

      const limit = 5000;

      const anonymousAxiosClient = axios(null, true);
      //const response = JSON.parse(EXAMPLE_STREAMS_API_RESPONSE);
      const fetchStreamCounter = state.streams.fetchStreamCounter + 1;

      //Counter to keep track of calls so when response arrives we can take the latest
      (counter => {
        fetchSensors(anonymousAxiosClient, {
          limit,
          filterUrlQuery
        })
          .then(response => {
            if (counter !== getState().streams.fetchStreamCounter) {
              return;
            }
            const parsedResponse = {};
            each(response.data.items, item => {
              //Temporary filter out streams at same coordinates (should be supported in UI in future)
              const itemAtSameCoordinates = find(parsedResponse, parsedItem => {
                return (
                  parsedItem.geometry.coordinates[0] ===
                    item.geo.coordinates[1] &&
                  parsedItem.geometry.coordinates[1] === item.geo.coordinates[0]
                );
              });

              if (!itemAtSameCoordinates) {
                parsedResponse[item.key] = {
                  key: item.key,
                  name: item.name,
                  type: item.type,
                  price: item.price,
                  updateinterval: item.updateinterval,
                  stake: item.stake,
                  example: item.example,
                  geometry: {
                    type: 'Point',
                    coordinates: [
                      item.geo.coordinates[1],
                      item.geo.coordinates[0]
                    ]
                  },
                  owner: item.owner,
                  numberofchallenges: item.numberofchallenges,
                  challengesstake: item.challengesStake
                };
              }
            });
            dispatch({
              type: STREAMS_TYPES.FETCH_STREAMS,
              streams: parsedResponse
            });
          })
          .catch(error => {
            dispatch({
              type: STREAMS_TYPES.FETCH_ERROR
            });
          });
      })(fetchStreamCounter);
      dispatch({
        type: STREAMS_TYPES.FETCH_STREAM_COUNTER,
        value: fetchStreamCounter
      });
    };
  },
  fetchStream: (dispatch, streamKey) => {
    return (dispatch, getState) => {
      dispatch({
        type: STREAMS_TYPES.FETCHING_NEARBY_STREAMS,
        value: true
      });
      dispatch({
        type: STREAMS_TYPES.FETCHING_CHALLENGES,
        value: true
      });

      const anonymousAxiosClient = axios(null, true);
      anonymousAxiosClient
        .get(`/sensor/${streamKey}?abi=false`)
        .then(response => {
          let parsedResponse = null;
          if (response.status === 200) {
            parsedResponse = {
              key: response.data.contractAddress,
              name: response.data.name,
              type: response.data.type,
              price: response.data.price,
              updateinterval: response.data.updateinterval,
              stake: response.data.stake,
              example: response.data.example,
              geometry: {
                type: 'Point',
                coordinates: [
                  response.data.geo.coordinates[1],
                  response.data.geo.coordinates[0]
                ]
              },
              owner: response.data.owner,
              numberofchallenges: response.data.numberOfChallenges,
              challengesstake: response.data.challengesStake
            };
          } else {
            parsedResponse = {};
          }

          dispatch({
            type: STREAMS_TYPES.FETCH_STREAM,
            stream: parsedResponse
          });

          // Get nearby streams
          const urlParametersNearbyStreams = `limit=20&item.type=${
            parsedResponse.type
          }&near=${parsedResponse.geometry.coordinates[1]},${
            parsedResponse.geometry.coordinates[0]
          },500&sort=item.stake`;
          const anonymousAxiosClient = axios(null, true);
          anonymousAxiosClient
            .get(`/sensorregistry/list?${urlParametersNearbyStreams}`)
            .then(response => {
              let parsedResponse = [];
              each(response.data.items, item => {
                //The stream itself is not a similar nearby stream
                if (item.key === streamKey) return;

                parsedResponse.push({
                  key: item.contractAddress,
                  name: item.name,
                  type: item.type,
                  price: item.price,
                  updateinterval: item.updateinterval,
                  stake: item.stake,
                  example: item.example,
                  geometry: {
                    type: 'Point',
                    coordinates: [
                      item.geo.coordinates[1],
                      item.geo.coordinates[0]
                    ]
                  },
                  owner: item.owner,
                  challenges: item.numberOfChallenges,
                  challengesstake: item.challengesStake
                });
              });

              dispatch({
                type: STREAMS_TYPES.FETCH_NEARBY_STREAMS,
                streams: parsedResponse
              });
            });

          //Get challenges
          const urlParametersChallenges = `listing=${streamKey}`;
          anonymousAxiosClient
            .get(`/challengeregistry/list?listing=${urlParametersChallenges}`)
            .then(response => {
              console.log(response);
              const parsedResponse = [];

              dispatch({
                type: STREAMS_TYPES.FETCH_CHALLENGES,
                challenges: parsedResponse
              });
            });

          //Get formatted address
          if (parsedResponse.geometry) {
            const latlng = `${parsedResponse.geometry.coordinates[0]},${
              parsedResponse.geometry.coordinates[1]
            }`;
            const unAuthenticatedAxiosClient = axios(null, true, true);
            unAuthenticatedAxiosClient
              .get(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}&key=${APIKey}&result_type=street_address`
              )
              .then(response => {
                const formattedAddress = response.data.results[0]
                  ? response.data.results[0].formatted_address
                  : 'Unkown address';

                dispatch({
                  type: STREAMS_TYPES.FETCH_FORMATTED_ADDRESS,
                  formattedAddress: formattedAddress
                });
              });
          }
        })
        .catch(error => {
          console.log(error);
        });
    };
  },
  fetchLandingStreams: () => {
    return (dispatch, getState) => {
      const anonymousAxiosClient = axios(null, true);
      anonymousAxiosClient
        .get(
          `/sensorregistry/list?limit=100&item.type[]=temperature&item.type[]=humidity&item.type[]=PM25&item.type[]=PM10&near=4.700518,50.879844,4000`
        )
        .then(response => {
          const parsedResponse = {};
          each(response.data.items, item => {
            const itemAtSameCoordinates = find(parsedResponse, parsedItem => {
              return (
                parsedItem.geometry.coordinates[0] ===
                  item.geo.coordinates[1] &&
                parsedItem.geometry.coordinates[1] === item.geo.coordinates[0]
              );
            });

            if (!itemAtSameCoordinates) {
              parsedResponse[item.key] = {
                key: item.contractAddress,
                name: item.name,
                type: item.type,
                price: item.price,
                stake: item.stake,
                example: item.example,
                geometry: {
                  type: 'Point',
                  coordinates: [
                    item.geo.coordinates[1],
                    item.geo.coordinates[0]
                  ]
                }
              };
            }
          });

          dispatch({
            type: STREAMS_TYPES.FETCH_LANDING_STREAMS,
            streams: parsedResponse
          });
        })
        .catch(error => {
          console.log(error);
        });
    };
  },
  fetchAvailableStreamTypes: () => {
    return (dispatch, getState) => {
      dispatch({
        type: STREAMS_TYPES.FETCH_AVAILABLE_STREAM_TYPES,
        availableStreamTypes: {
          temperature: {
            id: 'temperature',
            name: 'Temperature'
          },
          humidity: {
            id: 'humidity',
            name: 'Humidity'
          },
          PM10: {
            id: 'PM10',
            name: 'PM10'
          },
          PM25: {
            id: 'PM25',
            name: 'PM25'
          }
        }
      });
    };
  },
  updateFilter: filter => {
    //Used by landing page
    return (dispatch, getState) => {
      dispatch({
        type: STREAMS_TYPES.UPDATED_FILTER,
        filter //ES6 syntax sugar
      });

      STREAMS_ACTIONS.fetchStreams(dispatch, filter);
    };
  },
  setCenter: ({ lat, lng, address }) => {
    return async (dispatch, getState) => {
      if (address) {
        const res = await getGeolocationByAddress(address);
        lat = res.lat;
        lng = res.lng;
      }

      if (lat && lng) {
        const {
          streams: { map }
        } = getState();
        const newMap = { ...map, lat, lng };

        dispatch({
          type: STREAMS_TYPES.UPDATED_MAP,
          map: newMap
        });

        fetchFilterAddress(dispatch, lat, lng);
      }
    };
  },
  updateMap: map => {
    return (dispatch, getState) => {
      dispatch({
        type: STREAMS_TYPES.UPDATED_MAP,
        map
      });

      fetchFilterAddress(dispatch, map.lat, map.lng);
    };
  },
  setFilterAddress: filterAddress => {
    return (dispatch, getState) => {
      dispatch({
        type: STREAMS_TYPES.FETCH_FILTER_ADDRESS,
        filterAddress
      });
    };
  },
  challengeStream: (stream, reason, amount) => {
    return (dispatch, getState) => {
      dispatch({
        type: STREAMS_TYPES.CHALLENGING_STREAM,
        value: true
      });

      const metadata = { data: { reason } };
      prepareDtxSpendFromSensorRegistry(metadata).then(async responses => {
        const deployedTokenContractAddress = responses[0];
        const spenderAddress = responses[1];
        const metadataHash = responses[2];

        try {
          await dtxApproval(
            deployedTokenContractAddress,
            spenderAddress,
            amount
          );

          await sensorChallenge(stream.key, amount, metadataHash);

          dispatch({
            type: STREAMS_TYPES.CHALLENGING_STREAM,
            value: false
          });
        } catch (error) {
          console.log(error);
        }
      });
    };
  }
};
