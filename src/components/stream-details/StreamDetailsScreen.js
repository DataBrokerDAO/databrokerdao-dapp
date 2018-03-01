import React, { Component } from 'react';
import { Button, FontIcon } from 'react-md';
import styled from 'styled-components';
import { connect } from 'react-redux'

import Toolbar from '../generic/Toolbar';
import CenteredCard from '../generic/CenteredCard';
import CardContent from '../generic/CardContent';
import ToolbarSpacer from '../generic/ToolbarSpacer';
import { STREAMS_ACTIONS } from '../../redux/streams/actions';
import Icon from '../generic/icons';

class StreamDetailsScreen extends Component {
  componentDidMount() {
    //In case this stream was not in state yet, load it (in case it was: refresh to get latest version)
    this.props.fetchStream();
  }

  render() {
    const StyledContentContainer = styled.div`
      display:flex;
      padding:15px;
    `;

    const StyledContentCell = styled.div`
      margin:15px;
      flex:1;
    `;

    const StyledSensorAttribute = styled.p`
      font-weight: 700;
      font-size: 18px;
      display: flex;
      align-content: center;
      margin-bottom: 20px;
    `;

    const StyledSensorNameCardContent = styled.div`
      display:flex;
      justify-content:space-between;
    `;

    const StyledAttributeLabel = styled.span`
      margin-left: 12px;
    `;

    const StyledTypeIcon = styled.data`
      opacity: 0.54;
      width: 20px;
      height: 20px;
    `;

    const { stream, availableStreamTypes } = this.props;

    if(!stream || !availableStreamTypes)
      return(
        <div>
          <Toolbar showTabs={true} />
          <ToolbarSpacer/>
          <CenteredCard>
            <CardContent>
              <StyledSensorNameCardContent>
                <h1 style={{display:"inline-block"}}>{(stream)?stream.name:'Loading...'}</h1>
              </StyledSensorNameCardContent>
            </CardContent>
          </CenteredCard>
        </div>
      );

    console.log(availableStreamTypes);

    return (
      <div>
        <Toolbar showTabs={true} />
        <ToolbarSpacer/>
        <CenteredCard>
          <CardContent noMarginBottom>
            <StyledSensorNameCardContent>
              <h1 style={{display:"inline-block"}}>{(stream)?stream.name:'loading'}</h1>
              <Button raised primary>Purchase access</Button>
            </StyledSensorNameCardContent>
          </CardContent>
          <StyledContentContainer>
            <StyledContentCell>
              <StyledSensorAttribute>
                <Icon icon={stream.type} style={{fill:"rgba(0,0,0,0.54)", width:"20px", height:"20px"}} />
                <StyledAttributeLabel>{availableStreamTypes[stream.type].name}</StyledAttributeLabel>
              </StyledSensorAttribute>
              <StyledSensorAttribute>
                <FontIcon>update</FontIcon>
                <StyledAttributeLabel>Updated every two months</StyledAttributeLabel>
              </StyledSensorAttribute>
              <StyledSensorAttribute>
                <FontIcon>payment</FontIcon>
                <StyledAttributeLabel>{stream.price} DTX per hour</StyledAttributeLabel>
              </StyledSensorAttribute>
              <StyledSensorAttribute>
                <FontIcon>security</FontIcon>
                <StyledAttributeLabel>{stream.stake} DTX staked by owner (?)</StyledAttributeLabel>
              </StyledSensorAttribute>
            </StyledContentCell>
            <StyledContentCell style={{backgroundColor:"#5DBCD7"}}>

            </StyledContentCell>
          </StyledContentContainer>
        </CenteredCard>
        <CenteredCard>
          <CardContent>
            <h1>Example readings</h1>
            <div style={{backgroundColor:"rgba(0,0,0,0.1)", borderRadius:"12px", padding:"15px"}}>
              <code>{stream.example}</code>
            </div>
          </CardContent>
        </CenteredCard>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    fetchStream: () => STREAMS_ACTIONS.fetchStream(dispatch, ownProps.match.params.id)
  }
}

function mapStateToProps(state, ownProps) {
  return {
    stream: state.streams.streams[ownProps.match.params.id],
    availableStreamTypes: state.streams.availableStreamTypes
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StreamDetailsScreen)
