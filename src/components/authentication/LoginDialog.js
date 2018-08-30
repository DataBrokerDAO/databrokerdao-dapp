import React, { Component } from 'react';
import { DialogContainer } from 'react-md';
import { connect } from 'react-redux';
import LoginForm from './LoginForm';
import { AUTH_ACTIONS } from '../../redux/authentication/actions';

class LoginDialog extends Component {
  componentDidMount() {
    this.DialogStyle = {};
    if (window.innerWidth > 480)
      this.DialogStyle = {
        width: 'calc(100% - 20px)',
        maxWidth: '500px',
        position: 'relative',
        top: '160px',
        padding: '38px 44px 38px 44px',
        transform: 'translate3d(-50%,0,0)',
        WebkitTransform: 'translate3d(-50%,0,0)'
      };
    else
      this.DialogStyle = {
        width: 'calc(100% - 20px)',
        maxWidth: '500px',
        position: 'relative',
        top: '100px',
        padding: '18px',
        transform: 'translate3d(-50%,0,0)',
        WebkitTransform: 'translate3d(-50%,0,0)'
      };
  }

  render() {
    return (
      <DialogContainer
        id="login"
        visible={this.props.visible}
        onHide={this.props.hideEventHandler}
        focusOnMount={false}
        dialogStyle={this.DialogStyle}
        aria-labelledby="Log In"
      >
        <h1>Log In</h1>
        <LoginForm login={this.props.login} />
      </DialogContainer>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    login: (values, settings) => dispatch(AUTH_ACTIONS.login(values, settings))
  };
}

export default connect(
  null,
  mapDispatchToProps
)(LoginDialog);
