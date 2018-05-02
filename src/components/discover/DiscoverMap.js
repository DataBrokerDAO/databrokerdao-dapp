import React, { Component } from 'react';
import { withScriptjs, withGoogleMap, GoogleMap } from "react-google-maps"
import { connect } from 'react-redux'
import _ from 'lodash';
import supercluster from 'supercluster';

import DiscoverMapMarker from './DiscoverMapMarker';
import Cluster from '../generic/Cluster';
import { STREAMS_ACTIONS } from '../../redux/streams/actions';

class DiscoverMap extends Component {
  constructor(props){
    super(props);

    this.state = {
      clusteredMarkers:null,
      openedMapMarker:null,
      mapRef:null,
      mapBounds:null,
      zoom:15,
      center:{lat: this.props.map.lat, lng: this.props.map.lng}
    };
  }

  openMapMarker(streamKey){
    if(streamKey === this.state.openedMapMarker)
      this.setState({openedMapMarker:null});
    else
      this.setState({openedMapMarker:streamKey});
  }

  zoomOnCluster(position){
    const zoom = this.state.zoom + 1;
    this.setState({zoom:zoom,center:position});
  }

  onMapMounted(ref){
    if(!this.state.mapRef && ref){
      this.setState({mapRef:ref});
    }
  }

