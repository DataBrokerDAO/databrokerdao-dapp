import React, { Component } from 'react';

import Toolbar from '../generic/Toolbar';
import LandingContent from './LandingContent';
import LandingBackground from './LandingBackground';
import MapErrorBoundary from '../generic/MapErrorBoundary';
import { connect } from 'react-redux';
import { WALLET_ACTIONS } from '../../redux/wallet/actions';

class LandingScreen extends Component {
  componentDidMount() {
    if (this.props.token) this.props.fetchWallet();
  }

  render() {
    return (
      <div>
        <Toolbar showTabs={false} token={this.props.token} />
        <LandingContent />
        <MapErrorBoundary>
          {error => {
            return <LandingBackground error={error} />;
          }}
        </MapErrorBoundary>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  token: state.auth.token
});

function mapDispatchToProps(dispatch) {
  return {
    fetchWallet: () => dispatch(WALLET_ACTIONS.fetchWallet())
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LandingScreen);
