import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';

import DepositScreen from './DepositScreen';
import PendingScreen from './PendingScreen';
import SuccessScreen from './SuccessScreen';

import { BRIDGE_ACTIONS } from '../../redux/bridge/actions';

import Toolbar from '../generic/Toolbar';
import ToolbarSpacer from '../generic/ToolbarSpacer';
import CenteredCard from '../generic/CenteredCard';
import CardContent from '../generic/CardContent';

class BridgeScreen extends Component {
  componentDidMount() {
    this.props.connect();
  }
  render() {
    const { connected } = this.props;
    return (
      <div>
        <Toolbar showTabs={true} />
        <ToolbarSpacer />

        {!connected ? (
          <CenteredCard>
            <CardContent>
              <h2>Please install the <a target="_blank" href="https://metamask.io/">Metamask</a> browser extension to continue.</h2>
              <h3>If you have already installed Metamask, please unlock your account.</h3>
            </CardContent>
          </CenteredCard>
        ) : (
            <Switch>
              <Route path="/bridge/pending" component={PendingScreen} />
              <Route path="/bridge/success" component={SuccessScreen} />
              <Route component={DepositScreen} />
            </Switch>
          )}
      </div>
    )
  }
}

export default connect(
  (state) => ({ connected: state.bridge.connected }),
  (dispatch) => ({
    connect: () => dispatch(BRIDGE_ACTIONS.fetchSenderBalance()),
  })
)(BridgeScreen)