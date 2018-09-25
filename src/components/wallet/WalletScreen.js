import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import Toolbar from '../generic/Toolbar';
import CenteredCard from '../generic/CenteredCard';
import CardContent from '../generic/CardContent';
import ToolbarSpacer from '../generic/ToolbarSpacer';
import { AUTH_ACTIONS } from '../../redux/authentication/actions';
import { WALLET_ACTIONS } from '../../redux/wallet/actions';
import TitleCTAButton from '../generic/TitleCTAButton';
import localStorage from '../../localstorage';
import { convertWeiToDtx } from '../../utils/transforms';
import DepositDtxDialog from './DepositDtxDialog';
import WithdrawDtxDialog from './WithdrawDtxDialog';

class WalletScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      DepositDtxDialogVisible: false,
      WithdrawDtxDialogVisible: false
    };
  }

  componentDidMount() {
    this.props.fetchDBDAOBalance();
    this.props.fetchMainnetBalance();
  }

  toggleDepositDtxDialog() {
    this.props.clearErrors();
    this.setState({
      DepositDtxDialogVisible: !this.state.DepositDtxDialogVisible
    });
  }

  toggleWithdrawDtxDialog() {
    this.props.clearErrors();
    this.setState({
      WithdrawDtxDialogVisible: !this.state.WithdrawDtxDialogVisible
    });
  }

  render() {
    const address = localStorage.getItem('address');
    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
    const email = localStorage.getItem('email');
    let DTXBalance = '(loading)';
    if (!this.props.fetchingWallet && this.props.balance) {
      DTXBalance = convertWeiToDtx(this.props.balance);
    }

    const StyledTitleContainer = styled.div`
      display: flex;
      justify-content: space-between;

      @media (max-width: ${props => props.theme.mobileBreakpoint}) {
        flex-direction: column;
      }
    `;

    const DesktopAddress = styled.p`
      display: none;

      @media (min-width: ${props => props.theme.mobileBreakpoint}) {
        display: block;
      }
    `;

    const MobileAddress = styled.p`
      @media (min-width: ${props => props.theme.mobileBreakpoint}) {
        display: none;
      }
    `;

    return (
      <div>
        <Toolbar showTabs={true} />
        <ToolbarSpacer />
        <CenteredCard>
          <CardContent>
            <StyledTitleContainer>
              <h1>DTX balance: {DTXBalance}</h1>
              <div>
                <TitleCTAButton
                  flat
                  primary
                  swapTheming
                  disabled={this.props.depositing}
                  onClick={this.toggleDepositDtxDialog.bind(this)}
                >
                  Deposit
                </TitleCTAButton>
                <TitleCTAButton
                  flat
                  primary
                  swapTheming
                  disabled={this.props.withdrawing}
                  onClick={this.toggleWithdrawDtxDialog.bind(this)}
                >
                  Withdraw
                </TitleCTAButton>
              </div>
            </StyledTitleContainer>
            <DesktopAddress>Address: {address}</DesktopAddress>
            <MobileAddress>Address: {shortAddress}</MobileAddress>
            <p>Email: {email}</p>
            <p>
              <a href="#logout" onClick={() => this.props.logout()}>
                Log out
              </a>
            </p>
          </CardContent>
        </CenteredCard>
        <DepositDtxDialog
          visible={this.state.DepositDtxDialogVisible}
          hideEventHandler={() => this.toggleDepositDtxDialog()}
        />
        <WithdrawDtxDialog
          visible={this.state.WithdrawDtxDialogVisible}
          hideEventHandler={() => this.toggleWithdrawDtxDialog()}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  token: state.auth.token,
  balance: state.wallet.wallet.balance,
  fetchingWallet: state.wallet.fetchingWallet,
  depositing: state.wallet.depositing,
  withdrawing: state.wallet.withdrawing,
  stepIndex: state.wallet.stepIndex
});

function mapDispatchToProps(dispatch) {
  return {
    logout: () => dispatch(AUTH_ACTIONS.logout()),
    clearErrors: () => dispatch(WALLET_ACTIONS.clearErrors()),
    fetchDBDAOBalance: () => dispatch(WALLET_ACTIONS.fetchDBDAOBalance()),
    fetchMainnetBalance: () => dispatch(WALLET_ACTIONS.fetchMainnetBalance()),
    removeMePls: () =>
      dispatch(
        WALLET_ACTIONS.withdrawTokens(
          10,
          '0xfEA9698ce70e90CeE91D4C9148F9605c6CF1742C'
        )
      )
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletScreen);
