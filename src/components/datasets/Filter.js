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

import Icon from '../generic/Icon';
import EnhancedSelectField from '../generic/EnhancedSelectField';
import { DATASET_ACTIONS } from '../../redux/datasets/actions';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faTimesCircle from '@fortawesome/fontawesome-free-regular/faTimesCircle';

class Filter extends Component {
  componentDidMount() {
    this.props.fetchAvailableCategories();
    this.props.fetchAvailableFiletypes();
    this.props.fetchDatasets();
  }

  /**
   * TODO: this should me moved to a generic component: adding, removing, rendering, ...
   * of items in the advanced select field
   */
  addFiletypeToFilter(value) {
    const newFilter = Immutable.asMutable(this.props.filter, { deep: true });
    const newFileType = value;

    if (indexOf(newFilter.filetypes, newFileType) === -1) {
      newFilter.filetypes = concat(newFilter.filetypes, newFileType);
      this.props.fetchDatasets(newFilter);
    }
  }

  removeFiletypeFromFilter(id) {
    const newFilter = Immutable.asMutable(this.props.filter, { deep: true });
    newFilter.filetypes = pull(newFilter.filetypes, id);
    this.props.fetchDatasets(newFilter);
  }

  renderFiletypeListItems() {
    const filetypes = this.props.availableFiletypes;

    const options = [
      <option key="0" value="0">
        -- add category --
      </option>
    ];

    return concat(
      options,
      map(filetypes, type => {
        return (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        );
      })
    );
  }

  renderFiletypeChips() {
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

    const filetypes = this.props.filter.filetypes;
    const availableFiletypes = this.props.availableFiletypes;

    if (availableFiletypes.length === 0) return '';

    return map(filetypes, file => {
      return (
        <StyledChip
          key={file}
          label={availableFiletypes[file].name}
          onClick={() => this.removeFiletypeFromFilter(file)}
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

  addCategoryToFilter(value) {
    const newFilter = Immutable.asMutable(this.props.filter, { deep: true });
    const newCategory = value;

    if (indexOf(newFilter.categories, newCategory) === -1) {
      newFilter.categories = concat(newFilter.categories, newCategory);
      this.props.fetchDatasets(newFilter);
    }
  }

  removeCategoryFromFilter(id) {
    const newFilter = Immutable.asMutable(this.props.filter, { deep: true });
    newFilter.categories = pull(newFilter.categories, id);
    this.props.fetchDatasets(newFilter);
  }

  renderCategoryListItems() {
    const categories = this.props.availableCategories;

    const options = [
      <option key="0" value="0">
        -- add category --
      </option>
    ];

    return concat(
      options,
      map(categories, cat => {
        return (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        );
      })
    );
  }

  renderCategoryChips() {
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

    const categories = this.props.filter.categories;
    const availableCategories = this.props.availableCategories;

    if (availableCategories.length === 0) return '';

    return map(categories, cat => {
      return (
        <StyledChip
          key={cat}
          label={availableCategories[cat].name}
          avatar={
            <Avatar>
              <Icon
                icon={cat}
                style={{ fill: 'white', width: '15px', height: '15px' }}
              />
            </Avatar>
          }
          onClick={() => this.removeCategoryFromFilter(cat)}
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

    const filetypesMenuItems = [
      {
        label: 'json',
        value: 'json',
        disabled:
          findIndex(this.props.filter.filetypes, type => {
            return type === 'json';
          }) >= 0
      },
      {
        label: 'xls',
        value: 'xls',
        disabled:
          findIndex(this.props.filter.filetypes, type => {
            return type === 'xls';
          }) >= 0
      },
      {
        label: 'csv',
        value: 'csv',
        disabled:
          findIndex(this.props.filter.filetypes, type => {
            return type === 'csv';
          }) >= 0
      }
    ];

    const categoryMenuItems = [
      {
        label: 'Agriculture',
        value: 'agriculture',
        disabled:
          findIndex(this.props.filter.categories, type => {
            return type === 'agriculture';
          }) >= 0
      },
      {
        label: 'Environment',
        value: 'environment',
        disabled:
          findIndex(this.props.filter.categories, type => {
            return type === 'environment';
          }) >= 0
      },
      {
        label: 'Health',
        value: 'health',
        disabled:
          findIndex(this.props.filter.categories, type => {
            return type === 'health';
          }) >= 0
      },
      {
        label: 'Energy',
        value: 'energy',
        disabled:
          findIndex(this.props.filter.categories, type => {
            return type === 'energy';
          }) >= 0
      }
    ];

    return (
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <StyledH2>Categories</StyledH2>
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
        <EnhancedSelectField
          id="category"
          fieldname="category"
          label=""
          className="md-cell"
          onChange={(fieldname, value) => this.addCategoryToFilter(value)}
          menuItems={categoryMenuItems}
          simplifiedMenu={true}
          onBlur={() => {}}
          style={{ width: '100%' }}
          error={false}
          touched={false}
          placeholder="Add category"
          initialValue={null}
        />
        <div>{this.renderCategoryChips()}</div>
        <StyledH2>File types</StyledH2>
        <EnhancedSelectField
          id="category"
          fieldname="category"
          label=""
          className="md-cell"
          onChange={(fieldname, value) => this.addFiletypeToFilter(value)}
          menuItems={filetypesMenuItems}
          simplifiedMenu={true}
          onBlur={() => {}}
          style={{ width: '100%' }}
          error={false}
          touched={false}
          placeholder="Add file type"
          initialValue={null}
        />
        <div>{this.renderFiletypeChips()}</div>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    fetchDatasets: filter => dispatch(DATASET_ACTIONS.fetchDatasets(filter)),
    fetchAvailableFiletypes: () =>
      dispatch(DATASET_ACTIONS.fetchAvailableFiletypes()),
    fetchAvailableCategories: () =>
      dispatch(DATASET_ACTIONS.fetchAvailableCategories())
  };
}

const mapStateToProps = state => ({
  availableCategories: state.datasets.availableCategories,
  availableFiletypes: state.datasets.availableFiletypes,
  filter: state.datasets.filter
});

export default connect(mapStateToProps, mapDispatchToProps)(Filter);
