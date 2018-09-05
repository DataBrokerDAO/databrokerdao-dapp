import React, { Component } from 'react';
import { withScriptjs, withGoogleMap, GoogleMap } from 'react-google-maps';
import LandingMapMarker from '../../landing/LandingMapMarker';
import { styles } from '../../generic/MapStyles';

export default withScriptjs(
  withGoogleMap(
    class StreamDetailsMap extends Component {
      render() {
        const MapOptions = {
          clickableIcons: false,
          zoomControl: false,
          streetViewControl: false,
          styles
        };

        return (
          <GoogleMap
            defaultZoom={10}
            center={{
              lng: this.props.stream.geometry.coordinates[1],
              lat: this.props.stream.geometry.coordinates[0]
            }}
            options={MapOptions}
          >
            <LandingMapMarker
              stream={this.props.stream}
              position={{
                lng: this.props.stream.geometry.coordinates[1],
                lat: this.props.stream.geometry.coordinates[0]
              }}
            />
          </GoogleMap>
        );
      }
    }
  )
);