  distanceInMeter(lat1, lon1, lat2, lon2) {
    const p = 0.017453292519943295;    // Math.PI / 180
    const c = Math.cos;
    const a = 0.5 - c((lat2 - lat1) * p)/2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))/2;

    return Math.ceil(1000 * 12742 * Math.asin(Math.sqrt(a))); // 2 * R; R = 6371 km
  }

  mapChanged(){
    const lat = this.state.mapRef.getCenter().lat();
    const lng = this.state.mapRef.getCenter().lng();
    const bounds = this.state.mapRef.getBounds();
    const distance = this.distanceInMeter(bounds.f.f,bounds.b.b,bounds.f.b,bounds.b.f)*1.25;//* 1.25 so we don't have to fetch new streams for small movement or zoom change of map
    const zoom = this.state.mapRef.getZoom();
    const center = this.state.mapRef.getCenter();

    //Only get new streams if new map bounds are further away than distance from center of last time we got streams from server
    const distanceTopLeftToPreviousCenter = this.distanceInMeter(bounds.f.f,bounds.b.b,this.props.map.lat,this.props.map.lng);
    const distanceBottomRightToPreviousCenter = this.distanceInMeter(bounds.f.b,bounds.b.f,this.props.map.lat,this.props.map.lng);
    if(distanceTopLeftToPreviousCenter > this.props.map.distance || distanceBottomRightToPreviousCenter > this.props.map.distance){
      this.props.fetchStreams(lat,lng,distance);
      this.setState({distance,center:{lat,lng},mapBounds:bounds,zoom:zoom,center:center});//TODO causes double re-renders (1. new zoom in state, 2. new streams in state), but no big problem atm
    }
    else{
      //this.forceUpdate();
      this.setState({mapBounds:bounds,zoom:zoom,center:center});
    }
  }

  boundsChanged(){
    if(this.props.map.distance === 0)
      this.mapChanged();
  }

  clusterMarkers(streams){
    if(this.props.fetchingStreams || !this.state.mapRef)
      return;

    const clusterIndex = supercluster({
        radius: 160, //Cluster radius in pixels
        maxZoom: 16 //Maximum zoom level at which clusters are generated
    });
    clusterIndex.load(_.values(streams));
    const clusters = clusterIndex.getClusters([-180, -85, 180, 85], this.state.mapRef.getZoom()); //[westLng, southLat, eastLng, northLat], zoom

    //Only render markers and clusters within 1.25 times diagonal of screen
    //So if you zoom in you don't render too many!
    //distanceInMeter(lat1, lon1, lat2, lon2) {
    const nearbyClusters = _.filter(clusters, cluster => {
      if(this.state.mapBounds){
        const distance = this.distanceInMeter(this.state.mapBounds.f.f,this.state.mapBounds.b.b,this.state.mapBounds.f.b,this.state.mapBounds.b.f) * 1.25;
        const mapCenter = this.state.mapRef.getCenter();
        const clusterDistance = this.distanceInMeter(cluster.geometry.coordinates[0],cluster.geometry.coordinates[1],mapCenter.lat(),mapCenter.lng());
        return  clusterDistance <= distance;
      }
      else{
        return true;
      }
    });

    //Sort on lat to prevent (some) z-index issues
    const sortedClusters = _.sortBy(nearbyClusters, cluster => { return (cluster.properties && cluster.properties.cluster === true)? -cluster.geometry.coordinates[0]*2:-cluster.geometry.coordinates[0]; });

    const clusteredMarkers = _.map(sortedClusters, cluster => {
      if(cluster.properties && cluster.properties.cluster === true){
        const position = { lng: cluster.geometry.coordinates[1], lat: cluster.geometry.coordinates[0] };
        return <Cluster
                  key={cluster.properties.cluster_id}
                  position={position}
                  label={cluster.properties.point_count}
                  onClickHandler={() => this.zoomOnCluster(position)}
                />
      }
      else{
        return <DiscoverMapMarker
            key={cluster.key}
            stream={cluster}
            position={{ lng: cluster.geometry.coordinates[1], lat: cluster.geometry.coordinates[0] }}
            openedMapMarker={this.state.openedMapMarker}
            onClick={(streamKey) => this.openMapMarker(streamKey)}
          />;
      }
    });

    return clusteredMarkers;
  }

  render() {
    const clusteredMarkers = this.clusterMarkers(this.props.streams);

    const MapOptions = {
      clickableIcons: false,
      minZoom: 6,
      styles:[{"elementType": "labels.icon", "stylers": [{"visibility": "off"} ] }, {"elementType": "labels.text.fill", "stylers": [{"color": "#333333"}, {"saturation": 35 }, {"lightness": 40 } ] }, {"elementType": "labels.text.stroke", "stylers": [{"color": "#ffffff"}, {"lightness": 15 }, {"visibility": "on"} ] }, {"featureType": "administrative", "elementType": "geometry.fill", "stylers": [{"color": "#fefefe"}, {"lightness": 20 } ] }, {"featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{"color": "#fefefe"}, {"lightness": 17 }, {"weight": 1.2 } ] }, {"featureType": "administrative.land_parcel", "elementType": "labels", "stylers": [{"visibility": "off"} ] }, {"featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{"color": "#b3b3b3"} ] }, {"featureType": "administrative.neighborhood", "elementType": "labels.text.fill", "stylers": [{"color": "#b3b3b3"} ] }, {"featureType": "landscape", "elementType": "geometry", "stylers": [{"color": "#f8f8f8"} ] }, {"featureType": "landscape", "elementType": "labels", "stylers": [{"color": "#cccccc"}, {"visibility": "on"} ] }, {"featureType": "landscape", "elementType": "labels.text.fill", "stylers": [{"color": "#b3b3b3"} ] }, {"featureType": "landscape", "elementType": "labels.text.stroke", "stylers": [{"color": "#ffffff"} ] }, {"featureType": "poi", "elementType": "geometry", "stylers": [{"color": "#f5f5f5"}, {"lightness": 20 } ] }, {"featureType": "poi", "elementType": "labels", "stylers": [{"color": "#4c4c4c"}, {"visibility": "off"} ] }, {"featureType": "poi", "elementType": "labels.text", "stylers": [{"color": "#4c4c4c"}, {"visibility": "on"} ] }, {"featureType": "poi", "elementType": "labels.text.fill", "stylers": [{"color": "#b3b3b3"} ] }, {"featureType": "poi", "elementType": "labels.text.stroke", "stylers": [{"color": "#ffffff"} ] }, {"featureType": "poi.business", "stylers": [{"visibility": "off"} ] }, {"featureType": "poi.park", "elementType": "geometry", "stylers": [{"color": "#cfffce"}, {"lightness": 20 } ] }, {"featureType": "road", "elementType": "labels", "stylers": [{"color": "#999999"}, {"visibility": "on"} ] }, {"featureType": "road", "elementType": "labels.icon", "stylers": [{"visibility": "off"} ] }, {"featureType": "road", "elementType": "labels.text.stroke", "stylers": [{"color": "#ffffff"} ] }, {"featureType": "road.arterial", "elementType": "geometry", "stylers": [{"color": "#ffffff"}, {"lightness": 20 } ] }, {"featureType": "road.arterial", "elementType": "labels", "stylers": [{"visibility": "on"} ] }, {"featureType": "road.arterial", "elementType": "labels.icon", "stylers": [{"visibility": "off"} ] }, {"featureType": "road.highway", "elementType": "geometry", "stylers": [{"color": "#ffffff"}, {"visibility": "on"} ] }, {"featureType": "road.highway", "elementType": "labels", "stylers": [{"visibility": "off"} ] }, {"featureType": "road.highway", "elementType": "labels.icon", "stylers": [{"visibility": "off"} ] }, {"featureType": "road.highway", "elementType": "labels.text", "stylers": [{"visibility": "on"} ] }, {"featureType": "road.local", "elementType": "geometry", "stylers": [{"color": "#ffffff"} ] }, {"featureType": "road.local", "elementType": "labels", "stylers": [{"visibility": "off"} ] }, {"featureType": "transit", "elementType": "geometry", "stylers": [{"color": "#f2f2f2"}, {"lightness": 20 } ] }, {"featureType": "water", "elementType": "geometry", "stylers": [{"color": "#b6ddff"}, {"lightness": 15 } ] }, {"featureType": "water", "elementType": "labels.text.fill", "stylers": [{"color": "#808080"} ] } ]
    };

    return (
      <GoogleMap
       zoom={this.state.zoom}
       center={this.state.center}
       options={MapOptions}
       onZoomChanged={() => this.mapChanged()}
       onDragEnd={() => this.mapChanged()}
       ref={(ref) => this.onMapMounted(ref)}
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
  map: state.streams.map
})

function mapDispatchToProps(dispatch) {
  return {
    fetchStreams: (lng,lat,distance) => dispatch(STREAMS_ACTIONS.fetchStreams(null,lng,lat,distance))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withScriptjs(withGoogleMap(DiscoverMap)))
