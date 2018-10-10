import React, { Component } from 'react';
import { Checkbox } from 'react-md';
import DatePicker from 'react-md/lib/Pickers/DatePickerContainer';
import { connect } from 'react-redux';
import moment from 'moment';
import { BigNumber } from 'bignumber.js';
import { withRouter } from 'react-router-dom';
import LoginForm from '../authentication/LoginForm';
import TransactionDialog from '../generic/TransactionDialog';
import { WALLET_ACTIONS } from '../../redux/wallet/actions';
import { PURCHASES_ACTIONS } from '../../redux/purchases/actions';
import { AUTH_ACTIONS } from '../../redux/authentication/actions';
import { convertWeiToDtx } from '../../utils/transforms';
import styled from 'styled-components';

const StyledFormDiv = styled.div`
  .loginForm {
    padding: 0 20% !important;
  }
`;

const STEP_INTRO = 0,
  STEP_AUTHENTICATION = 1,
  STEP_CONFIG = 2,
  STEP_PURCHASING = 3,
  STEP_BALANCE_ERROR = 4;

export const TX_APPROVE = 1,
  TX_ENSURE_APPROVE = 2,
  TX_PURCHASE = 3,
  TX_ENSURE_PURCHASE = 4,
  TX_VERIFY_PURCHASE = 5;

class PurchaseSensorDialog extends Component {
  constructor(props) {
    super(props);

    const defaultPurchaseEndTime = moment()
      .add(7, 'd')
      .format('MM/DD/YYYY');

    const steps = this.props.token
      ? [
          { id: STEP_INTRO, description: 'Intro' },
          { id: STEP_CONFIG, description: 'Delivery' },
          { id: STEP_PURCHASING, description: 'Purchase' }
        ]
      : [
          { id: STEP_INTRO, description: 'Intro' },
          { id: STEP_AUTHENTICATION, description: 'Authentication' },
          { id: STEP_CONFIG, description: 'Delivery' },
          { id: STEP_PURCHASING, description: 'Purchase' }
        ];

    const transactions = [
      {
        id: TX_APPROVE,
        title: 'DTX',
        description:
          'Approve the amount of DTX to be spent by the registry smart contract'
      },
      {
        id: TX_ENSURE_APPROVE,
        title: 'Mining',
        description: 'Await for the transaction to be taken up in a block'
      },
      {
        id: TX_PURCHASE,
        title: 'Purchase',
        description: `Send a transaction to purchase your ${
          this.props.type
        } in the registry smart contract`
      },
      {
        id: TX_ENSURE_PURCHASE,
        title: 'Mining',
        description: 'Await for the transaction to be taken up in a block'
      },
      {
        id: TX_VERIFY_PURCHASE,
        title: 'Sync',
        description: `Verify the ${
          this.props.type
        } was properly purchased and synced with Databroker DAO`
      }
    ];

    this.state = {
      steps: steps,
      stepIndex: STEP_INTRO,
      transactions: transactions,
      transactionIndex: TX_APPROVE,
      purchasing: false,
      complete: false,
      receiveEmail: true,
      modal: false,
      purchaseEndTime: defaultPurchaseEndTime //Today + 7 days
    };
  }

  componentDidMount() {
    this.props.fetchDBDAOBalance();
  }

  finishStep(step) {
    switch (step) {
      case STEP_INTRO:
        if (!this.props.token) {
          this.setState({ stepIndex: STEP_AUTHENTICATION });
          break;
        }

        this.setState({ stepIndex: STEP_CONFIG });
        break;
      case STEP_AUTHENTICATION:
        this.setState({ stepIndex: STEP_CONFIG });
        break;
      case STEP_CONFIG:
        const price = this.calculatePurchasePrice();
        const hasTheMoney =
          this.props.balance &&
          BigNumber(this.props.balance).isGreaterThan(price);

        if (!hasTheMoney) {
          this.setState({
            stepIndex: STEP_BALANCE_ERROR,
            balanceDeficient: this.props.balance
              ? price.minus(BigNumber(this.props.balance)).toString()
              : null
          });
          break;
        }

        this.setState({ stepIndex: STEP_PURCHASING, modal: true });
        this.props.purchaseAccess(
          this.props.sensor,
          this.props.sensor.updateinterval ? this.state.purchaseEndTime : 0 // Pass endtime of 0 when a dataset is purchased forever
        );

        break;
      case STEP_PURCHASING:
        this.props.fetchPurchase(this.props.sensor.key);
        this.props.hideEventHandler();
        this.reset();
        break;
      case STEP_BALANCE_ERROR:
        this.props.history.push(`/wallet`);
        break;
      default:
        break;
    }
  }

