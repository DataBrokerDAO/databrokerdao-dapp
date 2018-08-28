import React, { Component } from 'react';
import {
  DataTable,
  TableHeader,
  TableBody,
  TableRow,
  TableColumn,
  TablePagination
} from 'react-md';
import map from 'lodash/map';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  PURCHASES_ACTIONS,
  PURCHASES_TYPES
} from '../../redux/purchases/actions';

const StyledParagraph = styled.p`
  padding: 24px 24px 24px 0px;
`;

const LeftTableColumn = styled(TableColumn)`
  padding-left: 0 !important;
`;

const StyledTableRow = styled(TableRow)`
  cursor: pointer;
`;

class DatasetsTable extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    if (this.props.token) this.props.fetchPurchases(0, 10, 0);
  }

  handlePagination = (start, rowsPerPage, currentPage) => {
    this.props.updateCurrentPage(currentPage);
    this.props.updateRowsPerPage(rowsPerPage);
    this.props.fetchPurchases(start, rowsPerPage, 0);
  };

  onViewDatasetDetails(dataset) {
    this.props.history.push(`/dataset/${dataset.key}`);
  }

  render() {
    if (!this.props.token) {
      return (
        <StyledParagraph>
          Please login to see your purchased datasets.
        </StyledParagraph>
      );
    }
    if (this.props.fetchingDatasets && this.props.datasets.length === 0) {
      return <StyledParagraph>Loading datasets...</StyledParagraph>;
    }

    if (this.props.datasets.length === 0) {
      return (
        <StyledParagraph>
          When you purchase access to a dataset, it will be listed here.
        </StyledParagraph>
      );
    }

    return (
      <DataTable baseId="datasets-table" plain>
        <TableHeader>
          <TableRow>
            <LeftTableColumn grow>Name</LeftTableColumn>
            <TableColumn>Category</TableColumn>
            <TableColumn>Filetype</TableColumn>
          </TableRow>
        </TableHeader>
        <TableBody>
          {this.renderDatasetListItems(this.props.datasets)}
        </TableBody>
        <TablePagination
          visible={!this.state.fetchingDatasets}
          style={{ marginLeft: 0 }}
          onPagination={this.handlePagination}
          rowsPerPage={this.props.rowsDatasets}
          rows={this.props.totalDatasets}
          page={this.props.pageDatasets}
        />
      </DataTable>
    );
  }

  renderDatasetListItems(datasets) {
    let listItems = map(datasets, (dataset, index) => (
      <StyledTableRow key={dataset.key}>
        <LeftTableColumn onClick={() => this.onViewDatasetDetails(dataset)}>
          {dataset.name}
        </LeftTableColumn>
        <TableColumn onClick={() => this.onViewDatasetDetails(dataset)}>
          {dataset.category}
        </TableColumn>
        <TableColumn onClick={() => this.onViewDatasetDetails(dataset)}>
          {dataset.filetype}
        </TableColumn>
      </StyledTableRow>
    ));

    return listItems;
  }
}

function mapDispatchToProps(dispatch) {
  return {
    fetchPurchases: (skip, limit, endTime) =>
      dispatch(PURCHASES_ACTIONS.fetchPurchases(skip, limit, endTime)),
    updateCurrentPage: currentPage =>
      dispatch(
        PURCHASES_ACTIONS.updateCurrentPage(
          PURCHASES_TYPES.UPDATE_CURRENT_PAGE_DATASETS,
          currentPage
        )
      ),
    updateRowsPerPage: rowsPerPage =>
      dispatch(
        PURCHASES_ACTIONS.updateRowsPerPage(
          PURCHASES_TYPES.UPDATE_CURRENT_PAGE_DATASETS,
          rowsPerPage
        )
      )
  };
}

const mapStateToProps = state => ({
  datasets: state.purchases.datasets,
  fetchingDatasets: state.purchases.fetchingDatasets,
  token: state.auth.token, //Used to verify if a user is signed in, if not we don't have to get purchases from API
  totalDatasets: state.purchases.totalDatasets,
  rowsDatasets: state.purchases.rowsDatasets,
  pageDatasets: state.purchases.pageDatasets
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(DatasetsTable));
