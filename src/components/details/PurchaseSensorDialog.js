import React, { Component } from 'react';
import { Checkbox } from 'react-md';
import DatePicker from 'react-md/lib/Pickers/DatePickerContainer';
import { connect } from 'react-redux';
import moment from 'moment';
import { BigNumber } from 'bignumber.js';
import { withRouter } from 'react-router-dom';
import RegisterForm from '../authentication/RegisterForm';
import TransactionDialog from '../generic/TransactionDialog';
import { WALLET_ACTIONS } from '../../redux/wallet/actions';
import { PURCHASES_ACTIONS } from '../../redux/purchases/actions';
import { AUTH_ACTIONS } from '../../redux/authentication/actions';

const STEP_INTRO = 0,
  STEP_REGISTRATION = 1,
  STEP_CONFIG = 2,
  STEP_PURCHASING = 3,
  STEP_SUCCESS = 4,
  STEP_BALANCE_ERROR = 5;

class PurchaseStreamDialog extends Component {
  constructor(props) {
    super(props);

    const defaultPurchaseEndTime = moment()
      .add(7, 'd')
      .format('MM/DD/YYYY');
    const steps = this.props.token
      ? [
          { id: STEP_INTRO, description: 'Intro' },
          { id: STEP_CONFIG, description: 'Delivery' },
          { id: STEP_PURCHASING, description: 'Purchase' },
          { id: STEP_SUCCESS, description: 'Success' }
        ]
      : [
          { id: STEP_INTRO, description: 'Intro' },
          { id: STEP_REGISTRATION, description: 'Registration' },
          { id: STEP_CONFIG, description: 'Delivery' },
          { id: STEP_PURCHASING, description: 'Purchase' },
          { id: STEP_SUCCESS, description: 'Success' }
        ];

    this.state = {
      steps: steps,
      stepIndex: STEP_INTRO,
      purchaseEndTime: defaultPurchaseEndTime, //Today + 7 days
      receiveEmail: true,
      modal: false
    };
  }

  componentDidMount() {
    this.props.fetchWallet();
  }

  finishStep(step) {
    if (step === STEP_INTRO) {
      if (!this.props.token) this.setState({ stepIndex: STEP_REGISTRATION });
      else this.setState({ stepIndex: STEP_CONFIG });
    } else if (step === STEP_REGISTRATION) {
      this.setState({ stepIndex: STEP_CONFIG });
    } else if (step === STEP_CONFIG) {
      //Check if user has enough DTX in wallet
      const durationSeconds =
        moment(this.state.purchaseEndTime).diff(moment()) / 1000;
      const purchasePrice = this.props.stream.updateinterval
        ? BigNumber(this.props.stream.price).multipliedBy(durationSeconds)
        : BigNumber(this.props.stream.price); // Only multiply price by duration when it's not a forever-purchase: when there is an updateinterval

      if (BigNumber(this.props.balance).isGreaterThan(purchasePrice)) {
        // Check if purchasePrice > balance in wallet
        this.props.purchaseAccess(
          this.props.stream,
          this.props.stream.updateinterval ? this.state.purchaseEndTime : 0 // Pass endtime of 0 when a dataset is purchased forever
        );
        this.setState({ stepIndex: STEP_PURCHASING, modal: true });
      } else {
        this.setState({ stepIndex: STEP_BALANCE_ERROR });
      }
    } else if (step === STEP_PURCHASING) {
      this.setState({ stepIndex: STEP_SUCCESS });
    } else if (step === STEP_SUCCESS) {
      this.props.fetchPurchase(this.props.stream.key);
      this.props.hideEventHandler();
    } else if (step === STEP_BALANCE_ERROR) {
      this.props.history.push(`/wallet`);
    }
  }

  handleReceiveEmailChange(value) {
    this.setState({ receiveEmail: value });
  }

  handlePurchaseEndTimeChange(value) {
    this.setState({ purchaseEndTime: value });
  }

