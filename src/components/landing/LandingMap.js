import React, { Component } from 'react';
import { withScriptjs, withGoogleMap, GoogleMap } from 'react-google-maps';
import values from 'lodash/values';
import sortBy from 'lodash/sortBy';
import map from 'lodash/map';
import { connect } from 'react-redux';
import supercluster from 'supercluster';

import LandingMapMarker from './LandingMapMarker';
import { STREAMS_ACTIONS } from '../../redux/streams/actions';
import Cluster from '../generic/Cluster';
import { USER_ACTIONS } from '../../redux/user/actions';
import { styles } from '../generic/MapStyles';
import { MAP_ACTIONS } from '../../redux/map/actions';

class LandingMap extends Component {
  componentDidMount() {
    const script = document.createElement('script');

    script.src =
      'https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=places&key=AIzaSyBv4e2Uj5ZFp82G8QXKfYv7Ea3YutD4eTg';
    script.async = true;
    document.body.appendChild(script);

    this.props.fetchLandingStreams();
  }

  constructor(props) {
    super(props);

    this.props.updateUserLocation();
    this.state = {
      mapRef: null
    };
  }

  onMapMounted(ref) {
    if (!this.state.mapRef && ref) {
      this.setState({ mapRef: ref });
      this.props.setGoogleApiLoaded();
    }
  }

  clusterMarkers(streams) {
    if (this.props.fetchingStreams || !this.state.mapRef) return;

    const clusterIndex = supercluster({
      radius: 160, //Cluster radius in pixels
      maxZoom: 16 //Maximum zoom level at which clusters are generated
    });
    clusterIndex.load(values(streams));
    const clusters = clusterIndex.getClusters(
      [-180, -85, 180, 85],
      this.state.mapRef.getZoom()
    ); //[westLng, southLat, eastLng, northLat], zoom

    //Sort on lat to prevent (some) z-index issues
    const sortedClusters = sortBy(clusters, cluster => {
      return cluster.properties && cluster.properties.cluster === true
        ? -cluster.geometry.coordinates[0] * 2
        : -cluster.geometry.coordinates[0];
    });

    const clusteredMarkers = map(sortedClusters, cluster => {
      if (cluster.properties && cluster.properties.cluster === true) {
        return (
          <Cluster
            key={cluster.properties.cluster_id}
            position={{
              lng: cluster.geometry.coordinates[1],
              lat: cluster.geometry.coordinates[0]
            }}
            label={cluster.properties.point_count}
          />
        );
      } else {
        return (
          <LandingMapMarker
            key={cluster.key}
            stream={cluster}
            position={{
              lng: cluster.geometry.coordinates[1],
              lat: cluster.geometry.coordinates[0]
            }}
          />
        );
      }
    });

    return clusteredMarkers;
  }

  render() {
    const clusteredMarkers = this.clusterMarkers(this.props.streams);
    //Google maps styling: https://mapstyle.withgoogle.com
    const MapOptions = {
      clickableIcons: false,
      // Disable all controls
      zoomControl: false,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
      styles
    };

    return (
      <GoogleMap
        zoom={10}
        center={this.props.userLocation}
        options={MapOptions}
        ref={ref => this.onMapMounted(ref)}
      >
        {clusteredMarkers}
      </GoogleMap>
    );
  }
}

const mapStateToProps = state => ({
  streams: state.streams.landingStreams,
  userLocation: state.user.location,
  googleApiLoaded: state.map.googleApiLoaded
});

function mapDispatchToProps(dispatch) {
  return {
    fetchLandingStreams: () => dispatch(STREAMS_ACTIONS.fetchLandingStreams()),
    updateUserLocation: () => dispatch(USER_ACTIONS.updateLocation()),
    setGoogleApiLoaded: () => dispatch(MAP_ACTIONS.setGoogleApiLoaded())
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withScriptjs(withGoogleMap(LandingMap)));
