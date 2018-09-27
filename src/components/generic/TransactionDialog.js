import React, { Component } from 'react';
import { Button, DialogContainer } from 'react-md';
import styled from 'styled-components';
import map from 'lodash/map';
import { PropagateLoader } from 'react-spinners';
import { css } from 'react-emotion';
import 'rc-steps/assets/index.css';
import 'rc-steps/assets/iconfont.css';
import Steps, { Step } from 'rc-steps';
import '../../styles/steps.css';

export default class TransactionDialog extends Component {
  constructor(props) {
    super(props);

    //Outside render() function to allow input fields inside (https://labs.chiedo.com/blog/always-define-components-outside-react-render-method)
    //If not, the input field would loose focus after each key stroke (because technically it's a NEW input field because of react re-render)
    this.StyledContentContainer = styled.div`
      h1 {
        text-align: center;
        margin-bottom: 24px;
      }

      p {
        text-align: center;
        padding: 0 5%;
      }
    `;
  }

  renderSteps() {
    const StyledStep = styled.div`
      color: #b6b6b6;
      text-transform: uppercase;
      margin-right: 24px;
      font-size: 13px;
      font-weight: 500;

      &.active {
        color: ${props => props.theme.dbdaoPink};
      }

      &:last-child {
        margin: 0;
      }

      @media (max-width: ${props => props.theme.mobileBreakpoint}) {
        font-size: 11px;
        margin-right: 14px;
      }
    `;

    const steps = map(this.props.steps, step => {
      const active = step.id === this.props.stepIndex;
      return (
        <StyledStep key={step.id} className={active ? 'active' : ''}>
          {step.description}
        </StyledStep>
      );
    });

    return steps;
  }

  renderTransactions() {
    const StyledTransaction = styled(Step)`
      color: #b6b6b6;
      margin-right: 24px;
      font-size: 13px;
      font-weight: 500;

      &.active {
        color: ${props => props.theme.dbdaoPink} !important;
      }

      &:last-child {
        margin: 0;
      }

      @media (max-width: ${props => props.theme.mobileBreakpoint}) {
        font-size: 11px;
        margin-right: 14px;
      }
    `;

    const transactions = map(this.props.transactions, transaction => {
      const active = transaction.id === this.props.transactionIndex;
      return (
        <StyledTransaction
          className={active ? 'active' : ''}
          key={transaction.id}
          title={transaction.title}
          description={transaction.description}
        />
      );
    });

    return transactions;
  }

  render() {
    let DialogStyle = {};
    const maxWidth = this.props.maxWidth || 1024;
    if (window.innerWidth > 480)
      DialogStyle = {
        width: 'calc(100% - 20px)',
        maxWidth: `${maxWidth}px`,
        position: 'relative',
        top: '160px',
        padding: '44px 44px 36px 44px',
        transform: 'translate3d(-50%,0,0)',
        WebkitTransform: 'translate3d(-50%,0,0)'
      };
    else
      DialogStyle = {
        width: 'calc(100% - 20px)',
        maxWidth: `${maxWidth}px`,
        position: 'relative',
        top: '100px',
        padding: '18px 18px 10px 18px',
        transform: 'translate3d(-50%,0,0)',
        WebkitTransform: 'translate3d(-50%,0,0)'
      };

    const LoaderOverride = css`
      display: block;
      width: 60px;
      margin-right: 60px;
      border-color: #2e3192;
    `;

    const StyledStepsContainer = styled.div`
      display: flex;
      justify-content: center;
      margin-bottom: 30px;

      @media (max-width: ${props => props.theme.mobileBreakpoint}) {
        margin-bottom: 30px;
      }
    `;

    const StyledButtonContainer = styled.div`
      min-height: 60px;
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      overflow: hidden;

      @media (max-width: ${props => props.theme.mobileBreakpoint}) {
        margin-top: 30px;
      }
    `;

    const StyledTransactionsContainer = styled.div`
      margin-top: 30px;
      display: flex;
      justify-content: flex-end;
      align-items: center;

      @media (max-width: ${props => props.theme.mobileBreakpoint}) {
        margin-top: 30px;
      }
    `;

    return (
      <DialogContainer
        id="transaction-dialog"
        visible={this.props.visible || false}
        onHide={this.props.onHide}
        dialogStyle={DialogStyle}
        aria-labelledby="Transaction dialog"
        modal={this.props.modal}
      >
        <StyledStepsContainer>{this.renderSteps()}</StyledStepsContainer>
        <this.StyledContentContainer>
          {this.props.children}
        </this.StyledContentContainer>
        {this.props.showTransactions && (
          <StyledTransactionsContainer>
            <Steps
              current={
                this.props.done
                  ? this.props.transactionIndex
                  : this.props.transactionIndex - 1
              }
              status={this.props.transactionError ? 'error' : null}
            >
              {this.renderTransactions()}
            </Steps>
          </StyledTransactionsContainer>
        )}
        <StyledButtonContainer>
          {this.props.loading && (
            <PropagateLoader
              className={LoaderOverride}
              sizeUnit={'px'}
              size={25}
              color={'#ee274c'}
              loading={true}
              id="transaction-in-progress"
            />
          )}
          {this.props.showContinue && (
            <Button
              flat
              primary
              disabled={this.props.loading}
              className={this.props.loading ? 'disabled-button' : ''}
              swapTheming
              onClick={event =>
                this.props.nextStepHandler(this.props.stepIndex)
              }
            >
              {this.props.transactionError
                ? 'Cancel'
                : this.props.done
                  ? 'Done'
                  : 'Continue'}
            </Button>
          )}
        </StyledButtonContainer>
      </DialogContainer>
    );
  }
}
