import React, { Component } from 'react';
import {
  DataTable,
  TableHeader,
  TableBody,
  TableRow,
  TableColumn
} from 'react-md';
import styled from 'styled-components';
import { BigNumber } from 'bignumber.js';
import moment from 'moment';

export default class ChallengesTable extends Component {
  convertWeiToDtx(dtxValue) {
    return BigNumber(dtxValue)
      .div(BigNumber(10).pow(18))
      .toString();
  }

  render() {
    const LeftTableColumn = styled(TableColumn)`
      padding-left: 0 !important;
    `;

    return (
      <DataTable baseId="challenges-table" plain>
        <TableHeader>
          <TableRow>
            <LeftTableColumn>Reason</LeftTableColumn>
            <TableColumn>Date</TableColumn>
            <TableColumn>DTX</TableColumn>
          </TableRow>
        </TableHeader>
        <TableBody>
          {this.props.challenges.map(challenge => {
            const stake = this.convertWeiToDtx(challenge.stake);
            const date = moment(
              parseInt(challenge.timestamp, 10) * 1000
            ).format('MMM D, YYYY');

            return (
              <TableRow key={challenge.timestamp}>
                <LeftTableColumn>{challenge.reason}</LeftTableColumn>
                <TableColumn>{date}</TableColumn>
                <TableColumn>{stake}</TableColumn>
              </TableRow>
            );
          })}
        </TableBody>
      </DataTable>
    );
  }
}
