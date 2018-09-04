import React from 'react';
import map from 'lodash/map';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import { DataTable, TableBody, TablePagination } from 'react-md';
import styled from 'styled-components';
import DatasetsHeader from './DatasetsHeader';
import DatasetsRow from './DatasetsRow';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { SENSORS_ACTIONS } from '../../redux/sensors/actions';

const StyledParagraph = styled.p`
  padding: 24px 24px 24px 0px;
`;

class DatasetsTable extends React.Component {
  componentDidMount() {
    // To fetch all listed datasets we'll need to be logged in
    const owner =
      this.props.listed && this.props.token
        ? localStorage.getItem('address')
        : null;

    const email =
      this.props.purchased && this.props.token
        ? localStorage.getItem('email')
        : null;

    if (this.props.token) this.props.fetchDatasets(0, 10, owner, email);
  }

  handlePagination = (start, rowsPerPage, currentPage) => {
    this.props.updatePage(currentPage, rowsPerPage);
    this.props.fetchDatasets(start, rowsPerPage);
  };

  onViewDatasetDetails(dataset) {
    this.props.history.push(`/dataset/${dataset.key}`);
  }

  render() {
    // If we're not logged in and we try and fetch listed/purchased sensors OR
    // if we're encountering a 401 error -> indicate you must be logged in
    if (
      (this.props.error &&
        this.props.error.response &&
        this.props.error.response.status === 401) ||
      (!this.props.token && (this.props.listed || this.props.purchased))
    ) {
      return <StyledParagraph>{this.props.msgUnauthenticated}</StyledParagraph>;
    }

    if (this.props.error) {
      return <StyledParagraph>{this.props.msgError}</StyledParagraph>;
    }

    if (this.props.fetchingDatasets) {
      return <StyledParagraph>{this.props.msgLoading}</StyledParagraph>;
    }

    if (isEmpty(this.props.datasets)) {
      return <StyledParagraph>{this.props.msgEmpty}</StyledParagraph>;
    }

    return (
      <DataTable baseId="datasets-table" plain>
        <DatasetsHeader />
        <TableBody>
          {this.renderDatasetListItems(this.props.datasets)}
        </TableBody>
        <TablePagination
          visible={this.props.fetchingDatasets ? 'false' : 'true'}
          style={{ marginLeft: 0 }}
          onPagination={this.handlePagination}
          rowsPerPage={this.props.rowsPerPage}
          rows={this.props.rows}
          page={this.props.page}
        />
      </DataTable>
    );
  }

  renderDatasetListItems(datasets) {
    let listItems = map(datasets, (dataset, index) => (
      <DatasetsRow
        key={index + dataset.key}
        dataset={dataset}
        handleClick={this.onViewDatasetDetails.bind(this)}
      />
    ));

    return listItems;
  }
}

DatasetsTable.propTypes = {
  msgError: PropTypes.string.isRequired,
  msgUnauthenticated: PropTypes.string.isRequired,
  msgLoading: PropTypes.string.isRequired,
  msgEmpty: PropTypes.string.isRequired,
  purchased: PropTypes.bool.isRequired,
  listed: PropTypes.bool.isRequired
};

DatasetsTable.defaultProps = {
  msgError: 'Something went wrong',
  msgUnauthenticated: 'Please login to see your datasets.',
  msgLoading: 'Loading datasets...',
  msgEmpty: 'No datasets found',
  purchased: false,
  listed: false
};

function mapDispatchToProps(dispatch) {
  return {
    fetchDatasets: (skip, limit, owner, email) =>
      dispatch(SENSORS_ACTIONS.fetchDatasets(skip, limit, owner, email)),
    updatePage: (page, rowsPerPage) =>
      dispatch(SENSORS_ACTIONS.updateDatasetsPage(page, rowsPerPage))
  };
}

const mapStateToProps = state => ({
  token: state.auth.token,
  fetchingDatasets: state.sensors.fetchingDatasets,
  error: state.sensors.fetchingDatasetsError,
  datasets: state.sensors.datasets,
  rows: state.sensors.datasetsRows,
  page: state.sensors.datasetsPage,
  rowsPerPage: state.sensors.datasetsRowsPerPage
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(DatasetsTable));