  render() {
    const loading = this.props.purchasingAccess;

    const isDataset =
      this.props.stream.sensortype &&
      this.props.stream.sensortype === 'DATASET';

    return (
      <TransactionDialog
        visible={this.props.visible}
        onHide={this.props.hideEventHandler}
        modal={this.state.modal}
        steps={this.state.steps}
        stepIndex={this.state.stepIndex}
        nextStepHandler={step => {
          this.finishStep(step);
        }}
        loading={loading}
        showContinueButton={this.state.stepIndex !== STEP_REGISTRATION}
      >
        <div
          style={{
            display: this.state.stepIndex === STEP_INTRO ? 'block' : 'none'
          }}
        >
          <h1>Purchase access</h1>
          <p>
            Purchases are made using DTX tokens. As DataBroker DAO is currently
            in beta, we will provide you with free demo tokens.
          </p>
          <p>
            After your purchase, the readings of this stream will be delivered
            via email.
          </p>
        </div>
        <div
          style={{
            display:
              this.state.stepIndex === STEP_REGISTRATION ? 'block' : 'none'
          }}
        >
          <h1>Create account</h1>
          <RegisterForm
            register={(values, settings) =>
              this.props.register(values, settings)
            }
            callBack={async () => {
              await this.props.fetchWallet();
              this.finishStep(STEP_REGISTRATION);
            }}
          />
        </div>
        <div
          style={{
            display: this.state.stepIndex === STEP_CONFIG ? 'block' : 'none',
            padding: '0 15%'
          }}
        >
          <h1>How do you want to receive your data?</h1>
          <Checkbox
            id="purchase-reading-emails"
            name="receive-email-checkbox[]"
            label={`Receive data via email`}
            value="receive-email"
            checked={this.state.receiveEmail}
            style={{ position: 'relative', left: '-10px' }}
            onChange={value => this.handleReceiveEmailChange(value)}
          />
          {this.props.stream.updateinterval && (
            <DatePicker
              id="purchase-end-time"
              label="Receive data until"
              portal
              lastChild
              renderNode={null}
              disableScrollLocking
              value={this.state.purchaseEndTime}
              style={{ marginBottom: '20px' }}
              onChange={value => this.handlePurchaseEndTimeChange(value)}
            />
          )}
        </div>
        <div
          style={{
            display:
              this.state.stepIndex === STEP_BALANCE_ERROR ? 'block' : 'none'
          }}
        >
          <h1>Your DTX balance is too low</h1>
          <p>
            As DataBroker DAO is currently in beta, you can fund your wallet
            with demo tokens free of charge.
          </p>
        </div>
        <div
          style={{
            display: this.state.stepIndex === STEP_PURCHASING ? 'block' : 'none'
          }}
        >
          <h1>Saving to the blockchain</h1>
          <p>
            It takes a while to save your purchase to the blockchain due to
            blocks that have to be mined before your transaction can be
            confirmed.
          </p>
        </div>
        <div
          style={{
            display: this.state.stepIndex === STEP_SUCCESS ? 'block' : 'none'
          }}
        >
          <h1>Purchase successful</h1>
          {this.state.receiveEmail && (
            <p>
              {isDataset
                ? 'You will receive this dataset in your inbox.'
                : 'You will start to receive readings of this stream in your inbox.'}
            </p>
          )}
          {!this.state.receiveEmail && (
            <p>
              Congratulations! You successfully purchased access to this data.
            </p>
          )}
        </div>
      </TransactionDialog>
    );
  }
}

const mapStateToProps = state => ({
  token: state.auth.token,
  purchasingAccess: state.purchases.purchasingAccess,
  balance: state.wallet.wallet.balance
});

function mapDispatchToProps(dispatch) {
  const purchaser = localStorage.getItem('address');

  return {
    register: (values, settings) =>
      dispatch(AUTH_ACTIONS.register(values, settings)),
    purchaseAccess: (stream, endTime) =>
      dispatch(PURCHASES_ACTIONS.purchaseAccess(stream, endTime)),
    fetchWallet: () => dispatch(WALLET_ACTIONS.fetchWallet()),
    fetchPurchase: sensor =>
      dispatch(PURCHASES_ACTIONS.fetchPurchase(null, sensor, purchaser))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(PurchaseStreamDialog));
