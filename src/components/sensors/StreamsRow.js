import React from 'react';
import { TableRow, TableColumn } from 'react-md';
import styled from 'styled-components';

import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faQuestionCircle from '@fortawesome/fontawesome-free-regular/faQuestionCircle';

const StyledTableRow = styled(TableRow)`
  cursor: pointer;
`;

const LeftTableColumn = styled(TableColumn)`
  padding-left: 0 !important;
`;

const StreamsRow = props => (
  <StyledTableRow key={props.key}>
    <LeftTableColumn onClick={() => props.handleClick(props.stream)}>
      {props.stream.name}
    </LeftTableColumn>
    <TableColumn onClick={() => props.handleClick(props.stream)}>
      {props.stream.type}
    </TableColumn>
    <TableColumn onClick={() => props.handleClick(props.stream)}>
      {props.stream.updateinterval
        ? props.stream.updateinterval === 86400000
          ? 'daily'
          : `${props.stream.updateinterval / 1000}''`
        : ''}
    </TableColumn>

    <TableColumn
      style={{ display: props.showDelivery ? 'table-cell' : 'none' }}
    >
      Email
      <span className="clickable" onClick={props.handleShowDelivery}>
        <FontAwesomeIcon
          icon={faQuestionCircle}
          style={{ marginLeft: '4px' }}
        />
      </span>
    </TableColumn>
  </StyledTableRow>
);

export default StreamsRow;
