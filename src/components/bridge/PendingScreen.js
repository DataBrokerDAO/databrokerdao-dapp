import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Redirect } from 'react-router-dom';
import { DEPOSIT_STEPS } from '../../redux/bridge/reducer';

import SendingStep from './steps/SendingStep';
import SignaturesStep from './steps/SignaturesStep';

class PendingScreen extends Component {

  getStep = (step=this.props.bridge.deposit.step) => {
    return {
      [DEPOSIT_STEPS.init]: SendingStep,
      [DEPOSIT_STEPS.sent]: SignaturesStep,
    }[step]
  }

  render() {
    const { bridge } = this.props;

    const Step = this.getStep();

    if (!Step) {
      return <Redirect to="/bridge" />;
    }

    return (
      <Step bridge={bridge} />
    );
  }
}

const mapStateToProps = state => ({
  bridge: state.bridge,
});

export default connect(
  mapStateToProps,
)(PendingScreen);
