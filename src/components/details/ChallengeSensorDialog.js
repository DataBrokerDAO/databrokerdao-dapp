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
import { convertDtxToWei, convertWeiToDtx } from '../../utils/transforms';
import { SENSORS_ACTIONS } from '../../redux/sensors/actions';

const STEP_INTRO = 0,
  STEP_REASON = 1,
  STEP_STAKE = 2,
  STEP_CHALLENGING = 3,
  STEP_BALANCE_ERROR = 4;

export const TX_IPFS_HASH = 1,
  TX_APPROVE = 2,
  TX_ENSURE_APPROVE = 3,
  TX_CHALLENGE = 4,
  TX_ENSURE_CHALLENGE = 5,
  TX_VERIFY_CHALLENGE = 6;

class ChallengeSensorDialog extends Component {
  constructor(props) {
    super(props);

    const steps = [
      { id: STEP_INTRO, description: 'Intro' },
      { id: STEP_REASON, description: 'Reason' },
      { id: STEP_STAKE, description: 'Stake' },
      { id: STEP_CHALLENGING, description: 'Challenge' }
    ];

    const transactions = [
      {
        id: TX_IPFS_HASH,
        title: 'IPFS',
        description: `IPFS hashing the challenge metadata`
      },
      {
        id: TX_APPROVE,
        title: 'DTX',
        description:
          'Approve the amount of DTX to be spent by the registry smart contract'
      },
      {
        id: TX_ENSURE_APPROVE,
        title: 'Mining',
        description: 'Await for the transaction to be taken up in a block'
      },
      {
        id: TX_CHALLENGE,
        title: 'Challenge',
        description: `Send a transaction to challenge the ${
          this.props.type
        } in the registry smart contract`
      },
      {
        id: TX_ENSURE_CHALLENGE,
        title: 'Mining',
        description: 'Await for the transaction to be taken up in a block'
      },
      {
        id: TX_VERIFY_CHALLENGE,
        title: 'Sync',
        description: `Verify the ${
          this.props.type
        } was challenged and synced with Databroker DAO`
      }
    ];

    this.state = {
      steps: steps,
      stepIndex: STEP_INTRO,
      transactions: transactions,
      transactionIndex: TX_APPROVE,
      transactionError: null,
      challenging: false,
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
    this.props.fetchDBDAOBalance();
  }

  finishStep(step) {
    const stakeAmount = parseInt(this.state.stakeAmount, 10);
    const stakeDTX = convertDtxToWei(stakeAmount);

    switch (step) {
      case STEP_INTRO:
        this.setState({
          stepIndex: STEP_REASON,
          transactionIndex: TX_APPROVE,
          transactionError: null
        });
        break;
      case STEP_REASON:
        if (this.state.reason.length > 0) {
          this.setState({ stepIndex: STEP_STAKE });
        } else {
          this.setState({ reasonError: 'Reason is a required field' });
        }
        break;
      case STEP_STAKE:
        if (stakeAmount < 50) {
          this.setState({ stakeError: 'Minimum stake of 50 required' });
          break;
        }

        const hasTheMoney =
          this.props.balance &&
          BigNumber(this.props.balance).isGreaterThan(stakeDTX);

        if (!hasTheMoney) {
          this.setState({
            stepIndex: STEP_BALANCE_ERROR,
            balanceDeficient: this.props.balance
              ? stakeDTX.minus(BigNumber(this.props.balance)).toString()
              : null
          });
          break;
        }

        this.setState({ stepIndex: STEP_CHALLENGING, modal: true });
        this.props.challengeSensor(
          this.props.sensor,
          this.state.reason,
          stakeDTX
        );
        break;
      case STEP_CHALLENGING:
        this.props.fetchSensorEventHandler();
        this.props.hideEventHandler();
        this.reset();
        break;
      case STEP_BALANCE_ERROR:
        this.props.history.push(`/wallet`);
        break;

      default:
        break;
    }
  }

  reset() {
    this.setState({ stepIndex: STEP_INTRO });
    this.props.clearErrors();
  }

  stakeAmountChanged(event) {
    this.setState({ stakeAmount: event.value });
  }

  render() {
    const loading = this.props.challenging;

    return (
      <TransactionDialog
        visible={this.props.visible}
        onHide={this.props.hideEventHandler}
        steps={this.state.steps}
        stepIndex={this.state.stepIndex}
        nextStepHandler={this.finishStep.bind(this)}
        showContinue={!this.props.challenging}
        showTransactions={this.state.stepIndex === STEP_CHALLENGING}
        transactions={this.state.transactions}
        transactionIndex={this.props.transactionIndex}
        transactionError={this.props.transactionError}
        loading={loading}
        done={
          this.state.stepIndex === STEP_CHALLENGING &&
          !this.props.challening &&
          !this.props.transactionError
        }
        modal={this.state.modal}
      >
        <div style={this.showOrHide(STEP_INTRO)}>
          <h1>Challenge {this.props.type} quality</h1>
          <p>
            If you are unhappy with the quality of this {this.props.type}, you
            can challenge it by staking some DTX tokens. Upon reaching a certain
            threshold of challenges, a check of the {this.props.type}
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
              Why are you unhappy with the quality of this {this.props.type}?
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
              label="Number of DTX to stake (min. 50)"
              className="md-cell md-cell--bottom"
              value={this.state.stakeAmount}
              onChange={value => this.setState({ stakeAmount: value })}
              style={{ width: '100%' }}
              error={this.state.stakeError !== null}
              errorText={this.state.stakeError}
            />
          </this.StepContentWithPadding>
        )}
        <div style={this.showOrHide(STEP_BALANCE_ERROR)}>
          <h1>Your DTX balance is too low</h1>
          {this.state.balanceDeficient && (
            <p>
              You have {convertWeiToDtx(this.props.balance)}
              DTX which is {convertWeiToDtx(this.state.balanceDeficient)}
              DTX short of the purchase price
            </p>
          )}
          <p>
            As DataBroker DAO is currently in beta, you can fund your wallet
            with demo tokens free of charge.
          </p>
        </div>
        <div style={this.showOrHide(STEP_CHALLENGING)}>
          <h1>Saving to the blockchain</h1>
          <p>
            It takes a while to save your challenge to the blockchain due to
            blocks that have to be mined before your transaction can be
            confirmed.
          </p>
        </div>
      </TransactionDialog>
    );
  }

  showOrHide(step) {
    return {
      display: this.state.stepIndex === step ? 'block' : 'none'
    };
  }
}

const mapStateToProps = state => ({
  token: state.auth.token,
  challenging: state.sensors.challenging,
  transactionIndex: state.sensors.transactionIndex,
  transactionError: state.sensors.transactionError,
  balance: state.wallet.wallet.balance
});

function mapDispatchToProps(dispatch) {
  return {
    clearErrors: () => dispatch(SENSORS_ACTIONS.clearErrors()),
    challengeSensor: (stream, reason, amount) =>
      dispatch(SENSORS_ACTIONS.challengeSensor(stream, reason, amount)),
    fetchDBDAOBalance: () => dispatch(WALLET_ACTIONS.fetchDBDAOBalance())
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ChallengeSensorDialog));
