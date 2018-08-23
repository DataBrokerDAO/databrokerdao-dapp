import React, { Component } from 'react';
import styled from 'styled-components';

import Toolbar from '../generic/Toolbar';
import CenteredCard from '../generic/CenteredCard';
import CardContent from '../generic/CardContent';
import ToolbarSpacer from '../generic/ToolbarSpacer';
import TitleCTAButton from '../generic/TitleCTAButton';
import StreamsTable from './stream/StreamsTable';
import DatasetsTable from './dataset/DatasetsTable';

export default class ListingsScreen extends Component {
  onEnlistStreamClicked() {
    this.props.history.push(`/stream/enlist`);
  }
  onEnlistDatasetClicked() {
    this.props.history.push(`/dataset/enlist`);
  }

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
            <h1 style={{ marginBottom: '0px' }}>Listings</h1>
            <p style={{ marginBottom: '30px' }}>
              Earn money by selling access to your data via DataBroker DAO.
            </p>
            <StyledTitleContainer>
              <h2>Streams</h2>
              <TitleCTAButton
                flat
                primary
                swapTheming
                onClick={event => this.onEnlistStreamClicked()}
              >
                Enlist stream
              </TitleCTAButton>
            </StyledTitleContainer>
            <StreamsTable />
            <StyledTitleContainer>
              <h2>Datasets</h2>
              <TitleCTAButton
                flat
                primary
                swapTheming
                onClick={event => this.onEnlistDatasetClicked()}
              >
                Enlist dataset
              </TitleCTAButton>
            </StyledTitleContainer>
            <DatasetsTable />
          </CardContent>
        </CenteredCard>
      </div>
    );
  }
}
