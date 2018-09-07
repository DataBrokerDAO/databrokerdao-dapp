import React, { Component } from 'react';
import { TabsContainer, Tabs, Tab } from 'react-md';
import Toolbar from '../generic/Toolbar';
import CenteredCard from '../generic/CenteredCard';
import CardContent from '../generic/CardContent';
import ToolbarSpacer from '../generic/ToolbarSpacer';
import StreamsTable from '../sensors/StreamsTable';
import DatasetsTable from '../sensors/DatasetsTable';
import DeliveryExplainerDialog from './DeliveryExplainerDialog';
import { connect } from 'react-redux';
import { PURCHASES_ACTIONS } from '../../redux/purchases/actions';

class PurchasesScreen extends Component {
  render() {
    return (
      <div>
        <Toolbar showTabs={true} />
        <ToolbarSpacer />
        <CenteredCard>
          <CardContent>
            <h1 style={{ marginBottom: '30px' }}>Purchases</h1>
            <TabsContainer>
              <Tabs
                tabId="tabs-purchases"
                inactiveTabClassName="md-text--secondary"
              >
                <Tab id="tab-streams" label="Streams">
                  <StreamsTable
                    purchased={true}
                    msgEmpty="When you purchase access to a stream, it will be listed here."
                  />
                </Tab>
                <Tab id="tab-datasets" label="Datasets">
                  <DatasetsTable
                    purchased={true}
                    msgEmpty="When you purchase access to a dataset, it will be listed here."
                  />
                </Tab>
              </Tabs>
            </TabsContainer>
          </CardContent>
        </CenteredCard>
        <DeliveryExplainerDialog
          visible={this.props.deliveryExplainerDialogVisible}
          hideEventHandler={this.props.toggleDeliveryExplainer}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  deliveryExplainerDialogVisible: state.purchases.deliveryExplainerDialogVisible
});

function mapDispatchToProps(dispatch) {
  return {
    toggleDeliveryExplainer: () =>
      dispatch(PURCHASES_ACTIONS.toggleDeliveryExplainer())
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PurchasesScreen);
