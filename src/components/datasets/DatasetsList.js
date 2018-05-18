import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
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

const StyledListItem = styled.p`
  cursor: pointer;
  display: flex;
  align-items: center;
  border-top: 1px solid #e0e0e0;

  &:first-child {
    border: none;
  }
`;

class DatasetsList extends Component {
  handlePagination = (start, limit) => {
    this.props.fetchDatasets({
      ...this.props.filter,
      start,
      limit
    });
  };

  onListItemClick(dataset) {
    this.props.history.push(`/dataset/${dataset.key}`);
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

    let listItems = _.map(datasets, (dataset, index) => {
      return (
        <StyledListItem
          key={dataset.id}
          onClick={event => this.onListItemClick(dataset)}
        >
          <TableRow
            key={`${dataset.key}row${index}`}
            style={{ padding: '15px', width: '100%' }}
          >
            <TableColumn style={{ maxWidth: '90px' }}>
              <Icon
                icon={dataset.category}
                style={{
                  fill: 'rgba(0,0,0,0.5)',
                  width: '20px',
                  height: '20px',
                  marginRight: '25px'
                }}
              />
            </TableColumn>
            <TableColumn grow>
              <div style={{ flex: '1' }}>
                <DatasetName>{dataset.name}</DatasetName>
                <DatasetPrice>
                  Price: {convertWeiToDtx(dataset.price)} DTX
                </DatasetPrice>
                <DatasetDetails>
                  File type: {dataset.filetype}, Owner stake:{' '}
                  {convertWeiToDtx(dataset.stake)} DTX, Challenges:{' '}
                  {dataset.numberofchallenges} ({convertWeiToDtx(
                    dataset.challengesstake
                  )}{' '}
                  DTX)
                </DatasetDetails>
              </div>
            </TableColumn>
            <TableColumn style={{ minWidth: '200px' }}>
              <div>
                <TitleCTAButton flat primary swapTheming onClick={event => {}}>
                  Purchase access
                </TitleCTAButton>
              </div>
            </TableColumn>
          </TableRow>
        </StyledListItem>
      );
    });

    if (this.props.fetchingDatasets)
      return (
        <StyledListItem className="disabled">loading datasets</StyledListItem>
      );
    else if (listItems.length > 0) return listItems;
    else
      return <StyledListItem className="disabled">no datasets</StyledListItem>;
  }

  render() {
    const StyledList = styled.div`
      padding-top: 65px;
      width: 100%;
    `;

    if (this.props.fetchingDatasets)
      return (
        <StyledListItem className="disabled">loading datasets</StyledListItem>
      );

    if (this.props.datasets.length === 0)
      return <StyledListItem className="disabled">no datasets</StyledListItem>;

    return (
      <StyledList>
        <DataTable plain fullWidth>
          <TableBody>
            {this.renderDatasetListItems(this.props.datasets)}
          </TableBody>
          <TablePagination
            onPagination={this.handlePagination}
            defaultRowsPerPage={10}
            rows={_.size(this.props.datasets)}
          />
        </DataTable>
      </StyledList>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    fetchDatasets: filter => dispatch(DATASET_ACTIONS.fetchDatasets(filter))
  };
}

const mapStateToProps = state => ({
  datasets: state.datasets.datasets,
  fetchingDatasets: state.datasets.fetchingDatasets,
  filter: state.datasets.filter
});

export default connect(mapStateToProps, mapDispatchToProps)(
  withRouter(DatasetsList)
);