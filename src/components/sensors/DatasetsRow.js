import React from 'react';
import { TableRow, TableColumn } from 'react-md';
import styled from 'styled-components';

const StyledTableRow = styled(TableRow)`
  cursor: pointer;
`;

const LeftTableColumn = styled(TableColumn)`
  padding-left: 0 !important;
`;

const DatasetsRow = props => (
  <StyledTableRow key={props.key}>
    <LeftTableColumn onClick={() => props.handleClick(props.dataset)}>
      {props.dataset.name}
    </LeftTableColumn>
    <TableColumn onClick={() => props.handleClick(props.dataset)}>
      {props.dataset.category}
    </TableColumn>
    <TableColumn onClick={() => props.handleClick(props.dataset)}>
      {props.dataset.filetype}
    </TableColumn>
  </StyledTableRow>
);

export default DatasetsRow;
