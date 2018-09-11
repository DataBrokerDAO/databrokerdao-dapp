import React from 'react';

import CenteredCard from '../../generic/CenteredCard';
import CardContent from '../../generic/CardContent';
import { CircularProgress } from 'react-md';
import { convertWeiToDtx } from '../../../utils/transforms';

export default class SendingStep extends React.Component {
  render() {
    const { bridge } = this.props;
    return (
      <CenteredCard>
        <CardContent>
          <h1>Sending {convertWeiToDtx(bridge.deposit.amount)} DTX to Bridge.</h1>
          <CircularProgress id="loading" />
        </CardContent>
      </CenteredCard>
    )
  }
}
