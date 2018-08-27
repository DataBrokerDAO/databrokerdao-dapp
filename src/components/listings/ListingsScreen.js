import React, { Component } from 'react';
import styled from 'styled-components';

import Toolbar from '../generic/Toolbar';
import CenteredCard from '../generic/CenteredCard';
import CardContent from '../generic/CardContent';
import ToolbarSpacer from '../generic/ToolbarSpacer';
import TitleCTAButton from '../generic/TitleCTAButton';
import StreamsTable from './stream/StreamsTable';
import DatasetsTable from './dataset/DatasetsTable';
import { TabsContainer, Tabs, Tab } from 'react-md';

export default class ListingsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTabIndex: 0
    };
  }

  onEnlistStreamClicked() {
    this.props.history.push(`/stream/enlist`);
  }
  onEnlistDatasetClicked() {
    this.props.history.push(`/dataset/enlist`);
  }

  handleTabChange = activeTabIndex => {
    this.setState({ activeTabIndex });
  };

  render() {
    const StyledTitleContainer = styled.div`
      display: flex;
      justify-content: space-between;

      @media (max-width: ${props => props.theme.mobileBreakpoint}) {
        flex-direction: column;
      }
    `;

    return (
      <div>
        <Toolbar showTabs={true} />
        <ToolbarSpacer />
        <CenteredCard>
          <CardContent>
            <StyledTitleContainer>
              <h1 style={{ marginBottom: '30px' }}>Listings</h1>
              {!this.state.activeTabIndex && (
                <TitleCTAButton
                  flat
                  primary
                  swapTheming
                  onClick={event => this.onEnlistStreamClicked()}
                  id="tab-streams-btn"
                >
                  Enlist stream
                </TitleCTAButton>
              )}
              {this.state.activeTabIndex === 1 && (
                <TitleCTAButton
                  flat
                  primary
                  swapTheming
                  onClick={event => this.onEnlistDatasetClicked()}
                  id="tab-datasets-btn"
                >
                  Enlist dataset
                </TitleCTAButton>
              )}
            </StyledTitleContainer>

            <TabsContainer
              activeTabIndex={this.state.activeTabIndex}
              onTabChange={this.handleTabChange}
            >
              <Tabs
                tabId="tab-listings"
                inactiveTabClassName="md-text--secondary"
              >
                <Tab id="tab-streams" label="Streams" visi>
                  <StreamsTable />
                </Tab>
                <Tab id="tab-datasets" label="Datasets">
                  <DatasetsTable />
                </Tab>
              </Tabs>
            </TabsContainer>
          </CardContent>
        </CenteredCard>
      </div>
    );
  }
}
