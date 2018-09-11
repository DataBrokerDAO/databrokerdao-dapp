import React, { Component } from 'react';
import { connect } from 'react-redux';

import CenteredCard from '../generic/CenteredCard';
import CardContent from '../generic/CardContent';
import { convertWeiToDtx } from '../../utils/transforms';
import { WALLET_ACTIONS } from '../../redux/wallet/actions';

class DepositScreen extends Component {

  componentDidMount() {
    this.props.fetchWallet();
  }

  render() {
    let { databrokerBalance, depositAmount } = this.props;

    if (databrokerBalance) {
        databrokerBalance = convertWeiToDtx(databrokerBalance);
    } else {
        databrokerBalance = '(loading)'
    }

    return (
        <CenteredCard>
            <CardContent>
                <h1>Succesfully deposited {depositAmount} DTX to your account! </h1>
                <h2>Your new databroker balace: {databrokerBalance} DTX</h2>
            </CardContent>
        </CenteredCard>
    );
  }
}

const mapStateToProps = state => ({
  depositAmount: state.bridge.deposit.amount,
  databrokerBalance: state.wallet.wallet.balance,
});

function mapDispatchToProps(dispatch) {
  return {
    fetchWallet: () => dispatch(WALLET_ACTIONS.fetchWallet()),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DepositScreen);
