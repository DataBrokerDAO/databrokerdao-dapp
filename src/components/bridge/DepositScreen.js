import React, { Component } from 'react';
import { connect } from 'react-redux';
import { TextField } from 'react-md';
import BigNumber from 'bignumber.js';

import CenteredCard from '../generic/CenteredCard';
import CardContent from '../generic/CardContent';
import { BRIDGE_ACTIONS } from '../../redux/bridge/actions';
import { WALLET_ACTIONS } from '../../redux/wallet/actions';
import TitleCTAButton from '../generic/TitleCTAButton';
import { convertDtxToWei, convertWeiToDtx } from '../../utils/transforms';

class DepositScreen extends Component {

  state = {
    amountField: '0.000000000000001',
  }

  componentDidMount() {
    this.props.fetchWallet();
    this.props.fetchSenderBalance();
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
    amount = convertDtxToWei(amount)
    this.props.requestDeposit(amount, recipient);
  }

  render() {
    const { bridge, wallet } = this.props;
    const { amountField } = this.state;

    let databrokerBalance = '(loading)';
    let senderBalance = databrokerBalance; 
    let hasEnoughFunds = false;
    if (!wallet.fetchingWallet && wallet.wallet.balance) {
      databrokerBalance = convertWeiToDtx(wallet.wallet.balance);
    }
    if (!bridge.fetchingBalance && bridge.senderBalance) {
      senderBalance = convertWeiToDtx(bridge.senderBalance);
      hasEnoughFunds = !!amountField.length
        && new BigNumber(senderBalance).minus(new BigNumber(amountField)).isPositive()
    }

    return (
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
            disabled={!hasEnoughFunds}
            onClick={this.handleDepositClick}
          >
            Deposit
        </TitleCTAButton>

        </CardContent>
      </CenteredCard>
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
