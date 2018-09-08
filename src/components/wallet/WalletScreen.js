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
import MintConfirmationDialog from './MintConfirmationDialog';

class WalletScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      MintConfirmationDialogVisible: false
    };
  }

  componentDidMount() {
    this.props.fetchWallet();
  }

  toggleConfirmationDialog() {
    this.setState({
      MintConfirmationDialogVisible: !this.state.MintConfirmationDialogVisible
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
                disabled={this.props.minting}
                onClick={this.toggleConfirmationDialog.bind(this)}
              >
                Fund wallet
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
        <MintConfirmationDialog
          visible={this.state.MintConfirmationDialogVisible}
          hideEventHandler={() => this.toggleConfirmationDialog()}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  token: state.auth.token,
  balance: state.wallet.wallet.balance,
  fetchingWallet: state.wallet.fetchingWallet,
  minting: state.wallet.minting,
  stepIndex: state.wallet.stepIndex
});

function mapDispatchToProps(dispatch) {
  return {
    logout: () => dispatch(AUTH_ACTIONS.logout()),
    fetchWallet: () => dispatch(WALLET_ACTIONS.fetchWallet()),
    mintTokens: amount => dispatch(WALLET_ACTIONS.mintTokens(amount))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletScreen);
