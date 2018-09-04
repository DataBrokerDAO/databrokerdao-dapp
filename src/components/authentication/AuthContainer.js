import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Switch, Route } from 'react-router-dom';
import Register from './RegisterScreen';
import Login from './LoginScreen';
import '../../styles/auth.css';
import { Paper } from 'react-md';
import Logo from '../../assets/logo-white.png';

const withSuccessRedirect = Component => (
  <Route render={props => <Component {...props} success="/app" />} />
);

class AuthContainer extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    notifications: PropTypes.array
  };

  render() {
    // const { location, notifications } = this.props;
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(to right,#EE274C 10%, #2E3192 100%)`,
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundBlendMode: 'soft-light'
        }}
      >
        <div style={{ flex: 'none', maxWidth: '500px', textAlign: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <img src={Logo} alt="Logo" style={{ height: '80px' }} />
          </div>
          <div>
            <Paper
              zDepth={3}
              raiseOnHover
              style={{
                marginTop: '5vh',
                backgroundColor: 'white',
                padding: '20px'
              }}
            >
              <Switch>
                <Route
                  exact
                  path="/account/register"
                  render={() => withSuccessRedirect(Register)}
                />
                <Route
                  exact
                  path="/account/login"
                  render={() => withSuccessRedirect(Login)}
                />
              </Switch>
            </Paper>
            {/*<div style={{ marginTop: '5vh' }}>
              <img
                src={SettleMintLogo}
                alt="SettleMint"
                style={{ height: '30px' }}
              />
            </div>*/}
          </div>
        </div>
      </div>
    );
  }
}

export default connect()(AuthContainer);
