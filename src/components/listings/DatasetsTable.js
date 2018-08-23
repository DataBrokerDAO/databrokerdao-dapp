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
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faQuestionCircle from '@fortawesome/fontawesome-free-regular/faQuestionCircle';
import { LISTING_ACTIONS, LISTING_TYPES } from '../../redux/listings/actions';

const StyledListItem = styled.span`
  cursor: pointer;
  border-top: 1px solid #e0e0e0;
  margin: 0;

  &:first-child {
    border: none;
  }
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
    if (this.props.token) this.props.fetchDatasetListings(0, 10, 0);
  }

  handlePagination = (start, rowsPerPage, currentPage) => {
    this.props.updateCurrentPage(currentPage);
    this.props.updateRowsPerPage(rowsPerPage);
    this.props.fetchDatasetListings(start, rowsPerPage, 0);
  };

  onViewDatasetDetails(dataset) {
    this.props.history.push(`/dataset/${dataset.key}`);
  }

  render() {
    if (this.props.fetchingDatasets && this.props.datasets.length === 0) {
      return <p>Loading datasets...</p>;
    }

    if (this.props.datasets.length === 0) {
      return <p />;
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
          visible={!this.state.fetchingDatasetListings}
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

    if (this.props.fetchingDatasetListings)
      return (
        <StyledListItem className="disabled">Loading datasets</StyledListItem>
      );
    else if (listItems.length > 0) return listItems;
    else
      return <StyledListItem className="disabled">No datasets</StyledListItem>;
  }
}

function mapDispatchToProps(dispatch) {
  return {
    fetchDatasetListings: (skip, limit, endTime) =>
      dispatch(LISTING_ACTIONS.fetchListings(skip, limit, endTime)),
    updateCurrentPage: currentPage =>
      dispatch(
        LISTING_ACTIONS.updateCurrentPage(
          LISTING_TYPES.UPDATE_CURRENT_PAGE_DATASETS,
          currentPage
        )
      ),
    updateRowsPerPage: rowsPerPage =>
      dispatch(
        LISTING_ACTIONS.updateRowsPerPage(
          LISTING_TYPES.UPDATE_ROWS_PER_PAGE_DATASETS,
          rowsPerPage
        )
      )
  };
}

const mapStateToProps = state => ({
  datasets: state.listings.datasets,
  fetchingDatasetListings: state.listings.fetchingDatasetListings,
  token: state.auth.token, //Used to verify if a user is signed in, if not we don't have to get purchases from API
  totalDatasets: state.listings.totalDatasets,
  rowsDatasets: state.listings.rowsDatasets,
  pageDatasets: state.listings.pageDatasets
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(DatasetsTable));
