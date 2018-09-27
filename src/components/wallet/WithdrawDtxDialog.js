import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import LoginForm from '../authentication/LoginForm';
import TransactionDialog from '../generic/TransactionDialog';
import { convertWeiToDtx } from '../../utils/transforms';
import { WALLET_ACTIONS } from '../../redux/wallet/actions';
import { AUTH_ACTIONS } from '../../redux/authentication/actions';
import styled from 'styled-components';
import { TextField } from 'react-md';

const StyledFormDiv = styled.div`
  .loginForm {
    padding: 0 20% !important;
  }
`;

const StyledDiv = styled.div`
  padding: 0 20%;
  p {
    padding: 0 !important;
    text-align: left !important;
  }
`;

const STEP_INTRO = 1,
  STEP_AUTHENTICATION = 2,
  STEP_METAMASK_INSTALL = 3,
  STEP_WITHDRAW = 4,
  STEP_TRANSFER = 5,
  STEP_BALANCE_ERROR = 6;

export const TX_WITHDRAW_CHECK_BALANCE = 1,
  TX_WITHDRAW_REQUEST_TRANSFER = 2,
  TX_WITHDRAW_AWAIT_WITHDRAW_GRANTED = 3,
  TX_WITHDRAW_WITHDRAW_DTX = 4,
  TX_WITHDRAW_AWAIT_TRANSFER = 5;

class WithdrawDtxDialog extends Component {
  constructor(props) {
    super(props);

    const steps = [
      { id: STEP_INTRO, description: 'Intro' },
      { id: STEP_AUTHENTICATION, description: 'Authentication' },
      { id: STEP_METAMASK_INSTALL, description: 'MetaMask' },
      { id: STEP_WITHDRAW, description: 'Withdraw' },
      { id: STEP_TRANSFER, description: 'Transfer' }
    ];

    const transactions = [
      {
        id: TX_WITHDRAW_CHECK_BALANCE,
        title: 'Balance',
        description: `Verify your DTX token balance is sufficient to perform the withdrawal`
      },
      {
        id: TX_WITHDRAW_REQUEST_TRANSFER,
        title: 'Request',
        description: `Awaiting the DTX token transfer onto our ERC20 TokenBridge`
      },
      {
        id: TX_WITHDRAW_AWAIT_WITHDRAW_GRANTED,
        title: 'Approval',
        description:
          "Awaiting the TokenBridgeValidator's signature to grant the withdrawal from our ERC20 TokenBridge"
      },
      {
        id: TX_WITHDRAW_WITHDRAW_DTX,
        title: 'Withdraw',
        description:
          'Requesting to withdraw DTX tokens from the ERC20 TokenBridge into your wallet'
      },
      {
        id: TX_WITHDRAW_AWAIT_TRANSFER,
        title: 'Transfer',
        description:
          'Awaiting for the DTX tokens to be transfered into your wallet'
      }
    ];

    this.state = {
      steps: steps,
      stepIndex: STEP_INTRO,
      transactions: transactions,
      transactionIndex: TX_WITHDRAW_CHECK_BALANCE,
      transactionError: null,
      withdrawing: false,
      complete: false,
      amountField: '1'
    };
  }

