import React, { Component } from 'react';
import { connect } from 'react-redux';
import { BigNumber } from 'bignumber.js';
import { withRouter } from 'react-router-dom';

import RegisterForm from '../../authentication/RegisterForm';
import TransactionDialog from '../../generic/TransactionDialog';
import { WALLET_ACTIONS } from '../../../redux/wallet/actions';
import { LISTING_ACTIONS } from '../../../redux/listings/actions';
import { AUTH_ACTIONS } from '../../../redux/authentication/actions';

const STEP_INTRO = 1,
  STEP_REGISTRATION = 2,
  STEP_ENLISTING = 3,
  STEP_SUCCESS = 4,
  STEP_BALANCE_ERROR = 5;

class EnlistConfirmationDialog extends Component {
  constructor(props) {
    super(props);

    const steps = this.props.token
      ? [
          { id: STEP_INTRO, description: 'Intro' },
          { id: STEP_ENLISTING, description: 'Enlist' },
          { id: STEP_SUCCESS, description: 'Success' }
        ]
      : [
          { id: STEP_INTRO, description: 'Intro' },
          { id: STEP_REGISTRATION, description: 'Registration' },
          { id: STEP_ENLISTING, description: 'Enlist' },
          { id: STEP_SUCCESS, description: 'Success' }
        ];

    this.state = {
      steps: steps,
      stepIndex: STEP_INTRO
    };
  }

  componentDidMount() {
    this.props.fetchWallet();
  }

  finishStep(step) {
    if (step === STEP_INTRO) {
      if (!this.props.token) this.setState({ stepIndex: STEP_REGISTRATION });
      else {
        const stakeDTX = BigNumber(parseInt(this.props.stream.stake, 10)).times(
          BigNumber(10).pow(18)
        );
        if (BigNumber(this.props.balance).isGreaterThan(stakeDTX)) {
          this.props.enlistStream(this.props.stream);
          this.setState({ stepIndex: STEP_ENLISTING });
        } else {
          this.setState({ stepIndex: STEP_BALANCE_ERROR });
        }
      }
    } else if (step === STEP_REGISTRATION) {
      this.props.enlistStream(this.props.stream);
      this.setState({ stepIndex: STEP_ENLISTING });
    } else if (step === STEP_ENLISTING)
      this.setState({ stepIndex: STEP_SUCCESS });
    else if (step === STEP_SUCCESS) {
      this.props.hideEventHandler();
    } else if (step === STEP_BALANCE_ERROR) {
      this.props.history.push(`/wallet`);
    }
  }

  render() {
    const loading = this.props.enlistingStream;

    return (
      <TransactionDialog
        visible={this.props.visible}
        onHide={this.props.hideEventHandler}
        steps={this.state.steps}
        stepIndex={this.state.stepIndex}
        nextStepHandler={step => {
          this.finishStep(step);
        }}
        loading={loading}
        showContinueButton={this.state.stepIndex !== STEP_REGISTRATION}
        modal={true}
      >
        <div
          style={{
            display: this.state.stepIndex === STEP_INTRO ? 'block' : 'none'
          }}
        >
          <h1>Enlist your stream</h1>
          <p>
            To enlist your stream you need DTX tokens. As DataBroker DAO is
            currently in beta, we will provide you with free demo tokens.
          </p>
        </div>
        <div
          style={{
            display:
              this.state.stepIndex === STEP_REGISTRATION ? 'block' : 'none'
          }}
        >
          <h1>Registration</h1>
          <RegisterForm
            register={(values, settings) =>
              this.props.register(values, settings)
            }
            callBack={() => {
              this.finishStep(STEP_REGISTRATION);
            }}
          />
        </div>
        <div
          style={{
            display: this.state.stepIndex === STEP_ENLISTING ? 'block' : 'none'
          }}
        >
          <h1>Saving to the blockchain</h1>
          <p>
            It takes a while to save to the blockchain due to blocks that have
            to be mined before your transaction can be confirmed.
          </p>
        </div>
        <div
          style={{
            display: this.state.stepIndex === STEP_SUCCESS ? 'block' : 'none'
          }}
        >
          <h1>Stream successfully enlisted</h1>
          <p>From now on, people are able to purchase your stream data.</p>
        </div>
        <div
          style={{
            display:
              this.state.stepIndex === STEP_BALANCE_ERROR ? 'block' : 'none'
          }}
        >
          <h1>Your DTX balance is too low</h1>
          <p>
            As DataBroker DAO is currently in beta, you can fund your wallet
            with demo tokens free of charge.
          </p>
        </div>
      </TransactionDialog>
    );
  }
}

const mapStateToProps = state => ({
  token: state.auth.token,
  enlistingStream: state.listings.enlistingStream,
  balance: state.wallet.wallet.balance
});

function mapDispatchToProps(dispatch) {
  return {
    register: (values, settings) =>
      dispatch(AUTH_ACTIONS.register(values, settings)),
    enlistStream: stream => dispatch(LISTING_ACTIONS.enlistStream(stream)),
    fetchWallet: () => dispatch(WALLET_ACTIONS.fetchWallet())
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(EnlistConfirmationDialog));
