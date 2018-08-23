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
import DeliveryExplainerDialog from './DeliveryExplainerDialog';

import {
  PURCHASES_ACTIONS,
  PURCHASES_TYPES
} from '../../redux/purchases/actions';

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

class StreamsTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      DeliveryExplainerVisible: false
    };
  }

  componentDidMount() {
    if (this.props.token) this.props.fetchPurchases();
  }

  handlePagination = (start, rowsPerPage, currentPage) => {
    this.props.updateCurrentPage(currentPage);
    this.props.updateRowsPerPage(rowsPerPage);
    this.props.fetchPurchases(start, rowsPerPage);
  };

  onViewStreamDetails(stream) {
    this.props.history.push(`/stream/${stream.key}`);
  }

  toggleDeliveryExplainer() {
    this.setState({
      DeliveryExplainerVisible: !this.state.DeliveryExplainerVisible
    });
  }

  render() {
    if (this.props.fetchingStreams && this.props.streams.length === 0) {
      return <p>Loading streams...</p>;
    }

    if (this.props.streams.length === 0) {
      return (
        <p>When you purchase access to a stream, it will be listed here.</p>
      );
    }

    return (
      <DataTable baseId="streams-table" plain>
        <TableHeader>
          <TableRow>
            <LeftTableColumn grow>Name</LeftTableColumn>
            <TableColumn>Type</TableColumn>
            <TableColumn>Frequency</TableColumn>
            <TableColumn>Delivery</TableColumn>
          </TableRow>
        </TableHeader>
        <TableBody>{this.renderStreamsListItems(this.props.streams)}</TableBody>
        <TablePagination
          visible={!this.state.fetchingStreams}
          style={{ marginLeft: 0 }}
          onPagination={this.handlePagination}
          rowsPerPage={this.props.rowsStreams}
          rows={this.props.totalStreams}
          page={this.props.pageStreams}
        />
        <DeliveryExplainerDialog
          visible={this.state.DeliveryExplainerVisible}
          hideEventHandler={() => this.toggleDeliveryExplainer()}
        />
      </DataTable>
    );
  }

  renderStreamsListItems(streams) {
    let listItems = map(streams, (stream, index) => (
      <StyledTableRow key={index + stream.key}>
        <LeftTableColumn onClick={() => this.onViewStreamDetails(stream)}>
          {stream.name}
        </LeftTableColumn>
        <TableColumn onClick={() => this.onViewStreamDetails(stream)}>
          {stream.type}
        </TableColumn>
        <TableColumn onClick={() => this.onViewStreamDetails(stream)}>
          {stream.updateinterval
            ? stream.updateinterval === 86400000
              ? 'daily'
              : `${stream.updateinterval / 1000}''`
            : ''}
        </TableColumn>
        <TableColumn>
          Email
          <span
            className="clickable"
            onClick={event => this.toggleDeliveryExplainer()}
          >
            <FontAwesomeIcon
              icon={faQuestionCircle}
              style={{ marginLeft: '4px' }}
            />
          </span>
        </TableColumn>
      </StyledTableRow>
    ));

    if (this.props.fetchingStreams)
      return (
        <StyledListItem className="disabled">Loading streams...</StyledListItem>
      );
    else if (listItems.length > 0) return listItems;
    else
      return <StyledListItem className="disabled">No streams</StyledListItem>;
  }
}

function mapDispatchToProps(dispatch) {
  return {
    fetchPurchases: (skip, limit) =>
      dispatch(PURCHASES_ACTIONS.fetchPurchases(skip, limit)),
    updateCurrentPage: currentPage =>
      dispatch(
        PURCHASES_ACTIONS.updateCurrentPage(
          PURCHASES_TYPES.UPDATE_CURRENT_PAGE_STREAMS,
          currentPage
        )
      ),
    updateRowsPerPage: rowsPerPage =>
      dispatch(
        PURCHASES_ACTIONS.updateRowsPerPage(
          PURCHASES_TYPES.UPDATE_ROWS_PER_PAGE_STREAMS,
          rowsPerPage
        )
      )
  };
}

const mapStateToProps = state => ({
  streams: state.purchases.streams,
  fetchingStreams: state.purchases.fetchingStreams,
  token: state.auth.token, //Used to verify if a user is signed in, if not we don't have to get purchases from API
  totalStreams: state.purchases.totalStreams,
  rowsStreams: state.purchases.rowsStreams,
  pageStreams: state.purchases.pageStreams
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(StreamsTable));
