import React, { Component } from 'react';
import styled from 'styled-components';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faFilter from '@fortawesome/fontawesome-free-solid/faFilter';

import Filter from './Filter';

export default class Sidebar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filterVisible: false
    };
  }

  toggleFilter() {
    this.props.setWidthHandler(this.state.filterVisible ? 0 : 320);
    this.setState({ filterVisible: !this.state.filterVisible });
  }

  render() {
    const StyledSidebar = styled.div`
      height: 100vh;
      // position: fixed;
      display: flex;
      align-items: stretch;
    `;

    const DesktopContentContainer = styled.div`
      display: flex;
      align-items: stretch;

      @media (max-width: ${props => props.theme.mobileBreakpoint}) {
        display: none;
      }
    `;

    const FilterContainer = styled.div`
      flex: initial;
      width: 320px;
      background-color: white;
      padding-top: 65px;
      overflow-y: auto;
      box-shadow: 1px 0 8px rgba(0, 0, 0, 0.15);
      z-index: 1;
    `;

    const MobileContentContainer = styled.div`
      display: none;

      @media (max-width: ${props => props.theme.mobileBreakpoint}) {
        display: flex;
        align-items: stretch;
      }
    `;

    const FilterButtonContainer = styled.div`
      width: 50px;
      height: 50px;
      position: absolute;
      top: 82px;
      left: 10px;
      background-color: white;
      overflow-y: auto;
      box-shadow: 1px 0 8px rgba(0, 0, 0, 0.15);
      z-index: 1;
      display: flex;
      justify-content: center;
      align-items: center;
    `;

    return (
      <StyledSidebar>
        <DesktopContentContainer>
          <FilterContainer>
            <Filter />
          </FilterContainer>
        </DesktopContentContainer>
        <MobileContentContainer>
          {this.state.filterVisible && (
            <FilterContainer>
              <Filter toggleFilterHandler={() => this.toggleFilter()} />
            </FilterContainer>
          )}
          {!this.state.filterVisible && (
            <FilterButtonContainer>
              <span
                className="clickable"
                onClick={() => this.toggleFilter()}
                style={{ color: 'rgba(0,0,0,0.7)' }}
              >
                <FontAwesomeIcon icon={faFilter} />
              </span>
            </FilterButtonContainer>
          )}
        </MobileContentContainer>
      </StyledSidebar>
    );
  }
}
