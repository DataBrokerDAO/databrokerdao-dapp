import React, { Component } from 'react';
import LandingMap from './LandingMap';

export default class LandingBackground extends Component {
  render() {
    const mapElementsStyle = {
      height: `100%`,
      width: '100%',
      position: 'absolute',
      top: '0',
      left: '0'
    };

    const APIKey = 'AIzaSyBv4e2Uj5ZFp82G8QXKfYv7Ea3YutD4eTg';

    return (
      <LandingMap
        googleMapURL={
          !this.props.error.message
            ? `https://maps.googleapis.com/maps/api/js?v=3.exp&key=${APIKey}`
            : `https://maps.google.cn/maps/api/js?v=3.exp&key=${APIKey}`
        }
        loadingElement={<div style={mapElementsStyle} />}
        containerElement={<div style={{ zIndex: '-1', ...mapElementsStyle }} />}
        mapElement={<div style={mapElementsStyle} />}
      />
    );
  }
}
