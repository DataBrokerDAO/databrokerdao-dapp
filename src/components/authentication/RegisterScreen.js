import React, { Component } from 'react';
import RegisterForm from './RegisterForm';

import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { AUTH_ACTIONS } from '../../redux/authentication/actions';

class Register extends Component {
  render() {
    return (
      <div>
        <h2>Register</h2>
        <RegisterForm register={this.props.register} />
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    register: (values, settings) =>
      dispatch(AUTH_ACTIONS.register(values, settings)),
    changeRoute: url => dispatch(push(url)),
    dispatch
  };
}

const mapStateToProps = state => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Register);
