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
import Icon from '../../generic/Icon';
import StakingExplainerDialog from '../StakingExplainerDialog';
import PurchaseSensorDialog from '../PurchaseSensorDialog';
import ChallengeSensorDialog from '../ChallengeSensorDialog';
import ChallengesTable from '../ChallengesTable';
import TitleCTAButton from '../../generic/TitleCTAButton';
import { convertWeiToDtx } from '../../../utils/transforms';
import { DATASET_ACTIONS } from '../../../redux/datasets/actions';
import { PURCHASES_ACTIONS } from '../../../redux/purchases/actions';
import localStorage from '../../../localstorage';

class DatasetDetailsScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      StakingExplainerVisible: false,
      PurchaseStreamVisible: false,
      ChallengeDialogVisible: false
    };
  }

  componentDidMount() {
    //In case this dataset was not in state yet, load it (in case it was: refresh to get latest version)
    this.props.fetchDataset();
    this.props.fetchAvailableCategories();
    this.props.fetchAvailableFiletypes();

    if (this.props.token) this.props.fetchIsPurchased();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.match.params.key !== prevProps.match.params.key)
      this.props.fetchDataset();
  }

  toggleStakingExplainer() {
    this.setState({
      StakingExplainerVisible: !this.state.StakingExplainerVisible
    });
  }

  togglePurchaseDataset() {
    this.setState({
      PurchaseDatasetVisible: !this.state.PurchaseDatasetVisible
    });
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

    const {
      dataset,
      availableCategories,
      availableFiletypes,
      fetchingPurchase
    } = this.props;

    if (
      !dataset ||
      !availableCategories ||
      !availableFiletypes ||
      fetchingPurchase
    )
      return (
        <div>
          <Toolbar showTabs={true} />
          <ToolbarSpacer />
          <CenteredCard>
            <CardContent>
              <StyledSensorNameCardContent>
                <h1 style={{ display: 'inline-block' }}>Loading...</h1>
              </StyledSensorNameCardContent>
            </CardContent>
          </CenteredCard>
        </div>
      );

    let example = dataset.example;
    try {
      example = JSON.stringify(
        JSON.parse(dataset.example.replace(/'/g, '"')),
        null,
        '  '
      );
    } catch (e) {
      // Not a JSON example - OK no problem
    }

    const price = dataset.updateinterval
      ? convertWeiToDtx(
          BigNumber(dataset.price)
            .multipliedBy(dataset.updateinterval)
            .div(1000)
        )
      : convertWeiToDtx(dataset.price);

    const stake = convertWeiToDtx(dataset.stake);

    const address = localStorage.getItem('address');
    const purchase = this.props.purchase;
    const purchased = purchase !== null;
    const isOwner =
      address && dataset.owner.toUpperCase() === address.toUpperCase();

    // Update interval: only needed when set has an update interval
    const updateInterval = dataset.updateinterval
      ? dataset.updateinterval === 86400000
        ? 'daily'
        : `${dataset.updateinterval / 1000}''`
      : null;

    let purchaseEndTime = null;
    if (purchase)
      purchaseEndTime = moment(parseInt(purchase.endTime, 10) * 1000).format(
        'MMM D, YYYY'
      );

    const menuItems = [
      <ListItem
        id="challenge-list-item"
        key="challenge-list-item"
        primaryText="Challenge"
        onClick={event => this.toggleChallengeDialog(event)}
      />
    ];

    return (
      <div>
        <Toolbar showTabs={true} />
        <ToolbarSpacer />
        <CenteredCard>
          <CardContent>
            <StyledSensorNameCardContent>
              <h1 style={{ display: 'inline-block' }}>{dataset.name}</h1>
              {!purchased &&
                !isOwner && (
                  <TitleCTAButton
                    flat
                    primary
                    swapTheming
                    onClick={event => this.togglePurchaseDataset()}
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
                    <IconSeparator
                      label={
                        updateInterval
                          ? `Purchased until ${purchaseEndTime}`
                          : 'Purchased'
                      }
                    >
                      <FontIcon>arrow_drop_down</FontIcon>
                    </IconSeparator>
                  </AccessibleFakeButton>
                </DropdownMenu>
              )}
            </StyledSensorNameCardContent>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              <StyledSensorAttribute>
                <Icon
                  icon={dataset.category}
                  style={{
                    fill: 'rgba(0,0,0,0.54)',
                    width: '20px',
                    height: '20px'
                  }}
                />
                <StyledAttributeLabel>
                  Category: {availableCategories[dataset.category].name}
                </StyledAttributeLabel>
              </StyledSensorAttribute>
              <StyledSensorAttribute>
                <Icon
                  icon={dataset.filetype}
                  style={{
                    fill: 'rgba(0,0,0,0.54)',
                    width: '20px',
                    height: '20px'
                  }}
                />
                <StyledAttributeLabel>
                  File type: {availableFiletypes[dataset.filetype].name}
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
                <StyledAttributeLabel>Price: {price} DTX</StyledAttributeLabel>
              </StyledSensorAttribute>

              {updateInterval && (
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
              )}
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
                  Challenges: {dataset.numberofchallenges} (
                  {Math.floor(convertWeiToDtx(dataset.challengesstake))} DTX)
                </StyledAttributeLabel>
              </StyledSensorAttribute>
            </div>
            {dataset.challengeslist &&
              dataset.challengeslist.length > 0 && (
                <ChallengesTable challenges={dataset.challengeslist} />
              )}
          </CardContent>
        </CenteredCard>
        <CenteredCard>
          <CardContent>
            <h1>Sample</h1>
            <StyledExampleContainer>
              <pre>{example}</pre>
            </StyledExampleContainer>
          </CardContent>
        </CenteredCard>
        <PurchaseSensorDialog
          visible={this.state.PurchaseDatasetVisible}
          stream={dataset}
          hideEventHandler={() => this.togglePurchaseDataset()}
        />
        <ChallengeSensorDialog
          visible={this.state.ChallengeDialogVisible}
          stream={dataset}
          hideEventHandler={() => this.toggleChallengeDialog()}
          toggleStakingExplainer={() => this.toggleStakingExplainer()}
          fetchStreamEventHandler={() => this.props.fetchStream()}
        />
        <StakingExplainerDialog
          visible={this.state.StakingExplainerVisible}
          hideEventHandler={() => this.toggleStakingExplainer()}
        />
      </div>
    );
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const sensor = ownProps.match.params.key;
  const purchaser = localStorage.getItem('address');

  return {
    fetchDataset: () =>
      dispatch(DATASET_ACTIONS.fetchDataset(dispatch, sensor)),
    fetchAvailableCategories: () =>
      dispatch(DATASET_ACTIONS.fetchAvailableCategories()),
    fetchAvailableFiletypes: () =>
      dispatch(DATASET_ACTIONS.fetchAvailableFiletypes()),
    fetchIsPurchased: () =>
      dispatch(PURCHASES_ACTIONS.fetchPurchase(null, sensor, purchaser))
  };
}

function mapStateToProps(state, ownProps) {
  return {
    token: state.auth.token,
    availableCategories: state.datasets.availableCategories,
    availableFiletypes: state.datasets.availableFiletypes,
    dataset: state.datasets.dataset,

    purchase: state.purchases.purchase,
    fetchingPurchase: state.purchases.fetchingPurchase,
    fetchingPurchaseError: state.purchases.fetchingPurchaseError
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DatasetDetailsScreen);