  finishStep(step) {
    switch (step) {
      case STEP_INTRO:
        if (
          this.props.fetchingMainnetBalanceError ||
          this.props.fetchingWalletError
        ) {
          this.setState({ stepIndex: STEP_BALANCE_ERROR });
          break;
        }

        if (!this.props.token) {
          this.setState({ stepIndex: STEP_AUTHENTICATION });
          break;
        }

        if (!this.props.connected) {
          this.setState({ stepIndex: STEP_METAMASK_INSTALL });
          break;
        }

        this.setState({
          stepIndex: STEP_WITHDRAW
        });
        break;
      case STEP_AUTHENTICATION:
        if (!this.props.connected) {
          this.setState({ stepIndex: STEP_METAMASK_INSTALL });
        } else if (!this.props.token) {
          this.setState({ stepIndex: STEP_AUTHENTICATION });
        } else {
          this.setState({
            stepIndex: STEP_WITHDRAW,
            transactionIndex: TX_WITHDRAW_CHECK_BALANCE
          });
        }
        break;
      case STEP_METAMASK_INSTALL:
        this.setState({ stepIndex: STEP_INTRO });
        break;
      case STEP_WITHDRAW:
        let amount = this.state.amountField;
        const recipient = this.props.address;
        if (!amount || !recipient) {
          return;
        }

        this.props.withdrawTokens(amount, recipient);
        this.setState({ stepIndex: STEP_TRANSFER });
        break;
      case STEP_TRANSFER:
        this.props.hideEventHandler();
        this.reset();
        break;
      case STEP_BALANCE_ERROR:
        this.setState({ stepIndex: STEP_INTRO });
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

  handleAmountChange = value => {
    this.setState({
      amountField: value
    });
  };

  render() {
    const steps = [];
    for (const step of this.state.steps) {
      if (step.id === STEP_AUTHENTICATION && this.props.token) {
        continue;
      }
      if (step.id === STEP_METAMASK_INSTALL && this.props.connected) {
        continue;
      }
      steps.push(step);
    }

    // Fetch dbdao wallet balance
    const balanceKnown = !this.props.fetchingWallet && this.props.balance;
    const databrokerBalance = balanceKnown
      ? convertWeiToDtx(this.props.balance)
      : '(loading)';

    // Fetch mainnet wallet balance
    const mainnetBalanceKnown =
      !this.props.fetchingMainnetBalance && this.props.mainnetBalance;
    const mainnetBalance = mainnetBalanceKnown
      ? convertWeiToDtx(this.props.mainnetBalance)
      : '(loading)';

    return (
      <TransactionDialog
        maxWidth={800}
        visible={this.props.visible}
        onHide={this.props.hideEventHandler}
        steps={steps}
        stepIndex={this.state.stepIndex}
        nextStepHandler={this.finishStep.bind(this)}
        showContinue={
          this.state.stepIndex !== STEP_AUTHENTICATION &&
          !this.props.withdrawing
        }
        showTransactions={this.state.stepIndex === STEP_TRANSFER}
        transactions={this.state.transactions}
        transactionIndex={this.props.transactionIndex}
        transactionError={this.props.transactionError}
        loading={this.props.withdrawing}
        done={
          this.state.stepIndex === STEP_TRANSFER &&
          !this.props.withdrawing &&
          !this.props.transactionError
        }
        modal={true}
      >
        <div style={this.showOrHide(STEP_INTRO)}>
          <h1>DTX Token Withdraw </h1>
          <p>
            Please note withdrawing DTX tokens requires you to first transfer
            the tokens from your Databroker DAO wallet onto our ERC20
            TokenBridge, after which a withdrawal can be made to transfer them
            into mainnet walet. The latter entails a gas cost.
          </p>
        </div>

        <StyledFormDiv style={this.showOrHide(STEP_AUTHENTICATION)}>
          <h1>Login</h1>
          <LoginForm
            login={this.props.login}
            callBack={async () => {
              await this.props.fetchDBDAOBalance();
              this.finishStep(STEP_AUTHENTICATION);
            }}
          />
        </StyledFormDiv>

        <div style={this.showOrHide(STEP_METAMASK_INSTALL)}>
          <h1>MetaMask Install</h1>
          <p>
            Please install the{' '}
            <a target="_blank" href="https://metamask.io/">
              Metamask
            </a>{' '}
            browser extension to continue. If you have already installed
            Metamask, please unlock your account.
          </p>
        </div>

        <div style={this.showOrHide(STEP_WITHDRAW)}>
          <h1>Withdraw DTX to your wallet</h1>
          <StyledDiv>
            <p>
              Databroker DAO balance: <b>{databrokerBalance} DTX</b>
            </p>
            <p>
              Mainnet balance: <b>{mainnetBalance} DTX</b>
            </p>

            <TextField
              id="amount"
              label="Withdraw DTX to Mainnet"
              type="number"
              onChange={this.handleAmountChange}
              value={this.state.amountField}
              fullWidth={false}
            />
          </StyledDiv>
        </div>

        <div style={this.showOrHide(STEP_BALANCE_ERROR)}>
          <h1>Balance Error</h1>
          {this.props.fetchingMainnetBalanceError && (
            <p>
              It appears we were unable to fetch your DTX balance on the
              Ethereum Mainnet Balance, please double check your account in
              MetaMask
            </p>
          )}
          {this.props.fetchingWalletError && (
            <p>
              It appears we were unable to fetch your DTX balance on MintNet,
              our apologies for this inconvenience.
            </p>
          )}
        </div>

        <div style={this.showOrHide(STEP_TRANSFER)}>
          <h1>Withdrawing from ERC20 Token Bridge</h1>
          <p>
            It takes a while to withdraw your DTX tokens from the Bridge because
            the transaction needs to be taken up in a block on the mainnet after
            which the TokenBridgeValidator needs to sign off on all
            transactions. Please do not close this window until you get
            confirmation your withdrawal was a success.
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
  address: state.auth.address,
  withdrawing: state.wallet.withdrawing,
  withdrawingError: state.wallet.withdrawingError,
  fetchingWallet: state.wallet.fetchingWallet,
  fetchingWalletError: state.wallet.fetchingWalletError,
  mainnetBalance: state.wallet.mainnetBalance,
  fetchingMainnetBalance: state.wallet.fetchingMainnetBalance,
  fetchingMainnetBalanceError: state.wallet.fetchingMainnetBalanceError,
  transactionIndex: state.wallet.transactionIndex,
  transactionError: state.wallet.transactionError,
  balance: state.wallet.wallet.balance,
  connected: state.wallet.connected
});

function mapDispatchToProps(dispatch, ownProps) {
  return {
    login: (values, settings) => dispatch(AUTH_ACTIONS.login(values, settings)),
    clearErrors: () => dispatch(WALLET_ACTIONS.clearErrors()),
    fetchDBDAOBalance: () => dispatch(WALLET_ACTIONS.fetchDBDAOBalance()),
    withdrawTokens: (amount, recipient) =>
      dispatch(WALLET_ACTIONS.withdrawTokens(amount, recipient))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(WithdrawDtxDialog));
