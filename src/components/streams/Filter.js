import React, { Component } from 'react';
import styled from 'styled-components';
import { Chip, Avatar } from 'react-md';
import { connect } from 'react-redux';
import findIndex from 'lodash/findIndex';
import indexOf from 'lodash/indexOf';
import pull from 'lodash/pull';
import concat from 'lodash/concat';
import map from 'lodash/map';
import Immutable from 'seamless-immutable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import faTimesCircle from '@fortawesome/fontawesome-free-regular/faTimesCircle';

import Icon from '../generic/Icon';
import { STREAMS_ACTIONS } from '../../redux/streams/actions';
import EnhancedSelectField from '../generic/EnhancedSelectField';
import LocationAutocomplete from './LocationAutocomplete';

class Filter extends Component {
  componentDidMount() {
    this.props.fetchAvailableStreamTypes();
  }

  addTypeToFilter(value) {
    const newFilter = Immutable.asMutable(this.props.filter, { deep: true });
    const newType = value;

    if (indexOf(newFilter.types, newType) === -1) {
      newFilter.types = concat(newFilter.types, newType);
      this.props.fetchStreams(newFilter);
    }
  }

  removeTypeFromFilter(id) {
    const newFilter = Immutable.asMutable(this.props.filter, { deep: true });
    newFilter.types = pull(newFilter.types, id);
    this.props.fetchStreams(newFilter);
  }

  renderTypeListItems() {
    const types = this.props.availableStreamTypes;

    const options = [
      <option key="0" value="0">
        -- add stream type --
      </option>
    ];

    return concat(
      options,
      map(types, type => {
        return (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        );
      })
    );
  }

  renderTypeChips() {
    const StyledChip = styled(Chip)`
      width: 100%;
      margin-bottom: 16px;
      cursor: pointer;
      &:first-child {
        margin-top: 20px;
      }
      &:last-child {
        margin-bottom: 0;
      }
    `;

    const types = this.props.filter.types;
    const availableTypes = this.props.availableStreamTypes;

    if (availableTypes.length === 0) return '';

    return map(types, type => {
      return (
        <StyledChip
          key={type}
          label={availableTypes[type].name}
          avatar={
            <Avatar>
              <Icon
                icon={type}
                style={{ fill: 'white', width: '15px', height: '15px' }}
              />
            </Avatar>
          }
          onClick={() => this.removeTypeFromFilter(type)}
          children={
            <Icon
              icon="remove"
              style={{
                fill: 'rgba(0,0,0,0.45)',
                width: '16px',
                height: '16px',
                marginRight: '7px',
                marginTop: '2px'
              }}
            />
          }
          rotateIcon={false}
          removable
        />
      );
    });
  }

  render() {
    const StyledH2 = styled.h2`
      margin-top: 22px;
      margin-bottom: 6px;

      &:first-child {
        margin-top: 0;
      }
    `;

    const CloseButton = styled.span`
      color: rgba(0, 0, 0, 0.7);
      display: none;

      @media (max-width: ${props => props.theme.mobileBreakpoint}) {
        display: block;
      }
    `;

    const typeMenuItems = [
      {
        label: 'Temperature',
        value: 'temperature',
        disabled:
          findIndex(this.props.filter.types, type => {
            return type === 'temperature';
          }) >= 0
      },
      {
        label: 'Humidity',
        value: 'humidity',
        disabled:
          findIndex(this.props.filter.types, type => {
            return type === 'humidity';
          }) >= 0
      },
      {
        label: 'PM 2.5',
        value: 'PM25',
        disabled:
          findIndex(this.props.filter.types, type => {
            return type === 'PM25';
          }) >= 0
      },
      {
        label: 'PM 10',
        value: 'PM10',
        disabled:
          findIndex(this.props.filter.types, type => {
            return type === 'PM10';
          }) >= 0
      }
    ];

    return (
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <StyledH2>Location</StyledH2>
          <CloseButton
            className="clickable"
            onClick={() => this.props.toggleFilterHandler()}
          >
            <FontAwesomeIcon
              icon={faTimesCircle}
              style={{ width: '17px', height: '17px', marginTop: '10px' }}
            />
          </CloseButton>
        </div>
        <LocationAutocomplete />
        <StyledH2>Type</StyledH2>
        <EnhancedSelectField
          id="location"
          fieldname="location"
          label=""
          className="md-cell"
          onChange={(fieldname, value) => this.addTypeToFilter(value)}
          menuItems={typeMenuItems}
          simplifiedMenu={true}
          onBlur={() => {}}
          style={{ width: '100%' }}
          error={false}
          touched={false}
          placeholder="Add stream type"
          initialValue={null}
        />
        <div>{this.renderTypeChips()}</div>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    fetchStreams: filter => dispatch(STREAMS_ACTIONS.fetchStreams(filter)),
    fetchAvailableStreamTypes: () =>
      dispatch(STREAMS_ACTIONS.fetchAvailableStreamTypes())
  };
}

const mapStateToProps = state => ({
  availableStreamTypes: state.streams.availableStreamTypes,
  filter: state.streams.filter
});

export default connect(mapStateToProps, mapDispatchToProps)(Filter);
