import each from 'lodash/each';
import find from 'lodash/find';
import map from 'lodash/map';
import axios from '../../utils/axios';
import { fetchSensors, fetchSensor, parseStream } from '../../api/sensors';

import { ERROR_TYPES } from '../errors/actions';
import { fetchChallenges } from '../../api/challenges';
import {
  fetchLocation,
  getGeolocationByAddress,
  fetchStreetAddress,
} from '../../utils/geo';

export const STREAMS_TYPES = {
  FETCH_ERROR: 'FETCH_ERROR',

  // DiscoveryMap
  FETCH_STREAMS: 'FETCH_STREAMS',
  FETCH_STREAM_COUNTER: 'FETCH_STREAM_COUNTER',
  UPDATED_MAP: 'UPDATED_MAP',

  // LandingMap
  FETCH_LANDING_STREAMS: 'FETCH_LANDING_STREAMS',

  // Stream details
  FETCHING_STREAM: 'FETCHING_STREAM',
  FETCHING_STREAM_ERROR: 'FETCHING_STREAM_ERROR',
  FETCH_NEARBY_STREAMS: 'FETCH_NEARBY_STREAMS',
  FETCHING_NEARBY_STREAMS: 'FETCHING_NEARBY_STREAMS',

  // Filter
  UPDATED_FILTER: 'UPDATED_FILTER',
  FETCHING_STREAMS: 'FETCHING_STREAMS',
  FETCH_AVAILABLE_STREAM_TYPES: 'FETCH_AVAILABLE_STREAM_TYPES',
  FETCH_FORMATTED_ADDRESS: 'FETCH_FORMATTED_ADDRESS', //Address in stream details
  FETCH_FILTER_ADDRESS: 'FETCH_FILTER_ADDRESS', //Address (city) in location filter
};

