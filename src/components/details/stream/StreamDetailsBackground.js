import React, { Component } from 'react';
import styled from 'styled-components';

import DetailsMap from './StreamDetailsMap';
import MapErrorBoundary from '../../generic/MapErrorBoundary';

export default class StreamDetailsBackground extends Component {
  render() {
    const mapElementsStyle = {
      height: '440px',
      width: '100%',
      position: 'absolute',
      top: '0',
      left: '0'
    };

    const StyledGradient = styled.div`
      background: linear-gradient(rgba(248, 248, 248, 0), #f8f8f8);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100px;
      margin-top: 340px;
      z-index: -1;
    `;

    const APIKey = 'AIzaSyBv4e2Uj5ZFp82G8QXKfYv7Ea3YutD4eTg';

    return (
      <div>
        <MapErrorBoundary>
          {error => {
            return (
              <DetailsMap
                googleMapURL={
                  !error.message
                    ? `https://maps.googleapis.com/maps/api/js?v=3.3.33&key=${APIKey}`
                    : `https://maps.google.cn/maps/api/js?v=3.3.33&key=${APIKey}`
                }
                loadingElement={<div style={mapElementsStyle} />}
                containerElement={
                  <div style={{ zIndex: '-1', ...mapElementsStyle }} />
                }
                mapElement={<div style={mapElementsStyle} />}
                stream={this.props.stream}
              />
            );
          }}
        </MapErrorBoundary>
        <StyledGradient />
      </div>
    );
  }
}
