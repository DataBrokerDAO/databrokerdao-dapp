import React, { Component } from 'react';
import styled from 'styled-components';
import { Button } from 'react-md';

export default class TitleCTAButton extends Component {
  render() {
    const StyledButton = styled(Button)`
      margin-left: 10px;
      margin-top: 10px;
      font-size: 13px;

      @media (max-width: ${props => props.theme.mobileBreakpoint}) {
        margin-top: 8px;
        margin-bottom: 4px;
        font-size: 12px;
      }
    `;

    return (
      <StyledButton
        flat
        primary
        swapTheming
        onClick={event => this.props.onClick(event)}
        disabled={this.props.disabled}
        className={this.props.disabled ? 'disabled-button' : ''}
      >
        {this.props.children}
      </StyledButton>
    );
  }
}
