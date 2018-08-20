import React, { Component } from 'react';
import { TextField } from 'react-md';
import { connect } from 'react-redux';
import { BigNumber } from 'bignumber.js';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faQuestionCircle from '@fortawesome/fontawesome-free-regular/faQuestionCircle';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';

import TransactionDialog from '../generic/TransactionDialog';
import { WALLET_ACTIONS } from '../../redux/wallet/actions';
import { STREAMS_ACTIONS } from '../../redux/streams/actions';

const STEP_INTRO = 0,
  STEP_REASON = 1,
  STEP_STAKE = 2,
  STEP_CHALLENGING = 3,
  STEP_SUCCESS = 4,
  STEP_BALANCE_ERROR = 5;

class ChallengeStreamDialog extends Component {
  constructor(props) {
    super(props);

    const steps = [
      { id: STEP_INTRO, description: 'Intro' },
      { id: STEP_REASON, description: 'Reason' },
      { id: STEP_STAKE, description: 'Stake' },
      { id: STEP_CHALLENGING, description: 'Challenge' },
      { id: STEP_SUCCESS, description: 'Success' }
    ];

    this.state = {
      steps: steps,
      stepIndex: STEP_INTRO,
      modal: false,
      reason: '',
      reasonError: null,
      stakeAmount: '',
      stakeError: null
    };

    this.StepContentWithPadding = styled.div`
      padding: 0 15%;

      @media (max-width: ${props => props.theme.mobileBreakpoint}) {
        padding: 0;
      }
    `;
  }

  componentDidMount() {
    this.props.fetchWallet();
  }

  finishStep(step) {
    if (step === STEP_INTRO) {
      this.setState({ stepIndex: STEP_REASON });
    } else if (step === STEP_REASON) {
      if (this.state.reason.length > 0) {
        this.setState({ stepIndex: STEP_STAKE });
      } else {
        this.setState({ reasonError: 'Reason is a required field' });
      }
    } else if (step === STEP_STAKE) {
      if (parseInt(this.state.stakeAmount, 10) > 0) {
        const amount = BigNumber(parseInt(this.state.stakeAmount, 10))
          .times(BigNumber(10).pow(18))
          .toString();
        if (BigNumber(this.props.balance).isGreaterThan(amount)) {
          this.props.challengeStream(
            this.props.stream,
            this.state.reason,
            amount
          );
          this.setState({ stepIndex: STEP_CHALLENGING, modal: true });
        } else {
          this.setState({ stepIndex: STEP_BALANCE_ERROR });
        }
      } else
        this.setState({ stakeError: 'Stake amount must be a positive number' });
    } else if (step === STEP_CHALLENGING)
      this.setState({ stepIndex: STEP_SUCCESS });
    else if (step === STEP_SUCCESS) {
      this.props.fetchStreamEventHandler();
      this.props.hideEventHandler();
    } else if (step === STEP_BALANCE_ERROR) {
      this.props.history.push(`/wallet`);
    }
  }

  stakeAmountChanged(event) {
    this.setState({ stakeAmount: event.value });
  }

  render() {
    const loading = this.props.challengingStream;

    return (
      <TransactionDialog
        visible={this.props.visible}
        onHide={this.props.hideEventHandler}
        modal={this.state.modal}
        steps={this.state.steps}
        stepIndex={this.state.stepIndex}
        nextStepHandler={step => {
          this.finishStep(step);
        }}
        loading={loading}
        showContinueButton={true}
      >
        <div
          style={{
            display: this.state.stepIndex === STEP_INTRO ? 'block' : 'none'
          }}
        >
          <h1>Challenge stream quality</h1>
          <p>
            If you are unhappy with the quality of data of this stream, you can
            challenge it by staking some DTX tokens.
          </p>
          <p>
            Upon reaching a certain threshold of challenges, a check of the data
            provider will be performed by a DataBroker DAO administrator.{' '}
            <span
              className="clickable"
              onClick={this.props.toggleStakingExplainer}
            >
              <FontAwesomeIcon
                icon={faQuestionCircle}
                color="rgba(0,0,0,0.6)"
              />
            </span>
          </p>
        </div>
        {this.state.stepIndex === STEP_REASON && (
          <this.StepContentWithPadding>
            <h1>
              Why are you unhappy with the quality of data of this stream?
            </h1>
            <TextField
              id="reason"
              fieldname="reason"
              label="Explain why"
              className="md-cell md-cell--bottom"
              value={this.state.reason}
              onChange={value => this.setState({ reason: value })}
              style={{ width: '100%' }}
              error={this.state.reasonError !== null}
              errorText={this.state.reasonError}
            />
          </this.StepContentWithPadding>
        )}
        {this.state.stepIndex === STEP_STAKE && (
          <this.StepContentWithPadding>
            <h1>Define stake</h1>
            <TextField
              id="stake"
              fieldname="stake"
              label="Number of DTX to stake"
              className="md-cell md-cell--bottom"
              value={this.state.stakeAmount}
              onChange={value => this.setState({ stakeAmount: value })}
              style={{ width: '100%' }}
              error={this.state.stakeError !== null}
              errorText={this.state.stakeError}
            />
          </this.StepContentWithPadding>
        )}
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
        <div
          style={{
            display:
              this.state.stepIndex === STEP_CHALLENGING ? 'block' : 'none'
          }}
        >
          <h1>Saving to the blockchain</h1>
          <p>
            It takes a while to save your challenge to the blockchain due to
            blocks that have to be mined before your transaction can be
            confirmed.
          </p>
        </div>
        <div
          style={{
            display: this.state.stepIndex === STEP_SUCCESS ? 'block' : 'none'
          }}
        >
          <h1>Challenge successful</h1>
          <p>
            Upon reaching a certain threshold of challenges, a check of the data
            provider will be performed by a DataBroker DAO administrator{' '}
            <span
              className="clickable"
              onClick={this.props.toggleStakingExplainer}
            >
              <FontAwesomeIcon
                icon={faQuestionCircle}
                color="rgba(0,0,0,0.6)"
              />
            </span>
            .
          </p>
        </div>
      </TransactionDialog>
    );
  }
}

const mapStateToProps = state => ({
  token: state.auth.token,
  challengingStream: state.streams.challengingStream,
  balance: state.wallet.wallet.balance
});

function mapDispatchToProps(dispatch) {
  return {
    challengeStream: (stream, reason, amount) =>
      dispatch(STREAMS_ACTIONS.challengeStream(stream, reason, amount)),
    fetchWallet: () => dispatch(WALLET_ACTIONS.fetchWallet())
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ChallengeStreamDialog));
