import React from 'react';
import { TableHeader, TableRow, TableColumn } from 'react-md';
import styled from 'styled-components';

const LeftTableColumn = styled(TableColumn)`
  padding-left: 0 !important;
`;

const StreamsHeader = props => (
  <TableHeader>
    <TableRow>
      <LeftTableColumn grow>Name</LeftTableColumn>
      <TableColumn>Type</TableColumn>
      <TableColumn>Frequency</TableColumn>
      <TableColumn
        style={{ display: props.showDelivery ? 'table-cell' : 'none' }}
      >
        Delivery
      </TableColumn>
    </TableRow>
  </TableHeader>
);

export default StreamsHeader;
