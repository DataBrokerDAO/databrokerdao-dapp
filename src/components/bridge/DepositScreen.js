import React, { Component } from 'react';
import { connect } from 'react-redux';
import { BigNumber } from 'bignumber.js';
import styled from 'styled-components';
import { TextField } from 'react-md';
import { CircularProgress } from 'react-md';

import Toolbar from '../generic/Toolbar';
import CenteredCard from '../generic/CenteredCard';
import CardContent from '../generic/CardContent';
import ToolbarSpacer from '../generic/ToolbarSpacer';
import { BRIDGE_ACTIONS } from '../../redux/bridge/actions';
import { DEPOSIT_STEPS } from '../../redux/bridge/reducer';
import { WALLET_ACTIONS } from '../../redux/wallet/actions';
import EnhancedTextField from '../generic/EnhancedTextField';
import TitleCTAButton from '../generic/TitleCTAButton';

class DepositScreen extends Component {

  state = {
    amountField: '10',
  }

  componentDidMount() {
    this.props.fetchWallet();
    this.props.fetchSenderBalance();
  }

  convertWeiToDtx(dtxValue) {
    return BigNumber(dtxValue)
      .div(BigNumber(10).pow(18))
      .toString();
  }

  convertDtxToWei(weiValue) {
    return BigNumber(weiValue)
      .times(BigNumber(10).pow(18))
      .toString();
  }

  handleAmountChange = (value) => {
    this.setState({
      amountField: value,
    })
  }

  handleDepositClick = () => {
    let amount = this.state.amountField;
    const recipient = this.props.address;
    if (!amount || !recipient) {
      return;
    }
    amount = this.convertDtxToWei(amount)
    this.props.requestDeposit(amount, recipient);
  }

  render() {
    const { bridge, wallet } = this.props;

    let databrokerBalance = '(loading)';
    let senderBalance = databrokerBalance; 
    if (!wallet.fetchingWallet && wallet.wallet.balance) {
      databrokerBalance = this.convertWeiToDtx(wallet.wallet.balance);
    }
    if (!bridge.fetchingBalance && bridge.senderBalance) {
      senderBalance = this.convertWeiToDtx(bridge.senderBalance);
    }

    return (
      <div>
        <Toolbar showTabs={true} />
        <ToolbarSpacer />

        {bridge.deposit.failure ? (
          <CenteredCard>
            <CardContent>
              <h1>Deposit Failed</h1>
            </CardContent>
          </CenteredCard>
        ) : bridge.deposit.success ? (
          <CenteredCard>
            <CardContent>
              <h1>Deposit success</h1>
              <h2>Databroker Balance: {databrokerBalance}</h2>
              <h2>Sender Balance: {senderBalance}</h2>
            </CardContent>
          </CenteredCard>
        ) : bridge.deposit.step === DEPOSIT_STEPS.approved ? (
          <CenteredCard>
            <CardContent>
              <h1>Deposit approved</h1>
              <h2>Waiting for execution</h2>
              <CircularProgress id="loading" />
            </CardContent>
          </CenteredCard>
        ) : bridge.deposit.step === DEPOSIT_STEPS.init ? (
          <CenteredCard>
            <CardContent>
              <h1>Deposit started</h1>
              <h2>Approving deposit</h2>
              <CircularProgress id="loading" />
            </CardContent>
          </CenteredCard>
        ) : (
          <CenteredCard>
            <CardContent>
              <h1>Deposit DTX to your wallet</h1>
              <h2>Databroker Balance: {databrokerBalance}</h2>
              <h2>Sender Balance: {senderBalance}</h2>

              <TextField
                id="amount"
                label="Amount"
                type="number"
                onChange={this.handleAmountChange}
                value={this.state.amountField}
                fullWidth={false}
                />

              <TitleCTAButton
                flat
                primary
                swapTheming
                onClick={this.handleDepositClick}
              >
                Deposit
              </TitleCTAButton>

            </CardContent>
          </CenteredCard>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  address: state.auth.address,
  bridge: state.bridge,
  wallet: state.wallet,
});

function mapDispatchToProps(dispatch) {
  return {
    requestDeposit: (...props) => dispatch(BRIDGE_ACTIONS.requestDeposit(...props)),
    fetchSenderBalance: () => dispatch(BRIDGE_ACTIONS.fetchSenderBalance()),
    fetchWallet: () => dispatch(WALLET_ACTIONS.fetchWallet()),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DepositScreen);
