import React, { Component } from 'react';
import { OverlayView } from 'react-google-maps';
import styled from 'styled-components';

export default class Cluster extends Component {
  render() {
    const zIndex = Math.floor(90000 - this.props.position.lat * 1000 + 10);
    const StyledOuterContainer = styled.div`
      transform: translate(-50%, -100%);
      z-index: ${zIndex};
      background-color: rgba(46, 49, 146, 0.7);
      width: 40px;
      height: 40px;
      border-radius: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    `;

    const StyledInnerContainer = styled.div`
      width: 30px;
      height: 30px;
      border-radius: 15px;
      background-color: ${props => props.theme.dbdaoPurple};
      display: flex;
      justify-content: center;
      align-items: center;
    `;

    const StyledLabel = styled.span`
      color: white;
      font-weight: 500;
      font-size: 14px;
    `;

    return (
      <OverlayView
        key={Math.random()}
        position={{
          lat: this.props.position.lat,
          lng: this.props.position.lng
        }}
        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      >
        <StyledOuterContainer onClick={this.props.onClickHandler}>
          <StyledInnerContainer>
            <StyledLabel>{this.props.label}</StyledLabel>
          </StyledInnerContainer>
        </StyledOuterContainer>
      </OverlayView>
    );
  }
}
