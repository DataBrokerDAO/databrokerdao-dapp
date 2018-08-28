import React, { Component } from 'react';
import styled from 'styled-components';
import propTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import Logo from '../../assets/databroker-logo-white.svg';
import LogoMobile from '../../assets/databroker-logo-white-mobile.svg';
import Tabs from './Tabs.js';
import LoginDialog from '../authentication/LoginDialog';

class Toolbar extends Component {
  static propTypes = {
    showTabs: propTypes.bool
  };

  constructor(props) {
    super(props);

    this.state = {
      LoginVisible: false
    };
  }

  toggleLogin() {
    this.setState({ LoginVisible: !this.state.LoginVisible });
  }

  goToStreamsScreen() {
    this.props.history.push('/streams');
  }

  render() {
    const StyledToolbar = styled.div`
      background: linear-gradient(
        to right,
        ${props => props.theme.dbdaoPink} 10%,
        ${props => props.theme.dbdaoPurple} 100%
      );
      width: 100%;
      padding: 12px 25px;
      box-shadow: 0 1px 11px rgba(0, 0, 0, 0.5);
      position: fixed;
      z-index: 100;
      top: 0;
      font-size: 14px;
      display: flex;

      @media (max-width: ${props => props.theme.mobileBreakpoint}) {
        padding: 12px 10px;
      }
    `;

    const StyledLogoContainer = styled.div`
      display: flex;
      align-items: center;
      width: 150px;

      @media (max-width: ${props => props.theme.mobileBreakpoint}) {
        width: 50px;
      }
    `;

    const StyledLogo = styled.img`
      height: 28px;
      cursor: pointer;
      margin: 8px 0;

      @media (max-width: ${props => props.theme.mobileBreakpoint}) {
        display: none;
      }
    `;

    const StyledLogoMobile = styled.img`
      height: 28px;
      cursor: pointer;
      margin: 8px 0;

      @media (min-width: ${props => props.theme.mobileBreakpoint}) {
        display: none;
      }
    `;

    const TabsContainer = styled.div`
      flex: 1;
      display: flex;
      align-items: center;
    `;

    const StyledWalletLinkContainer = styled.div`
      display: flex;
      justify-content: flex-end;
      align-items: center;
      width: 150px;

      @media (max-width: ${props => props.theme.mobileBreakpoint}) {
        width: 50px;
      }
    `;

    const StyledWalletLink = styled(Link)`
      color: white;
      font-weight: 600;
      text-decoration: none;
      font-size: 18px;
      font-family: 'Titillium Web', sans-serif;

      @media (max-width: ${props => props.theme.mobileBreakpoint}) {
        font-size: 16px;
      }
    `;

    const StyledLoginSpan = styled.span`
      color: white;
      font-weight: 600;
      font-size: 18px;
      cursor: pointer;
      font-family: 'Titillium Web', sans-serif;
    `;

    return (
      <div>
        <StyledToolbar>
          <StyledLogoContainer>
            <StyledLogo
              src={Logo}
              alt="SettleMint"
              onClick={() => this.goToStreamsScreen()}
            />
            <StyledLogoMobile
              src={LogoMobile}
              alt="SettleMint"
              onClick={() => this.goToStreamsScreen()}
            />
          </StyledLogoContainer>
          <TabsContainer>{this.props.showTabs && <Tabs />}</TabsContainer>
          <StyledWalletLinkContainer>
            {this.props.token && (
              <StyledWalletLink to="/wallet">Wallet</StyledWalletLink>
            )}
            {!this.props.token && (
              <StyledLoginSpan onClick={event => this.toggleLogin()}>
                Log In
              </StyledLoginSpan>
            )}
          </StyledWalletLinkContainer>
        </StyledToolbar>
        <LoginDialog
          visible={this.state.LoginVisible && !this.props.token}
          hideEventHandler={() => this.toggleLogin()}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  token: state.auth.token
});

export default connect(
  mapStateToProps,
  null
)(withRouter(Toolbar));
