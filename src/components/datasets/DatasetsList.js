import React, { Component } from 'react';
import { connect } from 'react-redux';
import map from 'lodash/map';
import isEmpty from 'lodash/isEmpty';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import { convertWeiToDtx } from '../../utils/transforms';
import TitleCTAButton from '../generic/TitleCTAButton';

import {
  DataTable,
  TableBody,
  TableRow,
  TableColumn,
  TablePagination
} from 'react-md';

import Icon from '../generic/Icon';
import { DATASET_ACTIONS } from '../../redux/datasets/actions';

const StyledParagraph = styled.p`
  padding: 124px 24px 24px 48px;
`;

class DatasetsList extends Component {
  handlePagination = (start, rowsPerPage, currentPage) => {
    this.props.updateCurrentPage(currentPage);
    this.props.updateRowsPerPage(rowsPerPage);
    this.props.fetchDatasets({
      ...this.props.filter,
      start,
      rowsPerPage
    });
  };

  onListItemClick(dataset) {
    this.props.history.push(`/dataset/${dataset.key}`);
  }

  render() {
    const StyledList = styled.div`
      padding-top: 65px;
      width: 100%;
    `;

    if (this.props.fetchingDatasets)
      return <StyledParagraph>Loading datasets...</StyledParagraph>;

    if (isEmpty(this.props.datasets))
      return (
        <StyledParagraph>
          There are currently no datasets on offer
        </StyledParagraph>
      );

    return (
      <StyledList>
        <DataTable plain baseId="datatable-datasets">
          <TableBody>
            {this.renderDatasetListItems(this.props.datasets)}
          </TableBody>
          <TablePagination
            style={{ marginLeft: 0 }}
            onPagination={this.handlePagination}
            rowsPerPage={this.props.rows}
            rows={this.props.total}
            page={this.props.page}
            simplified={'true'}
          />
        </DataTable>
      </StyledList>
    );
  }

  renderDatasetListItems(datasets) {
    const DatasetName = styled.h3`
      margin: 0 0 10px 0;
    `;

    const DatasetDetails = styled.p`
      font-size: 14px;
      color: #b6b6b6;
      margin: 0;
    `;

    const DatasetPrice = styled.p`
      font-size: 14px;
      margin: 0;
    `;

    let listItems = map(datasets, (dataset, index) => {
      return (
        <TableRow
          key={`${dataset.key}row${index}`}
          onClick={event => this.onListItemClick(dataset)}
          style={{ cursor: 'pointer' }}
        >
          <TableColumn adjusted={false}>
            <Icon
              icon={dataset.category}
              style={{
                fill: 'rgba(0,0,0,0.5)',
                width: '20px',
                height: '20px',
                display: 'block',
                margin: '0 auto'
              }}
            />
          </TableColumn>
          <TableColumn grow style={{ padding: '20px 20px 20px 0' }}>
            <div>
              <DatasetName>{dataset.name}</DatasetName>
              <DatasetPrice>
                Price: {convertWeiToDtx(dataset.price)} DTX
              </DatasetPrice>
              <DatasetDetails>
                {dataset.owned ? 'Owner: you, ' : ''}
                File type: {dataset.filetype}, Owner stake:{' '}
                {convertWeiToDtx(dataset.stake)} DTX, Challenges:{' '}
                {dataset.numberofchallenges} (
                {convertWeiToDtx(dataset.challengesstake)} DTX)
              </DatasetDetails>
            </div>
          </TableColumn>
          <TableColumn style={{ minWidth: '200px' }}>
            <div>
              <TitleCTAButton
                disabled={dataset.purchased || dataset.owned}
                flat
                primary
                swapTheming
                onClick={event => {}}
              >
                Purchase access
              </TitleCTAButton>
            </div>
          </TableColumn>
        </TableRow>
      );
    });

    return listItems;
  }
}

function mapDispatchToProps(dispatch) {
  return {
    fetchDatasets: filter => dispatch(DATASET_ACTIONS.fetchDatasets(filter)),
    updateCurrentPage: currentPage =>
      dispatch(DATASET_ACTIONS.updateCurrentPage(currentPage)),
    updateRowsPerPage: rowsPerPage =>
      dispatch(DATASET_ACTIONS.updateRowsPerPage(rowsPerPage))
  };
}

const mapStateToProps = state => ({
  datasets: state.datasets.datasets,
  fetchingDatasets: state.datasets.fetchingDatasets,
  filter: state.datasets.filter,
  total: state.datasets.total,
  rows: state.datasets.rows,
  page: state.datasets.page
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(DatasetsList));
