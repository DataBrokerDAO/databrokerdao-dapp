import React from 'react';
import map from 'lodash/map';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import { DataTable, TableBody, TablePagination } from 'react-md';
import styled from 'styled-components';
import StreamsHeader from './StreamsHeader';
import StreamRow from './StreamsRow';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { SENSORS_ACTIONS } from '../../redux/sensors/actions';
import { PURCHASES_ACTIONS } from '../../redux/purchases/actions';

const StyledParagraph = styled.p`
  padding: 24px 24px 24px 0px;
`;

class StreamsTable extends React.PureComponent {
  componentDidMount() {
    const owner =
      this.props.listed && this.props.token
        ? localStorage.getItem('address')
        : null;

    const email =
      this.props.purchased && this.props.token
        ? localStorage.getItem('email')
        : null;

    if (this.props.token) this.props.fetchStreams(0, 10, owner, email);
  }

  handlePagination = (start, rowsPerPage, currentPage) => {
    const owner =
      this.props.listed && this.props.token
        ? localStorage.getItem('address')
        : null;

    const email =
      this.props.purchased && this.props.token
        ? localStorage.getItem('email')
        : null;

    this.props.fetchStreams(start, rowsPerPage, owner, email);
    this.props.updatePage(currentPage, rowsPerPage);
  };

  onViewStreamDetails = stream => {
    this.props.history.push(`/stream/${stream.key}`);
  };

  render() {
    // If we're not logged in and we try and fetch listed/purchased sensors OR
    // if we're encountering a 401 error -> indicate you must be logged in
    if (
      (!this.props.token && (this.props.listed || this.props.purchased)) ||
      (this.props.error &&
        this.props.error.response &&
        this.props.error.response.status === 401)
    ) {
      return <StyledParagraph>{this.props.msgUnauthenticated}</StyledParagraph>;
    }

    if (this.props.error) {
      return <StyledParagraph>{this.props.msgError}</StyledParagraph>;
    }

    if (this.props.fetchingStreams) {
      return <StyledParagraph>{this.props.msgLoading}</StyledParagraph>;
    }

    if (isEmpty(this.props.streams)) {
      return <StyledParagraph>{this.props.msgEmpty}</StyledParagraph>;
    }

    return (
      <DataTable baseId="streams-table" plain>
        <StreamsHeader showDelivery={this.props.purchased} />
        <TableBody>{this.renderStreamListItems(this.props.streams)}</TableBody>
        <TablePagination
          visible={this.props.fetchingStreams ? 'false' : 'true'}
          style={{ marginLeft: 0 }}
          onPagination={this.handlePagination}
          rowsPerPage={this.props.rowsPerPage}
          rows={this.props.rows}
          page={this.props.page}
          simplified={'true'}
        />
      </DataTable>
    );
  }

  renderStreamListItems(streams) {
    let listItems = map(streams, (stream, index) => (
      <StreamRow
        key={index + stream.key}
        stream={stream}
        handleClick={this.onViewStreamDetails}
        showDelivery={this.props.purchased}
        handleShowDelivery={this.props.toggleDeliveryExplainer}
      />
    ));

    return listItems;
  }
}

StreamsTable.propTypes = {
  msgError: PropTypes.string.isRequired,
  msgUnauthenticated: PropTypes.string.isRequired,
  msgLoading: PropTypes.string.isRequired,
  msgEmpty: PropTypes.string.isRequired,
  purchased: PropTypes.bool.isRequired,
  listed: PropTypes.bool.isRequired
};

StreamsTable.defaultProps = {
  msgError: 'Something went wrong',
  msgUnauthenticated: 'Please login to see your streams.',
  msgLoading: 'Loading streams...',
  msgEmpty: 'No streams found',
  purchased: false,
  listed: false
};

function mapDispatchToProps(dispatch) {
  return {
    fetchStreams: (skip, limit, owner, email) =>
      dispatch(SENSORS_ACTIONS.fetchStreams(skip, limit, owner, email)),
    updatePage: (page, rowsPerPage) =>
      dispatch(SENSORS_ACTIONS.updateStreamsPage(page, rowsPerPage)),
    toggleDeliveryExplainer: () =>
      dispatch(PURCHASES_ACTIONS.toggleDeliveryExplainer())
  };
}

const mapStateToProps = state => ({
  token: state.auth.token,
  fetchingStreams: state.sensors.fetchingStreams,
  error: state.sensors.fetchingStreamsError,
  streams: state.sensors.streams,
  rows: state.sensors.streamsRows,
  page: state.sensors.streamsPage,
  rowsPerPage: state.sensors.streamsRowsPerPage
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(StreamsTable));
