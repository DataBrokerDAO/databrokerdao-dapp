import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import { Card, CardText, Button, Checkbox, Paper } from 'react-md';
import { connect } from 'react-redux';

import Icon from '../generic/Icon';
import { STREAMS_ACTIONS } from '../../redux/streams/actions';

class LandingContent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      temperature: true,
      humidity: true,
      PM25: true,
      PM10: true
    };
  }

  onDiscoverButtonClicked = e => {
    //Update Redux filter
    const filters = [];
    if (this.state.temperature) filters.push('temperature');
    if (this.state.humidity) filters.push('humidity');
    if (this.state.PM25) filters.push('PM25');
    if (this.state.PM10) filters.push('PM10');

    this.props.updateFilter({
      location: this.props.userLocation,
      types: filters
    });

    this.props.history.push('/streams');
  };

  toggleFilterType(type) {
    const updatedState = this.state;

    switch (type) {
      case 'temperature': {
        updatedState.temperature = !this.state.temperature;
        break;
      }
      case 'humidity': {
        updatedState.humidity = !this.state.humidity;
        break;
      }
      case 'PM25': {
        updatedState['PM25'] = !this.state['PM25'];
        break;
      }
      case 'PM10':
      default: {
        updatedState.PM10 = !this.state.PM10;
        break;
      }
    }

    this.setState(updatedState);
  }

  render() {
    const StyledCard = styled(Card)`
      width: 100%;
      max-width: 620px;
      position: relative;
      top: 120px;
      padding: 10px;

      @media (max-width: ${props => props.theme.mobileBreakpoint}) {
        max-width: calc(100% - 30px);
        padding: 0;
        top: 100px;
      }
    `;

    const StyledH1 = styled.h1`
      text-align: center;
      line-height: 1.5;
      margin-top: 20px;
      margin-bottom: 10px;

      @media (max-width: ${props => props.theme.mobileBreakpoint}) {
        margin-top: 0;
        margin-bottom: 20px;
      }
    `;

    const StyledDiscoverButton = styled(Button)`
      // margin: 0 auto;
      display: block;
    `;

    const StyledTypeButtonsContainer = styled.div`
      padding: 0 80px 20px 80px;
      display: flex;

      @media (max-width: ${props => props.theme.mobileBreakpoint}) {
        display: none;
      }
    `;

    const StyledTypeButton = styled(Paper)`
      display: flex;
      align-items: center;
      margin: 18px 10px 18px 10px;
      padding-left: 12px;
    `;

    const StyledTypeButtonLabel = styled.span`
      flex: 1;
      margin-left: 12px;
      line-height: 1;
    `;

    return (
      <div>
        <StyledCard className="md-block-centered">
          <CardText
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <StyledH1>
              Buy sensor data on the global market for local data
            </StyledH1>
            <StyledTypeButtonsContainer>
              <div style={{ flex: '1' }}>
                <StyledTypeButton zDepth={1}>
                  <Icon icon="temperature" />
                  <StyledTypeButtonLabel>Temperature</StyledTypeButtonLabel>
                  <Checkbox
                    id="temperature"
                    value="temperature"
                    name="temperature"
                    aria-label="temperature"
                    style={{ display: 'inline' }}
                    checked={this.state.temperature}
                    onChange={() => this.toggleFilterType('temperature')}
                  />
                </StyledTypeButton>
                <StyledTypeButton zDepth={1}>
                  <Icon icon="humidity" />
                  <StyledTypeButtonLabel>Humidity</StyledTypeButtonLabel>
                  <Checkbox
                    id="humidity"
                    value="humidity"
                    name="humidity"
                    aria-label="humidity"
                    style={{ display: 'inline' }}
                    checked={this.state.humidity}
                    onChange={() => this.toggleFilterType('humidity')}
                  />
                </StyledTypeButton>
              </div>
              <div style={{ flex: '1' }}>
                <StyledTypeButton zDepth={1}>
                  <Icon icon="PM25" />
                  <StyledTypeButtonLabel>PM 2.5</StyledTypeButtonLabel>
                  <Checkbox
                    id="PM25"
                    value="PM25"
                    name="PM25"
                    aria-label="PM25"
                    style={{ display: 'inline' }}
                    checked={this.state.PM25}
                    onChange={() => this.toggleFilterType('PM25')}
                  />
                </StyledTypeButton>
                <StyledTypeButton zDepth={1}>
                  <Icon icon="PM10" />
                  <StyledTypeButtonLabel>PM 10</StyledTypeButtonLabel>
                  <Checkbox
                    id="PM10"
                    value="PM10"
                    name="PM10"
                    aria-label="PM10"
                    style={{ display: 'inline' }}
                    checked={this.state.PM10}
                    onChange={() => this.toggleFilterType('PM10')}
                  />
                </StyledTypeButton>
              </div>
            </StyledTypeButtonsContainer>
            <StyledDiscoverButton
              primary
              swapTheming
              flat
              onClick={this.onDiscoverButtonClicked.bind(this)}
            >
              Discover sensors
            </StyledDiscoverButton>
          </CardText>
        </StyledCard>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  userLocation: state.user.location
});

function mapDispatchToProps(dispatch) {
  return {
    updateFilter: filter => dispatch(STREAMS_ACTIONS.updateFilter(filter))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(LandingContent));
