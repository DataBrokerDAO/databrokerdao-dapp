import React, { Component } from 'react';
import { connect } from 'react-redux';
import { BigNumber } from 'bignumber.js';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import LoginForm from '../authentication/LoginForm';
import TransactionDialog from '../generic/TransactionDialog';
import { WALLET_ACTIONS } from '../../redux/wallet/actions';
import { LISTING_ACTIONS } from '../../redux/listings/actions';
import { AUTH_ACTIONS } from '../../redux/authentication/actions';
import { convertDtxToWei, convertWeiToDtx } from '../../utils/transforms';
import get from 'lodash/get';

const StyledFormDiv = styled.div`
  .loginForm {
    padding: 0 20% !important;
  }
`;

const STEP_INTRO = 1,
  STEP_AUTHENTICATION = 2,
  STEP_ENLISTING = 3,
  STEP_BALANCE_ERROR = 4;

export const TYPE_STREAM = 'stream',
  TYPE_DATASET = 'dataset';

export const TX_IPFS_HASH = 1,
  TX_APPROVE = 2,
  TX_ENSURE_APPROVE = 3,
  TX_ENLIST = 4,
  TX_ENSURE_ENLIST = 5,
  TX_VERIFY_ENLIST = 6;

class EnlistConfirmationDialog extends Component {
  constructor(props) {
    super(props);

    const steps = this.props.token
      ? [
          { id: STEP_INTRO, description: 'Intro' },
          { id: STEP_ENLISTING, description: 'Enlist' }
        ]
      : [
          { id: STEP_INTRO, description: 'Intro' },
          { id: STEP_AUTHENTICATION, description: 'Authentication' },
          { id: STEP_ENLISTING, description: 'Enlist' }
        ];

    const transactions = [
      {
        id: TX_IPFS_HASH,
        title: 'IPFS',
        description: `IPFS hashing the ${this.props.type} metadata`
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
        id: TX_ENLIST,
        title: 'Enlist',
        description: `Send a transaction to enlist your ${
          this.props.type
        } in the registry smart contract`
      },
      {
        id: TX_ENSURE_ENLIST,
        title: 'Mining',
        description: 'Await for the transaction to be taken up in a block'
      },
      {
        id: TX_VERIFY_ENLIST,
        title: 'Sync',
        description: `Verify the ${
          this.props.type
        } was properly enlisted and synced with Databroker DAO`
      }
    ];

    this.state = {
      steps: steps,
      stepIndex: STEP_INTRO,
      transactions: transactions,
      transactionIndex: TX_APPROVE,
      transactionError: null,
      enlisting: false,
      complete: false
    };
  }

  componentDidMount() {
    this.props.fetchWallet();
  }

  finishStep(step) {
    const stakeDTX = convertDtxToWei(parseInt(this.props.sensor.stake, 10));

    switch (step) {
      case STEP_INTRO:
        if (!this.props.token) {
          this.setState({ stepIndex: STEP_AUTHENTICATION });
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

        this.setState({ transactionIndex: TX_APPROVE });
        this.setState({ stepIndex: STEP_ENLISTING });
        this.props.enlistSensor(this.props.sensor);
        break;
      case STEP_AUTHENTICATION:
        this.setState({ stepIndex: STEP_INTRO });
        break;
      case STEP_ENLISTING:
        this.props.hideEventHandler();
        this.props.history.push(`/listings#tab-${this.props.type}s`);
        this.reset();
        break;
      case STEP_BALANCE_ERROR:
        this.props.history.push(`/wallet`);
        break;
      default:
        this.props.hideEventHandler();
        break;
    }
  }

  reset() {
    this.setState({ stepIndex: STEP_INTRO });
    this.props.clearErrors();
  }

  render() {
    return (
      <TransactionDialog
        visible={this.props.visible}
        onHide={this.props.hideEventHandler}
        steps={this.state.steps}
        stepIndex={this.state.stepIndex}
        nextStepHandler={this.finishStep.bind(this)}
        showContinue={
          this.state.stepIndex !== STEP_AUTHENTICATION && !this.props.enlisting
        }
        showTransactions={this.state.stepIndex === STEP_ENLISTING}
        transactions={this.state.transactions}
        transactionIndex={this.props.transactionIndex}
        transactionError={this.props.transactionError}
        loading={this.props.enlisting}
        done={
          this.state.stepIndex === STEP_ENLISTING &&
          !this.props.enlisting &&
          !this.props.transactionError
        }
        modal={true}
      >
        <div style={this.showOrHide(STEP_INTRO)}>
          <h1>Enlist your {this.props.type}</h1>
          <p>
            To enlist your {this.props.type} you need DTX tokens. As DataBroker
            DAO is currently in beta, we will provide you with free demo tokens.
          </p>
        </div>

        <StyledFormDiv style={this.showOrHide(STEP_AUTHENTICATION)}>
          <h1>Login</h1>
          <LoginForm
            login={this.props.login}
            callBack={async () => {
              await this.props.fetchWallet();
              this.finishStep(STEP_AUTHENTICATION);
            }}
          />
        </StyledFormDiv>

        <div style={this.showOrHide(STEP_ENLISTING)}>
          <h1>Saving to the blockchain</h1>
          <p>
            It takes a while to save to the blockchain due to blocks that have
            to be mined before your transaction can be confirmed.
          </p>
        </div>

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
      </TransactionDialog>
    );
  }

  showOrHide(step) {
    return {
      display: this.state.stepIndex === step ? 'block' : 'none'
    };
  }
}

const mapStateToProps = (state, ownProps) => ({
  token: state.auth.token,
  enlisting: get(state, `listings.enlisting${ucFirst(ownProps.type)}`),
  transactionIndex: state.listings.transactionIndex,
  transactionError: state.listings.transactionError,
  balance: state.wallet.wallet.balance
});

function ucFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    clearErrors: () => dispatch(LISTING_ACTIONS.clearErrors()),
    register: (values, settings) =>
      dispatch(AUTH_ACTIONS.register(values, settings)),
    login: (values, settings) => dispatch(AUTH_ACTIONS.login(values, settings)),
    enlistSensor: sensor => {
      switch (ownProps.type) {
        case TYPE_STREAM:
          dispatch(LISTING_ACTIONS.enlistStream(sensor));
          break;
        case TYPE_DATASET:
          dispatch(LISTING_ACTIONS.enlistDataset(sensor));
          break;
        default:
          throw new Error(`Unknown type ${ownProps.type}`);
      }
    },
    fetchWallet: () => dispatch(WALLET_ACTIONS.fetchWallet())
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(EnlistConfirmationDialog));
