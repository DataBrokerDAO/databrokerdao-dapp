import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import LoginForm from '../authentication/LoginForm';
import TransactionDialog from '../generic/TransactionDialog';
import { WALLET_ACTIONS } from '../../redux/wallet/actions';
import { convertDtxToWei } from '../../utils/transforms';
import { AUTH_ACTIONS } from '../../redux/authentication/actions';
import styled from 'styled-components';

const StyledFormDiv = styled.div`
  .loginForm {
    padding: 0 20% !important;
  }
`;

const STEP_INTRO = 1,
  STEP_AUTHENTICATION = 2,
  STEP_MINTING = 3;

export const TX_MINTING = 1,
  TX_ENSURE_MINTING = 2,
  TX_VERIFY_MINT = 3;

class MintConfirmationDialog extends Component {
  constructor(props) {
    super(props);

    const steps = this.props.token
      ? [
          { id: STEP_INTRO, description: 'Intro' },
          { id: STEP_MINTING, description: 'Minting' }
        ]
      : [
          { id: STEP_INTRO, description: 'Intro' },
          { id: STEP_AUTHENTICATION, description: 'Authentication' },
          { id: STEP_MINTING, description: 'Minting' }
        ];

    const transactions = [
      {
        id: TX_MINTING,
        title: 'Mint',
        description: `Mint your tokens`
      },
      {
        id: TX_ENSURE_MINTING,
        title: 'Mining',
        description: 'Await for the transaction to be taken up in a block'
      },
      {
        id: TX_VERIFY_MINT,
        title: 'Sync',
        description:
          'Verify your tokens were minted and synced with Databroker DAO'
      }
    ];

    this.state = {
      steps: steps,
      stepIndex: STEP_INTRO,
      transactions: transactions,
      transactionIndex: TX_MINTING,
      transactionError: null,
      minting: false,
      complete: false
    };
  }

  finishStep(step) {
    switch (step) {
      case STEP_INTRO:
        if (!this.props.token) {
          this.setState({ stepIndex: STEP_AUTHENTICATION });
          break;
        }

        this.setState({
          stepIndex: STEP_MINTING,
          transactionIndex: TX_MINTING
        });
        this.props.mintTokens(convertDtxToWei(5000));
        break;
      case STEP_AUTHENTICATION:
        this.setState({ stepIndex: STEP_INTRO });
        break;
      case STEP_MINTING:
        this.props.hideEventHandler();
        this.reset();
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
        maxWidth={800}
        visible={this.props.visible}
        onHide={this.props.hideEventHandler}
        steps={this.state.steps}
        stepIndex={this.state.stepIndex}
        nextStepHandler={this.finishStep.bind(this)}
        showContinue={
          this.state.stepIndex !== STEP_AUTHENTICATION && !this.props.minting
        }
        showTransactions={this.state.stepIndex === STEP_MINTING}
        transactions={this.state.transactions}
        transactionIndex={this.props.transactionIndex}
        transactionError={this.props.transactionError}
        loading={this.props.minting}
        done={
          this.state.stepIndex === STEP_MINTING &&
          !this.props.minting &&
          !this.props.transactionError
        }
        modal={true}
      >
        <div style={this.showOrHide(STEP_INTRO)}>
          <h1>Mint some DTX tokens</h1>
          <p>
            To be able to interact with the platform you will need DTX tokens.
            As DataBroker DAO is currently in beta, we will provide you with
            free demo tokens.
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

        <div style={this.showOrHide(STEP_MINTING)}>
          <h1>Saving to the blockchain</h1>
          <p>
            It takes a while to save to the blockchain due to blocks that have
            to be mined before your transaction can be confirmed.
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
  minting: state.wallet.minting,
  transactionIndex: state.wallet.transactionIndex,
  transactionError: state.wallet.transactionError,
  balance: state.wallet.wallet.balance
});

function mapDispatchToProps(dispatch, ownProps) {
  return {
    login: (values, settings) => dispatch(AUTH_ACTIONS.login(values, settings)),
    clearErrors: () => dispatch(WALLET_ACTIONS.clearErrors()),
    fetchWallet: () => dispatch(WALLET_ACTIONS.fetchWallet()),
    mintTokens: amount => dispatch(WALLET_ACTIONS.mintTokens(amount))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(MintConfirmationDialog));
