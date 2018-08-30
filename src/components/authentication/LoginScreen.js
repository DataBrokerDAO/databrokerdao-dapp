import React, { Component } from 'react';
import LoginForm from './LoginForm';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { AUTH_ACTIONS } from '../../redux/authentication/actions';

class Login extends Component {
  render() {
    return (
      <div>
        <h2>Login</h2>
        <LoginForm login={this.props.login} />
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    changeRoute: url => dispatch(push(url)),
    login: (values, settings) => dispatch(AUTH_ACTIONS.login(values, settings)),
    dispatch
  };
}

const mapStateToProps = state => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
