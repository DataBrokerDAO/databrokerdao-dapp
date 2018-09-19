import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import LoginForm from '../authentication/LoginForm';
import TransactionDialog from '../generic/TransactionDialog';
import { convertDtxToWei, convertWeiToDtx } from '../../utils/transforms';
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
  STEP_DEPOSIT = 4,
  STEP_TRANSFER = 5,
  STEP_BALANCE_ERROR = 6;

export const TX_BALANCE_CHECK = 1,
  TX_DEPOSIT_APPROVE = 2,
  TX_DEPOSIT_TRANSFER = 3;

class DepositDtxDialog extends Component {
  constructor(props) {
    super(props);

    const steps = [
      { id: STEP_INTRO, description: 'Intro' },
      { id: STEP_AUTHENTICATION, description: 'Authentication' },
      { id: STEP_METAMASK_INSTALL, description: 'MetaMask' },
      { id: STEP_DEPOSIT, description: 'Deposit' },
      { id: STEP_TRANSFER, description: 'Transfer' }
    ];

    const transactions = [
      {
        id: TX_BALANCE_CHECK,
        title: 'Verify',
        description: `Verify you have enough DTX tokens in your account to make the deposit onto the TokenBridge`
      },
      {
        id: TX_DEPOSIT_APPROVE,
        title: 'Approve',
        description: `Waiting for DTX deposit approval by our ERC20 token bridge`
      },
      {
        id: TX_DEPOSIT_TRANSFER,
        title: 'Transfer',
        description:
          'Waiting for validator approval before your DTX tokens will be transfered into your wallet'
      }
    ];

    this.state = {
      steps: steps,
      stepIndex: STEP_INTRO,
      transactions: transactions,
      transactionIndex: TX_BALANCE_CHECK,
      transactionError: null,
      depositing: false,
      complete: false,
      amountField: '0.000000000000001'
    };
  }

  finishStep(step) {
    switch (step) {
      case STEP_INTRO:
        if (
          this.props.fetchingSenderBalanceError ||
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
          stepIndex: STEP_DEPOSIT
        });
        break;
      case STEP_AUTHENTICATION:
        if (!this.props.connected) {
          this.setState({ stepIndex: STEP_METAMASK_INSTALL });
        } else if (!this.props.token) {
          this.setState({ stepIndex: STEP_AUTHENTICATION });
        } else {
          this.setState({
            stepIndex: STEP_DEPOSIT,
            transactionIndex: TX_BALANCE_CHECK
          });
        }
        break;
      case STEP_METAMASK_INSTALL:
        this.setState({ stepIndex: STEP_INTRO });
        break;
      case STEP_DEPOSIT:
        let amount = this.state.amountField;
        const recipient = this.props.address;
        if (!amount || !recipient) {
          return;
        }

        amount = convertDtxToWei(amount);
        this.props.depositTokens(amount, recipient);
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

    // Fetch wallet balance
    const balanceKnown = !this.props.fetchingWallet && this.props.balance;
    const databrokerBalance = balanceKnown
      ? convertWeiToDtx(this.props.balance)
      : '(loading)';

    // Fetch sender balance
    const senderBalanceKnown =
      !this.props.fetchingSenderBalance && this.props.senderBalance;
    const senderBalance = senderBalanceKnown
      ? convertWeiToDtx(this.props.senderBalance)
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
          this.state.stepIndex !== STEP_AUTHENTICATION && !this.props.depositing
        }
        showTransactions={this.state.stepIndex === STEP_TRANSFER}
        transactions={this.state.transactions}
        transactionIndex={this.props.transactionIndex}
        transactionError={this.props.transactionError}
        loading={this.props.depositing}
        done={
          this.state.stepIndex === STEP_TRANSFER &&
          !this.props.depositing &&
          !this.props.transactionError
        }
        modal={true}
      >
        <div style={this.showOrHide(STEP_INTRO)}>
          <h1>DTX Token Deposit </h1>
          <p>
            To be able to interact with the platform you will need DTX tokens.
            <br />
            As Databroker DAO runs on a private PoA network we call MintNet, we
            have created an ERC20 Token Bridge which allows us to sync a wallet
            on the mainnet with a wallet on our network. For this to work you
            need to first deposit some DTX tokens onto our bridge so you can
            spend them on MintNet.
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

        <div style={this.showOrHide(STEP_DEPOSIT)}>
          <h1>Deposit DTX to your wallet</h1>
          <StyledDiv>
            <p>
              Databroker DAO balance: <b>{databrokerBalance} DTX</b>
            </p>
            <p>
              Mainnet balance: <b>{senderBalance} DTX</b>
            </p>

            <TextField
              id="amount"
              label="Deposit DTX"
              type="number"
              onChange={this.handleAmountChange}
              value={this.state.amountField}
              fullWidth={false}
            />
          </StyledDiv>
        </div>

        <div style={this.showOrHide(STEP_BALANCE_ERROR)}>
          <h1>Balance Error</h1>
          {this.props.fetchingSenderBalanceError && (
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
          <h1>Transfering to ERC20 Token Bridge</h1>
          <p>
            It takes a while to transfer your DTX onto the Bridge because the transaction needs to be taken
            up in a block on the mainnet after which validator nodes need to sign off on all transactions.
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
  depositing: state.wallet.depositing,
  depositingError: state.wallet.depositingError,
  fetchingWallet: state.wallet.fetchingWallet,
  fetchingWalletError: state.wallet.fetchingWalletError,
  fetchingSenderBalance: state.wallet.fetchingSenderBalance,
  fetchingSenderBalanceError: state.wallet.fetchingSenderBalanceError,
  transactionIndex: state.wallet.transactionIndex,
  transactionError: state.wallet.transactionError,
  balance: state.wallet.wallet.balance,
  connected: state.wallet.connected,
  senderBalance: state.wallet.senderBalance,
  depositAmount: state.wallet.depositAmount,
  depositRecipient: state.wallet.depositRecipient
});

function mapDispatchToProps(dispatch, ownProps) {
  return {
    login: (values, settings) => dispatch(AUTH_ACTIONS.login(values, settings)),
    clearErrors: () => dispatch(WALLET_ACTIONS.clearErrors()),
    fetchWallet: () => dispatch(WALLET_ACTIONS.fetchWallet()),
    depositTokens: (amount, recipient) =>
      dispatch(WALLET_ACTIONS.depositTokens(amount, recipient))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(DepositDtxDialog));
