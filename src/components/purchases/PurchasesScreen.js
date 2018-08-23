import React, { Component } from 'react';
import Toolbar from '../generic/Toolbar';
import CenteredCard from '../generic/CenteredCard';
import CardContent from '../generic/CardContent';
import ToolbarSpacer from '../generic/ToolbarSpacer';
import StreamsTable from './StreamsTable';
import DatasetsTable from './DatasetsTable';

export default class PurchasesScreen extends Component {
  render() {
    return (
      <div>
        <Toolbar showTabs={true} />
        <ToolbarSpacer />
        <CenteredCard>
          <CardContent>
            <h1 style={{ 'margin-bottom': '30px' }}>
              Purchases{' '}
              {/*<span
                className="clickable"
                onClick={event => this.toggleDeliveryExplainer()}
              >
                <FontAwesomeIcon
                  icon={faQuestionCircle}
                  style={{ marginLeft: '4px' }}
                />
              </span>*/}
            </h1>
            <h2>Streams</h2>
            <StreamsTable />
            <h2 style={{ 'margin-top': '20px' }}>Datasets</h2>
            <DatasetsTable />
          </CardContent>
        </CenteredCard>
        {/*<DeliveryExplainerDialog
          visible={this.state.DeliveryExplainerVisible}
          hideEventHandler={() => this.toggleDeliveryExplainer()}
        />*/}
      </div>
    );
  }
}