  reset() {
    this.setState({ stepIndex: STEP_INTRO });
    this.props.clearErrors();
  }

  handleReceiveEmailChange(value) {
    this.setState({ receiveEmail: value });
  }

  handlePurchaseEndTimeChange(value) {
    this.setState({ purchaseEndTime: value });
  }

  render() {
    return (
      <TransactionDialog
        visible={this.props.visible}
        onHide={this.props.hideEventHandler}
        steps={this.state.steps}
        stepIndex={this.state.stepIndex}
        nextStepHandler={this.finishStep.bind(this)}
        showContinue={
          this.state.stepIndex !== STEP_AUTHENTICATION && !this.props.purchasing
        }
        showTransactions={this.state.stepIndex === STEP_PURCHASING}
        transactions={this.state.transactions}
        transactionIndex={this.props.transactionIndex}
        transactionError={this.props.transactionError}
        loading={this.props.purchasing}
        done={
          this.state.stepIndex === STEP_PURCHASING &&
          !this.props.purchasing &&
          !this.props.transactionError
        }
        modal={this.state.modal}
      >
        <div style={this.showOrHide(STEP_INTRO)}>
          <h1>Purchase access</h1>
          <p>
            Purchases are made using DTX tokens. As DataBroker DAO is currently
            in beta, we will provide you with free demo tokens.
          </p>
        </div>
        <StyledFormDiv style={this.showOrHide(STEP_AUTHENTICATION)}>
          <h1>Login</h1>
          <LoginForm
            login={this.props.login}
            callBack={async () => {
              await this.props.fetchDBDAOBalance();
              this.finishStep(STEP_AUTHENTICATION);
            }}
          />
        </StyledFormDiv>
        <div style={this.showOrHide(STEP_CONFIG)}>
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
          {this.props.sensor.updateinterval && (
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
        <div style={this.showOrHide(STEP_BALANCE_ERROR)}>
          <h1>Your DTX balance is too low</h1>
          {this.state.balanceDeficient && (
            <p>
              You have {convertWeiToDtx(this.props.balance)}
              DTX which is {convertWeiToDtx(this.state.balanceDeficient)}
              DTX short of the purchase price
            </p>
          )}
          <p>
            As DataBroker DAO is currently in beta, you can fund your wallet
            with demo tokens free of charge.
          </p>
        </div>
        <div style={this.showOrHide(STEP_PURCHASING)}>
          <h1>Saving to the blockchain</h1>
          <p>
            It takes a while to save your purchase to the blockchain due to
            blocks that have to be mined before your transaction can be
            confirmed.
          </p>
        </div>
      </TransactionDialog>
    );
  }

  calculatePurchasePrice() {
    let purchasePrice;
    if (this.props.sensor.updateinterval) {
      const now = moment();
      const intervalMs = this.props.sensor.updateinterval;
      const durationMs = moment(this.state.purchaseEndTime).diff(now);
      const numIntervals = Math.ceil(durationMs / intervalMs);

      purchasePrice = BigNumber(this.props.sensor.price).multipliedBy(
        numIntervals
      );
    } else {
      purchasePrice = BigNumber(this.props.sensor.price);
    }

    return purchasePrice;
  }

  showOrHide(step) {
    return {
      display: this.state.stepIndex === step ? 'block' : 'none'
    };
  }
}

const mapStateToProps = state => ({
  token: state.auth.token,
  balance: state.wallet.wallet.balance,
  purchasing: state.purchases.purchasing,
  transactionIndex: state.purchases.transactionIndex,
  transactionError: state.purchases.transactionError
});

function mapDispatchToProps(dispatch) {
  const purchaser = localStorage.getItem('address');

  return {
    register: (values, settings) =>
      dispatch(AUTH_ACTIONS.register(values, settings)),
    login: (values, settings) => dispatch(AUTH_ACTIONS.login(values, settings)),
    purchaseAccess: (stream, endTime) =>
      dispatch(PURCHASES_ACTIONS.purchaseAccess(stream, endTime)),
    fetchDBDAOBalance: () => dispatch(WALLET_ACTIONS.fetchDBDAOBalance()),
    fetchPurchase: sensor =>
      dispatch(PURCHASES_ACTIONS.fetchPurchase(null, sensor, purchaser)),
    clearErrors: () => dispatch(PURCHASES_ACTIONS.clearErrors())
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(PurchaseSensorDialog));
