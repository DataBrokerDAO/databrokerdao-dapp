import React, { Component } from 'react';
import { List, FontIcon } from 'react-md';
import { connect } from 'react-redux';
import map from 'lodash/map';

import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import { BigNumber } from 'bignumber.js';

import Icon from '../generic/Icon';

class DiscoverStreamsList extends Component {
  onStreamListItemClick(stream) {
    this.props.history.push(`/stream/${stream.key}`);
  }

  convertWeiToDtx(dtxValue) {
    return BigNumber(dtxValue)
      .div(BigNumber(10).pow(18))
      .toString();
  }

  renderStreamsListItems(streams) {
    const StyledListItem = styled.div`
      padding: 18px 16px;
      cursor: pointer;
      display: flex;
      align-items: center;

      &:hover {
        background-color: #e0e0e0;
      }

      &.disabled {
        color: rgba(0, 0, 0, 0.5);
      }

      &.disabled:hover {
        cursor: default;
        background-color: white;
      }
    `;

    const StreamName = styled.p`
      font-size: 16px;
      margin: 0 0 3px 0;
    `;

    const StakeDetails = styled.p`
      font-size: 14px;
      color: #b6b6b6;
      margin: 0;
    `;

    let listItems = map(streams, stream => {
      return (
        <StyledListItem
          key={stream.key}
          onClick={event => this.onStreamListItemClick(stream)}
          leftIcon={<FontIcon key="data">data_usage</FontIcon>}
        >
          <Icon
            icon={stream.type}
            style={{
              fill: 'rgba(0,0,0,0.5)',
              width: '20px',
              height: '20px',
              marginRight: '13px'
            }}
          />
          <div style={{ flex: '1' }}>
            <StreamName>{stream.name}</StreamName>
            <StakeDetails>
              Stake: {this.convertWeiToDtx(stream.stake)}, Challenges:{' '}
              {stream.numberofchallenges} (
              {this.convertWeiToDtx(stream.challengesstake)} DTX)
            </StakeDetails>
          </div>
        </StyledListItem>
      );
    });

    if (this.props.fetchingStreams)
      return (
        <StyledListItem className="disabled">loading streams...</StyledListItem>
      );
    else if (listItems.length > 0) return listItems;
    else
      return <StyledListItem className="disabled">no streams</StyledListItem>;
  }

  render() {
    const StyledTitle = styled.h2`
      margin: 10px 16px 0 16px;
    `;

    return (
      <div>
        <StyledTitle>Available streams</StyledTitle>
        <List>{this.renderStreamsListItems(this.props.streams)}</List>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  streams: state.streams.streams,
  fetchingStreams: state.streams.fetchingStreams
});

export default connect(
  mapStateToProps,
  null
)(withRouter(DiscoverStreamsList));