export const STREAMS_ACTIONS = {
  fetchStreams: (_filter, _lat, _lng, _distance) => {
    return (dispatch, getState) => {
      const state = getState();

      dispatch({
        type: STREAMS_TYPES.FETCHING_STREAMS,
        value: true,
      });

      const limit = 5000;
      const filterUrlQuery = buildFilterQuery(
        dispatch,
        state,
        _filter,
        _lat,
        _lng,
        _distance
      );

      const anonymousAxiosClient = axios(false, true);
      const fetchStreamCounter = state.streams.fetchStreamCounter + 1;

      //Counter to keep track of calls so when response arrives we can take the latest
      (counter => {
        fetchSensors(anonymousAxiosClient, {
          limit,
          filterUrlQuery,
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
                parsedResponse[item.contractAddress] = {
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
                      item.geo.coordinates[0],
                    ],
                  },
                  owner: item.owner,
                  numberofchallenges: item.numberofchallenges,
                  challengesstake: item.challengesStake,
                };
              }
            });

            dispatch({
              type: STREAMS_TYPES.FETCH_STREAMS,
              streams: parsedResponse,
            });
          })
          .catch(error => {
            if (error && error.response && error.response.status === 401) {
              dispatch({
                type: ERROR_TYPES.AUTHENTICATION_ERROR,
                error,
              });
            }
            dispatch({
              type: STREAMS_TYPES.FETCH_ERROR,
            });
          });
      })(fetchStreamCounter);
      dispatch({
        type: STREAMS_TYPES.FETCH_STREAM_COUNTER,
        value: fetchStreamCounter,
      });
    };
  },
  fetchStream: (dispatch, stream) => {
    return async (dispatch, getState) => {
      try {
        dispatch({
          type: STREAMS_TYPES.FETCHING_STREAM,
          value: true,
        });

        const anonymousAxiosClient = axios(null, true);

        // Get the stream
        let response = await fetchSensor(anonymousAxiosClient, stream);
        let parsedStream = response.data.sensorid
          ? parseStream(response.data)
          : {};

        // Get the challenges
        const urlParametersChallenges = `listing=~${stream}`;
        response = await fetchChallenges(
          anonymousAxiosClient,
          urlParametersChallenges
        );
        const challenges = response.data.items;
        parsedStream.challengeslist = challenges;

        dispatch({
          type: STREAMS_TYPES.FETCHING_STREAM,
          value: false,
          stream: parsedStream,
        });

        // Get nearby streams
        dispatch({
          type: STREAMS_TYPES.FETCHING_NEARBY_STREAMS,
          value: true,
        });

        const urlParametersNearbyStreams = buildNearbyQuery(parsedStream);
        response = await anonymousAxiosClient.get(
          `/sensorregistry/list?${urlParametersNearbyStreams}`
        );
        let parsedResponse = [];
        each(response.data.items, item => {
          if (item.key === stream) return; // Skip the stream itself
          parsedResponse.push(parseStream(item));
        });
        dispatch({
          type: STREAMS_TYPES.FETCH_NEARBY_STREAMS,
          streams: parsedResponse,
        });

        //Get formatted address
        if (parsedStream.geometry) {
          const lat = parsedStream.geometry.coordinates[0];
          const lng = parsedStream.geometry.coordinates[1];
          const streetAddress = await fetchStreetAddress(lat, lng);
          dispatch({
            type: STREAMS_TYPES.FETCH_FORMATTED_ADDRESS,
            formattedAddress: streetAddress,
          });
        }
      } catch (error) {
        if (error && error.response && error.response.status === 401) {
          dispatch({
            type: ERROR_TYPES.AUTHENTICATION_ERROR,
            error,
          });
        }
        dispatch({
          type: STREAMS_TYPES.FETCHING_STREAM_ERROR,
          error,
        });
        console.log(error);
      }
    };
  },
  fetchLandingStreams: () => {
    return (dispatch, getState) => {
      const anonymousAxiosClient = axios(null, true);
      anonymousAxiosClient
        .get(
          `/sensorregistry/list?limit=100&type[]=temperature&type[]=humidity&type[]=PM25&type[]=PM10`
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
                    item.geo.coordinates[0],
                  ],
                },
              };
            }
          });

          dispatch({
            type: STREAMS_TYPES.FETCH_LANDING_STREAMS,
            streams: parsedResponse,
          });
        })
        .catch(error => {
          if (error && error.response && error.response.status === 401) {
            dispatch({
              type: ERROR_TYPES.AUTHENTICATION_ERROR,
              error,
            });
          }
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
            name: 'Temperature',
          },
          humidity: {
            id: 'humidity',
            name: 'Humidity',
          },
          PM10: {
            id: 'PM10',
            name: 'PM10',
          },
          PM25: {
            id: 'PM25',
            name: 'PM25',
          },
        },
      });
    };
  },
  updateFilter: filter => {
    return (dispatch, getState) => {
      dispatch({
        type: STREAMS_TYPES.UPDATED_FILTER,
        filter,
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
          streams: { map },
        } = getState();
        const newMap = { ...map, lat, lng };

        dispatch({
          type: STREAMS_TYPES.UPDATED_MAP,
          map: newMap,
        });

        const filterAddress = await fetchLocation(lat, lng);
        dispatch({
          type: STREAMS_TYPES.FETCH_FILTER_ADDRESS,
          filterAddress,
        });
      }
    };
  },
  updateMap: map => {
    return async (dispatch, getState) => {
      dispatch({
        type: STREAMS_TYPES.UPDATED_MAP,
        map,
      });

      const filterAddress = await fetchLocation(map.lat, map.lng);
      dispatch({
        type: STREAMS_TYPES.FETCH_FILTER_ADDRESS,
        filterAddress,
      });
    };
  },
  setFilterAddress: filterAddress => {
    return (dispatch, getState) => {
      dispatch({
        type: STREAMS_TYPES.FETCH_FILTER_ADDRESS,
        filterAddress,
      });
    };
  },
};

function buildNearbyQuery(stream) {
  return `limit=20&type=${stream.type}&sort=stake`;
}

function buildFilterQuery(dispatch, state, _filter, _lat, _lng, _distance) {
  let filterUrlQuery = '';

  //Filter on type
  const filter = _filter ? _filter : state.streams.filter;
  if (filter.types && filter.types.length === 0) filterUrlQuery = `type=none`;
  else if (filter.types && filter.types.length === 1)
    filterUrlQuery = `type=${filter.types[0]}`;
  else
    filterUrlQuery = map(filter.types, type => {
      return `type[]=${type}`;
    }).join('&');

  if (_filter) {
    dispatch({
      type: STREAMS_TYPES.UPDATED_FILTER,
      filter, //ES6 syntax sugar
    });
  }

  //Only get streams near certain point
  if (_lat && _lng && _distance) {
    // filterUrlQuery += `&near=${_lng},${_lat},${_distance}`;
    dispatch({
      type: STREAMS_TYPES.UPDATED_MAP,
      map: {
        ...state.map,
        distance: _distance,
        lat: _lat,
        lng: _lng,
      },
    });
  } else {
    // Get from Redux state
    const lat = state.streams.map.lat;
    const lng = state.streams.map.lng;

    filterUrlQuery += `&near=${lng},${lat}`;
  }

  return filterUrlQuery;
}
