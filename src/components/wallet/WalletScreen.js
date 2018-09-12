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

class WalletScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      DepositDtxDialogVisible: false
    };
  }

  componentDidMount() {
    this.props.fetchWallet();
    this.props.fetchSenderBalance();
  }

  toggleDepositDtxDialog() {
    this.setState({
      DepositDtxDialogVisible: !this.state.DepositDtxDialogVisible
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
              <TitleCTAButton
                flat
                primary
                swapTheming
                disabled={this.props.depositing}
                onClick={this.toggleDepositDtxDialog.bind(this)}
              >
                Deposit DTX
              </TitleCTAButton>
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
      </div>
    );
  }
}

const mapStateToProps = state => ({
  token: state.auth.token,
  balance: state.wallet.wallet.balance,
  fetchingWallet: state.wallet.fetchingWallet,
  depositing: state.wallet.depositing,
  stepIndex: state.wallet.stepIndex
});

function mapDispatchToProps(dispatch) {
  return {
    logout: () => dispatch(AUTH_ACTIONS.logout()),
    fetchWallet: () => dispatch(WALLET_ACTIONS.fetchWallet()),
    fetchSenderBalance: () => dispatch(WALLET_ACTIONS.fetchSenderBalance())
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletScreen);
