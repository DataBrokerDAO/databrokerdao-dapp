import React, { Component } from 'react';
import { withScriptjs, withGoogleMap, GoogleMap } from 'react-google-maps';
import { connect } from 'react-redux';
import values from 'lodash/values';
import sortBy from 'lodash/each';
import map from 'lodash/map';
import filter from 'lodash/filter';
import supercluster from 'supercluster';

import DiscoverMapMarker from './DiscoverMapMarker';
import Cluster from '../generic/Cluster';
import { STREAMS_ACTIONS } from '../../redux/streams/actions';
import { styles } from '../generic/MapStyles';
import { MAP_ACTIONS } from '../../redux/map/actions';

class DiscoverMap extends Component {
  constructor(props) {
    super(props);

    this.state = {
      clusteredMarkers: null,
      openedMapMarker: null,
      mapRef: null
    };
  }

  openMapMarker(streamKey) {
    if (streamKey === this.state.openedMapMarker)
      this.setState({ openedMapMarker: null });
    else this.setState({ openedMapMarker: streamKey });
  }

  zoomOnCluster(position) {
    const zoom = this.props.map.zoom + 1;
    const lat = position.lat;
    const lng = position.lng;
    this.props.updateMap({ ...this.props.map, lat, lng, zoom });
  }

  onMapMounted(ref) {
    if (!this.state.mapRef && ref) {
      this.setState({ mapRef: ref });
      this.props.setGoogleApiLoaded();
    }
  }

  distanceInMeter(lat1, lon1, lat2, lon2) {
    const p = 0.017453292519943295; // Math.PI / 180
    const c = Math.cos;
    const a =
      0.5 -
      c((lat2 - lat1) * p) / 2 +
      (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

    return Math.ceil(1000 * 12742 * Math.asin(Math.sqrt(a))); // 2 * R; R = 6371 km
  }

  mapChanged() {
    const lat = this.state.mapRef.getCenter().lat();
    const lng = this.state.mapRef.getCenter().lng();
    const bounds = this.state.mapRef.getBounds();
    //Distance = distance between top left and bottom right corner, so twice distance from center.
    //This means we fetch streams in a circle twice the bounds of map, in which user can pan around without having to fetch new streams from dapi
    const distance = this.distanceInMeter(
      bounds.f.f,
      bounds.b.b,
      bounds.f.b,
      bounds.b.f
    );
    const zoom = this.state.mapRef.getZoom();

    //Only get new streams if new map bounds are further away than distance from center of last time we got streams from server
    const distanceTopLeftToPreviousCenter = this.distanceInMeter(
      bounds.f.f,
      bounds.b.b,
      this.props.map.fetchLat,
      this.props.map.fetchLng
    );
    const distanceBottomRightToPreviousCenter = this.distanceInMeter(
      bounds.f.b,
      bounds.b.f,
      this.props.map.fetchLat,
      this.props.map.fetchLng
    );
    if (
      distanceTopLeftToPreviousCenter > this.props.map.distance ||
      distanceBottomRightToPreviousCenter > this.props.map.distance
    ) {
      this.props.fetchStreams(lat, lng, distance);
      this.props.updateMap({
        ...this.props.map,
        distance,
        lat,
        lng,
        zoom,
        fetchLat: lat,
        fetchLng: lng
      });
    } else {
      this.props.updateMap({ ...this.props.map, distance, lat, lng, zoom });
    }
  }

  boundsChanged() {
    if (this.props.map.distance === 0) this.mapChanged();
  }

  clusterMarkers(streams) {
    if (
      this.props.fetchingStreams ||
      !this.state.mapRef ||
      !this.state.mapRef.getBounds()
    )
      return;

    const clusterIndex = supercluster({
      radius: 160, //Cluster radius in pixels
      maxZoom: 16 //Maximum zoom level at which clusters are generated
    });
    clusterIndex.load(values(streams));
    const clusters = clusterIndex.getClusters(
      [-180, -85, 180, 85],
      this.state.mapRef.getZoom()
    ); //[westLng, southLat, eastLng, northLat], zoom

    //Only render markers and clusters within 1.25 times diagonal of screen
    //So if you zoom in you don't render streams that cannot be seen (= clipping)
    const bounds = this.state.mapRef.getBounds();
    const nearbyClusters = filter(clusters, cluster => {
      const distance =
        (this.distanceInMeter(bounds.f.f, bounds.b.b, bounds.f.b, bounds.b.f) /
          2) *
        1.25; //divide by 2 to get distance from center, then *1.25 to have slightly larger circle
      const mapCenter = this.state.mapRef.getCenter();
      const clusterDistance = this.distanceInMeter(
        cluster.geometry.coordinates[0],
        cluster.geometry.coordinates[1],
        mapCenter.lat(),
        mapCenter.lng()
      );
      return clusterDistance <= distance;
    });

    //Sort on lat to prevent (most) z-index issues
    const sortedClusters = sortBy(nearbyClusters, cluster => {
      return cluster.properties && cluster.properties.cluster === true
        ? -cluster.geometry.coordinates[0] * 2
        : -cluster.geometry.coordinates[0];
    });

    const clusteredMarkers = map(sortedClusters, cluster => {
      if (cluster.properties && cluster.properties.cluster === true) {
        const position = {
          lng: cluster.geometry.coordinates[1],
          lat: cluster.geometry.coordinates[0]
        };
        return (
          <Cluster
            key={cluster.properties.cluster_id}
            position={position}
            label={cluster.properties.point_count}
            onClickHandler={() => this.zoomOnCluster(position)}
          />
        );
      } else {
        return (
          <DiscoverMapMarker
            key={cluster.key}
            stream={cluster}
            position={{
              lng: cluster.geometry.coordinates[1],
              lat: cluster.geometry.coordinates[0]
            }}
            openedMapMarker={this.state.openedMapMarker}
            onClick={streamKey => this.openMapMarker(streamKey)}
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
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
      minZoom: 6,
      styles
    };

    return (
      <GoogleMap
        zoom={this.props.map.zoom}
        center={this.props.map}
        options={MapOptions}
        onZoomChanged={() => this.mapChanged()}
        onCenterChanged={() => this.mapChanged()}
        onDragEnd={() => this.mapChanged()}
        ref={ref => this.onMapMounted(ref)}
        onBoundsChanged={() => this.boundsChanged()}
      >
        {clusteredMarkers}
      </GoogleMap>
    );
  }
}

const mapStateToProps = state => ({
  streams: state.streams.streams,
  fetchingStreams: state.streams.fetchingStreams,
  map: state.streams.map,
  userLocation: state.user.location,
  googleApiLoaded: state.map.googleApiLoaded
});

function mapDispatchToProps(dispatch) {
  return {
    fetchStreams: (lng, lat, distance) =>
      dispatch(STREAMS_ACTIONS.fetchStreams(null, lng, lat, distance)),
    updateMap: map => dispatch(STREAMS_ACTIONS.updateMap(map)),
    setGoogleApiLoaded: () => dispatch(MAP_ACTIONS.setGoogleApiLoaded())
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withScriptjs(withGoogleMap(DiscoverMap)));
