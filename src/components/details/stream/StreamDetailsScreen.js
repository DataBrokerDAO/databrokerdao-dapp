import React, { Component } from 'react';
import {
  FontIcon,
  DropdownMenu,
  AccessibleFakeButton,
  ListItem
} from 'react-md';
import IconSeparator from 'react-md/lib/Helpers/IconSeparator';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { BigNumber } from 'bignumber.js';
import moment from 'moment';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faQuestionCircle from '@fortawesome/fontawesome-free-regular/faQuestionCircle';

import Toolbar from '../../generic/Toolbar';
import CenteredCard from '../../generic/CenteredCard';
import CardContent from '../../generic/CardContent';
import ToolbarSpacer from '../../generic/ToolbarSpacer';
import { STREAMS_ACTIONS } from '../../../redux/streams/actions';
import { PURCHASES_ACTIONS } from '../../../redux/purchases/actions';
import Icon from '../../generic/Icon';
import StakingExplainerDialog from '../StakingExplainerDialog';
import PurchaseSensorDialog from '../PurchaseSensorDialog';
import ChallengeSensorDialog from '../ChallengeSensorDialog';
import DetailsBackground from './StreamDetailsBackground';
import ChallengesTable from '../ChallengesTable';
import NearbyStreamsTable from './NearbyStreamsTable';
import TitleCTAButton from '../../generic/TitleCTAButton';
import { convertWeiToDtx } from '../../../utils/transforms';
import localStorage from '../../../localstorage';
import { TYPE_STREAM } from '../../listings/EnlistConfirmationDialog';

class StreamDetailsScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      StakingExplainerVisible: false,
      PurchaseStreamVisible: false,
      ChallengeDialogVisible: false
    };
  }

  componentDidMount() {
    //In case this stream was not in state yet, load it (in case it was: refresh to get latest version)
    this.props.fetchStream();
    this.props.fetchAvailableStreamTypes();
    if (this.props.token) this.props.fetchIsPurchased();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // After selecting stream in list of nearby streams, get details of this new stream
    // If user came to stream details screen directly, the other stream is not in the Redux state
    if (this.props.match.params.key !== prevProps.match.params.key)
      this.props.fetchStream();
  }

  toggleStakingExplainer() {
    this.setState({
      StakingExplainerVisible: !this.state.StakingExplainerVisible
    });
  }

  togglePurchaseStream() {
    this.setState({ PurchaseStreamVisible: !this.state.PurchaseStreamVisible });
  }

  toggleChallengeDialog(event) {
    this.setState({
      ChallengeDialogVisible: !this.state.ChallengeDialogVisible
    });
  }

  render() {
    const StyledSensorAttribute = styled.p`
      display: flex;
      align-content: center;
      width: 50%;
      margin-top: 20px;

      @media (max-width: ${props => props.theme.mobileBreakpoint}) {
        width: 100%;
      }
    `;

    const StyledSensorNameCardContent = styled.div`
      display: flex;
      justify-content: space-between;

      @media (max-width: ${props => props.theme.mobileBreakpoint}) {
        flex-direction: column;
      }
    `;

    const StyledAttributeLabel = styled.span`
      margin-left: 12px;
      line-height: 1.3;
    `;

    const StyledExampleContainer = styled.div`
      background-color: rgba(0, 0, 0, 0.1);
      border-radius: 3px;
      padding: 15px;
      overflow: auto;
      max-width: 840px;
    `;

    const { stream, availableStreamTypes, fetchingPurchases } = this.props;

    if (!stream || !availableStreamTypes || fetchingPurchases)
      return (
        <div>
          <Toolbar showTabs={true} />
          <ToolbarSpacer />
          <CenteredCard style={{ marginTop: '190px' }}>
            <CardContent>
              <StyledSensorNameCardContent>
                <h1 style={{ display: 'inline-block' }}>Loading...</h1>
              </StyledSensorNameCardContent>
            </CardContent>
          </CenteredCard>
        </div>
      );

    let example = stream.example;
    try {
      example = JSON.stringify(
        JSON.parse(stream.example.replace(/'/g, '"')),
        null,
        '  '
      );
    } catch (e) {
      // Not a JSON example - OK no problem
    }

    const price = convertWeiToDtx(
      BigNumber(stream.price)
        .multipliedBy(stream.updateinterval)
        .div(1000)
    );
    const stake = convertWeiToDtx(stream.stake);

    const address = localStorage.getItem('address');
    const purchase = this.props.purchase;
    const purchased = purchase !== null;
    const isOwner =
      address &&
      this.props.stream.owner.toUpperCase() === address.toUpperCase();

    const updateInterval =
      stream.updateinterval === 86400000
        ? 'daily'
        : `${stream.updateinterval / 1000}''`;

    let purchaseEndTime = null;
    if (purchase)
      purchaseEndTime = moment(parseInt(purchase.endTime, 10) * 1000).format(
        'MMM D, YYYY'
      );

    const menuItems = [
      <ListItem
        id="challenge-list-item"
        key="challenge-list-item"
        primaryText="Challenge stream"
        onClick={event => this.toggleChallengeDialog(event)}
      />
    ];

    return (
      <div>
        <Toolbar showTabs={true} />
        <ToolbarSpacer />
        <CenteredCard style={{ marginTop: '190px' }}>
          <CardContent>
            <StyledSensorNameCardContent>
              <h1 style={{ display: 'inline-block' }}>{stream.name}</h1>
              {!purchased &&
                !isOwner && (
                  <TitleCTAButton
                    flat
                    primary
                    swapTheming
                    onClick={event => this.togglePurchaseStream()}
                  >
                    Purchase access
                  </TitleCTAButton>
                )}
              {purchased && (
                <DropdownMenu
                  id={`smart-avatar-dropdown-menu`}
                  menuItems={menuItems}
                  anchor={{
                    x: DropdownMenu.HorizontalAnchors.CENTER,
                    y: DropdownMenu.VerticalAnchors.OVERLAP
                  }}
                  position={DropdownMenu.Positions.TOP_LEFT}
                  animationPosition="below"
                  sameWidth
                  simplifiedMenu={true}
                  style={{ marginTop: '17px' }}
                >
                  <AccessibleFakeButton>
                    <IconSeparator label={`Purchased until ${purchaseEndTime}`}>
                      <FontIcon>arrow_drop_down</FontIcon>
                    </IconSeparator>
                  </AccessibleFakeButton>
                </DropdownMenu>
              )}
            </StyledSensorNameCardContent>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              <StyledSensorAttribute>
                <Icon
                  icon={stream.type}
                  style={{
                    fill: 'rgba(0,0,0,0.54)',
                    width: '20px',
                    height: '20px'
                  }}
                />
                <StyledAttributeLabel>
                  Type: {availableStreamTypes[stream.type].name}
                </StyledAttributeLabel>
              </StyledSensorAttribute>
              <StyledSensorAttribute>
                <FontIcon
                  style={{ textAlign: 'left', width: '20px', height: '20px' }}
                >
                  update
                </FontIcon>
                <StyledAttributeLabel>
                  Frequency: {updateInterval}
                </StyledAttributeLabel>
              </StyledSensorAttribute>
              <StyledSensorAttribute>
                <Icon
                  icon="coins"
                  style={{
                    fill: 'rgba(0,0,0,0.54)',
                    width: '20px',
                    height: '20px'
                  }}
                />
                <StyledAttributeLabel>
                  Price: {price} DTX per reading
                </StyledAttributeLabel>
              </StyledSensorAttribute>
              <StyledSensorAttribute>
                <Icon
                  icon="location"
                  style={{
                    fill: 'rgba(0,0,0,0.54)',
                    width: '20px',
                    height: '20px'
                  }}
                />
                <StyledAttributeLabel>
                  {this.props.formattedAddress}
                </StyledAttributeLabel>
              </StyledSensorAttribute>
              {isOwner && (
                <StyledSensorAttribute>
                  <Icon
                    icon="staking"
                    style={{
                      fill: 'rgba(0,0,0,0.54)',
                      width: '20px',
                      height: '20px'
                    }}
                  />
                  <StyledAttributeLabel>Owner: you</StyledAttributeLabel>
                </StyledSensorAttribute>
              )}
            </div>
          </CardContent>
        </CenteredCard>

        <CenteredCard>
          <CardContent>
            <h1>
              Stakes and challenges{' '}
              <span
                className="clickable"
                onClick={event => this.toggleStakingExplainer()}
              >
                <FontAwesomeIcon
                  icon={faQuestionCircle}
                  style={{ marginLeft: '4px' }}
                />
              </span>
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              <StyledSensorAttribute>
                <Icon
                  icon="staking"
                  style={{
                    fill: 'rgba(0,0,0,0.54)',
                    width: '20px',
                    height: '20px'
                  }}
                />
                <StyledAttributeLabel>
                  Owner stake: {stake} DTX
                </StyledAttributeLabel>
              </StyledSensorAttribute>
              <StyledSensorAttribute>
                <Icon
                  icon="danger"
                  style={{
                    fill: 'rgba(0,0,0,0.54)',
                    width: '20px',
                    height: '20px'
                  }}
                />
                <StyledAttributeLabel>
                  Challenges: {stream.numberofchallenges} (
                  {Math.floor(convertWeiToDtx(stream.challengesstake))} DTX)
                </StyledAttributeLabel>
              </StyledSensorAttribute>
            </div>
            {stream.challengeslist &&
              stream.challengeslist.length > 0 && (
                <ChallengesTable challenges={stream.challengeslist} />
              )}
          </CardContent>
        </CenteredCard>
        <CenteredCard>
          <CardContent>
            <h1>Example reading(s)</h1>
            <StyledExampleContainer>
              <pre>{example}</pre>
            </StyledExampleContainer>
          </CardContent>
        </CenteredCard>
        {this.props.nearbyStreams &&
          this.props.nearbyStreams.length > 0 && (
            <CenteredCard>
              <CardContent>
                <h1>Similar streams nearby</h1>
                <NearbyStreamsTable streams={this.props.nearbyStreams} />
              </CardContent>
            </CenteredCard>
          )}
        <PurchaseSensorDialog
          visible={this.state.PurchaseStreamVisible}
          sensor={stream}
          type={TYPE_STREAM}
          hideEventHandler={() => this.togglePurchaseStream()}
        />
        <ChallengeSensorDialog
          visible={this.state.ChallengeDialogVisible}
          sensor={stream}
          type={TYPE_STREAM}
          hideEventHandler={() => this.toggleChallengeDialog()}
          toggleStakingExplainer={() => this.toggleStakingExplainer()}
          fetchSensorEventHandler={() => this.props.fetchStream()}
        />
        <StakingExplainerDialog
          visible={this.state.StakingExplainerVisible}
          hideEventHandler={() => this.toggleStakingExplainer()}
        />
        <DetailsBackground stream={stream} />
      </div>
    );
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const sensor = ownProps.match.params.key;
  const purchaser = localStorage.getItem('address');

  return {
    fetchStream: () => dispatch(STREAMS_ACTIONS.fetchStream(dispatch, sensor)),
    fetchAvailableStreamTypes: () =>
      dispatch(STREAMS_ACTIONS.fetchAvailableStreamTypes()),
    fetchIsPurchased: () =>
      dispatch(PURCHASES_ACTIONS.fetchPurchase(null, sensor, purchaser))
  };
}

function mapStateToProps(state, ownProps) {
  return {
    token: state.auth.token, //Used to verify if a user is signed in, if not we don't have to get purchases from API
    formattedAddress: state.streams.formattedAddress,

    stream: state.streams.streams[ownProps.match.params.key],
    nearbyStreams: state.streams.nearbyStreams,
    availableStreamTypes: state.streams.availableStreamTypes,

    purchase: state.purchases.purchase,
    fetchingPurchase: state.purchases.fetchingPurchase,
    fetchingPurchaseError: state.purchases.fetchingPurchaseError
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StreamDetailsScreen);
