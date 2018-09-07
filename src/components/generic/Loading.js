import React, { Component } from 'react';
import propTypes from 'prop-types';
import { DialogContainer } from 'react-md';
import { connect } from 'react-redux';
import Steps, { Step } from 'rc-steps';
import 'rc-steps/assets/index.css';
import 'rc-steps/assets/iconfont.css';
import '../css/loading.css';
import { PropagateLoader } from 'react-spinners';

class Loading extends Component {
  static propTypes = {
    show: propTypes.bool
  };

  static defaultProps = {
    show: true
  };

  render() {
    return (
      <DialogContainer
        className="loading"
        initialFocus="loading-dialog"
        id="loading-dialog"
        closeOnEsc={false}
        visible={this.props.loading === true}
        modal={true}
        width={350}
        aria-label="Loading"
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            borderRadius: '3px',
            padding: '3em'
          }}
        >
          <PropagateLoader
            sizeUnit={'px'}
            size={30}
            color={'#76b852'}
            loading={this.props.loading === true}
          />
          <div style={{ paddingTop: '2em' }}>
            <Steps direction="vertical" current={this.props.step}>
              <Step title="Creating transaction" />
              <Step title="Sending to the chain" />
              <Step title="Mining a new block" />
              <Step title="Updating the backend" />
            </Steps>
          </div>
        </div>
      </DialogContainer>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch
  };
}

const mapStateToProps = (state, props) => ({
  loading: state.loading.isLoading,
  step: state.loading.step
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Loading);
