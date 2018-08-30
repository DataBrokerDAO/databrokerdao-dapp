import React from 'react';
import { TableHeader, TableRow, TableColumn } from 'react-md';
import styled from 'styled-components';

const LeftTableColumn = styled(TableColumn)`
  padding-left: 0 !important;
`;

const DatasetsHeader = () => (
  <TableHeader>
    <TableRow>
      <LeftTableColumn grow>Name</LeftTableColumn>
      <TableColumn>Category</TableColumn>
      <TableColumn>Filetype</TableColumn>
    </TableRow>
  </TableHeader>
);

export default DatasetsHeader;
